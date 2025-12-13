# orchestrator/sales_agent_orchestrator.py

from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

class SalesAgentOrchestrator:
    def __init__(self, agents: dict, llm):
        self.agents = agents
        self.llm = llm

        # --- Intent Classifier Prompt ---
        self.intent_prompt = PromptTemplate(
            input_variables=["query"],
            template="""
You are a retail assistant AI.
Classify the user's intent for this query (comma-separated).

Valid intents:
- recommendation
- inventory
- payment
- fulfillment
- loyalty
- support

Query: {query}

Return ONLY the intents in comma-separated format.
""",
        )

        self.intent_chain = RunnableSequence(self.intent_prompt, self.llm)

    # ---------------------------------------------------------
    # ROUTING
    # ---------------------------------------------------------
    def route(self, user_query: str):

        # 1. Intent classification
        intent_raw = self.intent_chain.invoke({"query": user_query})
        intent_text = intent_raw.content.lower().strip()

        intents = [i.strip() for i in intent_text.split(",") if i.strip()]
        print("🧭 Detected intents:", intents)

        responses = {}

        # 2. If only inventory → inventory
        if intents == ["inventory"]:
            responses["inventory"] = self.agents["inventory"].handle(user_query)

        # 3. If only recommendation → recommendation
        elif intents == ["recommendation"]:
            responses["recommendation"] = self.agents["recommendation"].handle(user_query)

        # 4. If both inventory + recommendation
        elif "inventory" in intents and "recommendation" in intents:
            inv = self.agents["inventory"].handle(user_query)
            rec = self.agents["recommendation"].handle(user_query)
            responses["inventory"] = inv.get("inventory", [])
            responses["similar"] = rec.get("similar", [])
            responses["complementary"] = rec.get("complementary", [])

        # 5. Fallback
        else:
            q = user_query.lower()
            if any(k in q for k in ["suggest", "recommend", "best"]):
                responses["recommendation"] = self.agents["recommendation"].handle(user_query)
            else:
                responses["inventory"] = self.agents["inventory"].handle(user_query)

        return self._merge_responses(responses)

    # ---------------------------------------------------------
    # MERGING LOGIC
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
    # FASTAPI RESPONSE BUILDER
    # ---------------------------------------------------------
    def chat(self, message):

        result = self.route(message)

        # UI text
        if result["inventory"]:
            reply = f"Found {len(result['inventory'])} matching products."
        elif result["similar"]:
            reply = f"Found {len(result['similar'])} similar products."
        else:
            reply = "No relevant products found."

        # combine product lists
        products = (
            result.get("inventory", []) +
            result.get("similar", []) +
            result.get("complementary", [])
        )

        print(products)

        return {
            "reply": reply,
            "products": products
        }
