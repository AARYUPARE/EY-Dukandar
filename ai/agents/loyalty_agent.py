import requests
from sympy.codegen.ast import none

OFFERS_API = "http://localhost:8080/api/offers/search"
APPLY_OFFER_API = "http://localhost:8080/api/offers/apply"


class LoyaltyAgent:
    def __init__(self, session_manager):
        self.session_manager = session_manager

    def resolve_offer(self, message: str, shown_offers: list):
        """
        Resolves offer from user message using:
        - index (1, 2nd, second, last)
        - keywords
        """

        msg = message.lower()

        # 1️⃣ index parsing
        numbers = [str(i) for i in range(1, len(shown_offers) + 1)]

        for i, num in enumerate(numbers):
            if num in msg:
                return shown_offers[i]

        if "last" in msg and shown_offers:
            return shown_offers[-1]

        # 2️⃣ keyword match
        for offer in shown_offers:
            name = offer.get("offerName", "").lower()
            if any(word in msg for word in name.split()):
                return offer

        return None

    # ------------------------------------------------
    # 🔥 INTERNAL FORMATTER (NEW)
    # ------------------------------------------------
    def _format_offers(self, user_points, offers):
        lines = []

        for idx, offer in enumerate(offers, start=1):
            lines.append(
                f"🏷️ OFFER {idx}\n"
                f"─────────\n"
                f"{offer.get('offerName', 'Special Offer')}\n"
                f"✨ {offer.get('description', '')}\n"
                f"⭐ Requires: {offer.get('minPointsRequired')} points\n"
                f"💸 Discount: {offer.get('discountPercentage', 0)}%"
            )

        offers_text = "\n\n".join(lines)

        return (
            f"🎁 YOUR LOYALTY STATUS\n"
            f"─────────\n"
            f"⭐ Points: {user_points}\n\n"
            f"🎉 Available Offers\n\n"
            f"{offers_text}\n\n"
            f"👉 Say apply offer 1 to redeem"
        )

    def calculate_cart_total(self, cart_items):
        """
        Calculate total payable amount for cart items.
        Source of truth for money calculation.
        """

        if not cart_items:
            return 0

        total = 0.0

        for item in cart_items:
            try:
                price = float(item.get("price", 0))
                quantity = int(item.get("quantity", 1))
                total += price * quantity
            except (TypeError, ValueError):
                # Skip corrupted cart item safely
                continue

        # Round to 2 decimals for currency safety
        return round(total, 2)

    def build_reservation_checkout_summary(self, product, session):

        if not product:
            session["payment_pending"] = False
            return "No reserved product found."

        payment_Offer = session["payment_offer"]
        total = product["price"]

        if payment_Offer:
            total = total - (total * payment_Offer.get("discountPercentage", 0) // 100)

        lines = []
        lines.append("🧾 **Reserved Item Summary**")
        lines.append(f"{product['name']} — ₹{product['price']}")
        lines.append(f"\n🧮 Total: ₹{total}")

        if payment_Offer:
            lines.append(f"""
                    🏷️ Applied Offer
                    __________________
                    {payment_Offer.get('offerName', 'Special Offer')}
                    ✨ {payment_Offer.get('description', '')}
                    💸 Discount: {payment_Offer.get('discountPercentage', 0)}%
                    """)

        lines.append("\n💳 How would you like to pay?")
        lines.append("🔗 UPI | 💳 Card | 🏦 Net Banking | 💵 Cash")
        return "\n".join(lines)

    def build_checkout_summary(self, session):

        print("Reserved Product: ",session.get("reservation", {}))

        if session.get("payment_pending"):
            reservation_summary = self.build_reservation_checkout_summary(product=session.get("reservation", {}).get("product"), session=session)
            return "\n".join(reservation_summary)

        lines = []
        items = session["cart"]["items"]
        cart_offer = session["cart"]["offer"]
        total = self.calculate_cart_total(items)

        if cart_offer:
            total = total - (total * cart_offer.get("discountPercentage", 0) // 100)

        lines.append("🧾 Order Summary")
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item['name']} — ₹{item['price']}")

        lines.append(f"\n🧮 Total: ₹{total}")

        if cart_offer:
            lines.append(f"""
                🏷️ Applied Offer
                __________________
                f"{cart_offer.get('offerName', 'Special Offer')}\n"
                f"✨ {cart_offer.get('description', '')}\n"
                f"💸 Discount: {cart_offer.get('discountPercentage', 0)}%"
                
            """)

        lines.append("\n💳 How would you like to pay?")
        lines.append("UPI | Card | Net Banking | Cash on Delivery")

        return "\n".join(lines)

    def show_offers(self, user, session):

        """
           Fetch offers directly from Spring controller
           then apply eligibility + bundle logic
        """

        user_points = user.get("loyaltyPoints", 0)

        try:
            offers = requests.get(
                OFFERS_API,
                params={"loyaltyPoints": user_points}
            ).json()
        except Exception:
            return {"reply": "Unable to fetch loyalty offers right now."}

        cart_items = session["cart"]["items"]
        cart_total = sum(i["price"] * i["quantity"] for i in cart_items)

        valid_offers = []
        suggestions = []

        for offer in offers:
            min_points = offer.get("minPointsRequired", 0)
            min_price = offer.get("minCartPrice", 0)

            has_points = user_points >= min_points
            has_price = cart_total >= min_price

            # ----------------------------------
            # CASE 1 → fully eligible
            # ----------------------------------
            if has_points and has_price:
                valid_offers.append(offer)
                continue

            # ----------------------------------
            # CASE 2 → price missing only
            # ----------------------------------
            if has_points and not has_price:
                gap = min_price - cart_total

                if 200 <= gap <= 300:
                    bundle = self.bundle(session["focus"]["current_product"])
                    suggestions.append((offer, gap, bundle))
                continue

            # ----------------------------------
            # CASE 3 → points missing
            # ----------------------------------
            if not has_points:
                gap_points = min_points - user_points
                bundle = self.bundle(session["focus"]["current_product"])
                suggestions.append((offer, f"{gap_points} more points", bundle))

        # ----------------------------------
        # FORMAT RESPONSE
        # ----------------------------------

        if valid_offers:
            session["pending_action"] = "SELECT_OFFER"
            session["shown_offers"] = valid_offers

            return {
                "reply": self._format_offers(user_points, valid_offers),
                "eligibleOffers": valid_offers
            }

        if suggestions:
            offer, gap, bundle = suggestions[0]

            text = (
                f"🎁 Almost there!\n\n"
                f"🏷️ {offer.get('offerName')}\n"
                f"✨ {offer.get('description')}\n\n"
                f"👉 Add items worth ₹{gap} more to unlock this offer"
            )

            if bundle:
                text += f"\n\n🔥 Recommended combo item: {bundle['items'][0]['name']}"

            return {"reply": text}

        return {"reply": "😕 No offers available yet. Shop more to earn rewards!"}

    def apply_payment_offer(self, session_id, message):
        session = self.session_manager.get(session_id)

        shown = session.get("shown_offers", [])

        if not shown:
            return {"reply": "No offers available to apply."}

        offer = self.resolve_offer(message, shown)

        if not offer:
            return {"reply": "Please choose a valid offer number."}

        session["payment_offer"] = offer

        self.session_manager._save(session_id, session)

        check_out_summary = self.build_checkout_summary(session=session)

        return {
            "reply": f"✅ \"{offer['offerName']}\" applied successfully! 🎉 \n\n" + check_out_summary
        }

    def apply_offer_from_message(self, session_id, message):
        session = self.session_manager.get(session_id)

        shown = session.get("shown_offers", [])

        if not shown:
            return {"reply": "No offers available to apply."}

        offer = self.resolve_offer(message, shown)

        if not offer:
            return {"reply": "Please choose a valid offer number."}

        # ----------------------------------
        # attach to cart
        # ----------------------------------
        session["cart"]["offer"] = {
            "id": offer["id"],
            "name": offer["offerName"],
            "type": "PERCENT",
            "value": offer.get("discountPercentage")
        }

        self.session_manager._save(session_id, session)

        check_out_summary = self.build_checkout_summary(session=session)

        return {
            "reply": f"✅ \"{offer['offerName']}\" applied successfully! 🎉 \n\n" + check_out_summary
        }