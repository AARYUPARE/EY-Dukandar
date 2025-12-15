# agents/recommendation_agent.py

from vectorstore.pinecone_client import index
from vectorstore.embedder import embed
from db.product_queries import fetch_products_by_ids
from utils.text_cleaner import clean_text
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

class RecommendationAgent:
    def __init__(self, llm=None):
        self.llm = llm

    # --------------------------------------------------- #
    # Pinecone Search
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
    # Category Expansion Using LLM
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
    # Main Handler
    # --------------------------------------------------- #
    def handle(self, query, k_similar=8, k_complement=6):

        similar = self.pinecone_search(query, k=k_similar)

        complementary = []
        categories = self.category_expand_with_llm(query, top_n=3)

        for cat in categories:
            complementary.extend(
                self.pinecone_search(cat, k=k_complement)
            )

        # De-duplicate
        seen = set()

        def dedupe(items):
            out = []
            for p in items:
                pid = str(p.get("id"))
                if pid not in seen:
                    seen.add(pid)
                    out.append(p)
            return out

        return {
            "similar": dedupe(similar),
            "complementary": dedupe(complementary)
        }