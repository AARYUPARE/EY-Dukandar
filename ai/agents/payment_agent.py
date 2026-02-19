import random
import time

class PaymentAgent:
    def __init__(self):
        pass

    # -----------------------------
    # DUMMY PAYMENT PROCESSOR
    # -----------------------------
    def pay(self, user, amount, method):
        """
        method → UPI | CARD | WALLET
        Loyalty Rule → 1 point per ₹100 spent
        """

        if not user or not user.get("id"):
            return {
                "status": "FAILED",
                "reason": "User not logged in"
            }

        if not amount or amount <= 0:
            return {
                "status": "FAILED",
                "reason": "Invalid amount"
            }

        # simulate payment delay
        time.sleep(1)

        # -----------------------------
        # PAYMENT SUCCESS
        # -----------------------------
        payment_id = f"PAY_{random.randint(100000, 999999)}"

        # -----------------------------
        # LOYALTY POINT CALCULATION
        # -----------------------------
        existing_points = user.get("loyaltyPoints", 0)

        earned_points = amount // 100   # ₹100 = 1 point
        updated_points = existing_points + earned_points

        # update user object (in-memory / session)
        user["loyaltyPoints"] = updated_points

        return {
            "status": "SUCCESS",
            "paymentId": payment_id,
            "method": method,
            "amount": amount,
            "earnedLoyaltyPoints": earned_points,
            "totalLoyaltyPoints": updated_points,
            "message": (
                f"Payment of ₹{amount} successful via {method}. "
                f"You earned {earned_points} loyalty points 🎉"
            )
        }