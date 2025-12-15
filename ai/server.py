from fastapi import FastAPI
from pydantic import BaseModel
from main import orchestrator

app = FastAPI()

class Query(BaseModel):
    context: str
    message: str
    lastProducts: list = []   # 🔥 REQUIRED

@app.post("/query")
def query(data: Query):
    print(data)

    user_query = data.message
    last_products = data.lastProducts

    response = orchestrator.chat(
        message=user_query,
        last_products=last_products
    )

    # Convert any bytes → safe string
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
        # optional (but useful)
        "storeInventory": response.get("storeInventory")
    }
