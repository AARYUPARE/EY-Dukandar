from vectorstore.pinecone_client import get_index
from vectorstore.embedder import embed
from utils.text_cleaner import clean_text

def recommendation_agent(sales_output):
    product = sales_output.get("product_name", "")
    category = sales_output.get("category", "")
    subCategory = sales_output.get("subCategory", [])

    # Build a strong semantic query
    query_text = f"{product} {category} {','.join(subCategory)}"
    query_text = clean_text(query_text)

    query_vector = embed(query_text)
    index = get_index()

    try:
        response = index.query(
            vector=query_vector,
            top_k=10,
            include_metadata=True
        )
    except Exception as e:
        return {"reply": f"Error querying Pinecone: {str(e)}", "similar": []}

    similar_items = []
    for match in response.matches:
        similar_items.append({
            "id": match.id,
            "score": match.score,
            "name": match.metadata.get("name", ""),
            "brand": match.metadata.get("brand", ""),
            "category": match.metadata.get("category", ""),
            "sub_category": match.metadata.get("sub_category", ""),
            "price": match.metadata.get("price", ""),
            "image_url": match.metadata.get("image_url", ""),
            "sku": match.metadata.get("sku", ""),
        })

    return {
        "reply": f"Found {len(similar_items)} similar items.",
        "similar": similar_items
    }