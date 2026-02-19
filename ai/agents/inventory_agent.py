import requests
from typing import Dict, List

BASE_URL = "http://localhost:8080/api/inventory"


class InventoryAgent:
    def __init__(self):
        pass

    # =====================================================
    # 1️⃣ BACKEND CALL
    # =====================================================
    def _call_backend(self, product_id: int, user_location: str
                      ) -> Dict:
        payload = {
            "productId": product_id,
            "city": user_location
        }

        print(f"payload: {payload}")

        res = requests.get(
            f"{BASE_URL}/product/nearby",
            params=payload,
            timeout=5
        )

        # print("Inventory Store Response: " + res.json())

        res.raise_for_status()
        return res.json()

    # =====================================================
    # 2️⃣ NORMALIZE RESPONSE
    # =====================================================
    def _normalize(self, backend_response: List[Dict]) -> Dict:
        stores = backend_response
        available_stores = []

        for store in stores:
            if store.get("stockQuantity", 0) > 0:
                available_stores.append(store)

        available_stores.sort(
            key=lambda s: s.get("distanceKm", 9999)
        )

        return {
            "available_stores": available_stores,
            "unavailable": len(available_stores) == 0
        }

    # =====================================================
    # 3️⃣ PUBLIC METHOD USED BY SALES AGENT
    # =====================================================
    def check(self, product: Dict, user: Dict = None) -> Dict:

        if not product:
            return {
                "available_stores": [],
                "unavailable": True
            }

        if not user:
            return {
                "available_stores": [],
                "unavailable": True
            }

        backend_response = self._call_backend(
            product_id=product["id"],
            user_location=user["location"]
        )

        print(f"backend response: "
              f"{backend_response}")

        return self._normalize(backend_response)

    def is_available_in_store(self, product_id, store_id, size="M") -> bool:
        payload = {
            "productId": product_id,
            "size": size,
            "storeId": store_id
        }

        print(f"payload: {payload}")

        res = requests.get(
            f"{BASE_URL}/check",
            params=payload,
            timeout=5
        )

        items = res.json()

        print(items)

        if len(items) == 0:
            return False  # not available
        else:
            return True  # available