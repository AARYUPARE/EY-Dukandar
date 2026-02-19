# =====================================================
# 0️⃣ UTILITIES
# =====================================================
def make_json_safe(obj):
    if isinstance(obj, bytes):
        try:
            return obj.decode("utf-8")
        except UnicodeDecodeError:
            return repr(obj)
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [make_json_safe(v) for v in obj]
    return obj


from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import fetch_products_by_ids
from utils.text_cleaner import clean_text


class RecommendationAgent:

    def __init__(self):
        # Category → complementary categories
        self.COMPLEMENTARY_MAP = {
            "shirt": ["belt", "trouser", "jeans"],
            "tshirt": ["jeans", "shorts"],
            "jeans": ["belt", "tshirt"],
            "trouser": ["belt", "shirt"],
            "shoes": ["socks", "shoe_care"],
            "sneakers": ["socks", "shoe_care"],
        }

    # =====================================================
    # INTERNAL VECTOR SEARCH
    # =====================================================
    def _search(self, query: str, k=6, filters=None):
        vector = embed(clean_text(query))

        res = index.query(
            vector=vector,
            top_k=k,
            include_metadata=True,
            filter=filters or {}
        )

        ids = [str(m["id"]) for m in res.get("matches", [])]
        products = fetch_products_by_ids(ids)
        return make_json_safe(products)

    # =====================================================
    # QUALITY SCORING HELPERS
    # =====================================================
    def get_fabric_score(self, fabric: str) -> int:
        if not fabric:
            return 0

        fabric = fabric.lower()

        if "linen" in fabric:
            return 6
        if "cotton" in fabric and "blend" in fabric:
            return 4
        if "pure cotton" in fabric or "100%" in fabric:
            return 3
        if "cotton" in fabric:
            return 2
        if "poly" in fabric:
            return 1

        return 0

    def get_finish_score(self, finish: str) -> int:
        if not finish:
            return 0

        finish = finish.lower()

        if "premium" in finish:
            return 5
        if "wrinkle" in finish:
            return 4
        if "pre" in finish:
            return 3
        if "enzyme" in finish:
            return 2
        if "regular" in finish:
            return 1

        return 0

    def quality_score(self, product: dict) -> int:
        fabric_score = self.get_fabric_score(
            product.get("fabric", "")
        )
        finish_score = self.get_finish_score(
            product.get("finish", "")
        )

        # Fabric > Finish
        return fabric_score * 2 + finish_score

    # =====================================================
    # 1️⃣ DISCOVERY (SalesAgent → intent == DISCOVERY)
    # =====================================================
    def find_products(
            self,
            product_type=None,
            occasion=None,
            budget=None,
            size=None
    ):
        query_parts = []

        if product_type:
            query_parts.append(product_type)
        if occasion:
            query_parts.append(occasion)
        if size:
            query_parts.append(f"size {size}")

        query = " ".join(query_parts)

        filters = {}
        if budget:
            filters["price"] = {"$lte": budget}

        return self._search(
            query=query,
            k=6,
            filters=filters
        )

    # =====================================================
    # 2️⃣ QUALITY UPGRADE (SalesAgent → after product select)
    # =====================================================
    def get_quality_upgrade(self, selected_product: dict,
                            budget=None, occasion=None):
        category = selected_product.get("category")
        price = selected_product.get("price")

        print("UPGRADE")

        if not category or not price:
            return None

        max_price = price + 500
        if budget:
            max_price = min(max_price, budget)

        # 🎯 Occasion-aware query
        query_parts = ["premium", category]
        if occasion:
            query_parts.append(occasion)

        candidates = self._search(
            query=" ".join(query_parts),
            k=6,
            filters={
                "category": category,
                "price": {"$gt": price, "$lte": max_price}
            }
        )

        base_score = self.quality_score(selected_product)

        upgrades = [
            p for p in candidates
            if self.quality_score(p) > base_score
        ]

        if not upgrades:
            return None

        upgrades.sort(key=lambda x: x["price"])

        upgrade = upgrades[0]
        price_diff = upgrade["price"] - price

        return upgrade, price_diff

    # =====================================================
    # 3️⃣ CROSS-SELL (SalesAgent → after ADD_TO_CART)
    # =====================================================
    def cross_sell(self, base_product: dict):

        category = base_product.get("category")
        if not category:
            return []

        complements = self.COMPLEMENTARY_MAP.get(category.lower(), [])
        if not complements:
            return []

        products = self._search(
            query=f"{category} accessories",
            k=5,
            filters={"category": {"$in": complements}}
        )

        if not products:
            return []

        # Sort by quality score
        products.sort(
            key=lambda x: self.quality_score(x),
            reverse=True
        )

        return products[:2]

    # =====================================================
    # 4️⃣ BUNDLE (BUSINESS RULES)
    # =====================================================
    def bundle(self, base_product: dict, occasion=None):

        if not base_product:
            return None

        category = base_product.get("category")
        base_price = base_product.get("price", 0)

        if not category or not base_price:
            return None

        complements = self.COMPLEMENTARY_MAP.get(category.lower(), [])
        if not complements:
            return None

        # Build smart query
        query_parts = [category]

        if occasion:
            query_parts.append(occasion)

        if base_product.get("fabric"):
            query_parts.append(base_product["fabric"])

        query = " ".join(query_parts)

        # Search complementary products
        candidates = self._search(
            query=query,
            k=6,
            filters={"category": {"$in": complements}}
        )

        if not candidates:
            return None

        # Price compatibility filter (economic logic)
        candidates = [
            p for p in candidates
            if p.get("price")
               and 0.1 * base_price <= p["price"] <= 0.6 * base_price
        ]

        if not candidates:
            return None

        # Rank by quality score
        candidates.sort(
            key=lambda x: self.quality_score(x),
            reverse=True
        )

        selected = candidates[0]

        bundle_total = base_price + selected["price"]

        # Dynamic discount strategy
        if bundle_total > 5000:
            discount = {
                "type": "PERCENT",
                "value": 15,
                "label": "Premium Combo Offer"
            }
        elif bundle_total > 3000:
            discount = {
                "type": "PERCENT",
                "value": 10,
                "label": "Smart Saver Combo"
            }
        else:
            discount = {
                "type": "FLAT",
                "value": 100,
                "label": "Starter Combo Deal"
            }

        return {
            "items": [selected],
            "discount": discount
        }