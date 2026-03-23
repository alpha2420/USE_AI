"""
Embedding service — uses Groq-compatible API for embeddings over HTTPx.
Works securely without the heavy openai library dependency.
"""
import logging
import httpx
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def _send_embedding_request(payload: dict):
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is required for embeddings"
        )

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Endpoint handling based on base_url
    base_url = settings.GROQ_BASE_URL.rstrip("/")
    url = f"{base_url}/embeddings"

    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Embedding API ERROR: {str(e)}")
            print(f"Embedding API ERROR: {str(e)}")
            if isinstance(e, httpx.HTTPStatusError):
                logger.error(f"Response body: {e.response.text}")
            raise HTTPException(status_code=500, detail=f"Embedding API error: {str(e)}")

async def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding via the Groq-compatible embeddings API."""
    payload = {
        "model": settings.EMBEDDING_MODEL,
        "input": text
    }
    data = await _send_embedding_request(payload)
    return data["data"][0]["embedding"]

async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts via the Groq-compatible embeddings API."""
    payload = {
        "model": settings.EMBEDDING_MODEL,
        "input": texts
    }
    data = await _send_embedding_request(payload)
    return [item["embedding"] for item in data["data"]]
