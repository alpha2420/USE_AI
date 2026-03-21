from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.user import KnowledgeChunk
from app.utils.chunker import chunk_text
from app.services.embeddings import generate_embeddings_batch, generate_embedding
from app.services.llm_provider import generate_completion
import logging

logger = logging.getLogger(__name__)

async def process_text(text_content: str, org_id: str, db: AsyncSession):
    chunks = chunk_text(text_content, chunk_size=400)
    
    # Process chunks in batches to avoid LLM rate limits
    batch_size = 20
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i + batch_size]
        try:
            embeddings = await generate_embeddings_batch(batch_chunks)
            
            # Prepare rows for bulk insert
            knowledge_objects = [
                KnowledgeChunk(
                    org_id=org_id,
                    text=chunk,
                    embedding=embedding
                )
                for chunk, embedding in zip(batch_chunks, embeddings)
            ]
            
            # Insert to db
            db.add_all(knowledge_objects)
            await db.commit()
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to process text chunks: {e}")
            raise Exception(f"Failed to process text: {str(e)}")

async def generate_reply(question: str, org_id: str, db: AsyncSession) -> str:
    # Convert question to embedding
    question_embedding = await generate_embedding(question)
    
    # Search vector db
    # We use pgvector's <=> operator to calculate cosine distance
    stmt = (
        select(KnowledgeChunk)
        .where(KnowledgeChunk.org_id == org_id)
        .order_by(KnowledgeChunk.embedding.cosine_distance(question_embedding))
        .limit(3)
    )
    
    result = await db.execute(stmt)
    matching_chunks = result.scalars().all()
    
    if not matching_chunks:
        # Fallback if no context found
        context = "No relevant context found in your knowledge base."
    else:
        context = "\n\n".join([chunk.text for chunk in matching_chunks])
    
    # Generate response
    system_prompt = (
        "You are a helpful AI assistant representing a business. "
        "Use the provided context to answer the user's question accurately. "
        "If the answer is not contained in the context, politely state that you do not have that information."
    )
    
    user_prompt = f"Context:\n{context}\n\nQuestion:\n{question}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    logger.info(f"Generating reply for org {org_id}")
    return await generate_completion(messages)
