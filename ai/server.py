from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any
from main import sales_agent, llm, inventory_agent, session_manager   # 🔥 import llm also
from utils.translator import LLMTranslator   # 🔥 new
from adapters.pos_adapter import POSAdapter
from adapters.web_adapter import WebAdapter


app = FastAPI()

translator = LLMTranslator(llm)
pos_adapter = POSAdapter(session_manager, inventory_agent, llm)
web_adapter = WebAdapter(session_manager, llm)

class Query(BaseModel):
    message: str
    sessionId: str
    user: Optional[Dict[str, Any]] = None   # ✅ USER COMES HERE

@app.post("/query")
def query(data: Query):
    # print("📨 Incoming request:", data)

    print("From frontend: " + data.message)

    lang, english_message = translator.to_english(data.message)

    response = sales_agent.handle(
        user=data.user,
        session_id=data.sessionId,
        user_message=english_message
    )
    print("After: Conversion: " + english_message)

    # print("🤖 Agent response (raw):", response)

    def safe_convert(obj):
        if isinstance(obj, bytes):
            return obj.hex()
        if isinstance(obj, dict):
            return {k: safe_convert(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [safe_convert(i) for i in obj]
        return obj

    response = safe_convert(response)

    reply = response.get("reply")

    reply = translator.from_english(reply, lang)

    return {
        "reply": reply,
        "products": response.get("products") or [],
        "stores": response.get("stores") or [],
        "user_lang": lang,
    }

# ======================================
# NEW LOGIN CONTINUITY ENDPOINT
# ======================================

class LoginEvent(BaseModel):
    sessionId: str
    channel: str          # "web" | "kiosk"
    user: Optional[Dict[str, Any]] = None
    store: Optional[Dict[str, Any]] = None


@app.post("/login-event")
def login_event(data: LoginEvent):

    try:
        print("🔥 Login event received:", data.channel)

        if data.channel.lower() == "kiosk":
            reply = pos_adapter.on_user_login(
                session_id=data.sessionId,
                user=data.user,
                store=data.store
            )
        else:
            reply = web_adapter.on_user_login(
                session_id=data.sessionId,
                user=data.user
            )

        print("Login event reply:", reply)

        return {"reply": reply}

    except Exception as e:
        print("AI ERROR:", str(e))
        return {
            "reply": "Welcome back! How can I help you today? 😊"
        }

