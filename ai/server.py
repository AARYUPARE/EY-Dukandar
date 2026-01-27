from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any
from main import orchestrator

app = FastAPI()

class Query(BaseModel):
    context: str
    message: str
    lastProducts: list = []
    user: Optional[Dict[str, Any]] = None   # ✅ USER COMES HERE

@app.post("/query")
def query(data: Query):
    # print("📨 Incoming request:", data)

    response = orchestrator.chat(
        message=data.message,
        user=data.user
    )

    print(response)
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

    return {
        "reply": response.get("reply"),
        "products": response.get("products"),
        "stores": response.get("storeInventory")
    }
