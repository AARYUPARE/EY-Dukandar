# loyalty_agent.py
import requests

OFFERS_API = "http://localhost:8080/api/loyalty/offers"     # GET → all offers
APPLY_OFFER_API = "http://localhost:8080/api/loyalty/apply" # POST → apply offer

def loyalty_agent(sales_output):

    user_message = sales_output.get("user_message", "")
    user = sales_output.get("user")

    # ============================
    # 1️⃣ Get loyalty points from USER OBJECT
    # ============================
    if not user:
        return {"error": "User not available"}

    user_id = user.get("id")
    user_points = user.get("loyaltyPoints", 0)

    # ============================
    # 2️⃣ Fetch all offers
    # ============================
    try:
        offers = requests.get(OFFERS_API).json()
    except:
        return {"error": "Unable to fetch loyalty offers"}

    # ============================
    # 3️⃣ Filter eligible offers
    # ============================
    eligible_offers = [
        offer for offer in offers
        if user_points >= offer.get("minPointsRequired", 0)
    ]

    # ============================
    # 4️⃣ Apply offer (ONLY if explicitly asked)
    # ============================
    if "apply" in user_message.lower():
        if not eligible_offers:
            return {"message": "No eligible offers to apply."}

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
                "message": "Offer applied successfully!",
                "updatedPoints": response.json().get("loyaltyPoints"),
                "offerApplied": chosen_offer
            }
        except:
            return {"error": "Failed to apply the offer"}

    # ============================
    # 5️⃣ Normal return → SHOW OFFERS
    # ============================
    return {
        "userPoints": user_points,
        "eligibleOffers": eligible_offers,
        "allOffers": offers
    }
