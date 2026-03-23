import httpx
import logging
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Valid Grok model names
GROK_CHAT_MODEL = "grok-2-mini"
GROK_EMBEDDING_MODEL = "grok-3-mini-fast"

async def _send_request(endpoint: str, payload: dict):
    if not settings.GROK_API_KEY:
        raise HTTPException(status_code=500, detail="GROK_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    base_url = settings.GROK_BASE_URL.rstrip("/")
    url = f"{base_url}{endpoint}"

    logger.info(f"Grok API request: {url} | model: {payload.get('model')}")

    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        last_error = None
        for attempt in range(3):
            try:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                error_body = e.response.text
                logger.error(
                    f"Grok API HTTP error (attempt {attempt + 1}/3): "
                    f"status={e.response.status_code} body={error_body}"
                )
                last_error = f"Grok API error {e.response.status_code}: {error_body}"
                if e.response.status_code in (401, 403):
                    # Auth errors won't resolve with retries
                    raise HTTPException(status_code=500, detail=last_error)
            except httpx.RequestError as e:
                logger.error(f"Grok API network error (attempt {attempt + 1}/3): {e}")
                last_error = f"Grok network error: {str(e)}"

        raise HTTPException(status_code=500, detail=last_error or "LLM API error after 3 retries")

async def generate_grok_embedding(text: str) -> list[float]:
    """Generates an embedding using Grok API."""
    payload = {
        "model": GROK_EMBEDDING_MODEL,
        "input": text,
        "encoding_format": "float"
    }
    data = await _send_request("/embeddings", payload)
    return data["data"][0]["embedding"]

async def generate_grok_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generates embeddings for multiple texts using Grok API."""
    payload = {
        "model": GROK_EMBEDDING_MODEL,
        "input": texts,
        "encoding_format": "float"
    }
    data = await _send_request("/embeddings", payload)
    return [item["embedding"] for item in data["data"]]

async def generate_grok_completion(messages: list[dict], model: str = None) -> str:
    """Generates a chat completion using Grok API."""
    payload = {
        "model": model or GROK_CHAT_MODEL,
        "messages": messages,
        "temperature": 0.3,
    }
    data = await _send_request("/chat/completions", payload)
    return data["choices"][0]["message"]["content"]
