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