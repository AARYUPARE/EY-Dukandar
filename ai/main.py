# main.py

# LangChain
from langchain_core.runnables import RunnableSequence
from langchain_core.prompts import PromptTemplate


from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Groq LLaMA 3 model (free API key from https://console.groq.com/keys)

# ---------------------------------------------------------
# 1. LLM SETUP (Fix: ensure a Runnable LLM is available)
# ---------------------------------------------------------
try:
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.7,
        api_key=os.getenv("API_KEY")
    )
    print("✔ Using Groq LLM")
except Exception as e:
    print("❌ Groq LLM load failed:", e)
    print("⚠ Running WITHOUT LLM. Intent classifier will NOT work.")
    llm = None  # prevent breaking project


# ---------------------------------------------------------
# 2. IMPORT AGENTS
# ---------------------------------------------------------
from agents.recommendation_agent import RecommendationAgent
from agents.inventory_agent import InventoryAgent

# Optional stubs (so orchestrator does not crash)
class DummyAgent:
    def handle(self, q):
        return {"summary": "Not implemented"}

payment_agent = DummyAgent()
fulfillment_agent = DummyAgent()
loyalty_agent = DummyAgent()
support_agent = DummyAgent()


# ---------------------------------------------------------
# 3. INSTANTIATE AGENTS
# ---------------------------------------------------------
reco_agent = RecommendationAgent(llm=llm)
inv_agent = InventoryAgent(recommendation_agent=reco_agent, llm=llm)

agents = {
    "recommendation": reco_agent,
    "inventory": inv_agent,
    "payment": payment_agent,
    "fulfillment": fulfillment_agent,
    "loyalty": loyalty_agent,
    "support": support_agent
}


# ---------------------------------------------------------
# 4. ORCHESTRATOR
# ---------------------------------------------------------
from orchestrator.sales_agent import SalesAgentOrchestrator

orchestrator = SalesAgentOrchestrator(agents=agents, llm=llm)


# ---------------------------------------------------------
# 5. REPL LOOP
# ---------------------------------------------------------
def repl():
    print("\n=== Dukandar AI | Sales Assistant ===")

    if llm is None:
        print("⚠ Warning: No LLM. Only inventory & recommendations will work.\n")

    while True:
        q = input("You: ").strip()

        if q.lower() in {"quit", "exit"}:
            break

        out = orchestrator.chat(q)

        print("\n--- Response ---")

        if isinstance(out, str):
            print(out)
            continue

        if out.get("products"):
            print("\nProducts:")
            for p in out["products"][:10]:
                print(f" - {p['name']} | ₹{p['price']}")

        print("\n---------------\n")


# ---------------------------------------------------------
# RUN
# ---------------------------------------------------------
if __name__ == "__main__":
    repl()