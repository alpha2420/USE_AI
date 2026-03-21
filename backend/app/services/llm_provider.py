from app.config import settings
import openai

# Initialize OpenAI client early if needed
openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if getattr(settings, "OPENAI_API_KEY", None) else None

async def generate_embedding(text: str) -> list[float]:
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "grok":
        from app.services.grok_service import generate_grok_embedding
        return await generate_grok_embedding(text)
    else:
        # Default fallback to OpenAI
        if not openai_client:
            raise ValueError("OpenAI API key missing")
        response = await openai_client.embeddings.create(
            input=[text],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

async def generate_completion(messages: list[dict], model: str = None) -> str:
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "grok":
        from app.services.grok_service import generate_grok_completion
        return await generate_grok_completion(messages, model=model or "grok-beta")
    else:
        if not openai_client:
            raise ValueError("OpenAI API key missing")
        response = await openai_client.chat.completions.create(
            model=model or "gpt-4o",
            messages=messages
        )
        return response.choices[0].message.content
