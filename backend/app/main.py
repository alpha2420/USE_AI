import logging
import time
from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, knowledge, whatsapp, chat
from app.config import settings
from app.database import AsyncSessionLocal, engine
from sqlalchemy import text
from app.services.llm_provider import generate_embedding
import redis.asyncio as redis

# Logging Setup
logging.basicConfig(
    filename='logs/app.log',
    filemode='a',
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger("useai")

app = FastAPI(title="useAI Backend MVP")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
    print("Database connection successful")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis setup for rate limiting
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Simple Rate limit: 100 req / minute / user (Using IP or Auth header as fallback)
    identifier = request.headers.get("Authorization") or request.client.host
    if identifier:
        key = f"rate_limit:{identifier}"
        requests = await redis_client.incr(key)
        if requests == 1:
            await redis_client.expire(key, 60)
        
        if requests > 100:
            return Response("Rate limit exceeded", status_code=429)

    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Server Error: {str(e)}")
        response = Response("Internal Server Error", status_code=500)
        
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

@app.get("/")
async def root():
    return {"message": "Welcome to useAI Backend API"}

