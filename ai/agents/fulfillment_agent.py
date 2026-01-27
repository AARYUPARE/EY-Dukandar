import requests

BACKEND_BASE_URL = "http://localhost:8080"


class FulfillmentAgent:
    def __init__(self):
        pass

    # ------------------------------------------------
    # 🔥 SMALL HELPERS (FORMAT ONLY)
    # ------------------------------------------------
    def _emoji(self, name):
        name = (name or "").lower()

        if "shirt" in name:
            return "👕"
        if "pant" in name or "jean" in name:
            return "👖"
        if "shoe" in name:
            return "👟"
        if "watch" in name:
            return "⌚"
        if "belt" in name:
            return "👔"
        if "suit" in name:
            return "🕴️"

        return "🛍️"

    # -----------------------------
    # ADD TO CART
    # -----------------------------
    def add_to_cart(self, user, product, size, quantity=1, store_id=None, inventory_id=None):
        if not user or not user.get("id"):
            return {"reply": "Please login to add items to cart."}

        payload = {
            "userId": user["id"],
            "productId": product["id"],
            "size": size,
            "quantity": quantity,
            "storeId": store_id,
            "inventoryId": inventory_id
        }

        res = requests.post(
            f"{BACKEND_BASE_URL}/api/cart/add",
            json=payload
        )

        return {
            "reply": (
                f"🛒 Added to cart!\n\n"
                f"{self._emoji(product['name'])} {product['name']}\n"
                f"👕 Size: {size}\n"
                f"📦 Qty: {quantity}\n\n"
                f"You can say *view cart* or *checkout* 😉"
            ),
            "cart": res.json()
        }

    # -----------------------------
    # VIEW CART
    # -----------------------------
    def view_cart(self, user):
        if not user or not user.get("id"):
            return {"reply": "Please login to view your cart."}

        res = requests.get(
            f"{BACKEND_BASE_URL}/api/cart/{user['id']}"
        )

        cart = res.json()

        items = cart.get("items", [])

        if not items:
            return {"reply": "🛒 Your cart is empty right now."}

        lines = []
        total = 0

        for idx, item in enumerate(items, start=1):
            product = item.get("product", {})
            price = product.get("price", 0)
            qty = item.get("quantity", 1)

            total += price * qty

            lines.append(
                f"{self._emoji(product.get('name'))} {product.get('name')} "
                f"x{qty} — ₹{price * qty}"
            )

        return {
            "reply": (
                "🧾 **YOUR CART**\n"
                "─────────\n"
                + "\n".join(lines)
                + f"\n─────────\n💰 Total: ₹{total}\n\n"
                "Say *checkout* when ready!"
            ),
            "cart": cart
        }

    # -----------------------------
    # PLACE ORDER
    # -----------------------------
    def place_order(self, user, delivery_type="HOME_DELIVERY", pickup_store_id=None, selected_item_ids=None):
        if not user or not user.get("id"):
            return {"reply": "Please login to place an order."}

        payload = {
            "userId": user["id"],
            "deliveryType": delivery_type,
            "pickupStoreId": pickup_store_id,
            "selectedItemIds": selected_item_ids
        }

        res = requests.post(
            f"{BACKEND_BASE_URL}/api/orders/create",
            json=payload
        )

        order = res.json()
        print(order)

        return {
            "reply": (
                f"🎉 **Order Placed Successfully!**\n\n"
                f"🧾 Order ID: {order['id']}\n"
                f"💰 Total Paid: ₹{order['totalAmount']}\n"
                f"🚚 {delivery_type.replace('_', ' ').title()} started\n\n"
                f"Thanks for shopping with us ❤️"
            ),
            "order": order
        }

    # -----------------------------
    # RESERVE PRODUCT
    # -----------------------------
    def reserve_product(self, user, product, size, store_id):
        if not user or not user.get("id"):
            return {"reply": "Please login to reserve a product."}

        payload = {
            "userId": user["id"],
            "productId": product["id"],
            "size": size,
            "storeId": store_id
        }

        res = requests.post(
            f"{BACKEND_BASE_URL}/api/reservations",
            json=payload
        )

        reservation = res.json()

        return {
            "reply": (
                f"✅ **Reservation Confirmed!**\n\n"
                f"{self._emoji(product['name'])} {product['name']}\n"
                f"📍 Store ID: {store_id}\n"
                f"👕 Size: {size}\n\n"
                "Please visit the store to try it 😊"
            ),
            "reservation": reservation
        }

    # -----------------------------
    # ORDER HISTORY
    # -----------------------------
    def order_history(self, user):
        if not user or not user.get("id"):
            return {"reply": "Please login to view your orders."}

        res = requests.get(
            f"{BACKEND_BASE_URL}/api/orders/user/{user['id']}"
        )

        orders = res.json()

        if not orders:
            return {"reply": "You don’t have any past orders yet."}

        lines = []

        for o in orders:
            lines.append(
                f"🧾 #{o.get('id')} — ₹{o.get('totalAmount')} — {o.get('orderStatus')}"
            )

        return {
            "reply": (
                "📦 **YOUR ORDERS**\n"
                "─────────\n"
                + "\n".join(lines)
            ),
            "orders": orders
        }

    # -----------------------------
    # ADD TO WISHLIST
    # -----------------------------
    def add_to_wishlist(self, user, product, size):
        if not user or not user.get("id"):
            return {"reply": "Please login to add items to wishlist."}

        payload = {
            "userId": user["id"],
            "productId": product["id"],
            "size": size
        }

        requests.post(
            f"{BACKEND_BASE_URL}/api/wishlist",
            json=payload
        )

        return {
            "reply": (
                f"💖 Added to wishlist!\n\n"
                f"{self._emoji(product['name'])} {product['name']} (Size {size})"
            )
        }
