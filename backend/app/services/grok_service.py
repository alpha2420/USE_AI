import httpx
import logging
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def _send_request(endpoint: str, payload: dict):
    headers = {
        "Authorization": f"Bearer {settings.GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    # Timeout and Retry logic
    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(3):
            try:
                response = await client.post(
                    f"{settings.GROK_BASE_URL}{endpoint}",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Grok API HTTP error: {e.response.status_code} - {e.response.text}")
                if attempt == 2:
                    raise HTTPException(status_code=500, detail="LLM API error")
            except httpx.RequestError as e:
                logger.error(f"Grok API Request error: {e}")
                if attempt == 2:
                    raise HTTPException(status_code=500, detail="LLM network error")
        
async def generate_grok_embedding(text: str) -> list[float]:
    """Generates an embedding using Grok API."""
    payload = {
        "model": "grok-embedding-latest", 
        "input": text,
        "encoding_format": "float"
    }
    data = await _send_request("/embeddings", payload)
    return data["data"][0]["embedding"]

async def generate_grok_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generates embeddings for multiple texts using Grok API."""
    payload = {
        "model": "grok-embedding-latest",
        "input": texts,
        "encoding_format": "float"
    }
    data = await _send_request("/embeddings", payload)
    return [item["embedding"] for item in data["data"]]

async def generate_grok_completion(messages: list[dict], model="grok-beta") -> str:
    """Generates a chat completion using Grok API"""
    payload = {
        "model": model,
        "messages": messages
    }
    data = await _send_request("/chat/completions", payload)
    return data["choices"][0]["message"]["content"]
