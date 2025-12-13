from sentence_transformers import SentenceTransformer

# Tiny, stable model for Windows
_model = SentenceTransformer("intfloat/e5-small-v2")

def embed(text):
    return _model.encode(text).tolist()
