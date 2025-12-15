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
You are a retail assistant AI.
Classify the user's intent (comma-separated).

Valid intents:
- recommendation
- inventory
- search-in-store
- payment
- fulfillment
- loyalty
- support

If user refers to a previously shown product
(e.g. "3rd product", "I like this", "buy this"),
use search-in-store.

Query: {query}
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
    def route(self, user_query: str, last_products=None):
        last_products = last_products or []

        intent_raw = self.intent_chain.invoke({"query": user_query})
        intents = [i.strip() for i in intent_raw.content.lower().split(",") if i.strip()]

        print("🧭 Detected intents:", intents)

        # 🔥 SEARCH IN STORE
        if "search-in-store" in intents and last_products:
            selection_raw = self.selector_chain.invoke({
                "query": user_query,
                "products": last_products
            })

            raw = selection_raw.content.strip()
            print("🔍 Selector raw output:", raw)

            # Try to extract JSON safely
            try:
                # If wrapped in markdown ```json
                if raw.startswith("```"):
                    raw = raw.strip("`")
                    raw = raw.replace("json", "", 1).strip()

                data = json.loads(raw)
            except Exception:
                # Fallback: no valid JSON
                return {
                    "reply": "Sorry, I couldn't understand which product you selected.",
                    "products": []
                }

            idx = data.get("product_index")
            size = data.get("size")

            return self.agents["inventory"].search_in_store(
                product_index=idx,
                product_list=last_products,
                size=size
            )

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
    # 🔥 MERGING LOGIC (FROM OLD VERSION)
    # ---------------------------------------------------------
    def _merge_responses(self, responses):
        merged = {
            "inventory": responses.get("inventory", []),
            "similar": responses.get("similar", []),
            "complementary": responses.get("complementary", []),
        }

        # If recommendation agent returned full dict
        if "recommendation" in responses:
            merged["similar"] = responses["recommendation"].get("similar", [])
            merged["complementary"] = responses["recommendation"].get("complementary", [])

        return merged

    # ---------------------------------------------------------
    # FASTAPI ENTRY POINT
    # ---------------------------------------------------------
    def chat(self, message: str, last_products=None):

        result = self.route(message, last_products)

        # search-in-store response (already final)
        if isinstance(result, dict) and "storeInventory" in result:
            return result

        products = (
            result.get("inventory", [])
            + result.get("similar", [])
            + result.get("complementary", [])
        )

        if products:
            reply = f"Found {len(products)} matching products."
        else:
            reply = "No relevant products found."

        return {
            "reply": reply,
            "products": products
        }
