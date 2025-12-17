import json
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence


class SalesAgentOrchestrator:
    def __init__(self, agents: dict, llm):
        self.agents = agents
        self.llm = llm

        # -------------------------------
        # INTENT CLASSIFIER
        # -------------------------------
        self.intent_prompt = PromptTemplate(
            input_variables=["query"],
            template="""
        You are a senior retail AI intent classifier.

        Classify the user's intent.
        Return ONE OR MORE intents (comma-separated).
        Return ONLY intent names.

        ------------------------
        VALID INTENTS
        ------------------------

        recommendation
        - User wants suggestions, alternatives, best items

        inventory
        - User wants availability, stock, price, size, stores

        search-in-store
        - User refers to a product already shown
        - Examples:
          "1st product", "3rd one", "this", "that", "buy this", "select this"

        fulfillment
        - User wants to RESERVE or ORDER a product
        - Includes:
          reserve, book, hold, order, buy now, place order
        - Examples:
          "reserve this"
          "order the 2nd one"
          "book the 3rd product"
        - If product is referenced → ALSO include search-in-store

        loyalty
        - Points, offers, rewards

        support
        - Wishlist, account help, store help

        payment
        - Checkout, pay now

        ------------------------
        IMPORTANT RULES
        ------------------------

        1. If user says reserve/order AND refers to a product → include fulfillment + search-in-store
        2. If user mentions wishlist → include support
        3. If product reference exists → search-in-store MUST be included
        4. Return only intent names, comma-separated

        ------------------------
        User Query:
        {query}

        Return ONLY intents.
        """
        )

        # -------------------------------
        # PRODUCT SELECTOR
        # -------------------------------
        self.selector_prompt = PromptTemplate(
            input_variables=["query", "products"],
            template="""
        Products:
        {products}

        User query:
        {query}

        Respond ONLY with valid JSON.
        Do NOT add any text, explanation, or markdown.

        JSON format:
        {{
          "product_index": null,
          "size": null
        }}
        """
        )

        self.intent_chain = RunnableSequence(self.intent_prompt, self.llm)
        self.selector_chain = RunnableSequence(self.selector_prompt, self.llm)

    # ---------------------------------------------------------
    # ROUTING LOGIC
    # ---------------------------------------------------------
    def route(self, user_query: str, last_products=None, user=None):
        last_products = last_products or []

        intent_raw = self.intent_chain.invoke({"query": user_query})
        intents = [i.strip() for i in intent_raw.content.lower().split(",") if i.strip()]
        print("Detected intents:", intents, "\n")

        # -----------------------------------------------------
        # 🔥 NEW: SUPPORT AGENT
        # -----------------------------------------------------
        if "wishlist" in intents:
            if not user or not user.get("id"):
                return {
                    "reply": "Please log in to get support assistance."
                }

            print("🛠 Routing to Support Agent")

            return self.agents["support"].handle(
                query=user_query,
                user=user
            )

        # 🔥 SEARCH IN STORE (UNCHANGED)
        if "search-in-store" in intents and last_products:
            selection_raw = self.selector_chain.invoke({
                "query": user_query,
                "products": last_products
            })

            raw = selection_raw.content.strip()
            print("🔍 Selector raw output:", raw)

            try:
                if raw.startswith("```"):
                    raw = raw.strip("`")
                    raw = raw.replace("json", "", 1).strip()

                data = json.loads(raw)
            except Exception:
                return {
                    "reply": "Sorry, I couldn't understand which product you selected.",
                    "products": []
                }

            idx = data.get("product_index")
            size = data.get("size")

            res = self.agents["inventory"].search_in_store(
                product_index=idx,
                product_list=last_products,
                size=size,
                user=user
            )
            # --- NEW FORMATTING LOGIC ---
            base_reply = res.get("reply", "Here are the stores where you can find this item:")
            stores = res.get("storeInventory", [])

            if stores:
                store_lines = []
                for idx, store in enumerate(stores, start=1):
                    # Building an attractive card-like format for each store
                    lines = [
                        f"🏬 Store {idx}: {store.get('name', 'Retail Store')}",
                        f"📍 Address: {store.get('address', 'Contact store for location')}",
                        f"📞 Phone: {store.get('phone', 'N/A')}",
                    ]

                    # Optional: Add a visual separator or small note
                    store_lines.append("\n".join(lines))

                stores_text = "\n\n---\n\n".join(store_lines)
                full_reply = f"{base_reply}\n\n{stores_text}\n\n📍 Would you like reserve product at any of these locations?*"
            else:
                full_reply = base_reply

            res["reply"] = full_reply
            return res

        # -----------------------------------------------------
        # 🔥 FULFILLMENT INTENT (RESERVE / ORDER)
        # -----------------------------------------------------
        if "fulfillment" in intents and "search-in-store" in intents and last_products:
            selection_raw = self.selector_chain.invoke({
                "query": user_query,
                "products": last_products
            })

            raw = selection_raw.content.strip()

            try:
                if raw.startswith("```"):
                    raw = raw.strip("`").replace("json", "", 1).strip()
                data = json.loads(raw)
            except Exception:
                return {
                    "reply": "I couldn’t figure out which product you want to reserve.",
                    "products": []
                }

            product_index = data.get("product_index")
            size = data.get("size")

            if product_index is None or product_index >= len(last_products):
                return {"reply": "Invalid product selection."}

            product = last_products[product_index]

            # 🔥 POWERFUL, HUMAN-LIKE REPLY
            return {
                "reply": (
                    f"Nice choice 😄\n\n"
                    f"I can reserve **{product.get('name')}** for you.\n\n"
                    f"📍 First, tell me **which store** you want to reserve it from.\n"
                    f"Just say something like:\n"
                    f"➡️ *Reserve it at store 1*\n"
                    f"➡️ *Book this at the second store*\n\n"
                    f"I’ll take care of everything 💪"
                ),
                "pendingFulfillment": {
                    "intent": "reserve",
                    "product_id": product.get("id"),
                    "size": size
                },
                "products": [product]
            }

        # -----------------------------------------------------
        # 🔥 NEW: LOYALTY AGENT (READ-ONLY)
        # -----------------------------------------------------
        if "loyalty" in intents:
            if not user or not user.get("id"):
                return {
                    "reply": "Please log in to view your loyalty offers.",
                    "products": []
                }

            print("🎁 Routing to Loyalty Agent")

            res =  self.agents["loyalty"].handle({
                "user": user,
                "user_message": user_query,
                "action": "check"   # 🔒 NEVER APPLY HERE
            })

            base_reply = res.get("reply", "")
            offers = res.get("eligibleOffers", [])

            if offers:
                offer_lines = []

                for idx, offer in enumerate(offers, start=1):
                    lines = [
                        f"🎁 Offer {idx}: {offer.get('offerName', 'Special Offer')}",
                        f"• Description: {offer.get('description', 'N/A')}",
                        f"• Minimum Points Required: {offer.get('minPointsRequired', 'N/A')}",
                        f"• Discount: {offer.get('discountPercentage', 0)}%",
                    ]

                    offer_lines.append("\n".join(lines))

                offers_text = "\n\n".join(offer_lines)
                full_reply = f"{base_reply}\n\nHere are your eligible offers:\n\n{offers_text}"
            else:
                full_reply = base_reply

            res["reply"] = full_reply
            return res

        responses = {}

        # INVENTORY ONLY
        if intents == ["inventory"]:
            responses["inventory"] = self.agents["inventory"].handle(user_query)

        # RECOMMENDATION ONLY
        elif intents == ["recommendation"]:
            responses["recommendation"] = self.agents["recommendation"].handle(user_query)

        # BOTH
        elif "inventory" in intents and "recommendation" in intents:
            inv = self.agents["inventory"].handle(user_query)
            rec = self.agents["recommendation"].handle(user_query)
            responses["inventory"] = inv.get("inventory", [])
            responses["similar"] = rec.get("similar", [])
            responses["complementary"] = rec.get("complementary", [])

        # FALLBACK
        else:
            q = user_query.lower()
            if any(k in q for k in ["suggest", "recommend", "best"]):
                responses["recommendation"] = self.agents["recommendation"].handle(user_query)
            else:
                responses["inventory"] = self.agents["inventory"].handle(user_query)

        return self._merge_responses(responses)

    # ---------------------------------------------------------
    # MERGING LOGIC (UNCHANGED)
    # ---------------------------------------------------------
    def _merge_responses(self, responses):
        merged = {
            "inventory": responses.get("inventory", []),
            "similar": responses.get("similar", []),
            "complementary": responses.get("complementary", []),
        }

        if "recommendation" in responses:
            merged["similar"] = responses["recommendation"].get("similar", [])
            merged["complementary"] = responses["recommendation"].get("complementary", [])

        return merged

    # ---------------------------------------------------------
    # FASTAPI ENTRY POINT
    # ---------------------------------------------------------
    def chat(self, message: str, last_products=None, user=None):
        result = self.route(message, last_products, user)
        # print(result);

        if isinstance(result, dict) and (
            "storeInventory" in result or "eligibleOffers" in result
        ):
            return result

        products = (
            result.get("inventory", [])
            + result.get("similar", [])
            + result.get("complementary", [])
        )

        PRODUCT_EMOJI_MAP = {"shirt": "👕", "tshirt": "👕", "t-shirt": "👕", "pant": "👖", "pants": "👖", "trouser": "👖",
                             "jeans": "👖", "belt": "👔", "suit": "🕴️", "jacket": "🧥", "hoodie": "🧥", "shoe": "👟",
                             "shoes": "👟", "sneaker": "👟", "watch": "⌚", "cap": "🧢", }

        def get_product_emoji(product_name: str) -> str:
            if not product_name:
                return "🛍️"

            name = product_name.lower()

            for keyword, emoji in PRODUCT_EMOJI_MAP.items():
                if keyword in name:
                    return emoji

            return "🛍️"

        unique_products_map = {}

        for p in products:
            pid = p.get("id")
            if pid is not None:
                unique_products_map[pid] = p

        products = list(unique_products_map.values())

        if products:
            product_lines = []

            for idx, p in enumerate(products, start=1):
                name = p.get("name", "this one")
                price = p.get("price", "N/A")
                emoji = get_product_emoji(name)

                product_lines.append(
                    f"{emoji} OPTION {idx}\n"
                    f"─────────\n"
                    f"{name} — ₹{price}"
                )

            products_text = "\n\n".join(product_lines)

            reply = (
                f"heyy, sir 😄\n"
                f"I checked it properly — you’ve got {len(products)} solid options here.\n\n"
                f"{products_text}\n\n"
                f"Just tell me which one you’re feeling —\n"
                f"like 1st, 2nd, or 3rd etc.\n"
                f"I’ll handle the rest 😉"
            )
        else:
            reply = (
                "Sorry, sir 😕 I checked, but nothing solid came up this time.\n"
                "Try changing it a bit — brand, color, or category — we’ll find something 💪"
            )

        return {
            "reply": reply,
            "products": products
        }

