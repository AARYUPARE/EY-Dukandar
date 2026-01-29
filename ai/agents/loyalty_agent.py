import requests

OFFERS_API = "http://localhost:8080/api/offers/search"
APPLY_OFFER_API = "http://localhost:8080/api/offers/apply"


class LoyaltyAgent:
    def __init__(self):
        pass

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
            f"🎁 **YOUR LOYALTY STATUS**\n"
            f"─────────\n"
            f"⭐ Points: {user_points}\n\n"
            f"🎉 **Available Offers**\n\n"
            f"{offers_text}\n\n"
            f"👉 Say *apply offer 1* to redeem"
        )

    # ------------------------------------------------
    # MAIN HANDLER
    # ------------------------------------------------
    def handle(self, payload: dict):
        """
        payload = {
            user: {...},
            user_message: str,
            action: "check" | "apply"
        }
        """

        print("🔥 REAL LoyaltyAgent.handle CALLED")

        user = payload.get("user")
        user_message = payload.get("user_message", "")
        action = payload.get("action", "check")

        if not user:
            return {
                "reply": "Please log in to view loyalty offers."
            }

        user_id = user.get("id")
        user_points = user.get("loyaltyPoints", 0)

        # ----------------------------
        # 1️⃣ Fetch all offers
        # ----------------------------
        try:
            offers = requests.get(
                OFFERS_API,
                params={"loyaltyPoints": user_points}
            ).json()
        except Exception:
            return {"reply": "Unable to fetch loyalty offers right now."}

        # ----------------------------
        # 2️⃣ Filter eligible offers
        # ----------------------------
        eligible_offers = [
            offer for offer in offers
            if user_points >= offer.get("minPointsRequired", 0)
        ]

        # ----------------------------
        # 3️⃣ APPLY OFFER
        # ----------------------------
        if action == "apply":
            if not eligible_offers:
                return {"reply": "No eligible offers to apply."}

            chosen_offer = eligible_offers[0]

            try:
                response = requests.post(
                    APPLY_OFFER_API,
                    json={
                        "userId": user_id,
                        "offerId": chosen_offer["id"]
                    }
                )

                new_points = response.json().get("loyaltyPoints")

                return {
                    "reply": (
                        f"✅ **Offer Applied Successfully!**\n\n"
                        f"🏷️ {chosen_offer.get('offerName')}\n"
                        f"⭐ Remaining Points: {new_points}\n\n"
                        f"Enjoy your savings 🎉"
                    ),
                    "updatedPoints": new_points,
                    "offerApplied": chosen_offer
                }

            except Exception:
                return {"reply": "Failed to apply the offer."}

        # ----------------------------
        # 4️⃣ READ ONLY RESPONSE (🔥 formatted)
        # ----------------------------
        if not eligible_offers:
            return {
                "reply": (
                    f"🎁 **YOUR LOYALTY STATUS**\n"
                    f"─────────\n"
                    f"⭐ Points: {user_points}\n\n"
                    f"😕 No offers available yet.\n"
                    f"Shop more to earn rewards!"
                ),
                "userPoints": user_points,
                "eligibleOffers": []
            }

        reply_text = self._format_offers(user_points, eligible_offers)

        return {
            "reply": reply_text,
            "userPoints": user_points,
            "eligibleOffers": eligible_offers
        }