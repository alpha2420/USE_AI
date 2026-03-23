"""
Groq LLM service — OpenAI-compatible client for chat completions.
Replaces the old Grok service. Uses the same OpenAI SDK with Groq base URL.
"""
import logging
from openai import AsyncOpenAI
from app.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Initialize Groq client using OpenAI-compatible SDK
_groq_client = None

def _get_groq_client() -> AsyncOpenAI:
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")
        _groq_client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url=settings.GROQ_BASE_URL,
        )
    return _groq_client


async def generate_groq_completion(messages: list[dict], model: str = None) -> str:
    """Generates a chat completion using Groq API (OpenAI-compatible)."""
    final_model = model or settings.CHAT_MODEL
    logger.info(f"Groq completion request | model={final_model}")

    try:
        client = _get_groq_client()
        response = await client.chat.completions.create(
            model=final_model,
            messages=messages,
            temperature=0.3,
            timeout=30,
        )
        return response.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LLM ERROR: {str(e)}")
        print(f"LLM ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")
