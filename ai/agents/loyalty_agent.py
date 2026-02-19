import requests

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

    def build_checkout_summary(self, session):

        lines = []
        items = session["cart"]["items"]
        total = self.calculate_cart_total(items)

        lines.append("🧾 Order Summary")
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item['name']} — ₹{item['price']}")

        lines.append(f"\n🧮 Total: ₹{total}")
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