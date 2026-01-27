from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq

# -----------------------------------------
# 1. LOAD ENV & LLM
# -----------------------------------------
load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.7,
    api_key=os.getenv("GROQ_API_KEY")
)

# -----------------------------------------
# 2. IMPORT AGENTS (CLASSES ONLY)
# -----------------------------------------
from agents.payment_agent import PaymentAgent
from agents.recommendation_agent import RecommendationAgent
from agents.inventory_agent import InventoryAgent
from agents.loyalty_agent import LoyaltyAgent
from agents.support_agent import SupportAgent
from agents.fulfillment_agent import FulfillmentAgent

# -----------------------------------------
# 3. INSTANTIATE AGENTS (MATCH CONSTRUCTORS)
# -----------------------------------------

agents = {
    "recommendation": RecommendationAgent(llm=llm),
    "inventory": InventoryAgent(),
    "payment": PaymentAgent(),
    "fulfillment": FulfillmentAgent(),
    "loyalty": LoyaltyAgent(),
    "support": SupportAgent(base_url="http://localhost:8080")
}

# -----------------------------------------
# 4. ORCHESTRATOR
# -----------------------------------------
from orchestrator.sales_agent import SalesAgentOrchestrator

orchestrator = SalesAgentOrchestrator(
    recommendation_agent=agents["recommendation"],
    inventory_agent=agents["inventory"],
    fulfillment_agent=agents["fulfillment"],
    payment_agent=agents["payment"],
    loyalty_agent=agents["loyalty"],   # 🔥 ADD THIS
    llm = llm
)

# -----------------------------------------
# 5. REPL LOOP
# -----------------------------------------
def repl():
    print("\n=== Dukandar AI | Sales Assistant ===")

    while True:
        q = input("You: ").strip()

        if q.lower() in {"quit", "exit"}:
            print("👋 Bye!")
            break

        out = orchestrator.chat(q)

        # print("\n--- Response ---")

        # if isinstance(out, str):
        #     print(out)
        #     continue

        # if isinstance(out, dict) and out.get("products"):
        #     print("\nProducts:")
        #     for p in out["products"][:10]:
        #         print(f" - {p['name']} | ₹{p['price']}")

        # print("\n---------------\n")

# -----------------------------------------
# RUN
# -----------------------------------------
if __name__ == "__main__":
    repl()