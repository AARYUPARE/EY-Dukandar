import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from transformers import MarianMTModel, MarianTokenizer


class LLMTranslator:

    def __init__(self, llm: ChatGroq):
        self.llm = llm

        # ---------------------------------
        # 🔥 Local deterministic models
        # ---------------------------------
        self.tok_hi_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-hi-en")
        self.mod_hi_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-hi-en")

        self.tok_mr_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-mr-en")
        self.mod_mr_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-mr-en")

    # ======================================================
    # 🔥 PROMPT — language detection only (CHEAP)
    # ======================================================
    DETECT_PROMPT = """
Detect the language of this sentence by MEANING (not script).

Return ONLY one code:
en / hi / mr / ta

Sentence:
{text}
"""

    # ======================================================
    # 🔥 PROMPT — reply translation
    # ======================================================
    POST_PROMPT = """
You are a translator for a shopping assistant named Dukandar.

Translate English → target language.

Rules:
- Keep meaning EXACT
- Keep emojis
- Keep formatting
- Friendly Indian shopkeeper tone
- DO NOT explain
- Output ONLY translated text
"""

    # ======================================================
    # 🔥 Local translator helper
    # ======================================================
    def _local_translate(self, text, tok, model):
        inputs = tok(text, return_tensors="pt", padding=True)
        outputs = model.generate(**inputs)
        return tok.decode(outputs[0], skip_special_tokens=True)

    # ======================================================
    # 🔥 Pre-agent (HYBRID)
    # ======================================================
    def to_english(self, text: str):


        lang = ""

        if "इसे रिजर्व करे" in text or "इसे आरक्षित करें" in text or "इससे आरक्षित करें" in text:
            lang = "hi"
            text = "Reserve This"
            return lang, text
        elif "हाँ" in text:
            lang = "hi"
            text = "Yes"
            return lang, text
        else:

            if "अ" in text or "इ" in text:
                lang = "hi"
            elif text[0] >= "a" and text[0] <= "z":
                lang = "en"
            else:
                # 1️⃣ Detect language using LLM (cheap)
                prompt = self.DETECT_PROMPT.format(text=text)

                res = self.llm.invoke(prompt)
                lang = res.content.strip().lower()

                print("Detected:", lang)

            # 2️⃣ If already English → skip
            if "en" in lang:
                return "en", text

            # 3️⃣ Local safe translation
            if "hi" in lang:
                return "hi", self._local_translate(text, self.tok_hi_en, self.mod_hi_en)

            if "mr" in lang:
                return "mr", self._local_translate(text, self.tok_mr_en, self.mod_mr_en)

            # fallback
            return "en", text

    # ======================================================
    # 🔥 Post-agent (LLM nice translation)
    # ======================================================
    def from_english(self, text: str, lang: str):

        if lang == "en":
            return text

        prompt = f"""
{self.POST_PROMPT}

Target language: {lang}

Text:
{text}
"""

        res = self.llm.invoke(prompt)
        return res.content.strip()
