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
        "OPENAI_API_KEY", 
        "GROK_API_KEY", # Since it's the default provider
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

@app.get("/")
async def root():
    return {"message": "Welcome to useAI Backend API"}

