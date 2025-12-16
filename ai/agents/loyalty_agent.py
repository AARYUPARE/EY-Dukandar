import requests

OFFERS_API = "http://localhost:8080/api/offers/search"
APPLY_OFFER_API = "http://localhost:8080/api/offers/apply"


class LoyaltyAgent:
    def __init__(self):
        pass

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

        print(offers)

        # ----------------------------
        # 2️⃣ Filter eligible offers
        # ----------------------------
        eligible_offers = [
            offer for offer in offers
            if user_points >= offer.get("minPointsRequired", 0)
        ]

        # ----------------------------
        # 3️⃣ Apply offer (ONLY if allowed)
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

                return {
                    "reply": "Offer applied successfully!",
                    "updatedPoints": response.json().get("loyaltyPoints"),
                    "offerApplied": chosen_offer
                }
            except Exception:
                return {"reply": "Failed to apply the offer."}

        # ----------------------------
        # 4️⃣ READ-ONLY RESPONSE
        # ----------------------------
        return {
            "reply": f"You have {user_points} loyalty points.",
            "userPoints": user_points,
            "eligibleOffers": eligible_offers
        }
