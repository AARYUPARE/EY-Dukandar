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
        pass

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
    def quality_score(self, product: dict) -> int:

        score = 0
        # -------------------------
        # 1️⃣ PRICE BASED SCORING
        # -------------------------
        price = product.get("price", 0)

        if price >= 4000:
            score += 5
        elif price >= 2500:
            score += 4
        elif price >= 1500:
            score += 3
        elif price >= 800:
            score += 2
        else:
            score += 1

        # -------------------------
        # 2️⃣ BRAND BASED SCORING
        # -------------------------
        premium_brands = {
            "louis philippe": 3,
            "van heusen": 2,
            "allen solly": 2,
            "peter england": 1
        }

        brand = product.get("brand", "").lower()

        for b, weight in premium_brands.items():
            if b in brand:
                score += weight
                break

        # -------------------------
        # 3️⃣ SUBCATEGORY KEYWORDS
        # -------------------------
        premium_keywords = [
            "formal",
            "slim fit",
            "premium",
            "solid",
            "tailored",
            "luxury"
        ]

        subcat = product.get("subCategory", "").lower()

        for keyword in premium_keywords:
            if keyword in subcat:
                score += 1

        # -------------------------
        # 4️⃣ NAME BASED BONUS
        # -------------------------
        name = product.get("name", "").lower()

        if "slim fit" in name:
            score += 1
        if "solid" in name:
            score += 1

        return score

    # =====================================================
    # 1️⃣ DISCOVERY (SalesAgent → intent == DISCOVERY)
    # =====================================================
    def find_products(
            self,
            product_type=None,
            occasion=None,
            budget=None
    ):
        query_parts = []

        if product_type:
            query_parts.append(product_type)
        if occasion:
            query_parts.append(occasion)

        query = " ".join(query_parts)

        filters = {}
        if budget:
            filters["price"] = {"$lte": budget}
            
        if product_type:
            filters["category"] = product_type

        return self._search(
            query=query,
            k=6,
            filters=filters
        )

    # =====================================================
    # 2️⃣ QUALITY UPGRADE (SalesAgent → after product select)
    # =====================================================
    def up_sell(self, selected_product: dict, occasion=None):

        category = selected_product.get("category")
        price = selected_product.get("price")

        if not category or not price:
            return None

        max_price = price + 500

        candidates = self._search(
            query=category,
            k=6,
            filters={
                "category": category,
                "price": {"$gt": price, "$lte": max_price}
            }
        )

        if not candidates:
            return None

        # Exclude same product
        candidates = [
            p for p in candidates
            if p.get("sku") != selected_product.get("sku")
        ]

        if not candidates:
            return None

        # Choose smallest price jump
        candidates.sort(key=lambda x: x["price"])

        upgrade = candidates[0]
        return upgrade
    

    # =====================================================
    # 4️⃣ BUNDLE (DYNAMIC MULTI-ITEM - HACKATHON READY)
    # =====================================================
    def cross_sell(self, base_product: dict, occasion=None):

        if not base_product:
            return None

        category = base_product.get("category")
        base_price = base_product.get("price", 0)

        if not category or not base_price:
            return None

        # =====================================================
        # 🎯 Outfit Blueprint (Group Based)
        # =====================================================
        BUNDLE_TARGET = {
            "shirt": {
                "bottom": ["pant", "trouser", "jeans"],
                "accessory": ["belt"],
                "footwear": ["shoes", "sneakers"]
            },
            "tshirt": {
                "bottom": ["jeans", "shorts"],
                "footwear": ["sneakers"]
            },
            "jeans": {
                "top": ["shirt", "tshirt"],
                "accessory": ["belt"],
                "footwear": ["shoes", "sneakers"]
            },
            "trouser": {
                "top": ["shirt"],
                "accessory": ["belt"],
                "footwear": ["shoes"]
            },
        }

        targets = BUNDLE_TARGET.get(category.lower())
        if not targets:
            return None

        # =====================================================
        # 🔎 Flatten Categories For Pinecone Filter
        # =====================================================
        flat_categories = []
        for group in targets.values():
            flat_categories.extend(group)

        # =====================================================
        # 🔎 Build Smart Semantic Query
        # =====================================================
        query_parts = [
            base_product.get("name", ""),
            category,
            "complete outfit",
            "matching items"
        ]

        if occasion:
            query_parts.append(occasion)

        if base_product.get("subCategory"):
            query_parts.append(base_product["subCategory"])

        query = " ".join(query_parts)

        # =====================================================
        # 🔎 Search From Pinecone
        # =====================================================
        candidates = self._search(
            query=query,
            k=25,
            filters={"category": {"$in": flat_categories}}
        )

        if not candidates:
            return None

        # =====================================================
        # 💰 Price Compatibility Filter
        # =====================================================
        filtered = [
            p for p in candidates
            if p.get("price")
            and p.get("sku") != base_product.get("sku")
            and 0.3 * base_price <= p["price"] <= 1.2 * base_price
        ]

        if not filtered:
            return None

        # =====================================================
        # ⭐ Quality Filtering
        # =====================================================
        base_quality = self.quality_score(base_product)

        filtered = [
            p for p in filtered
            if self.quality_score(p) >= base_quality - 2
        ]

        if not filtered:
            return None

        # =====================================================
        # 📦 Group By Target Blueprint Groups
        # =====================================================
        from collections import defaultdict
        grouped = defaultdict(list)

        for p in filtered:
            for group_name, group_categories in targets.items():
                if p["category"].lower() in group_categories:
                    grouped[group_name].append(p)

        # =====================================================
        # 🧠 Select Best Item Per Group
        # =====================================================
        bundle_items = []

        for group_name, items in grouped.items():
            if not items:
                continue

            items.sort(
                key=lambda x: (
                    self.quality_score(x),
                    -abs(x["price"] - base_price * 0.6)
                ),
                reverse=True
            )

            bundle_items.append(items[0])

        if not bundle_items:
            return None

        # =====================================================
        # 💵 Calculate Bundle Pricing
        # =====================================================
        bundle_total = base_price + sum(p["price"] for p in bundle_items)

        # =====================================================
        # 🎁 Dynamic Discount Based On Value
        # =====================================================
        if bundle_total > 8000:
            discount = {
                "type": "PERCENT",
                "value": 18,
                "label": "Premium Complete Look Offer"
            }
        elif bundle_total > 5000:
            discount = {
                "type": "PERCENT",
                "value": 12,
                "label": "Smart Combo Deal"
            }
        else:
            discount = {
                "type": "PERCENT",
                "value": 8,
                "label": "Style Saver Combo"
            }

        return {
            "base_product": base_product,
            "items": bundle_items,
            "bundle_total": bundle_total,
            "discount": discount
        }