# agents/recommendation_agent.py

from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import fetch_products_by_ids
from utils.text_cleaner import clean_text

from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

import json


class RecommendationAgent:
    def __init__(self, llm=None):
        self.llm = llm

    # --------------------------------------------------- #
    # Pinecone Search (UNCHANGED)
    # --------------------------------------------------- #
    def pinecone_search(self, query, k=6, filter_metadata=None):
        vector = embed(clean_text(query))

        try:
            if filter_metadata:
                res = index.query(
                    vector=vector,
                    top_k=k,
                    include_metadata=True,
                    filter=filter_metadata
                )
            else:
                res = index.query(
                    vector=vector,
                    top_k=k,
                    include_metadata=True
                )

            matches = res.get("matches", [])

        except Exception as e:
            print("❌ Pinecone error:", e)
            return []

        ids = [m.get("id") for m in matches]
        return fetch_products_by_ids(ids)

    # --------------------------------------------------- #
    # Category Expansion Using LLM (UNCHANGED)
    # --------------------------------------------------- #
    def category_expand_with_llm(self, query, top_n=3):
        if not self.llm:
            return []

        prompt = PromptTemplate(
            input_variables=["query", "top_n"],
            template="""
You are a smart retail assistant.
Generate {top_n} relevant product categories or sub-categories.
Query: {query}
Return ONLY a comma-separated list.
"""
        )

        try:
            chain = prompt | self.llm
            out = chain.invoke({"query": query, "top_n": top_n})

            text = getattr(out, "content", None) or str(out)
            categories = [c.strip() for c in text.split(",") if c.strip()]

            return categories[:top_n]

        except Exception as e:
            print("❌ LLM Category Expansion error:", e)
            return []

    # --------------------------------------------------- #
    # 🔥 PRODUCT FORMATTING + LLM EXPLANATION (FIXED)
    # --------------------------------------------------- #
    def _format_products(self, products, query):

        PRODUCT_EMOJI_MAP = {
            "shirt": "👕",
            "pant": "👖",
            "trouser": "👖",
            "jeans": "👖",
            "suit": "🕴️",
            "jacket": "🧥",
            "hoodie": "🧥",
            "shoe": "👟",
            "watch": "⌚",
            "belt": "👔",
            "cap": "🧢"
        }

        def emoji(name):
            name = (name or "").lower()
            for k, e in PRODUCT_EMOJI_MAP.items():
                if k in name:
                    return e
            return "🛍️"

        explanations = {}

        # -----------------------------
        # 🔥 LLM REASON GENERATION (ROBUST)
        # -----------------------------
        if self.llm and products:
            try:
                prompt = f"""
You are a helpful shopping assistant.

User query:
{query}

For each product, write ONE short friendly reason (max 15 words).

STRICT RULES:
- Return ONLY valid JSON
- No text before or after
- No markdown
- No explanation

Format:
{{"0":"reason","1":"reason"}}

Products:
{[p.get("name") + " - " + (p.get("description") or "") for p in products]}
"""

                res = self.llm.invoke(prompt)

                raw = getattr(res, "content", str(res)).strip()

                # 🔥 Remove markdown/codeblocks
                raw = raw.replace("```json", "").replace("```", "").strip()

                try:
                    explanations = json.loads(raw)
                except Exception:
                    print("⚠️ LLM explanation parse failed. Raw output:\n", raw)
                    explanations = {}

            except Exception as e:
                print("❌ LLM explanation error:", e)
                explanations = {}

        # -----------------------------
        # FORMAT PRODUCT CARDS
        # -----------------------------
        lines = []

        for i, p in enumerate(products):
            reason = explanations.get(str(i), "Popular choice for your search")

            lines.append(
                f"{emoji(p.get('name'))} OPTION {i+1}\n"
                f"─────────\n"
                f"{p.get('name')} — ₹{p.get('price')}\n"
                f"✨ {reason}"
            )

        text = "\n\n".join(lines)

        reply = (
            "Here are some hand-picked options for you 👇\n\n"
            f"{text}\n\n"
            "Tell me which one you like (1st, 2nd, etc.) 😉"
        )

        return reply

    # --------------------------------------------------- #
    # Main Handler (LOGIC SAME + formatting added)
    # --------------------------------------------------- #
    def handle(self, query, k_similar=8, k_complement=2):

        similar = self.pinecone_search(query, k=k_similar)

        complementary = []
        categories = self.category_expand_with_llm(query, top_n=3)

        for cat in categories:
            complementary.extend(
                self.pinecone_search(cat, k=k_complement)
            )

        # -----------------------------
        # De-duplicate
        # -----------------------------
        seen = set()

        def dedupe(items):
            out = []
            for p in items:
                pid = str(p.get("id"))
                if pid not in seen:
                    seen.add(pid)
                    out.append(p)
            return out

        similar = dedupe(similar)
        complementary = dedupe(complementary)

        display_products = (similar + complementary)[:6]

        # 🔥 Formatting happens ONLY here (agent responsibility)
        reply = self._format_products(display_products, query)

        return {
            "reply": reply,
            "products": display_products,
            "similar": similar,
            "complementary": complementary
        }
