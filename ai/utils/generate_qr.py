import os
from io import BytesIO
from datetime import datetime

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import CircleModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask, RadialGradiantColorMask

from PIL import Image, ImageDraw, ImageFont


class QRGenerator:

    @staticmethod
    def build_prompt(product_id, store_id, size, user_id) -> str:
        return f"{product_id}_{store_id}_{size}_{user_id}"

    @staticmethod
    def generate_qr_bytes(payload: str, logo_path: str | None = None):

        # =====================================
        # 1️⃣ TRUE CIRCULAR QR (PNG directly)
        # =====================================
        qr = qrcode.QRCode(
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=16,
            border=4
        )

        qr.add_data(payload)
        qr.make(fit=True)

        # # =============================
        # # 2️⃣ remove center modules safely
        # # =============================
        # matrix = qr.get_matrix()
        #
        # size = len(matrix)
        #
        # gap_modules = 9  # ⭐ control hole size
        #
        # start = (size - gap_modules) // 2
        # end = start + gap_modules
        #
        # for r in range(start, end):
        #     for c in range(start, end):
        #         matrix[r][c] = False  # remove modules

        qr_img = qr.make_image(
            image_factory=StyledPilImage,

            # dots
            module_drawer=CircleModuleDrawer(),

            # ⭐ corners (THIS was missing)
            eye_drawer=CircleModuleDrawer(),
            eye_center_drawer=CircleModuleDrawer(),

            color_mask=RadialGradiantColorMask(
                back_color=(255, 255, 255),
                center_color=(124, 58, 237),
                edge_color=(75, 0, 130)
            )
        ).convert("RGBA")

        # draw = ImageDraw.Draw(qr_img)

        # # =====================================
        # # ⭐ center blank space (no matrix hack)
        # # =====================================
        # gap_ratio = 0.265  # ⭐ control logo space
        #
        # gap_size = int(qr_img.width * gap_ratio)
        #
        # x = (qr_img.width - gap_size) // 2
        # y = (qr_img.height - gap_size) // 2
        #
        # # white square mask
        # draw.rectangle(
        #     (x, y, x + gap_size, y + gap_size),
        #     fill="white"
        # )

        # if logo_path and os.path.exists(logo_path):
        #     logo = Image.open(logo_path).convert("RGBA")
        #
        #     # ⭐ SAFE SIZE (20%)
        #     logo_size = int(qr_img.width * 0.20)
        #
        #     logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
        #
        #     # center position
        #     x = (qr_img.width - logo_size) // 2
        #     y = (qr_img.height - logo_size) // 2
        #
        #     # ⭐ white background padding (VERY IMPORTANT)
        #     padding = int(logo_size * 0.18)
        #
        #     bg = Image.new(
        #         "RGBA",
        #         (logo_size + padding * 2, logo_size + padding * 2),
        #         "white"
        #     )
        #
        #     # rounded background looks premium
        #     mask = Image.new("L", bg.size, 0)
        #     ImageDraw.Draw(mask).rounded_rectangle(
        #         (0, 0, bg.size[0], bg.size[1]),
        #         radius=30,
        #         fill=255
        #     )
        #
        #     bg.putalpha(mask)
        #
        #     qr_img.paste(bg, (x - padding, y - padding), bg)
        #
        #     # paste logo on top
        #     qr_img.paste(logo, (x, y), logo)

        # =====================================
        # 3️⃣ Add header text
        # =====================================
        padding_top = 150
        padding_bottom = 60

        final_img = Image.new(
            "RGBA",
            (qr_img.width, qr_img.height + padding_top + padding_bottom),
            "white"
        )

        final_img.paste(qr_img, (0, padding_top))

        text = "Reserve Auth QR"

        try:
            font = ImageFont.truetype("arial.ttf", 90)
        except:
            font = ImageFont.load_default()

        dummy_draw = ImageDraw.Draw(qr_img)

        bbox = dummy_draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        padding_x = 60
        padding_y = 40

        # ⭐ KEY FIX — dynamic width
        final_width = max(qr_img.width, text_w + padding_x * 2)

        padding_top = text_h + padding_y * 2
        padding_bottom = 40

        final_height = qr_img.height + padding_top + padding_bottom

        final_img = Image.new("RGBA", (final_width, final_height), "white")

        # center QR
        qr_x = (final_width - qr_img.width) // 2
        final_img.paste(qr_img, (qr_x, padding_top))

        draw = ImageDraw.Draw(final_img)

        # center text
        text_x = (final_width - text_w) // 2
        draw.text(
            (text_x, padding_y),
            text,
            fill=(244, 176, 79),
            font=font
        )

        # =====================================
        # 4️⃣ Save locally
        # =====================================
        os.makedirs("generated_qr", exist_ok=True)

        filename = f"generated_qr/{payload}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"

        final_img.save(filename)
        final_img.save("test_qr.png")

        # =====================================
        # 5️⃣ Return bytes
        # =====================================
        output = BytesIO()
        final_img.save(output, format="PNG")

        return output.getvalue()


# test
if __name__ == "__main__":
    QRGenerator.generate_qr_bytes("2_1_M_1", "Transparent Product.png")
    print("✅ Styled circular QR generated → test_qr.png")
