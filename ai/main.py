from dotenv import load_dotenv
import os
import uuid

from langchain_groq import ChatGroq

# -------------------------------
# 1️⃣ LOAD ENV
# -------------------------------
load_dotenv(override=True)

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.7,
    api_key=os.getenv("GROQ_API_KEY")
)

# -------------------------------
# 2️⃣ IMPORT YOUR AGENTS
# -------------------------------
from orchestrator.sales_agent import SalesAgent
from agents.recommendation_agent import RecommendationAgent
from agents.inventory_agent import InventoryAgent
from agents.fulfillment_agent import FulfillmentAgent
from session.session_manager import RedisSessionManager
from agents.payment_agent import PaymentAgent
from agents.loyalty_agent import LoyaltyAgent
from adapters.pos_adapter import POSAdapter
from adapters.web_adapter import WebAdapter

# -------------------------------
# 3️⃣ INIT SESSION MANAGER
# -------------------------------
session_manager = RedisSessionManager(
    redis_host="localhost",
    redis_port=6379,
    db=0
)

# -------------------------------
# 4️⃣ INIT DOMAIN AGENTS
# -------------------------------
recommendation_agent = RecommendationAgent()
inventory_agent = InventoryAgent()
fulfillment_agent = FulfillmentAgent()
payment_agent = PaymentAgent(session=session_manager)
loyalty_agent = LoyaltyAgent(session_manager=session_manager)

pos_adapter = POSAdapter(session_manager, inventory_agent, payment_agent, llm)
web_adapter = WebAdapter(session_manager, llm)

# -------------------------------
# 5️⃣ INIT SALES AGENT (CORE)
# -------------------------------
sales_agent = SalesAgent(
    llm=llm,
    recommendation_agent=recommendation_agent,
    fulfillment_agent=fulfillment_agent,
    inventory_agent=inventory_agent,
    session_manager=session_manager,
    payment_agent=payment_agent,
    loyalty_agent=loyalty_agent,
    pos_adapter=pos_adapter
)

# -------------------------------
# 6️⃣ REPL LOOP (CLI CHAT)
# -------------------------------
def repl():
    print("\n=== 🛍️ Dukandar AI | Sales Assistant ===")

    # 🔐 One session per user
    session_id = str(uuid.uuid4())
    print(f"[Session ID]: {session_id}\n")

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() in {"exit", "quit"}:
            print("👋 Bye!")
            break

        try:
            response = sales_agent.handle(
                user=user,
                session_id=session_id,
                user_message=user_input
            )
        except Exception as e:
            print("❌ Error:", e)
            continue

        print("\nAssistant:")
        print(response)
        print("-" * 50)


# -------------------------------
# 7️⃣ RUN
# -------------------------------
if __name__ == "__main__":
    repl()