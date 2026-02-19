import requests
# from torch._dynamo.polyfills import os
import os
from utils.generate_qr import QRGenerator


ACCESS_TOKEN = "EAAdJ1D75nt0BQqarOiMRQlEtZCbcTDkpecAgRMIO3teJ6kUDUbjprMgwOKgZBSMQbm3wvqUxKtkvfb9fmhq3mgQqa9VnnLcDQNlENhJoUVZCiT2N3KmoukcjKTALvnTgIDMB8cBc3xy77W0KJ3KtZAtItAgoAreq8uG9s7N8yxX5zppWoEjkjUcdMndtAuhdapV7jXfESQzysSpMLeyZA73DOxsx3d1ZCSOtvbMzoqQgykElegYkLn50l6gcucfriZCvI2ateEGV9Gx961jAAKkwa3v"

def sendImageToWhatsAppMedia(payload: str, img_bytes: bytes) -> str:
    url = f"https://graph.facebook.com/v22.0/904317979441773/media"

    print("URL = ", url)

    print("Authentication Token:" + f"Bearer {ACCESS_TOKEN}")

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    }

    files = {
        "file": (f"{payload}.png", img_bytes, "image/png")
    }

    data = {
        "messaging_product": "whatsapp"
    }

    res = requests.post(url, headers=headers, data=data, files=files)

    print(res.json())

    media_id = res.json()["id"]

    print("🔥 mediaId =", media_id)

    return media_id


if __name__ == "__main__":

    payload = "P102_S3_L_U77"
    img_bytes = QRGenerator.generate_qr_bytes(payload, "Transparent Product.png")
    media_id = sendImageToWhatsAppMedia(payload, img_bytes)

    print("Media send id:" , media_id)

