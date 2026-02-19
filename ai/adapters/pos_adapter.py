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

    def __init__(self, session_manager, inventory, llm):
        self.session = session_manager
        self.inventory = inventory
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
    - Do NOT change emojis or line breaks
    - Only replace product names dynamically
    - Each product MUST be on a new line
    - Use a suitable product emoji (👕 for shirts, 👖 for jeans, 👟 for shoes, 👜 for bags)
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
                    template="""
            You are an in-store assistant.
        
            The customer browsed these items online earlier.
            Only show items available in this store.
        
            Rules:
            - Friendly continuation tone
            - Use emojis per product
            - Encourage trying items physically
            - Do NOT mention online explicitly
        
            Products:
            {products}
        
            Output:
            Natural, human message.
            """
        )

        # =====================================================
        # Reserved product
        # =====================================================
        self.pos_reserved_prompt = PromptTemplate(
            template="""
    You are an in-store assistant.

    The customer has already reserved this product in this store.

    Rules:
    - Clear confirmation
    - Mention QR / counter pickup
    - Reassuring and polite

    Product:
    {product}

    Output:
    Short confirmation message.
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
        return  f"Hi {user['name']}! welcome to {store['name']} How can I assist you with your shopping today? You can ask me to show products, check availability, or help with your cart. Just let me know what you need! 😊"