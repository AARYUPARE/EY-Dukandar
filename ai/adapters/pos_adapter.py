from langchain_core.prompts import PromptTemplate
import json
import re


class POSAdapter:
    """
    POS Adapter
    - Handles omnichannel continuity when user logs into store kiosk
    - Filters everything by store_id
    - Re-renders all messages using POS-specific LLM prompts
    """

    def __init__(self, session_manager, inventory_agent, payment_agent, llm):
        self.session = session_manager
        self.inventory = inventory_agent
        self.payment_agent = payment_agent
        self.llm = llm

        # ---------------------------
        # POS Cart
        # ---------------------------
        self.pos_cart_prompt = PromptTemplate(
            input_variables=["products"],
            template="""
    You are a retail store assistant.

    VERY IMPORTANT RULES:
    - Keep the message format EXACTLY the same
    - Do NOT rephrase, shorten, or add anything
    - Do not invent any new products
    - Do NOT change emojis or line breaks
    - Only replace product names dynamically
    - Each product MUST be on a new line
    - Use a suitable product emoji (👕 for shirts, 👖 for jeans, 👟 for shoes, 👜 for bags) at start of each product
    - Output ONLY the final message, nothing else

    FORMAT (DO NOT CHANGE):

    Welcome back 👋
    I see you already added a few items to your cart online 🛒.
    🙂 Good news! These items are available right here in this store:
    {{PRODUCT_LINES}}
    Would you like to buy these now, or would you like to look around and try something else?

    Products:
    {products}
    """
        )

        # =====================================================
        # Brouse products
        # =====================================================
        self.pos_browse_prompt = PromptTemplate(
            input_variables=["products"],
            template="""
        You are a warm and professional in-store assistant.

        VERY IMPORTANT RULES:
        - Keep the message format EXACTLY the same
        - Do NOT rephrase, shorten, or add anything
        - Do not invent any new products
        - Do NOT change emojis or line breaks
        - Only replace product names dynamically
        - Each product MUST be on a new line
        - Use a suitable product emoji (👕 for shirts, 👖 for jeans, 👟 for shoes, 👜 for bags, 👗 for dresses, 🧥 for jackets) at start of each product
        - Only show products provided in JSON
        - Output ONLY the final message, nothing else

        FORMAT (DO NOT CHANGE):

        🏬 Welcome! Glad to see you here.

        Here are the items currently available in this store:

        ━━━━━━━━━━━━━━━━━━
        {{PRODUCT_LINES}}
        ━━━━━━━━━━━━━━━━━━

        ✨ Feel free to see them up close, check the fabric, or try them on.

        Would you like me to guide you to any of these? 😊

        Products:
        {products}
        """
        )

        # =====================================================
        # Reserved product
        # =====================================================
        self.pos_reserved_prompt = PromptTemplate(
            input_variables=["product"],
            template="""
    You are a polite and professional in-store assistant.

    Context:
    The customer has already reserved this item in THIS store.

    Rules:
    - Keep the message format EXACTLY the same
    - Do NOT rephrase, shorten, or add anything
    - Do not invent any new product
    - Clear confirmation
    - Store-focused tone
    - Direct instructions
    - Short and confident
    - Mention QR scan or counter pickup
    - keep output like below Output Example.

    FORMAT (DO NOT CHANGE):

    🏬 You have successfully reserved this item in this store:

    🛍️ {{Product Name}}

    📍 It is ready for pickup here.

    📲 Please scan your reservation QR code at the self-checkout kiosk   
    or  
    🧾 Visit the billing counter and share your reservation ID.

    We’ll assist you right away. 😊

    Reserved Product:
    {product}
    """
        )

    # =========================================================
    # ENTRY POINT (CALLED WHEN USER LOGS INTO KIOSK)
    # =========================================================

    def on_user_login(self, session_id, user, store):
        """
        Called immediately when user logs into store kiosk.
        """

        session = self.session.get(session_id)

        if not session:
            session = {}

        # Save store + user context
        session["meta"]["store_id"] = store["id"]
        session["meta"]["user_id"] = user.get("id")
        self.session._save(session_id, session)

        store_id = store["id"]

        # -------------------------------------------------
        # 1️⃣ RESERVED PRODUCT PRIORITY
        # -------------------------------------------------
        reservation = session.get("reservation", {})
        if reservation.get("selected_store") and reservation["selected_store"]["id"] == store_id:
            product = reservation.get("product")
            if product:
                return (self.pos_reserved_prompt | self.llm).invoke({
                    "product": json.dumps(product)
                }).content.strip()

        # -------------------------------------------------
        # 2️⃣ CART CONTINUITY
        # -------------------------------------------------
        cart_items = session.get("cart", {}).get("items", [])
        if cart_items:
            products = []

            for item in cart_items:
                if self.inventory.is_available_in_store(
                        product_id=item["product_id"],
                        store_id=store_id,
                        size="M"
                ):
                    products.append({
                        "id": item["product_id"],  # 🔑 REQUIRED
                        "name": item["name"],
                        "category": item["metadata"].get("category", "product")
                    })

            if products:
                message = (self.pos_cart_prompt | self.llm).invoke({
                    "products": json.dumps(products)
                }).content.strip()

                session["pending_action"] = "POS_CHECKOUT_CONFIRM"
                session["focus"] = {
                    "type": "store_cart_items",
                    "store_id": store_id,
                    "product_ids": [p["id"] for p in products]
                }

                self.session._save(session_id, session)

                return message

        # -------------------------------------------------
        # 3️⃣ BROWSING CONTINUITY (SHOWN PRODUCTS)
        # -------------------------------------------------
        shown_products = session.get("focus", {}).get("shown_products", [])
        if shown_products:
            store_products = []

            for p in shown_products:
                if self.inventory.is_available_in_store(
                        product_id=p["id"],
                        store_id=store_id,
                        size="M"
                ):
                    store_products.append(p)

            if store_products:
                return (self.pos_browse_prompt | self.llm).invoke({
                    "products": json.dumps(store_products)
                }).content.strip()

        # -------------------------------------------------
        # 4️⃣ FALLBACK WELCOME
        # -------------------------------------------------
        return f"Hi {user['name']}! welcome to {store['name']} How can I assist you with your shopping today? You can ask me to show products, check availability, or help with your cart. Just let me know what you need! 😊"

    def handle_payment(self, session_id, payment_method):

        session = self.session.get(session_id)

        if not session or not session.get("payment_pending"):
            return "No payment in progress."

        reservation = session.get("reservation", {})
        product = reservation.get("product")

        if not product:
            return "No reserved product found."

        # 🔥 Simulate successful payment
        order = {
            "items": [product],
            "total": product["price"],
            "payment_method": payment_method,
            "status": "PAID"
        }

        # Clear reservation & payment state
        session["reservation"] = {}
        session["payment_pending"] = False

        self.session._save(session_id, session)

        payment_result = self.payment_agent.pay(
            amount=product["price"]
        )

        return (
            f"✅ Payment successful via {payment_method}!\n"
            "🎉 Your reservation has been confirmed.\n"
            f"💰 Total: ₹{product["price"]}"
        )

    def handle_qr_scan(self, session_id, product):

        session = self.session.get(session_id)
        if not session:
            return "Session expired."

        summary = self.build_reservation_checkout_summary(product, session_id)

        # 🔥 Mark payment state
        session["payment_pending"] = True
        self.session._save(session_id, session)

        return summary

    def build_reservation_checkout_summary(self, product, session_id):

        session = self.session.get(session_id)

        if not product:
            session["payment_pending"] = False
            return "No reserved product found."

        total = product["price"]

        lines = []
        lines.append("🧾 **Reserved Item Summary**")
        lines.append(f"1. {product['name']} — ₹{product['price']}")
        lines.append(f"\n🧮 Total: ₹{total}")
        lines.append("\n💳 How would you like to pay?")
        lines.append("UPI | Card | Net Banking | Cash")

        return "\n".join(lines)