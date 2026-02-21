import os
import requests
import barcode
from barcode.writer import ImageWriter


# ===============================
# CONFIG
# ===============================

BASE_URL = "http://localhost:8080/api"   # your Spring Boot
OUTPUT_DIR = "barcodes"


# Barcode styling (important for scanning reliability)
OPTIONS = {
    "module_width": 0.35,     # bar thickness
    "module_height": 18,      # height
    "font_size": 12,
    "text_distance": 5,
    "quiet_zone": 6,
    "write_text": True
}


# ===============================
# HELPERS
# ===============================

def fetch_json(url):
    """Generic GET helper"""
    r = requests.get(url, timeout=10)

    if r.status_code != 200:
        print(f"❌ Failed: {url}")
        return []

    return r.json()


def get_products():
    return fetch_json(f"{BASE_URL}/products")


def get_inventory(product_id):
    return fetch_json(f"{BASE_URL}/inventory/product/{product_id}")


def generate_barcode(data):
    """Generate Code128 barcode image"""
    code = barcode.get("code128", data, writer=ImageWriter())
    filepath = os.path.join(OUTPUT_DIR, data)
    code.save(filepath, OPTIONS)


# ===============================
# MAIN
# ===============================

def main():

    print("\n🚀 Starting Dukandar Barcode Generator...\n")

    # create folder if not exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    products = get_products()

    if not products:
        print("❌ No products found. Is backend running?")
        return

    total = 0

    for product in products:

        product_id = product["id"]
        sku = product["sku"]

        print(f"\n📦 Product: {sku}")

        inventories = get_inventory(product_id)

        if not inventories:
            print("   ⚠ No inventory found")
            continue

        for inv in inventories:
            store_id = inv["storeId"]
            size = inv.get("size", "NA")

            barcode_text = f"{sku}_{store_id}_{size}"

            print(f"   → Generating: {barcode_text}")

            generate_barcode(barcode_text)
            total += 1

    print(f"\n✅ Done! Generated {total} barcodes in '{OUTPUT_DIR}' folder\n")


if __name__ == "__main__":
    main()
