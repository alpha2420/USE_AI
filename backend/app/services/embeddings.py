import asyncio
from app.services.llm_provider import generate_embedding as _generate_embedding
from app.config import settings

async def generate_embedding(text: str) -> list[float]:
    return await _generate_embedding(text)

async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "grok":
        from app.services.grok_service import generate_grok_embeddings_batch
        return await generate_grok_embeddings_batch(texts)
    else:
        # OpenAI fallback
        import openai
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.embeddings.create(
            input=texts,
            model="text-embedding-3-small"
        )
        return [data.embedding for data in response.data]
