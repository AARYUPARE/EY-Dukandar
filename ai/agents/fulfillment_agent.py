import requests

BACKEND = "http://localhost:8080"

def fulfillment_agent(intent_payload):
    """
    Handles product reservation, ordering and loyalty reward updates.
    This is called *after* sales agent identifies the intent.
    """

    intent = intent_payload.get("intent")
    product_id = intent_payload.get("product_id")
    size = intent_payload.get("size")
    user_id = intent_payload.get("user_id")
    store_id = intent_payload.get("store_id")
    qty = intent_payload.get("quantity", 1)

    if not user_id:
        return {"reply": "User must be logged in to place orders.", "success": False}

    if not product_id:
        return {"reply": "Product ID missing.", "success": False}

    # ============================================================
    # 1️⃣  RESERVE PRODUCT
    # ============================================================
    if intent == "reserve":
        reserve_res = requests.post(
            f"{BACKEND}/api/reservations/create",
            json={
                "userId": user_id,
                "productId": product_id,
                "size": size,
                "storeId": store_id,
                "quantity": qty
            }
        )

        if reserve_res.status_code != 200:
            return {"reply": "Could not reserve product.", "success": False}

        return {
            "reply": f"Product has been successfully reserved for you at store {store_id}.",
            "reservation": reserve_res.json(),
            "success": True
        }

    # ============================================================
    # 2️⃣  PLACE ORDER
    # ============================================================
    if intent == "order":
        order_res = requests.post(
            f"{BACKEND}/api/orders",
            json={
                "userId": user_id,
                "productId": product_id,
                "size": size,
                "storeId": store_id,
                "quantity": qty
            }
        )

        if order_res.status_code != 200:
            return {"reply": "Order could not be completed.", "success": False}

        order_data = order_res.json()

        # ============================================================
        # 3️⃣  CALCULATE USER LOYALTY POINTS
        # ============================================================
        product_price = order_data.get("totalAmount", 0)
        loyalty_points = int(product_price * 0.05)  # ⭐ 5% rule

        loyalty_res = requests.post(
            f"{BACKEND}/api/loyalty/add",
            json={
                "userId": user_id,
                "points": loyalty_points
            }
        )

        return {
            "reply": (
                f"🎉 Your order is confirmed!\n"
                f"🧾 Order ID: {order_data.get('orderId')}\n"
                f"💰 Total Amount: {order_data.get('totalAmount')}\n"
                f"⭐ Added Loyalty Points: {loyalty_points}"
            ),
            "order": order_data,
            "loyalty_updated": loyalty_res.status_code == 200,
            "success": True
        }

    # ============================================================
    # INVALID INTENT
    # ============================================================
    return {"reply": "Invalid fulfillment intent.", "success": False}