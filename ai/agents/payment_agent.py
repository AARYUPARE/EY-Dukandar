import random
import time


class PaymentAgent:
    def __init__(self):
        pass

    # ------------------------------------------------
    # 🔥 INTERNAL FORMATTERS
    # ------------------------------------------------
    def _format_success(self, payment_id, method, amount, earned, total):
        return (
            f"💳 **PAYMENT SUCCESSFUL**\n"
            f"─────────\n"
            f"💰 Amount: ₹{amount}\n"
            f"🏦 Method: {method}\n"
            f"🧾 Transaction ID: {payment_id}\n\n"
            f"🎁 Loyalty Points Earned: +{earned}\n"
            f"⭐ Total Points: {total}\n\n"
            f"Processing your order now... 🚀"
        )

    def _format_failure(self, reason):
        return (
            f"❌ **Payment Failed**\n"
            f"─────────\n"
            f"{reason}\n\n"
            f"Please try another method 🙂"
        )

    # ------------------------------------------------
    # MAIN PAYMENT LOGIC
    # ------------------------------------------------
    def pay(self, user, amount, method):
        """
        method → UPI | CARD | WALLET
        Loyalty Rule → ₹100 = 1 point
        """

        # -----------------------------
        # VALIDATIONS
        # -----------------------------
        if not user or not user.get("id"):
            return {
                "status": "FAILED",
                "reply": self._format_failure("User not logged in")
            }

        if not amount or amount <= 0:
            return {
                "status": "FAILED",
                "reply": self._format_failure("Invalid amount")
            }

        # simulate gateway delay
        time.sleep(1)

        # -----------------------------
        # PAYMENT SUCCESS
        # -----------------------------
        payment_id = f"PAY_{random.randint(100000, 999999)}"

        # -----------------------------
        # LOYALTY CALCULATION
        # -----------------------------
        existing_points = user.get("loyaltyPoints", 0)

        earned_points = amount // 100
        updated_points = existing_points + earned_points

        # update session user
        user["loyaltyPoints"] = updated_points

        reply_text = self._format_success(
            payment_id,
            method,
            amount,
            earned_points,
            updated_points
        )

        return {
            "status": "SUCCESS",
            "paymentId": payment_id,
            "method": method,
            "amount": amount,
            "earnedLoyaltyPoints": earned_points,
            "totalLoyaltyPoints": updated_points,
            "reply": reply_text
        }