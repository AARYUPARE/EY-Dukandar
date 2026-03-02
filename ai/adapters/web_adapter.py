import json
from langchain_core.prompts import PromptTemplate

class WebAdapter:
    def __init__(self, session_manager, llm):
        self.session = session_manager
        self.llm = llm

        # ---------- PROMPTS ----------
        self.cart_continuity_prompt = PromptTemplate(
            input_variables=["cart_items"],
            template="""
        You are an omnichannel shopping assistant.

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
        I see you already added a few items to your cart 🛒.
        🙂 Good news! These items are ready for you:
        {{PRODUCT_LINES}}
        Would you like to continue to checkout, or would you like to explore more options?

        Products:
        {cart_items}
        """
        )

        self.browsing_continuity_prompt = PromptTemplate(
            input_variables=["products"],
            template="""
        You are an omnichannel shopping assistant.

        VERY IMPORTANT RULES:
        - Keep the message format EXACTLY the same
        - Do NOT rephrase, shorten, or add anything
        - Do not invent any new products
        - Do NOT change emojis or line breaks
        - Only replace product names dynamically
        - Each product MUST be on a new line
        - Use a suitable product emoji (👕 for shirts, 👖 for jeans, 👟 for shoes, 👜 for bags, 👗 for dresses, 🧥 for jackets) at start of each product
        - Output ONLY the final message, nothing else

        FORMAT (DO NOT CHANGE):

        🔄 Welcome back!

        ✨ Your browsing journey is synced across all your devices.

        Here’s what you were exploring earlier:
        {{PRODUCT_LINES}}

        Would you like to continue exploring these styles, or try something new?
        """
        )

    # ---------------------------
    # ENTRY POINT (CALL ON LOGIN)
    # ---------------------------
    def on_user_login(self, session_id, brand=None, user=None):
        session = self.session.get(session_id)

        if not session:
            session = {}

        session["discovery"]["brand"] = brand
        self.session._save(session_id, session)

        print("Hello Web")

        # 1️⃣ CART CONTINUITY
        if session.get("cart", {}).get("items"):
            return self._render_cart_continuity(session)

        # 2️⃣ BROWSING CONTINUITY
        if session.get("focus", {}).get("shown_products"):
            return self._render_browsing_continuity(session)

        # 3️⃣ FALLBACK
        return self._render_fallback(user)

    # ---------------------------
    # RENDERERS
    # ---------------------------
    def _render_cart_continuity(self, session):
        cart_items = session["cart"]["items"]

        response = (self.cart_continuity_prompt | self.llm).invoke({
            "cart_items": json.dumps(cart_items)
        })

        return response.content.strip()

    def _render_browsing_continuity(self, session):
        products = session["focus"]["shown_products"]

        response = (self.browsing_continuity_prompt | self.llm).invoke({
            "products": json.dumps(products)
        })

        return response.content.strip()

    def _render_fallback(self, user):
        return f"Hi {user['name']}! welcome to dukandar How can I assist you with your shopping today? You can ask me to show products, check availability, or help with your cart. Just let me know what you need! 😊"