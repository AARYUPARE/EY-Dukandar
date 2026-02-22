import random
import time

import requests

BASE_URL = "http://localhost:8080/api"

class PaymentAgent:
    def __init__(self):
        pass

    # -----------------------------
    # DUMMY PAYMENT PROCESSOR
    # -----------------------------
    def pay(self, amount):
        """
        method → UPI | CARD | WALLET
        Loyalty Rule → 1 point per ₹100 spent
        """

        if not amount or amount <= 0:
            return {
                "status": "FAILED",
                "reason": "Invalid amount"
            }

        # simulate payment delay

        payload = {
            "amount":amount
        }

        print("Payment Request")
        res = requests.post(
            f"{BASE_URL}/payment/init",
            params=payload,
            timeout=5
        )

        return {

        }
        
    def payment_success(self, session_id):
        
        session = self.session.get(session_id)
        amount = session["checkout"]["amount"]
        self.session.clear_cart(session_id)

        return {
            "reply" : (
            f"🎉 Order placed successfully!\n"
            f"🧾 Order ID: 101\n"
            f"💰 Total: ₹{amount}\n\n"
            "Thank you for shopping with us please come again i am here for find best cloths for you, you are always welcome! have a nice day 😊"
            )
        }