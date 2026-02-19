import json
from langchain_core.prompts import PromptTemplate

class WebAdapter:
    def __init__(self, session_manager, llm):
        self.session = session_manager
        self.llm = llm

        # ---------- PROMPTS ----------
        self.cart_continuity_prompt = PromptTemplate.from_template("""
        You are a friendly online shopping assistant.

        Greet the user warmly.
        Tell them they already added items to their cart.
        List the items with attractive emojis.
        End by asking whether they want to continue checkout or browse more.

        Cart items:
        {cart_items}
        """)

        self.browsing_continuity_prompt = PromptTemplate.from_template("""
        You are a friendly online shopping assistant.

        Greet the user.
        Mention that they were browsing these products earlier.
        Ask if they want to continue browsing similar options or need help.

        Products:
        {products}
        """)

    # ---------------------------
    # ENTRY POINT (CALL ON LOGIN)
    # ---------------------------
    def on_user_login(self, session_id, user=None):
        session = self.session.get(session_id)

        print("Hellow Web")

        # 1️⃣ CART CONTINUITY
        if session["cart"]["items"]:
            return self._render_cart_continuity(session)

        # 2️⃣ BROWSING CONTINUITY
        if session["focus"]["shown_products"]:
            return self._render_browsing_continuity(session)

        # 3️⃣ FALLBACK
        return self._render_fallback(user)

    # ---------------------------
    # RENDERERS
    # ---------------------------
    def _render_cart_continuity(self, session):
        cart_items = [
            f"{item['name']} (₹{item['price']})"
            for item in session["cart"]["items"]
        ]

        response = (self.cart_continuity_prompt | self.llm).invoke({
            "cart_items": json.dumps(cart_items)
        })

        return response.content.strip()

    def _render_browsing_continuity(self, session):
        products = [
            p["name"] for p in session["focus"]["shown_products"]
        ]

        response = (self.browsing_continuity_prompt | self.llm).invoke({
            "products": json.dumps(products)
        })

        return response.content.strip()

    def _render_fallback(self, user):
        return f"Hi {user['name']}! welcome to dukandar How can I assist you with your shopping today? You can ask me to show products, check availability, or help with your cart. Just let me know what you need! 😊"