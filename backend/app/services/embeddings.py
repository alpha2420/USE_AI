"""
Embedding service — uses OpenAI-compatible API for embeddings.
Works with any provider that supports the /embeddings endpoint (OpenAI, Groq, etc).
"""
import logging
from openai import AsyncOpenAI
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Lazy-initialized embedding client
_embed_client = None


def _get_embed_client() -> AsyncOpenAI:
    """Get or create the embedding API client.
    
    Uses OPENAI_API_KEY + OpenAI base URL for embeddings because
    Groq does not currently offer an embeddings endpoint.
    The chat completions still go through Groq.
    """
    global _embed_client
    if _embed_client is None:
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is required for embeddings (text-embedding-3-small)"
            )
        _embed_client = AsyncOpenAI(api_key=api_key)
    return _embed_client


async def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding via the OpenAI embeddings API."""
    try:
        client = _get_embed_client()
        response = await client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Embedding ERROR: {str(e)}")
        print(f"Embedding ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding API error: {str(e)}")


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts via the OpenAI embeddings API."""
    try:
        client = _get_embed_client()
        response = await client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch Embedding ERROR: {str(e)}")
        print(f"Batch Embedding ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding API error: {str(e)}")
