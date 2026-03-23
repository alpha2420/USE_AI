import logging
import time
from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, knowledge, whatsapp, chat
from app.config import settings
from app.database import AsyncSessionLocal, engine
from sqlalchemy import text
from app.services.llm_provider import generate_embedding
import os
import redis.asyncio as redis


# Logging Setup
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("useai")

app = FastAPI(title="useAI Backend MVP")

@app.on_event("startup")
async def startup_event():
    import traceback
    # Step 4: Verify environment variables
    required_vars = [
        "DATABASE_URL", 
        "REDIS_URL", 
        "GROQ_API_KEY",
        "SUPABASE_URL", 
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    print("--- 🔬 Verifying Dependencies ---")
    for var in required_vars:
        val = getattr(settings, var, None)
        if not val:
            print(f"⚠️ WARNING: Missing environment variable: {var}")
        else:
            print(f"✅ Found: {var}")

    try:
        from app.database import Base, engine
        import app.models.user
        import app.models.conversation
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            await conn.run_sync(Base.metadata.create_all)

            # Safe migration: ensure embedding column is 1536 dims
            try:
                result = await conn.execute(text(
                    "SELECT atttypmod FROM pg_attribute "
                    "WHERE attrelid = 'knowledge_chunks'::regclass "
                    "AND attname = 'embedding'"
                ))
                row = result.first()
                if row and row[0] != 1536:
                    print(f"⚙️ Migrating embedding column from {row[0]} to 1536 dimensions...")
                    await conn.execute(text(
                        "DELETE FROM knowledge_chunks"
                    ))
                    await conn.execute(text(
                        "ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(1536)"
                    ))
                    print("✅ Embedding column migrated to 1536 dimensions")
            except Exception as vec_err:
                print(f"⚠️ Vector migration check skipped: {vec_err}")

        print("✅ Database schema initialized successfully.")
        print("✅ Database connection successful")
    except Exception as e:
        print("❌ Database connection or schema initialization FAILED:")
        traceback.print_exc()

    if redis_client:
        try:
            await redis_client.ping()
            print("✅ Redis connection successful")
        except Exception as e:
            print("❌ Redis connection FAILED:")
            traceback.print_exc()
    else:
        print("❌ Redis client not initialized")

    # LLM provider diagnostics
    print(f"🤖 LLM provider: {settings.LLM_PROVIDER}")
    print(f"🤖 Chat model: {settings.CHAT_MODEL}")
    print(f"🤖 Embedding model: {settings.EMBEDDING_MODEL}")
    if settings.LLM_PROVIDER.lower() == "groq":
        print(f"🤖 Has Groq key: {bool(settings.GROQ_API_KEY)}")
        print(f"🤖 Groq base URL: {settings.GROQ_BASE_URL}")
        if settings.GROQ_API_KEY:
            print(f"🤖 Groq key length: {len(settings.GROQ_API_KEY)}")
    elif settings.LLM_PROVIDER.lower() == "grok":
        print(f"🤖 Has Grok key: {bool(settings.GROK_API_KEY)}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://use-ai-one.vercel.app",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis setup for rate limiting
redis_client = None
try:
    if settings.REDIS_URL:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    import traceback
    print("Redis initialization failed:")
    traceback.print_exc()

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip preflight OPTIONS requests — let CORSMiddleware handle them
    if request.method == "OPTIONS":
        return await call_next(request)

    start_time = time.time()
    
    # Simple Rate limit: 100 req / minute / user (Using IP or Auth header as fallback)
    identifier = request.headers.get("Authorization") or request.client.host
    if identifier and redis_client:
        try:
            key = f"rate_limit:{identifier}"
            requests = await redis_client.incr(key)
            if requests == 1:
                await redis_client.expire(key, 60)
            
            if requests > 100:
                return Response("Rate limit exceeded", status_code=429)
        except Exception as e:
            logger.warning(f"Redis rate limit error: {e}")

    try:
        response = await call_next(request)
    except Exception as e:
        import traceback
        import sys
        print("--- CRITICAL SERVER ERROR ---")
        traceback.print_exc(file=sys.stdout)
        logger.error(f"Server Error: {str(e)}")
        # More informative response for debugging (MVP stage only)
        response = Response(f"Internal Server Error: {str(e)}", status_code=500)
        
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    return response

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Base"])
app.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/health/dependencies")
async def dependency_health():
    import httpx
    status = {"database": "error", "redis": "error", "whatsapp": "error"}
    
    # Check Database
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        status["database"] = "ok"
    except:
        pass
        
    # Check Redis
    if redis_client:
        try:
            await redis_client.ping()
            status["redis"] = "ok"
        except:
            pass
            
    # Check Whatsapp service
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.WHATSAPP_SERVICE_URL.rstrip('/')}/status/health-test", timeout=2.0)
            # Just checking if service responds
            if resp.status_code < 500:
                status["whatsapp"] = "ok"
    except:
        pass
        
    return status

@app.get("/health/llm")
async def llm_health():
    provider = settings.LLM_PROVIDER.lower()
    has_key = False
    base_url = ""
    if provider == "groq":
        has_key = bool(settings.GROQ_API_KEY)
        base_url = settings.GROQ_BASE_URL
    elif provider == "grok":
        has_key = bool(settings.GROK_API_KEY)
        base_url = settings.GROK_BASE_URL
    return {
        "provider": settings.LLM_PROVIDER,
        "has_key": has_key,
        "base_url": base_url,
        "chat_model": settings.CHAT_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
    }

@app.get("/")
async def root():
    return {"message": "Welcome to useAI Backend API"}

