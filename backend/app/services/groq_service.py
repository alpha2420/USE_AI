"""
Groq LLM service — OpenAI-compatible client for chat completions.
Replaces the old Grok service. Uses httpx to avoid heavy openai dependency.
"""
import logging
import httpx
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def generate_groq_completion(messages: list[dict], model: str = None) -> str:
    """Generates a chat completion using Groq API over HTTPx."""
    final_model = model or settings.CHAT_MODEL
    logger.info(f"Groq completion request | model={final_model}")

    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    base_url = settings.GROQ_BASE_URL.rstrip("/")
    url = f"{base_url}/chat/completions"

    payload = {
        "model": final_model,
        "messages": messages,
        "temperature": 0.3
    }

    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"LLM ERROR: {str(e)}")
            print(f"LLM ERROR: {str(e)}")
            if isinstance(e, httpx.HTTPStatusError):
                logger.error(f"Response body: {e.response.text}")
            raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")
