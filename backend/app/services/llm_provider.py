"""
LLM Provider router — dispatches chat completions and embeddings
to the configured provider (groq or grok).
"""
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def generate_embedding(text: str) -> list[float]:
    """Generate an embedding using the embeddings API."""
    from app.services.embeddings import generate_single_embedding as _api_embedding
    return await _api_embedding(text)


async def generate_completion(messages: list[dict], model: str = None) -> str:
    """Route chat completion to the configured LLM provider."""
    provider = settings.LLM_PROVIDER.lower()

    if provider == "groq":
        from app.services.groq_service import generate_groq_completion
        final_model = model or settings.CHAT_MODEL
        logger.info(f"Routing to Groq completion | model={final_model}")
        return await generate_groq_completion(messages, model=final_model)

    elif provider == "grok":
        # Legacy Grok support (kept for backward compatibility)
        from app.services.grok_service import generate_grok_completion
        logger.info("Routing to legacy Grok completion")
        return await generate_grok_completion(messages, model=model)

    else:
        raise ValueError(f"Unknown LLM provider: {provider}")
