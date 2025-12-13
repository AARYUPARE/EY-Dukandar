# vectorstore/build_index.py

import time
from pinecone import Pinecone, ServerlessSpec
from db.product_queries import get_all_products
from vectorstore.embedder import embed
from utils.text_cleaner import clean_text

# ---------------------------------------------
# CONFIG
# ---------------------------------------------
INDEX_NAME = "dukandar"
DIMENSION = 384   # your embedding dimension
CLOUD = "aws"
REGION = "us-east-1"
BATCH_SIZE = 50

# ---------------------------------------------
# CONNECT TO PINECONE
# ---------------------------------------------
pc = Pinecone(api_key="pcsk_4kyrnt_L4MKiuVp1fWGFc5V5yaqWhHZgnZzJKoFmr62Q8Ur1UWWANM5Fo4HyuEPNLyMKS3")   # <-- Replace with env var ideally


# ---------------------------------------------
# SAFE METADATA CLEANER
# ---------------------------------------------
def safe_meta(value):
    if value is None:
        return ""
    if isinstance(value, list):
        return ", ".join(str(x) for x in value)
    return str(value)


# ---------------------------------------------
# DELETE OLD INDEX IF EXISTS
# ---------------------------------------------
def reset_index():
    existing = [idx["name"] for idx in pc.list_indexes()]

    if INDEX_NAME in existing:
        print(f"🗑 Deleting old index: {INDEX_NAME}")
        pc.delete_index(name=INDEX_NAME)
        time.sleep(3)  # wait until deleted

    print(f"🆕 Creating new index: {INDEX_NAME}")
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud=CLOUD, region=REGION)
    )

    time.sleep(5)  # give time to initialize
    print("✅ New index created.")


# ---------------------------------------------
# EMBEDDING PIPELINE
# ---------------------------------------------
def embed_product_text(p):
    text = f"""
        {p.get('name', '')}
        {p.get('brand', '')}
        {p.get('category', '')}
        {p.get('subCategory', '')}
        {p.get('description', '')}
    """
    text = clean_text(text)
    return embed(text)


# ---------------------------------------------
# UPSERT ALL PRODUCTS
# ---------------------------------------------
def upsert_all():
    index = pc.Index(INDEX_NAME)

    products = get_all_products()
    vectors = []

    print(f"📦 Total products found: {len(products)}")

    for p in products:
        print("➡ Upserting:", p)

        vectors.append({
            "id": str(p["id"]),
            "values": embed_product_text(p),
            "metadata": {
                "name": safe_meta(p.get("name")),
                "brand": safe_meta(p.get("brand")),
                "category": safe_meta(p.get("category")),
                "sub_category": safe_meta(p.get("subCategory")),
                "price": float(p.get("price", 0)),
                "image_url": safe_meta(p.get("imageUrl")),
                "model_url": safe_meta(p.get("modelUrl")),
                "sku": safe_meta(p.get("sku")),
            }
        })

        # batch
        if len(vectors) >= BATCH_SIZE:
            index.upsert(vectors=vectors)
            vectors = []

    # final batch
    if vectors:
        index.upsert(vectors=vectors)

    print("✅ All products upserted successfully!")


# ---------------------------------------------
# MAIN SCRIPT
# ---------------------------------------------
if __name__ == "__main__":
    reset_index()
    upsert_all()
    print("🎉 Pinecone index rebuild complete!")
