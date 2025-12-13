# utils/text_cleaner.py

import re

def clean_text(text: str) -> str:
    """
    Clean product text before embedding or LLM use.
    Removes unwanted symbols, multiple spaces, etc.
    """
    if not text:
        return ""

    text = text.lower()                                         # normalize
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)                 # remove symbols
    text = re.sub(r"\s+", " ", text).strip()                    # fix spacing
    return text
