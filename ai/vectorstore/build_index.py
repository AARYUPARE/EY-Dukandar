# pinecone_setup.py

from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import get_all_products
from utils.text_cleaner import clean_text


def safe_str(value):
    """Convert None → empty string, else string"""
    return str(value) if value is not None else ""


def safe_list(value):
    """Convert None → empty list, ensure list[str]"""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v]
    return [str(value)]


def build_index():
    print("🧹 Attempting to delete existing Pinecone vectors...")

    try:
        index.delete(delete_all=True)
        print("🧹 Existing vectors deleted")
    except Exception:
        print("ℹ️ No existing vectors found, skipping delete")

    products = get_all_products()
    print(f"📦 Fetched {len(products)} products from DB")

    vectors = []

    for p in products:
        # ---- normalize subCategory from any backend shape ----
        sub_category = (
            p.get("subCategory")
            or p.get("sub_category")
            or p.get("subcategory")
        )

        # ---- text for embedding ----

        combined_text = f"""
            name: {safe_str(p.get('name'))}
            category: {safe_str(p.get('category'))}
            subcategory: {safe_str(sub_category)}
            brand: {safe_str(p.get('brand'))}
        """

        cleaned = clean_text(combined_text)
        vector = embed(cleaned)

        vectors.append({
            "id": str(p["id"]),   # id must be string
            "values": vector,
            "metadata": {
                "name": safe_str(p.get("name")),
                "brand": safe_str(p.get("brand")),
                "category": safe_str(p.get("category")),
                "sub_category": sub_category,      # ✅ str
                "price": float(p.get("price", 0)),   # ✅ number
                "image_url": safe_str(p.get("imageUrl") or p.get("image_url")),
                "model_url": safe_str(p.get("modelUrl") or p.get("model_url")),
                "sku": safe_str(p.get("sku")),
                "productLink": safe_str(p.get("productLink")),
            }
        })

    if vectors:
        index.upsert(vectors=vectors)
        print(f"✅ Indexed {len(vectors)} products into Pinecone successfully!")
    else:
        print("⚠️ No products found to index.")


if __name__ == "__main__":
    print("🚀 Rebuilding Pinecone Vector Index...")
    build_index()
