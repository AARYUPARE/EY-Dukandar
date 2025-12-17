import requests

class SupportAgent:
    def __init__(self, base_url: str):
        self.base_url = base_url

    # -------------------------------------------------------------
    # ⭐ 1. GET ALL WISHLIST ITEMS (ANY STORE AVAILABILITY)
    # -------------------------------------------------------------
    def get_full_wishlist(self, user_id):
        try:
            url = f"{self.base_url}/wishlist/{user_id}"
            res = requests.get(url)
            res.raise_for_status()
            return {
                "reply": "Here are all your wishlist items with availability status:",
                "wishlist": res.json()
            }
        except Exception as e:
            return {"reply": f"Error fetching wishlist: {str(e)}"}

    # -------------------------------------------------------------
    # ⭐ 2. GET AVAILABLE WISHLIST ITEMS IN A SPECIFIC STORE
    # -------------------------------------------------------------
    def get_wishlist_in_store(self, user_id, store_id):
        try:
            url = f"{self.base_url}/wishlist/{user_id}/store/{store_id}"
            res = requests.get(url)
            res.raise_for_status()
            return {
                "reply": f"Here are wishlist items available in store {store_id}:",
                "wishlist": res.json()
            }
        except Exception as e:
            return {"reply": f"Error fetching wishlist store data: {str(e)}"}

    # -------------------------------------------------------------
    # ⭐ 3. ADD ITEM TO WISHLIST
    # -------------------------------------------------------------
    def add_to_wishlist(self, user_id, product_id, size):
        try:
            url = f"{self.base_url}/wishlist/add"
            payload = {
                "userId": user_id,
                "productId": product_id,
                "size": size
            }
            res = requests.post(url, json=payload)
            res.raise_for_status()
            return {"reply": "Product added to wishlist successfully!"}
        except Exception as e:
            return {"reply": f"Error adding to wishlist: {str(e)}"}

    # -------------------------------------------------------------
    # ⭐ 4. REMOVE ITEM FROM WISHLIST
    # -------------------------------------------------------------
    def remove_from_wishlist(self, user_id, product_id, size):
        try:
            url = f"{self.base_url}/wishlist/remove"
            payload = {
                "userId": user_id,
                "productId": product_id,
                "size": size
            }
            res = requests.delete(url, json=payload)
            res.raise_for_status()
            return {"reply": "Item removed from wishlist successfully!"}
        except Exception as e:
            return {"reply": f"Error removing from wishlist: {str(e)}"}

    # -------------------------------------------------------------
    # ⭐ MAIN ENTRY: PROCESS SUPPORT QUERIES
    # -------------------------------------------------------------
    def handle(self, query: str, user=None):
        q = query.lower()

        if user is None:
            return {"reply": "Please login to continue."}

        user_id = user.get("id")

        # ---------------------------------------
        # Match wishlist intents
        # ---------------------------------------
        if "my wishlist" in q or "show wishlist" in q:
            return self.get_full_wishlist(user_id)

        if "wishlist in this store" in q or "wishlist here" in q:
            if "store_id" not in user:
                return {"reply": "Store ID not found. Kiosk must provide storeId."}
            return self.get_wishlist_in_store(user_id, user["store_id"])

        if "wishlist in store" in q:
            # extract store id from query (very basic)
            store_id = ''.join(filter(str.isdigit, q))
            if store_id:
                return self.get_wishlist_in_store(user_id, int(store_id))
            return {"reply": "Please specify store ID."}

        if "add to wishlist" in q:
            # Expected: "add to wishlist product 5 size m"
            pid = self._extract_number(q)
            size = self._extract_size(q)
            if not pid or not size:
                return {"reply": "Please specify product ID and size."}
            return self.add_to_wishlist(user_id, pid, size)

        if "remove from wishlist" in q:
            pid = self._extract_number(q)
            size = self._extract_size(q)
            if not pid or not size:
                return {"reply": "Please specify product ID and size."}
            return self.remove_from_wishlist(user_id, pid, size)

        # ---------------------------------------
        # Fallback support message
        # ---------------------------------------
        return {
            "reply": "I can help with wishlist, order status, store availability, and account support."
        }

    # -------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------
    def _extract_number(self, text):
        nums = [int(s) for s in text.split() if s.isdigit()]
        return nums[0] if nums else None

    def _extract_size(self, text):
        for size in ["s", "m", "l", "xl", "xxl"]:
            if size in text.lower():
                return size.upper()
        return None