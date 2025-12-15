import requests
from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import fetch_products_by_ids
from utils.text_cleaner import clean_text

BACKEND_BASE_URL = "http://localhost:8080"

class InventoryAgent:
    def __init__(self, recommendation_agent, llm=None):
        self.reco = recommendation_agent
        self.llm = llm

    def handle(self, query):
        vec = embed(clean_text(query))
        res = index.query(vector=vec, top_k=10, include_metadata=True)
        ids = [m["id"] for m in res.get("matches", [])]
        inventory = fetch_products_by_ids(ids)
        reco = self.reco.handle(query)

        return {
            "inventory": inventory,
            "similar": reco["similar"],
            "complementary": reco["complementary"]
        }

    def search_in_store(self, product_index, product_list, size=None, user=None):

        print("📦 InventoryAgent.search_in_store")
        print("👤 User received:", user)

        if product_index is None or product_index >= len(product_list):
            return {"reply": "Invalid product selection.", "products": []}

        product = product_list[product_index]
        product_id = product["id"]

        user_city = user.get("location") if isinstance(user, dict) else None
        print("📍 User city:", user_city)

        if not user_city:
            return {
                "reply": "Please update your location to find nearby stores.",
                "products": [product],
                "storeInventory": []
            }

        res = requests.get(
            f"{BACKEND_BASE_URL}/api/inventory/product/{product_id}/nearby",
            params={"city": user_city, "maxDistanceKm": 15}
        )

        stores = res.json()
        # print("🏬 Nearby stores:", stores)

        if not stores:
            return {
                "reply": f"'{product['name']}' is not available near {user_city}.",
                "products": [product],
                "storeInventory": []
            }

        return {
            "reply": f"'{product['name']}' is available near you.",
            "products": [product],
            "storeInventory": stores
        }

