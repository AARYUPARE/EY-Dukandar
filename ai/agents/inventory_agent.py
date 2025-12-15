import requests

BACKEND_BASE_URL = "http://localhost:8080"

def handle(sales_output):

    product_name = sales_output.get("product_name")
    size = sales_output.get("size")

    if not product_name:
        return {"error": "No product name provided"}

    try:
        # 1) Search product in backend
        product_response = requests.get(
            f"{BACKEND_BASE_URL}/api/products/search",
            params={"name": product_name}
        )

        if product_response.status_code != 200:
            return {"error": "Product service error"}

        products = product_response.json()
        if not products:
            return {"inventory": []}

        product = products[0]
        product_id = product.get("id")

        # 2) Check inventory for this product
        inventory_response = requests.get(
            f"{BACKEND_BASE_URL}/api/inventory/check",
            params={"productId": product_id, "size": size}
        )

        if inventory_response.status_code != 200:
            return {"error": "Inventory service error"}

        inventory_data = inventory_response.json()

        return {
            "inventory": inventory_data,
            "product": product,
            "category": product.get("category"),
            "subCategory": product.get("subCategory", [])
        }

    except Exception as e:
        return {"error": str(e)}