import requests

BACKEND_BASE_URL = "http://localhost:8080"


class InventoryAgent:
    def __init__(self):
        pass

    # ------------------------------------------------
    # 🔥 INTERNAL FORMATTER (NEW)
    # ------------------------------------------------
    def _format_store_cards(self, product, stores, city):
        """
        Pretty UI formatting only
        NO business logic here
        """

        store_lines = []

        for idx, store in enumerate(stores, start=1):
            store_lines.append(
                f"🏬 STORE {idx}\n"
                f"─────────\n"
                f"📍 {store.get('address', 'Address not available')}\n"
                f"📞 {store.get('phone', 'N/A')}"
            )

        stores_text = "\n\n".join(store_lines)

        return (
            f"✅ **{product['name']}** is available near you in **{city}** 🎉\n\n"
            f"{stores_text}\n\n"
            "👉 Say:\n"
            "• Reserve at store 1\n"
            "• Book second store\n"
            "• Add to wishlist"
        )

    # ------------------------------------------------
    # CHECK AVAILABILITY IN NEAREST STORE
    # ------------------------------------------------
    def check_nearest_store(self, product, user, size=None):
        """
        product → already selected product
        user → user object with location
        """

        if not product or not product.get("id"):
            return {"reply": "Please select a product first."}

        user_city = user.get("location") if isinstance(user, dict) else None

        if not user_city:
            return {
                "reply": "Please update your location to check nearby availability.",
                "products": [product],
                "storeInventory": []
            }

        res = requests.get(
            f"{BACKEND_BASE_URL}/api/inventory/product/{product['id']}/nearby",
            params={
                "city": user_city,
                "maxDistanceKm": 15,
                "size": size
            }
        )

        stores = res.json()

        # ------------------------------------------------
        # ❌ NOT AVAILABLE
        # ------------------------------------------------
        if not stores:
            return {
                "reply": (
                    f"😕 I checked stores around **{user_city}**.\n\n"
                    f"❌ **{product['name']}** is currently out of stock.\n\n"
                    "Would you like me to add it to your wishlist? 💖"
                ),
                "products": [product],
                "storeInventory": [],
                "wishlistSuggested": True
            }

        # ------------------------------------------------
        # ✅ AVAILABLE  (🔥 now nicely formatted)
        # ------------------------------------------------
        reply_text = self._format_store_cards(product, stores, user_city)

        return {
            "reply": reply_text,
            "products": [product],
            "storeInventory": stores
        }
