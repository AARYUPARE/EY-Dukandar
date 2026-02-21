import redis
import json
import uuid
from datetime import datetime


class RedisSessionManager:

    def __init__(
            self,
            redis_host="localhost",
            redis_port=6379,
            db=0,
            ttl=60 * 60 * 24 * 14
    ):
        self.client = redis.Redis(
            host=redis_host,
            port=redis_port,
            db=db,
            decode_responses=True
        )
        self.ttl = ttl

    # ---------------------------
    # CREATE / LOAD SESSION
    # ---------------------------
    def get_or_create(self, session_id=None, channel="web"):
        if session_id and self.client.exists(session_id):
            return self.get(session_id)

        session_id = session_id or str(uuid.uuid4())

        session = {
            "session_id": session_id,

            # 🔑 FOCUS MEMORY
            "focus": {
                "current_product": None,
                "shown_products": [],
                "current_category": None,
                "type": None,
                "store_id": None,
                "product_ids":[]
            },

            "last_system_action": {
                "type": None,
                "payload": None
            },

            "inventory": {
                "last_checked_product": None,
                "last_result": None
            },

            "checkout": {
                "started": False,
                "payment_method": None,
                "order_confirmed": False,
                "channel": None,                 # 🔑 important
                "store_id": None,
                "items": []
            },

            "shown_offers": [],

            # 🔑 SINGLE SOURCE OF TRUTH
            "pending_action": None,
            "payment_pending": False,

            # RESERVATION
            "reservation": {
                "product": None,
                "available_stores": [],
                "selected_store": None,
                "status": None,  # "AVAILABLE" | "UNAVAILABLE"
            },

            # 🔍 DISCOVERY MEMORY
            "discovery": {
                "product_type": None,
                "occasion": None,
                "budget": None,
                "size": None,
                "occasion_applicable": True,
                "asked_once": False
            },

            # 🛒 CART
            "cart": {
                "items": [],
                "locked": False,
                "offer": None
            },

            # 💰 PRICING CONTEXT
            "pricing": {
                "base_price": None,
                "last_delta": None,
                "bundle": None,
                "bundle_applied": False
            },

            # 🧠 USER SIGNALS
            "user_signals": {
                "price_sensitive": None,
                "declined_upsell_count": 0
            },

            # 🌐 META (OMNICHANNEL)
            "meta": {
                "channel": channel,
                "locale": "en-IN",
                "user_id": None,
                "store_id": None
            },

            # ⏱ TIMESTAMPS
            "timestamps": {
                "created_at": self._now(),
                "updated_at": self._now()
            }
        }

        self._save(session_id, session)
        return session

    # ---------------------------
    # GET SESSION
    # ---------------------------
    def get(self, session_id):
        data = self.client.get(session_id)
        return json.loads(data) if data else None

    # ---------------------------
    # SAVE SESSION
    # ---------------------------
    def _save(self, session_id, session):
        session["timestamps"]["updated_at"] = self._now()
        self.client.setex(session_id, self.ttl, json.dumps(session))

    # ---------------------------
    # FOCUS HELPERS
    # ---------------------------
    def set_shown_products(self, session_id, products, category):
        session = self.get(session_id)
        session["focus"]["shown_products"] = products
        session["focus"]["current_category"] = category
        session["pending_action"] = "SELECT_PRODUCT"
        self._save(session_id, session)

    def select_product(self, session_id, product):
        session = self.get(session_id)
        session["focus"]["current_product"] = product
        session["pending_action"] = "POST_SELECT_PRODUCT"
        self._save(session_id, session)

    # ---------------------------
    # CART
    # ---------------------------
    def add_to_cart(self, session_id, product, quantity=1):
        session = self.get(session_id)

        cart_item = {
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": quantity,
            "added_at": datetime.utcnow().isoformat(),
            "channel": session.get("channel", "chat"),
            "metadata": {
                "category": product.get("category"),
                "brand": product.get("brand")
            }
        }

        session["cart"]["items"].append(cart_item)

        # DO NOT lock cart here
        session["cart"]["locked"] = False

        # Clear pending action safely
        session["pending_action"] = None

        self._save(session_id, session)

    # ---------------------------
    # POST-ADD UPSELL
    # ---------------------------
    def set_post_add_upsell(self, session_id, product, cross_sell, bundle):
        session = self.get(session_id)

        if not cross_sell:
            session["pending_action"] = "BUNDLE"

        if not bundle:
            session["pending_action"] = "CROSS_SELL"

        session["last_system_action"] = {
            "type": "POST_ADD_UPSELL",
            "payload": {
                "base_product": product,
                "cross_sell_products": cross_sell,
                "bundle_products": bundle
            }
        }

        self._save(session_id, session)

    # ---------------------------
    def clear_post_add_action(self, session_id):
        session = self.get(session_id)

        session["pending_action"] = None
        session["last_system_action"] = {
            "type": None,
            "payload": None
        }

        self._save(session_id, session)

    # ---------------------------
    # PENDING ACTION CONTROL
    # ---------------------------
    def set_pending(self, session_id, action):
        session = self.get(session_id)
        session["pending_action"] = action
        self._save(session_id, session)

    def clear_pending(self, session_id):
        session = self.get(session_id)
        session["pending_action"] = None
        self._save(session_id, session)

    # ---------------------------
    # UTIL
    # ---------------------------
    def _now(self):
        return datetime.utcnow().isoformat()