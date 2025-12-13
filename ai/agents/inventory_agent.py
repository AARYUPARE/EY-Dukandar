# agents/inventory_agent.py

from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import fetch_products_by_ids
from utils.text_cleaner import clean_text

class InventoryAgent:
    def __init__(self, recommendation_agent, llm=None):
        self.reco = recommendation_agent
        self.llm = llm

    def handle(self, query):
        vec = embed(clean_text(query))
        res = index.query(vector=vec, top_k=10, include_metadata=True)

        matches = res.get("matches", [])
        ids = [m["id"] for m in matches]

        inventory = fetch_products_by_ids(ids)

        reco = self.reco.handle(query)

        return {
            "inventory": inventory,
            "similar": reco["similar"],
            "complementary": reco["complementary"]
        }
