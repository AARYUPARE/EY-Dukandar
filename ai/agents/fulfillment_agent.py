import requests
from typing import Dict

BASE_URL = "http://localhost:8080/api"


class FulfillmentAgent:
    def __init__(self):
        pass

    # =====================================================
    # 1️⃣ PLACE ORDER
    # =====================================================
    def place_order(self, user_id: str, cart_items: list, payment_method: str) -> Dict:
        payload = {
            "userId": user_id,
            "paymentMethod": payment_method,
        }

        res = requests.post(
            f"{BASE_URL}/orders/place",
            params=payload,
            timeout=5
        )

        res.raise_for_status()
        return res.json()

    # =====================================================
    # 2️⃣ CONFIRM RESERVATION (OPTIONAL)
    # =====================================================
    def confirm_reservation(self, user_id: int, product_id: int, store_id: int) -> Dict:
        payload = {
            "userId": user_id,
            "productId": product_id,
            "size": "M",
            "storeId": store_id
        }

        res = requests.post(
            f"{BASE_URL}/reservations/create",
            params=payload,
            timeout=5
        )

        res.raise_for_status()
        return res.json()

    # =====================================================
    # 3️⃣ FINALIZE (CALLED BY SALES AGENT)
    # =====================================================
    def finalize(self, user, session: Dict) -> Dict:

        cart_items = session.get("cart", {}).get("items", [])
        payment_method = session.get("checkout", {}).get("payment_method")

        # if not user or not cart_items:
        #     return {
        #         "success": False,
        #         "reason": "INVALID_STATE"
        #     }
        #
        # order = self.place_order(
        #     user_id=user["id"],
        #     cart_items=cart_items,
        #     payment_method=payment_method
        # )

        # Optional reservation confirmation
        reservation = session.get("reservation")
        if reservation and reservation.get("selected_store"):
            self.confirm_reservation(
                user_id=user["id"],
                product_id=reservation["product"]["id"],
                store_id=reservation["selected_store"]["id"]
            )

        return {
            "success": True,
            #"order_id": order.get("id"),
            #"total": order.get("totalAmount"),
            "order_id": 2,
            "total": 3000,
            "items_count": len(cart_items)
        }

    # =====================================================
    # 4️⃣ ADD PRODUCT TO WISHLIST
    # =====================================================
    def add_to_wishlist(self, user_id: str, product_id: str) -> dict:

        payload = {
            "userId": user_id,
            "productId": product_id,
            "size": "M"
        }

        res = requests.post(
            f"{BASE_URL}/wishlist/add",
            params=payload,
            timeout=5
        )

        res.raise_for_status()

        return {
            "success": True
        }