import os
import time

import requests
from langchain_core.prompts import PromptTemplate
import json
import re
from requests import session

from agents import LoyaltyAgent
from utils.generate_qr import QRGenerator

SIZE_IRRELEVANT_TYPES = {
    "wallet", "belt", "cap", "perfume", "watch", "sunglasses"
}


class SalesAgent:

    def __init__(self, llm, recommendation_agent, fulfillment_agent, inventory_agent, session_manager, payment_agent, loyalty_agent: LoyaltyAgent, pos_adapter):

        self.llm = llm
        self.reco = recommendation_agent
        self.fulfillment = fulfillment_agent
        self.inventory = inventory_agent
        self.session = session_manager
        self.payment_agent = payment_agent
        self.loyalty_agent = loyalty_agent
        self.pos_adapter = pos_adapter

        # ===================================================
        # 0️⃣ INTENT ROUTER PROMPT
        # ===================================================
        self.intent_router_prompt = PromptTemplate(
            input_variables=["message", "session_summary"],
            template="""
    You are a STRICT but PRACTICAL intent classifier for a fashion retail assistant.

    **give your best and 100% think properly and read user message carefully before choosing intent.**

    Your job is to choose the SINGLE best intent
    based on:
    1) the user message
    2) the session state

    ==================== HARD RULES ====================
    - Output JSON ONLY
    - Choose ONLY ONE intent
    - Never invent new intents
    - Prefer action over NONE if intent is reasonably clear
    - NONE is LAST RESORT only

    ==================== SESSION STATE ====================
    {session_summary}

    Field meanings:
    - has_current_product → whether "this / it" can be resolved
    - shown_products_count → number of products shown last
    - cart_count → items in cart
    - pending_action → system is waiting for confirmation
    - last_system_action → what system last asked

    ==================== INTENT PRIORITY (TOP → DOWN) ====================
    1. ACCEPT / DECLINE (only if pending_action exists)
    2. RESERVE
    3. CHECKOUT
    4. AVAILABILITY
    5. SELECT
    6. OFFER
    7. DISCOVERY
    8. ADD_TO_CART
    9. ADD_TO_WISHLIST
    10. PAYMENT
    11. NONE

    ==================== INTENT DEFINITIONS ====================

    DISCOVERY
    User is browsing or searching products.
    User asks to show products.
    Trigger words/examples:
    - "show me", "browse", "looking for", "find", "shirts", "jeans", "shoes"
    - category-only messages ("shirts", "t-shirts")

    Always valid when:
    - shown_products_count == 0

    SELECT
    User is choosing ONE product from shown list.
    Trigger words/examples:
    - "first", "second", "2nd", "that one", "this one", product name, "show this"
    Valid when:
    - shown_products_count > 0

    AVAILABILITY
    User asks about stock or store availability.
    Trigger words/examples:
    - "available", "in stock", "near me", "which store", "availability", "nearest store"

    ADD_TO_CART
    User wants to add product to cart.
    Trigger words/examples:
    - "add to cart", "add this into cart", "put in cart"

    RESERVE
    User wants to reserve product.
    Trigger words/examples:
    - "reserve", "hold", "keep aside", "book this"
    Valid ONLY when:
    - has_current_product == true

    CHECKOUT
    User wants to complete purchase.
    Trigger words/examples:
    - "buy this one", "checkout", "buy", "buy this", "purchase", "place order", "complete order" 
    Valid when:
    - cart_count > 0

    ADD_TO_WISHLIST
    User wants to save product.
    Trigger words/examples:
    - "wishlist", "save for later", "add to wishlist"

    ACCEPT
    User agrees.
    Trigger words:
    - "yes", "ok", "sure", "do it", "go ahead"
    Valid ONLY when:
    - pending_action is not null

    DECLINE
    User declines.
    Trigger words:
    - "no", "not now", "skip", "later"
    Valid ONLY when:
    - pending_action is not null

    OFFER
    User asks about deals.
    Trigger words:
    - "offer", "offers, "discount", "apply offer"

    PAYMENT
    User mentions payment method during checkout.
    Trigger words:
    - "UPI", "Card", "Net Banking", "Cash on Delivery", "pay with", "pay using", "COD", "pay"

    NONE
    Use ONLY if message is totally unrelated or meaningless.

      ==================== OUTPUT FORMAT ====================
    {{
    "intent": "<ONE_INTENT>"
    }}

    ==================== USER MESSAGE ====================
    {message}
    """
        )

        # =====================================================
        # FORMAT PRODUCTS TO HUMAN-READABLE
        # =====================================================
        self.product_formatter_prompt = PromptTemplate(
            input_variables=["products"],
            template="""
    You are a retail product presentation expert.

    Your job is to format products in a clean, friendly, easy-to-read way.

    Rules:
    - do not invent any new products by yourself only use given products
    - Add relevant emoji (Shirt → 👕, Suit → 👔, Jeans → 👖, Dress → 👗, Jacket → 🧥, Sweater → 🧥, Shoes → 👟, Saree → 🥻, Cap → 🧢, Bag → 👜, 👘 → Kurta) at the start of each product
    - Add OPTION title each product clearly (OPTION 1, OPTION 2, OPTION 3...)
    - give full stop after every item
    - keep underline between products and OPTION title (use a long Unicode line like ─────────────)
    - Keep descriptions short(same like below examples)
    - Do NOT upsell
    - Do NOT add prices comparisons
    - Sound like a helpful store assistant
    - Do not write any other sentence in output other than product details and products

    Products:
    {products}

    Output example:

    OPTION 1
    ─────────────
    👕 Blue Casual Shirt
    • Cotton fabric
    • Slim fit
    • ₹1,499.

    OPTION 2
    ─────────────
    👕 Black Formal Shirt
    • Wrinkle-free
    • Regular fit
    • ₹1,799.
    """
        )

        # =====================================================
        #  FIRST‑LEVEL UPSELL PROMPT
        # =====================================================
        self.upsell_prompt = PromptTemplate(
            input_variables=["products", "query"],
            template="""
    You are a fashion retail assistant.

    You are given:
    1. The user's search query
    2. A list of recommended products with their prices

    Your tasks(mandatory):
    Step 1: Sort the products by price (lowest to highest).
    Step 2: After sorting, ALWAYS select product with second highest price and Do NOT choose any other product

    Rules:
    - Do NOT mention other products
    - Do NOT compare products
    - Do NOT mention price
    - Keep tone subtle and helpful
    - Do NOT explain your steps or reasoning
    - keep it short and natural, like a real store assistant so user will get impress
    - keep it in simple language that a typical customer would understand don't use haivy words
    - keep it to ONE to TWO sentence only
    - Mention the selected product name naturally in the upsell sentence
    - Do NOT use vague references like "this shirt" or "this product"
    - You may start the sentence with 👕 this emoji.

    Output format:
    Output only valid JSON.
    Do not add any text.
    No explanation, no markdown.

    Format:
    {{
    "upsell_text": "one sentence upsell message including product name"
    }}

    User query:
    {query}

    Recommended products:
    {products}

    example upsell sentences:
    - “👕 Urban Edge Casual Shirt is pure cotton. For daily wear, many customers prefer cotton-stretch—easier movement.”
    - "👕 The pure cotton shirt is a good choice for breathable     everyday wear.
    Many customers also consider the cotton-stretch option for easier movement during long hours."
    - "👕 The pure cotton shirt is a classic everyday option.
    Cotton-stretch shirts are currently being picked more for their modern fit and flexibility."

    """
        )

        # =====================================================
        # SELECT PRODUCT FORMATTING PROMPT
        # ======================================================
        self.product_description_prompt = PromptTemplate(
            input_variables=["product"],
            template="""
    You are a retail assistant.

    STRICT RULES:
    - only use the product data provided in input, do NOT invent any new product or feature by yourself
    - Follow the EXACT structure shown below
    - Do NOT change line order
    - Do NOT add or remove lines
    - Do NOT change punctuation
    - Do NOT add emojis (emoji already exists)
    - Only replace the content using the product data

    FORMAT (copy exactly):

    👕 {{product_name}}
    Nice choice — {{one_line_description}}

    • {{feature_1}}
    • {{feature_2}}
    • Price: ₹{{price}}

    PRODUCT DATA (JSON):
    {product}

    OUTPUT:
    Only the formatted text.
    """
        )

        # =====================================================
        # 8️⃣ SECOND‑LEVEL UPSELL PROMPT
        # =====================================================
        self.one_time_upsell_prompt = PromptTemplate(
            input_variables=["selected_product", "upgrade_product", "price_diff"],
            template="""
    You are a polite and helpful fashion retail assistant.

    Your task is to suggest a quality upgrade in a respectful, optional tone.

    Rules:
    - Start the sentence using a permission-based phrase such as:
    "If you're okay paying ₹{price_diff} more" OR
    "If you're open to spending ₹{price_diff} more"
    - Explain why the upgrade is better using fabric or finish only
    - Keep it natural and friendly
    - Limit the response to 1–2 lines
    - Do NOT ask a question
    - Do NOT mention budgets
    - Do NOT mention product prices directly
    - keep it short and natural, like a real store assistant
    - keep it in simple language that a typical customer would understand don't use haivy words
    - You may start the sentence with 👕 this emoji.

    Selected product:
    {selected_product}

    Upgrade product:
    {upgrade_product}

    Output style examples:
    "👕 If you're okay paying ₹300 more, you can upgrade to the linen blend option, which stays cooler, resists wrinkles, and feels more comfortable for long wear."

    "👕 If you're open to spending ₹250 more, this premium cotton shirt feels softer on the skin and keeps its shape better through the day."
    """
        )

        # =====================================================
        # FORMAT STORES TO HUMAN-READABLE
        # =====================================================
        self.store_formatter_prompt = PromptTemplate(
            input_variables=["stores"],
            template="""
    You are a retail store presentation expert.

    Your job is to format stores in a clean, friendly, easy-to-read way.

    Rules:
    - do not invent any new store by yourself only use given stores
    - Add 🏬 emoji at the start of each store
    - Add OPTION title each store clearly (OPTION 1, OPTION 2, OPTION 3...)
    - keep underline between products and OPTION title (use a long Unicode line like ─────────────)
    - keep underline between stores and OPTION title(same like below examples)
    - Keep descriptions short(same like below examples)
    - Do NOT recommend or rank stores
    - Do NOT add distance comparisons
    - Sound like a helpful store assistant
    - Do not write any other sentence in output other than store details and stores
    - Do not write any URL in the response even if provided

    Stores:
    {stores}

    Output example:

    OPTION 1
    ─────────────
    🏬 Dukandar Andheri West
    • Andheri West, Mumbai

    OPTION 2
    ─────────────
    🏬 Dukandar Bandra East
    • Bandra East, Mumbai
    """
        )

        # =====================================================
        # SELECT STORE FORMATTING PROMPT
        # =====================================================
        self.select_store_prompt = PromptTemplate(
            input_variables=["store"],
            template="""
    You are a retail assistant.

    STRICT RULES:
    - only use the store data provided in input, do NOT invent any new store or detail
    - Follow the EXACT structure shown below
    - Do NOT change line order
    - Do NOT add or remove lines
    - Do NOT change punctuation
    - Do NOT add emojis (emoji already exists)
    - Only replace the content using the store data

    FORMAT (copy exactly):

    🏬 {{store_name}}
    Great — this store is near to you.

    • Location: {{location}}
    • Distance: {{distance}}
    • Store Timing: {{timing}}

    STORE DATA (JSON):
    {store}

    OUTPUT:
    Only the formatted text.
    """
        )

        # =====================================================
        # 8️⃣ ADD BUNDLE ITEM INTENT
        # =====================================================
        self.bundle_prompt = PromptTemplate(
            input_variables=["base_product", "bundle_products"],
            template="""
    You are a friendly fashion retail assistant.

    Your task is to present a popular bundle in a conversational and persuasive way.

    Rules:
    - do not invent any new product by yourself only use given products
    - Start by showing the bundle clearly (title + items)
    - Use a "Popular Combo" or "Most customers buy" tone
    - Mention savings using the provided savings text only
    - Add a soft, friendly call-to-action at the end
    - Keep it natural and human, not robotic
    - Do NOT calculate prices
    - Do NOT mention how the bundle was created
    - Ask only ONE simple question at the end
    - If the bundle is not meaningful, output exactly: NO_BUNDLE
    - keep it short and natural, like a real store assistant same like the example below
    - keep it in simple language that a typical customer would understand don't use haivy words
    - add emoji 📦 at the start of bundle title and 👕 for shirt, 👖 for jeans, 🧵 for belt, 👟 for shoes and ✨ for explanation, 🙂 at end of explanation

    Selected product:
    {base_product}

    Bundle details:
    {bundle_products}

    Output format example:

    📦 Popular Combo – Office Starter Pack
    👕 Shirt  
    👖 Slim-fit chinos  
    🧵 Leather belt  
    👟 White sneakers  

    👉 Bundle price: ₹2,999 instead of ₹3,450
    💰 You save ₹450 flat  

    ✨ Most customers buy this combo.  
    If you go for this combo, you save ₹450 flat and get a complete office-ready look.  
    Would you like to add this combo? 🙂
    """
        )

        # =====================================================
        # AVAILABILITY TO HUMAN
        # =====================================================
        self.availability_prompt = PromptTemplate(
            input_variables=["product", "stores"],
            template="""
    You are a friendly in-store fashion assistant.

    Your task:
    Respond with a short, clear availability message.

    Rules:
    - Keep the response to exactly 2 sentences
    - Sound natural and helpful
    - You must start the sentence with 🏬 this emoji.
    - Do NOT exaggerate
    - Do NOT mention system or technical words
    - Do NOT add extra suggestions or explanations
    - keep it in simple language that a typical customer would understand don't use haivy words 

    If the product is available:
    - Mention the nearest store and distance
    - Clearly say it is the nearest store
    - Ask whether to reserve at this store or at a different store
    - Ask the user to reply with store name or option number

    Product:
    {product}

    Availability data:
    {stores}

    Response:
    """
        )

        # =====================================================
        # OFFER EXPLANATION PROMPT
        # =====================================================
        self.offer_prompt = PromptTemplate(
            input_variables=["offers", "cart"],
            template="""
    You are a friendly retail salesperson.

    Your task:
    - Explain the available offers in simple, natural language
    - Help the user understand how they can benefit
    - Be clear and honest
    - Do NOT invent offers
    - Do NOT change values
    - Do NOT mention internal IDs
    - Use a warm, helpful tone

    Guidelines:
    - Mention expiry only if relevant
    - If an offer applies to current cart, highlight it
    - Encourage action gently (like a real store assistant)

    Offers:
    {offers}

    Cart:
    {cart}

    Response:
    """
        )

        self.DISCOVERY_EXTRACTION_PROMPT = PromptTemplate(
            input_variables=["query"],
            template="""
    You are a retail sales assistant.

    From the user's message, extract:
    - product_type (single word, lowercase)
    - occasion (office | casual | festive | party | wedding | null)
    - budget (number only, INR, or null)
    - style (optional: slim, oversized, premium, basic)
    - size (S | M | L | XL | XXL | 28 | 30 | 32 | 34 | 36 | null)
    - occasion_applicable (true / false)

    Rules:
    - Utility items (innerwear, socks, sweaters, hoodies, thermals) → occasion_applicable = false
    - If something is not mentioned, return null
    - Respond ONLY in valid JSON

    User message:
    {query}
    """
        )


    def sendImageToWhatsAppMedia(self, payload: str, img_bytes: bytes) -> str:
        url = f"https://graph.facebook.com/v22.0/{os.getenv("PHONE_NUMBER_ID")}/media"

        headers = {
            "Authorization": f"Bearer {os.getenv("ACCESS_TOKEN")}"
        }

        files = {
            "file": (f"{payload}.png", img_bytes, "image/png")
        }

        data = {
            "messaging_product": "whatsapp"
        }

        res = requests.post(url, headers=headers, data=data, files=files)

        media_id = res.json()["id"]

        print("🔥 mediaId =", media_id)

        return media_id

    def needs_occasion(self, product_type: str) -> bool:
        """
        Returns False for product types where occasion does not make sense.
        """
        if not product_type:
            return False

        OCCASION_IRRELEVANT_TYPES = {
            "underwear",
            "vest",
            "socks",
            "boxers",
            "briefs",
            "innerwear",
            "thermals",
            "nightwear",
            "sleepwear"
        }

        return product_type.lower() not in OCCASION_IRRELEVANT_TYPES

    def apply_store_filter(self, products: list, session: dict):
        """
        Filters products based on store availability if store context exists.
        """
        store_id = session.get("meta", {}).get("store_id")

        # Web / App flow → no filtering
        if not store_id:
            return products

        filtered = []
        for p in products:
            if self.inventory.is_available_in_store(
                    product_id=p["id"],
                    store_id=store_id,
                    size=session["discovery"]["size"]
            ):
                filtered.append(p)

        return filtered

    def build_checkout_summary(self, session):
        # 🔑 POS vs Web item resolution
        items = (
                session.get("checkout", {}).get("items")
                or session["cart"]["items"]
        )

        lines = []
        total = self.calculate_cart_total(items)

        lines.append("🧾 **Order Summary**")
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item['name']} — ₹{item['price']}")

        lines.append(f"\n🧮 Total: ₹{total}")
        lines.append("\n💳 How would you like to pay?")
        lines.append("🔗 UPI | 💳 Card | 🏦 Net Banking | 🛵 Cash on Delivery")

        return "\n".join(lines)



    def select_checkout_upsell(self, cart_items):
        cart_total = self.calculate_cart_total(cart_items)

        FREE_GIFT_THRESHOLD = 1999
        MAX_GAP_ALLOWED = 700  # don't tease if too far

        FREE_GIFT = {
            "name": "Silk Pocket Square",
            "sku": "FREE_PSQ"
        }

        remaining = FREE_GIFT_THRESHOLD - cart_total

        # 🎁 Threshold-based free gift upsell
        if 0 < remaining <= MAX_GAP_ALLOWED:
            return {
                "type": "THRESHOLD_GIFT",
                "remaining_amount": remaining,
                "gift": FREE_GIFT
            }

        # 🧵 Impulse add-on upsell
        impulse_item = self.reco.checkout_upsell(cart_items)
        if impulse_item:
            return {
                "type": "IMPULSE_ADDON",
                "item": impulse_item
            }

        return None

    def is_discovery_complete(self, disc: dict) -> bool:
        if not disc.get("product_type"):
            return False

        if self.needs_size(disc.get("product_type")) and not disc.get("size"):
            return False

        if not disc.get("budget"):
            return False

        if self.needs_occasion(disc.get("product_type")) and not disc.get("occasion"):
            return False

        return True

    def needs_size(self, product_type: str) -> bool:
        if not product_type:
            return False
        return product_type.lower() not in SIZE_IRRELEVANT_TYPES

    def extract_discovery_signals(self, message: str) -> dict:
        raw = (self.DISCOVERY_EXTRACTION_PROMPT | self.llm).invoke({
            "query": message
        }).content.strip()

        try:
            data = json.loads(raw)
        except Exception:
            return {
                "product_type": None,
                "occasion": None,
                "budget": None,
                "style": None,
                "size": None,
                "occasion_applicable": True
            }

        # Normalize size
        size = data.get("size")
        if isinstance(size, str):
            size = size.upper()

        # Normalize budget
        budget = data.get("budget")
        if not isinstance(budget, int):
            budget = None

        return {
            "product_type": data.get("product_type"),
            "occasion": data.get("occasion"),
            "budget": budget,
            "style": data.get("style"),
            "size": size,
            "occasion_applicable": data.get("occasion_applicable", True)
        }

    # =====================================================
    # UTILITY: CALCULATE CART TOTAL
    # =====================================================
    def calculate_cart_total(self, cart_items):
        """
        Calculate total payable amount for cart items.
        Source of truth for money calculation.
        """

        if not cart_items:
            return 0

        total = 0.0

        for item in cart_items:
            try:
                price = float(item.get("price", 0))
                quantity = int(item.get("quantity", 1))
                total += price * quantity
            except (TypeError, ValueError):
                # Skip corrupted cart item safely
                continue

        # Round to 2 decimals for currency safety
        return round(total, 2)

    # =====================================================
    # PARSE PAYMENT METHOD FROM USER MESSAGE
    # =====================================================
    def parse_payment_method(self, message: str):
        """
        Returns canonical payment method string or None
        """

        msg = message.lower()

        # -------------------------
        # 1️⃣ UPI (GPay, PhonePe, Paytm)
        # -------------------------
        if any(k in msg for k in [
            "upi", "gpay", "google pay", "phonepe", "paytm", "bhim"
        ]):
            return "UPI"

        # -------------------------
        # 2️⃣ Card (credit / debit)
        # -------------------------
        if any(k in msg for k in [
            "card", "credit card", "debit card", "visa", "mastercard"
        ]):
            return "CARD"

        # -------------------------
        # 3️⃣ Net Banking
        # -------------------------
        if any(k in msg for k in [
            "net banking", "internet banking", "bank transfer"
        ]):
            return "NET_BANKING"

        # -------------------------
        # 4️⃣ Wallet
        # -------------------------
        if any(k in msg for k in [
            "wallet", "amazon pay", "mobikwik"
        ]):
            return "WALLET"

        # -------------------------
        # 5️⃣ Cash on Delivery
        # -------------------------
        if any(k in msg for k in [
            "cod", "cash on delivery", "pay on delivery"
        ]):
            return "COD"

        return None

    # =====================================================
    # PARSE INDEX FROM USER MESSAGE
    # =====================================================
    def parse_index(self, message: str):
        """
        Returns 0-based index or None
        """
        msg = message.lower()

        # 1️⃣ Explicit numbers
        match = re.search(r"\b(\d+)\b", msg)
        if match:
            idx = int(match.group(1)) - 1
            return idx if idx >= 0 else None

        # 2️⃣ Ordinal words
        ordinal_map = {
            "first": 0, "1st": 0,
            "second": 1, "2nd": 1,
            "third": 2, "3rd": 2,
            "fourth": 3, "4th": 3,
            "fifth": 4, "5th": 4,
            "sixth": 5, "6th": 5,
        }

        for word, idx in ordinal_map.items():
            if re.search(rf"\b{word}\b", msg):
                return idx

        # 3️⃣ "last"
        if "last" in msg:
            return -1

        return None

    # =====================================================
    # RESOLVE PRODUCT FROM USER MESSAGE
    # =====================================================
    def resolve_product(self, message: str, shown_products: list, current_product=None):
        """
        Resolves product from user message using:
        - this / it / same one
        - index (2, 2nd, second, last)
        - product name keywords
        """

        msg = message.lower()

        # 1️⃣ Pronouns
        if current_product and any(p in msg for p in [
            "this", "this one", "it", "same one"
        ]):
            return current_product

        # 2️⃣ Index / ordinal
        idx = self.parse_index(message)

        if idx is not None:
            if idx == -1 and shown_products:
                return shown_products[-1]
            if 0 <= idx < len(shown_products):
                return shown_products[idx]

        # 3️⃣ Product name / keyword match
        for product in shown_products:
            name = product.get("name", "").lower()
            tokens = [t for t in name.split() if len(t) > 3]

            if name in msg or any(token in msg for token in tokens):
                return product

        if current_product:
            return current_product

        return None

    # =====================================================
    # RESOLVE STORE FROM USER MESSAGE  
    # =====================================================
    def resolve_store(self, message: str, available_stores: list, current_store: dict = None):
        """
        Resolves store from user message
        """

        msg = message.lower()

        # 1️⃣ Pronouns
        if current_store and any(w in msg for w in ["this", "it", "same one", "that one"]):
            return current_store

        # 2️⃣ Index / ordinal
        index_map = {
            "1": 0, "first": 0, "1st": 0,
            "2": 1, "second": 1, "2nd": 1,
            "3": 2, "third": 2, "3rd": 2,
            "4": 3, "fourth": 3, "4th": 3
        }

        for word, idx in index_map.items():
            if re.search(rf"\b{word}\b", msg) and idx < len(available_stores):
                return available_stores[idx]

        # 3️⃣ Store name match
        for store in available_stores:
            name = store["name"].lower()
            tokens = [t for t in name.split() if len(t) > 3]

            if name in msg or any(token in msg for token in tokens):
                return store

        # 4️⃣ Nearest
        if any(w in msg for w in ["nearest", "closest", "near me", "nearby"]):
            return sorted(
                available_stores,
                key=lambda s: s.get("distance", 9999)
            )[0]

        return None

    # =====================================================
    # MAIN HANDLE METHOD
    # =====================================================
    def handle(self, user, session_id: str, user_message: str):
        session = self.session.get_or_create(session_id)
        disc = session["discovery"]


        # -------------------------
        # 1️⃣ INTENT ROUTING (SINGLE ENTRY)
        # -------------------------
        session_summary = {
            "has_current_product": session.get("focus", {}).get("current_product") is not None,
            "shown_products_count": len(session.get("focus", {}).get("shown_products", [])),
            "cart_count": len(session.get("cart", {}).get("items", [])),
            "pending_action": session.get("pending_action"),
            "last_system_action": session.get("last_system_action", {}).get("type")
        }

        intent_raw = (self.intent_router_prompt | self.llm).invoke({
            "message": user_message,
            "session_summary": json.dumps(session_summary)
        }).content

        # 1. Extract first JSON object only
        match = re.search(r'\{[\s\S]*?\}', intent_raw)

        if not match:
            raise ValueError("No JSON found in intent router response")

        intent_json = json.loads(match.group())
        intent = intent_json.get("intent", "UNKNOWN")

        if disc.get("asked_once") and not self.is_discovery_complete(disc):
            intent = "DISCOVERY"

        print(f"intent: {intent}")

        # -------------------------
        # 2️⃣ ACCEPT / DECLINE (GLOBAL)
        # -------------------------
        if intent in ("ACCEPT", "DECLINE", "RESERVE"):
            # -------------------------
            # RESERVE STORE SELECTION
            # -------------------------
            if session["pending_action"] == "RESERVE_SELECT_STORE" and intent == "DECLINE":
                session["pending_action"] = None
                self.session._save(session_id, session)
                return {
                    "reply": "No problem 👍 Let me know how you’d like to continue."
                }

            # -------------------------
            # RESERVE CONFIRMATION DECLINE
            # -------------------------
            if session["pending_action"] == "RESERVE_SELECT_STORE" and intent in ("ACCEPT", "RESERVE"):
                store = self.resolve_store(
                    message=user_message,
                    available_stores=session["reservation"]["available_stores"],
                    current_store=session["reservation"].get("selected_store")
                )

                if not store:
                    return {"reply": "Please tell me which store you’d like to reserve from 🙂"}

                session["reservation"]["selected_store"] = store
                session["pending_action"] = "RESERVE_CONFIRM"
                self.session._save(session_id, session)

                return {"reply": f"Sure 👍 Shall I reserve it at {store['name']}?"}

            # -------------------------
            # RESERVE CONFIRMATION
            # -------------------------
            if session["pending_action"] == "RESERVE_CONFIRM" and intent in ("ACCEPT", "RESERVE"):
                product = session["focus"]["current_product"]
                store = session["reservation"]["selected_store"]

                # Later → fulfillment.reserve(product, store)
                session["pending_action"] = None
                self.session._save(session_id, session)

                user_id = user.get("id")

                self.fulfillment.confirm_reservation(
                    user_id=user_id,
                    product_id=product["id"],
                    store_id=store["id"]
                )

                size = "M"

                payload = QRGenerator.build_prompt(product["id"], store["id"], size, user["id"])

                img_bytes = QRGenerator.generate_qr_bytes(payload=payload)

                # media_id = self.sendImageToWhatsAppMedia(payload=payload, img_bytes=img_bytes)

                caption = f"""✅ Reservation Confirmed!

                                👕 Product: {product['name']}
                                🏷 Brand: {product['brand']}
                                📏 Size: {size}
                                🏬 Store: {store['name']}
                                📍 Address: {store['address']}

                                📸 Scan this QR at store for pickup.
                                """

                requests.post(
                    f"http://localhost:8080/webhook/send/image",
                    json={
                        "phone": user['phone'],  # ✅ new API endpoint
                        "caption": "Use this QR to grab your reservation",
                        "imageBytes": list(img_bytes),
                        "name": payload
                    }
                )

                return {
                    "reply" : f"""✅ Reservation Confirmed!
                    
                    Your item has been successfully reserved at 📍 {store['name']}

                👕 Product: {product['name']}
                🏷 Brand: {product['brand']}
                📏 Size: {size}
                🏬 Store: {store['name']}
                📍 Address: {store['address']}

                📸 QR has been sent to your Whattsapp. Scan this QR at store for pickup. 
                The store team has been notified and your item will be held for you. Please visit the store within 48 hours to collect it.
                Would you like directions to the store or explore more products while you're here? 😊
                """
                }

            # -------------------------
            # RESERVE DECLINE
            # ------------------------
            if session["pending_action"] == "RESERVE_CONFIRM" and intent == "DECLINE":
                session["pending_action"] = None
                self.session._save(session_id, session)
                return {
                    "reply": "No problem 👍 Let me know how you’d like to continue."
                }

            # -------------------------
            # WISHLIST HANDLER
            # -------------------------
            if session["pending_action"] == "WISHLIST_CONFIRM":
                if intent == "ACCEPT" or intent == "ADD_TO_WISHLIST":
                    product = session["reservation"]["product"]
                    print("Adding to wishlist:", product)

                    user_id = user.get("id")

                    self.fulfillment.add_to_wishlist(
                        user_id=user_id,
                        product_id=product["id"]
                    )
                    session["reservation"]["product"] = []
                    session["pending_action"] = None
                    self.session._save(session_id, session)

                    return {"reply" : f"""💖 Added to your wishlist!

                    {product["name"]} is safely saved to your wishlist.
                    
                    You can view it when it will available near to you and move it to your cart when you're ready.
                    
                    Would you like to explore similar products or continue shopping? 😊"""
                            }

            # -------------------------
            # WISHLIST DECLINE
            # -------------------------
            if session["pending_action"] == "WISHLIST_CONFIRM" and intent == "DECLINE":
                session["pending_action"] = None
                self.session._save(session_id, session)
                return {"reply" : "Alright 👍 Let me know if you want help with anything else."}

            # -------------------------
            # BUNDLE OFFER DECLINE → CROSS-SELL
            # ------------------------
            if intent == "DECLINE" and session["pending_action"] == "CROSS_SELL":

                product = session["focus"]["current_product"]["name"]

                return {"reply":f"No worries 🙂 I've added just the {product} to your cart. Would you like to buy somethong else or would you like to checkout"}

            # -------------------------
            # BUNDLE OFFER ACCEPT → CROSS-SELL
            # ------------------------
            if intent == "ACCEPT" and session["pending_action"] == "CROSS_SELL":

                bundle_products = session["cross-sell_products"]

                # Add bundle items to cart
                for product in bundle_products:
                    self.session.add_to_cart(session_id, product)

                return {
                    "reply": "🎉 Great choice! I've added the full bundle to your cart. do you want checkout or buy something else"
                }

            # -------------------------
            # UP-SELL DECLINE
            # ------------------------
            if intent == "DECLINE" and session["pending_action"] == "UPSELL_DECISION":

                session["pending_action"] == "POST_SELECT_PRODUCT"
                self.session._save(session_id, session)

                return {
                    "reply" : f"No worries 🙂 shall I added just the {session['focus']['current_product']['name']} into your cart."
                }

            # -------------------------
            # UP_SALE ACCEPT
            # ------------------------
            if intent == "ACCEPT" and session["pending_action"] == "UPSELL_DECISION":

                product = session["upsell_product"]
                session["pending_action"] = "POST_SELECT_PRODUCT"
                session["focus"]["current_product"] = product
                self.session._save(session_id, session)

                product_description = (self.product_description_prompt | self.llm).invoke({
                    "product": json.dumps(product)
                }).content.strip()

                response = product_description + "\n\n"

                return {"reply" : response + "Excellent upgrade choice! 👍 Shall I add this to your cart?"}

            # ----------------------------------
            # DECLINE ADD TO CART
            # ----------------------------------
            if intent == "DECLINE" and session.get("pending_action") == "POS_CHECKOUT_CONFIRM":
                session["pending_action"] = None
                session["focus"] = None
                self.session._save(session_id, session)
                return {"reply":"No problem 🙂 You can continue browsing or try something else."}

            # ----------------------------------
            # ACCEPT ADD TO CART
            # ----------------------------------
            if intent == "ACCEPT" and session["pending_action"] == "POST_SELECT_PRODUCT":
                product = self.resolve_product(
                    message=user_message,
                    shown_products=session["focus"]["shown_products"],
                    current_product=session["focus"]["current_product"]
                )

                if not product:
                    return {"reply": "Please tell me which product you'd like to add 🙂"}

                # 1️⃣ ADD TO CART — SOURCE OF TRUTH
                self.session.add_to_cart(session_id, product)

                messages = [f"""🛒 Added to your cart!

                            {product['name']} has been successfully added to your cart.

                            💰 Price: ₹{product['price']}

                            You're one step closer to checkout!
                            Would you like to continue shopping or proceed to checkout? 😊
                            """]

                # 2️⃣ TRY BUNDLE FIRST (AOV MAXIMIZER)
                bundle_products = self.reco.cross_sell(product) or []

                if bundle_products:
                    bundle_text = (self.bundle_prompt | self.llm).invoke({
                        "base_product": json.dumps(product),
                        "bundle_products": json.dumps(bundle_products)
                    }).content.strip()

                    if bundle_text != "NO_BUNDLE":
                        messages.append(bundle_text)
                        session["cross-sell_products"] = bundle_products
                        session["pending_action"] = "cross_sell"
                        self.session._save(session_id, session)
                        return {"reply": "\n\n".join(messages)}

                return {"reply": "\n\n".join(messages)}

            # =====================================================
            # POS CHECKOUT CONFIRM (KIOSK FLOW)
            # =====================================================
            if intent == "ACCEPT" and session.get("pending_action") == "POS_CHECKOUT_CONFIRM":

                focus = session.get("focus", {})
                store_id = focus.get("store_id")
                allowed_ids = set(focus.get("product_ids", []))

                # Safety check
                if not store_id or not allowed_ids:
                    session["pending_action"] = None
                    self.session._save(session_id, session)
                    return {"reply":"Something went wrong 😕 Please try again."}

                # ----------------------------------
                # Filter cart to STORE items only
                # ----------------------------------
                pos_items = [
                    item for item in session["cart"]["items"]
                    if item["product_id"] in allowed_ids
                ]

                if not pos_items:
                    session["pending_action"] = None
                    self.session._save(session_id, session)
                    return {"reply":"Sorry 😕 These items are no longer available in this store."}

                # ----------------------------------
                # Create POS‑scoped checkout
                # ----------------------------------
                session["checkout"] = {
                    "started": True,
                    "payment_method": None,
                    "order_confirmed": False,
                    "channel": "pos",  # 🔑 important
                    "store_id": store_id,
                    "items": pos_items
                }

                session["pending_action"] = "SELECT_OFFER"

                self.session._save(session_id, session)

                formatted_checkout = self.build_checkout_summary(session=session)

                formatted_checkout += "\n\n" + offers["reply"]

                return {"reply": formatted_checkout}


        # -------------------------
        # 3️⃣ DISCOVERY
        # -------------------------
        if intent == "DISCOVERY":
            session = self.session.get(session_id)
            disc = session["discovery"]

            # -------------------------------
            # 0️⃣ Ask combined question ONCE
            # -------------------------------
            if not disc["asked_once"]:
                disc["asked_once"] = True
                self.session._save(session_id, session)

                return {
                    "reply": (
                        "Sure 🙂 Tell me a bit more so I can find the best options for you!\n\n"
                        "You can reply like:\n"
                        "👔 Office shirts, size L, budget ₹2000\n"
                        "👕 Casual shirt, size M, under ₹1500\n"
                        "🌸 Festive kurta, size XL, ₹1500\n\n"
                        "Just give me a this few details and I’ll pick out the perfect choices for you in your budget! ✨"
                    )
                }

            # -------------------------------
            # 1️⃣ Extract discovery signals
            # -------------------------------
            signals = self.extract_discovery_signals(user_message)

            for key, value in signals.items():
                if value is not None:
                    disc[key] = value

            # -------------------------------
            # 2️⃣ Occasion relevance
            # -------------------------------
            if disc["product_type"]:
                disc["occasion_applicable"] = self.needs_occasion(disc["product_type"])
            else:
                disc["occasion_applicable"] = False

            self.session._save(session_id, session)

            # -------------------------------
            # 3️⃣ Validate minimum info
            # -------------------------------
            missing = []

            if not disc["product_type"]:
                missing.append("product")

            if self.needs_size(disc["product_type"]) and not disc["size"]:
                missing.append("size")

            if not disc["budget"]:
                missing.append("budget")

            if disc.get("occasion_applicable") and not disc["occasion"]:
                missing.append("occasion")

            # Ask ONE follow-up if needed
            if missing:
                return {"reply":(
                        "Almost there 🙂 Just tell me your "
                        + ", ".join(missing)
                )}

            # -------------------------------
            # 4️⃣ Discovery complete → find products
            # -------------------------------
            products = self.reco.find_products(
                product_type=disc["product_type"],
                occasion=disc["occasion"],
                budget=disc["budget"]
            )

            if not products:
                return {"reply":"I couldn’t find good matches 😕 Want to try something else?"}

            # -------------------------------
            # 5️⃣ Save focus memory
            # -------------------------------
            self.session.set_shown_products(
                session_id=session_id,
                products=products,
                category=disc["product_type"]
            )

            session["focus"]["shown_products"] = products

            # -------------------------------
            # 6️⃣ Format products
            # -------------------------------
            formatted = (self.product_formatter_prompt | self.llm).invoke({
                "products": json.dumps(products)
            }).content.strip()

            # -------------------------------
            # 7️⃣ Upsell hint
            # -------------------------------
            upsell_hint = (self.upsell_prompt | self.llm).invoke({
                "products": json.dumps(products),
                "query": user_message or ""
            }).content.strip()

            try:
                upsell_text = json.loads(upsell_hint).get("upsell_text", "")
            except Exception:
                upsell_text = ""

            # -------------------------------
            # 8️⃣ Final response
            # -------------------------------
            return {
                "reply" : f"""
                ✨ Quick tip ✨
                __________________
                {upsell_text}
                
                {formatted}

                Just tell me the number (like 1st or 2nd) or say this one 🙂
                """,
                "products": products
            }

        # -------------------------
        # STORE SELECTION
        # -------------------------
        if session["pending_action"] == "RESERVE_SELECT_STORE" and intent in ("SELECT", "RESERVE"):
            store = self.resolve_store(
                message=user_message,
                available_stores=session["reservation"]["available_stores"],
                current_store=session["reservation"].get("selected_store")
            )

            if not store:
                return {"reply" : "Please select a valid store 🙂"}

            session["reservation"]["selected_store"] = store
            session["pending_action"] = "RESERVE_CONFIRM"
            self.session._save(session_id, session)

            if session["reservation"].get("selected_store") != None:
                return {
                    "reply" : f"Sure 👍 if you want to reserve {session['focus']['current_product']} Would you like me to reserve it for you at {store['name']}?"
                }

            store_description = (self.select_store_prompt | self.llm).invoke({
                "store": json.dumps(store)
            }).content.strip()

            return {
                "reply" : store_description + "\n\n" + f"Great choice 👍 Would you like me to reserve it for you at {store['name']}?"
            }

        # -------------------------
        # 4️⃣ SELECT PRODUCT
        # -------------------------
        if intent == "SELECT":
            selected_product = self.resolve_product(
                message=user_message,
                shown_products=session["focus"]["shown_products"],
                current_product=None
            )

            if not selected_product:
                return {"reply" : "Please tell me which option you liked 🙂"}

            product_description = (self.product_description_prompt | self.llm).invoke({
                "product": json.dumps(selected_product)
            }).content.strip()

            # save selection
            session["focus"]["current_product"] = selected_product
            self.session.select_product(session_id, selected_product)

            response = product_description + "\n\n"

            # 🔥 ask RecommendationAgent for quality upgrade
            upgrade_result = self.reco.up_sell(
                selected_product=selected_product,
                occasion=session["discovery"]["occasion"]
            )

            if not upgrade_result:
                return {"reply" : response + "Nice pick 👍 Shall I add this to your cart?"}

            upgrade_product = upgrade_result
            price_diff = upgrade_product["price"] - selected_product["price"]

            # 🧠 LLM only generates language
            upsell_message = (self.one_time_upsell_prompt | self.llm).invoke({
                "selected_product": json.dumps(selected_product),
                "upgrade_product": json.dumps(upgrade_product),
                "price_diff": price_diff
            }).content.strip()

            response += upsell_message

            # mark upsell state
            session["pending_action"] = "UPSELL_DECISION"
            session["upsell_product"] = upgrade_product
            self.session._save(session_id, session)

            return {"reply" : response}

        # -------------------------
        # 5️⃣ ADD TO CART
        # -------------------------
        if intent == "ADD_TO_CART":
            product = self.resolve_product(
                message=user_message,
                shown_products=session["focus"]["shown_products"],
                current_product=session["focus"]["current_product"]
            )

            if not product:
                return {"reply" : "Please tell me which product you'd like to add 🙂"}

            # 1️⃣ ADD TO CART — SOURCE OF TRUTH
            self.session.add_to_cart(session_id, product)

            messages = [f"""🛒 Added to your cart!

                            {product['name']} has been successfully added to your cart.

                            💰 Price: ₹{product['price']}

                            You're one step closer to checkout!
                            Would you like to continue shopping or proceed to checkout? 😊
                            """]

            # 2️⃣ TRY BUNDLE FIRST (AOV MAXIMIZER)
            bundle_products = self.reco.cross_sell(product) or []

            if bundle_products:
                bundle_text = (self.bundle_prompt | self.llm).invoke({
                    "base_product": json.dumps(product),
                    "bundle_products": json.dumps(bundle_products)
                }).content.strip()

                if bundle_text != "NO_BUNDLE":
                    messages.append(bundle_text)
                    session["cross-sell_products"] = bundle_products
                    session["pending_action"] = "cross_sell"
                    self.session._save(session_id, session)
                    return {"reply": "\n\n".join(messages)}

            return {"reply": "\n\n".join(messages)}

        # -------------------------
        # WISHLIST HANDLER
        # -------------------------
        if session["pending_action"] == "WISHLIST_CONFIRM":
            if intent == "ACCEPT" or intent == "ADD_TO_WISHLIST":
                product = session["reservation"]["product"]
                print("Adding to wishlist:", product)

                user_id = user.get("id")

                self.fulfillment.add_to_wishlist(
                    user_id=user_id,
                    product_id=product["id"]
                )

                session["reservation"]["product"] = []
                session["pending_action"] = None
                self.session._save(session_id, session)

                return {"reply" : f"""💖 Added to your wishlist!

                    {product["name"]} is safely saved to your wishlist.
                    
                    You can view it when it will available near to you and move it to your cart when you're ready.
                    
                    Would you like to explore similar products or continue shopping? 😊"""
                        }

        # -------------------------
        # AVAILABILITY HANDLER
        # -------------------------
        if intent == "AVAILABILITY":
            product = self.resolve_product(
                user_message,
                session["focus"]["shown_products"],
                session["focus"]["current_product"]
            )

            if not product:
                return {"reply":"Please select a product first 🙂"}

            stores = self.inventory.check(product, user)

            # ✅ Reservation context = single product
            session["reservation"] = {
                "product": product,
                "available_stores": stores,
                "selected_store": None,
                "status": "AVAILABLE" if stores else "UNAVAILABLE"
            }

            # Decide next step
            session["pending_action"] = (
                "RESERVE_SELECT_STORE" if stores else "WISHLIST_CONFIRM"
            )

            self.session._save(session_id, session)

            if not stores:
                return {
                    "reply": f"🏬 {product["name"]} is not available in any nearest store for reservation would you like to add it into wishlist 💖? 🙂"
                }

            # Natural language via LLM
            response = (self.availability_prompt | self.llm).invoke({
                "product": json.dumps(product),
                "stores": json.dumps(stores)
            })

            formatted = (self.store_formatter_prompt | self.llm).invoke({
                "stores": json.dumps(stores)
            }).content.strip()

            result = response.content.strip() + "\n\n" + formatted
            return {
                "reply":result,
                "stores": stores,
            }

        # -------------------------
        # RESERVE HANDLER (DECLINE)
        # -------------------------
        if intent == "RESERVE" and session["pending_action"] == "wishlist_confirm":
            return {
                "reply":"product is not available in any nearest store for reservation would you like to add it into wishlist 💖? 🙂"
            }

        # -------------------------
        # RESERVE HANDLER (ENTRY)
        # -------------------------
        if intent == "RESERVE" and session.get("pending_action") not in ("RESERVE_SELECT_STORE", "wishlist_confirm"):
            product = self.resolve_product(
                user_message,
                session["focus"]["shown_products"],
                session["focus"]["current_product"]
            )

            if not product:
                return {"reply":"Please select a product first 🙂"}

            stores = self.inventory.check(product, user)

            # ✅ Reservation context = single product
            session["reservation"] = {
                "product": product,
                "available_stores": stores,
                "selected_store": None,
                "status": "AVAILABLE" if stores else "UNAVAILABLE"
            }

            # Decide next step
            session["pending_action"] = (
                "RESERVE_SELECT_STORE" if stores else "WISHLIST_CONFIRM"
            )

            self.session._save(session_id, session)

            if not stores:
                return {
                    "reply":f"🏬 {product["name"]} is not available in any nearest store for reservation would you like to add it into wishlist 💖? 🙂"
                }

            # Natural language via LLM
            response = (self.availability_prompt | self.llm).invoke({
                "product": json.dumps(product),
                "stores": json.dumps(stores)
            })

            formatted = (self.store_formatter_prompt | self.llm).invoke({
                "stores": json.dumps(stores)
            }).content.strip()

            result = response.content.strip() + "\n\n" + formatted
            return {"reply": result}

        # -------------------------
        # 7️⃣ CHECKOUT
        # -------------------------
        if intent == "CHECKOUT":
            if not session["cart"]["items"]:
                return {"reply":"Your cart is empty 🙂 Please add something first."}

            offers = self.loyalty_agent.show_offers(user=user, session=session)

            session["checkout"] = {
                "started": True,
                "payment_method": None,
                "order_confirmed": False
            }

            session["pending_action"] = "SELECT_OFFER"

            self.session._save(session_id, session)

            formatted_checkout = self.build_checkout_summary(session=session)

            formatted_checkout += "\n\n" + offers["reply"]

            return {"reply": formatted_checkout}

        # -------------------------
        # PAYMENT METHOD SELECTION
        # -------------------------
        if intent == "PAYMENT":
            method = self.parse_payment_method(user_message)

            if not method:
                return {
                    "reply": ("Please choose a valid payment method 💳💰\n" "How would you like to pay?\n"
                              "• 🔗 UPI\n"
                              "• 💳 Card\n"
                              "• 🏦 Net Banking\n"
                              "• 🛵 Cash on Delivery")
                }


            # =====================================================
            # 🔥 1️⃣ POS PAYMENT ROUTING (BEFORE AGENT CALL)
            # =====================================================
            if session.get("payment_pending"):
                print("💳 Routing to POS payment handler")

                reply = self.pos_adapter.handle_payment(
                    session_id=session_id,
                    payment_method=method
                )

                return {"reply": reply.get("reply")}


            session["checkout"]["payment_method"] = method
            session["pending_action"] = "PAYMENT_PROCESS"
            amount = self.calculate_cart_total(session["cart"]["items"])
            session["checkout"]["amount"] = amount
            self.session._save(session_id, session)

            # 🔹 Call Payment Agent
            payment_result = self.payment_agent.pay(
                amount = amount
            )

            return{
                "reply": "Payment Started"
            }

        # -------------------------
        # 8️⃣ OFFER
        # -------------------------
        if intent == "OFFER":
            if session["cart"]["offer"]:
                return {"reply": "You already have an offer applied to the cart"}

            return self.loyalty_agent.apply_offer_from_message(session_id=session_id, message=user_message)

        # -------------------------
        # 9️⃣ FALLBACK
        # -------------------------
        return {"reply":"I can help you browse, check availability, or checkout 🙂"}
