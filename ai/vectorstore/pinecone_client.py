import os
from dotenv import load_dotenv
from pinecone import Pinecone

# Load env variables
load_dotenv()

# Initialize pinecone client
PC = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Index name
INDEX_NAME = os.getenv("PINECONE_INDEX", "dukandar")

# Create index instance
index = PC.Index(INDEX_NAME)


def get_index():
    """Return pinecone index object."""
    return index
