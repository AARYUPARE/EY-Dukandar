# core/product_queries.py
from .mysql_connection import get_db

def get_all_products():
    db = get_db()
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM products")
    rows = cur.fetchall()
    cur.close()
    db.close()
    return rows

def get_product_by_id(pid):
    db = get_db()
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM products WHERE id=%s", (pid,))
    row = cur.fetchone()
    cur.close()
    db.close()
    return row

def search_products_sql(query, limit=20):
    """
    Simple SQL search: searches name, brand, category, sub_category, description.
    For prototype/hackathon use a LIKE-based search.
    """
    q = f"%{query}%"
    db = get_db()
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT * FROM products
        WHERE name LIKE %s OR brand LIKE %s OR category LIKE %s OR sub_category LIKE %s OR description LIKE %s
        LIMIT %s
    """, (q, q, q, q, q, limit))
    rows = cur.fetchall()
    cur.close()
    db.close()
    return rows

def fetch_products_by_ids(ids):
    if not ids:
        return []
    db = get_db()
    cur = db.cursor(dictionary=True)
    format_strings = ",".join(["%s"] * len(ids))
    cur.execute(f"SELECT * FROM products WHERE id IN ({format_strings})", tuple(ids))
    rows = cur.fetchall()
    cur.close()
    db.close()
    # preserve order of ids
    id_map = {str(r["id"]): r for r in rows}
    return [id_map[str(i)] for i in ids if str(i) in id_map]
