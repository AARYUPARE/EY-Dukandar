# pinecone_setup.py

from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import get_all_products
from utils.text_cleaner import clean_text

def build_index():
    """
    Build Pinecone embeddings for all products.
    Run only once during initialization.
    """
    products = get_all_products()

    vectors = []

    for p in products:
        combined_text = f"{p['name']} {p['brand']} {p['category']} {p['sub_category']} {p['description']}"
        cleaned = clean_text(combined_text)

        vector = embed(cleaned)

        vectors.append({
            "id": str(p["id"]),
            "values": vector,
            "metadata": {
                "name": p["name"],
                "brand": p["brand"],
                "category": p["category"],
                "sub_category": p["sub_category"],
                "price": p["price"],
                "image_url": p["image_url"],
                "sku": p["sku"]
            }
        })

    index.upsert(vectors=vectors)
    print(f"✅ Indexed {len(vectors)} products into Pinecone successfully!")


if __name__ == "__main__":
    print("🚀 Building Pinecone Vector Index...")
    build_index()
