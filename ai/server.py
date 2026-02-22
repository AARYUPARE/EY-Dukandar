from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any

from main import sales_agent, llm, inventory_agent, payment_agent, session_manager, pos_adapter, web_adapter   # 🔥 import llm also
from utils.translator import LLMTranslator   # 🔥 new
from adapters.pos_adapter import POSAdapter
from adapters.web_adapter import WebAdapter


app = FastAPI()

translator = LLMTranslator(llm)


class Query(BaseModel):
    message: str
    sessionId: str
    user: Optional[Dict[str, Any]] = None   # ✅ USER COMES HERE

@app.post("/query")
def query(data: Query):

    print("From frontend: " + data.message)

    # 🔥 Get session first
    session = session_manager.get(data.sessionId) or {}

    # =====================================================
    # 2️⃣ NORMAL AI FLOW
    # =====================================================

    lang, english_message = translator.to_english(data.message)

    response = sales_agent.handle(
        user=data.user,
        session_id=data.sessionId,
        user_message=english_message
    )

    print("After: Conversion: " + english_message)

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

        #print("Login event reply:", reply)

        return {"reply": reply}

    except Exception as e:
        print("AI ERROR:", str(e))
        return {
            "reply": "Welcome back! How can I help you today? 😊"
        }

class QRScanEvent(BaseModel):
    sessionId: str
    product: Dict[str, Any]


@app.post("/qr-scan")
def qr_scan(data: QRScanEvent):

    print("📱 QR Scan received")

    reply = pos_adapter.handle_qr_scan(
        session_id=data.sessionId,
        product=data.product
    )

    return {"reply": reply}

class SuccessEvent(BaseModel):
    sessionId: str

@app.post("/show_success")
def show_success(data: SuccessEvent):
    
    session = session_manager.get(data.sessionId) or {}
    
    if session.get("payment_pending"):
        
        reply = pos_adapter.payment_success(
            session_id=data.sessionId
        )

        return {"reply": reply}
    
    else:
        reply = payment_agent.payment_success(
            session_id=data.sessionId
        )

        return {"reply": reply} 
        
    

