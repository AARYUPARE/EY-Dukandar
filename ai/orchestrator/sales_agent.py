import re
import json
import os
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

MEMORY_FILE = "user_memory.json"

ALLOWED_INTENTS = {
    "LOYALTY",
    "ORDER_HISTORY",
    "INVENTORY_CHECK",
    "RECOMMEND",
    "SELECT",
    "CHECKOUT",
    "ONLINE_PAYMENT",
    "COD"
}

class SalesAgentOrchestrator:
    def __init__(
        self,
        recommendation_agent,
        inventory_agent,
        fulfillment_agent,
        payment_agent,
        loyalty_agent,
        llm
    ):
        self.reco = recommendation_agent
        self.inventory = inventory_agent
        self.fulfillment = fulfillment_agent
        self.payment = payment_agent
        self.loyalty = loyalty_agent
        self.llm = llm

        self.context = {
            "shown_products": [],
            "selected_product": None,
            "pending_checkout": None,
            "awaiting_wishlist_confirm": False,
            "disliked_products": set()
        }

        self.memory = self.load_memory()

    # ------------------------------------------------
    # MEMORY
    # ------------------------------------------------
    def load_memory(self):
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        return {"disliked_products": []}

    def save_memory(self):
        with open(MEMORY_FILE, "w") as f:
            json.dump(self.memory, f)

    # ------------------------------------------------
    # INTENT DETECTION
    # ------------------------------------------------
    def detect_intent(self, text: str):
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
You are a STRICT intent classifier.

Valid intents:
LOYALTY, ORDER_HISTORY, INVENTORY_CHECK,
RECOMMEND, SELECT, CHECKOUT,
ONLINE_PAYMENT, COD

Rules:
• Return ONLY intent names
• No explanation
• Multiple intents → comma-separated
"""
        )

        chain = RunnableSequence(prompt, self.llm)
        result = chain.invoke({"query": text})

        raw = result.content.upper()
        intents = [i for i in ALLOWED_INTENTS if i in raw]

        # 🔥 FALLBACK RULES (FIXED)
        if not intents:
            t = text.lower()
            if any(x in t for x in ["upi", "card", "wallet"]):
                return ["ONLINE_PAYMENT"]
            if any(x in t for x in ["cod", "cash on delivery", "cash"]):
                return ["COD"]
            if any(x in t for x in ["buy", "order", "checkout"]):
                return ["CHECKOUT"]
            if any(x in t for x in ["available", "stock", "store", "where"]):
                return ["INVENTORY_CHECK"]
            if any(x in t for x in ["show", "want", "looking"]):
                return ["RECOMMEND"]
            return ["UNKNOWN"]

        return intents

    # ------------------------------------------------
    # UTILITIES
    # ------------------------------------------------
    def extract_index(self, text):
        match = re.search(r"(\d+)", text)
        return int(match.group(1)) - 1 if match else None

    def match_by_name(self, text, products):
        t = text.lower()
        for p in products:
            if p.get("name", "").lower() in t:
                return p
        return None

    def chat(self, message: str, last_products = None,user=None):
        return self.handle(user=user, message=message)

    # ------------------------------------------------
    # PRODUCT FORMATTER
    # ------------------------------------------------
    def format_products(self, products):
        lines = []
        for i, p in enumerate(products, 1):
            lines.append(f"👕 OPTION {i}\n{p['name']} — ₹{p['price']}")
        return "\n\n".join(lines), products

    # ------------------------------------------------
    # MAIN HANDLER
    # ------------------------------------------------
    def handle(self, user, message):
        msg = message.lower()

        # ---------- SMART OVERRIDE: DISLIKE ----------
        if any(x in msg for x in ["don't like", "do not like", "not this"]):
            disliked = self.context["selected_product"]
            if disliked:
                pid = str(disliked.get("id"))
                self.context["disliked_products"].add(pid)
                self.memory["disliked_products"].append(pid)
                self.save_memory()

            remaining = [
                p for p in self.context["shown_products"]
                if str(p.get("id")) not in self.context["disliked_products"]
            ]

            if not remaining:
                return {"reply": "Got it 👍 I’ll remember that. Want to see something else?"}

            formatted, products = self.format_products(remaining)
            self.context["shown_products"] = products
            self.context["selected_product"] = None
            return {"reply": "No worries 🙂 Here are other options:\n\n" + formatted}

        # ---------- FIX: I like 2nd one ----------
        if self.context["shown_products"]:
            # numeric select: 1, 2nd, first, etc.
            if re.search(r"\b(1st|2nd|3rd|\d+|first|second|third)\b", msg):
                intents = ["SELECT"]

            # contextual select: "this item", "this one", "show this"
            elif any(x in msg for x in ["this item", "this one", "show this", "show this item"]):
                if self.context["selected_product"]:
                    intents = ["SELECT"]
                elif len(self.context["shown_products"]) == 1:
                    intents = ["SELECT"]
                else:
                    return {
                        "reply": "Please specify which one 🙂 (e.g. *first one*, *2nd one*)"
                    }

            else:
                intents = self.detect_intent(message)
        else:
            intents = self.detect_intent(message)

        print(f"🕵️ Intents: {intents}")

        response = None

        for intent in intents:

            if intent == "RECOMMEND":
                response = self.reco.handle(message)

            elif intent == "SELECT" and self.context["shown_products"]:
                idx = self.extract_index(message)
                product = (
                    self.context["shown_products"][idx]
                    if idx is not None and idx < len(self.context["shown_products"])
                    else self.match_by_name(message, self.context["shown_products"])
                )
                if product:
                    self.context["selected_product"] = product
                    response = {
                        "reply": (
                            f"✅ {product['name']} selected\n\n"
                            "You can say:\n"
                            "• Check availability\n"
                            "• Buy this"
                        )
                    }

            elif intent == "INVENTORY_CHECK":
                product = self.context["selected_product"]
                if not product:
                    response = {"reply": "Please select a product first 🙂"}
                else:
                    response = self.inventory.check_nearest_store(product, user)

            elif intent == "CHECKOUT":
                product = self.context["selected_product"]
                if not product:
                    response = {"reply": "Please select a product first 🙂"}
                else:
                    self.context["pending_checkout"] = product
                    response = {
                        "reply": (
                            f"🧾 Order Summary\n"
                            f"Product: {product['name']}\n"
                            f"Price: ₹{product['price']}\n\n"
                            "How would you like to pay?\n"
                            "• UPI\n• Card\n• 💵 Cash on Delivery"
                        )
                    }

            elif intent == "ONLINE_PAYMENT" and self.context["pending_checkout"]:
                product = self.context["pending_checkout"]
                pay = self.payment.pay(
                    user=user,
                    amount=product["price"],
                    method=message.upper()
                )
                if pay.get("status") == "SUCCESS":
                    response = self.fulfillment.place_order(user)
                    self.context["pending_checkout"] = None
                else:
                    response = {"reply": "❌ Payment failed. Try again."}

            elif intent == "COD" and self.context["pending_checkout"]:
                response = self.fulfillment.place_order(
                    user=user,
                    delivery_type="HOME_DELIVERY"
                )
                self.context["pending_checkout"] = None

            elif intent == "ORDER_HISTORY":
                response = self.fulfillment.order_history(user)

            elif intent == "LOYALTY":
                response = self.loyalty.handle({
                    "user": user,
                    "user_message": message,
                    "action": "check"
                })

        return response or {"reply": "I didn’t quite get that 😅"}