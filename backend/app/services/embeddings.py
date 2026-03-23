"""
Embedding service — uses local SentenceTransformer model for free embeddings.
No paid API calls required.
"""
import logging
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger(__name__)

# Load the model once at module import time
_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        model_name = settings.EMBEDDING_MODEL
        logger.info(f"Loading embedding model: {model_name}")
        print(f"🧠 Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
        print(f"✅ Embedding model loaded: {model_name} (dim={_model.get_sentence_embedding_dimension()})")
    return _model


async def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding using the local model."""
    model = _get_model()
    embedding = model.encode(text)
    return embedding.tolist()


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts using the local model."""
    model = _get_model()
    embeddings = model.encode(texts)
    return [emb.tolist() for emb in embeddings]
