from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.database import get_db
from app.models.conversation import Conversation, Message
from app.models.user import Organization, User
from app.services.rag import generate_reply
from app.services.whatsapp_service import send_whatsapp_message
from app.utils.deps import get_current_user

router = APIRouter()

class TestChatRequest(BaseModel):
    question: str

@router.post("/test")
async def test_chat(request: TestChatRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Test endpoint for the UI dashboard to chat with the trained RAG pipeline directly.
    """
    try:
        reply_content = await generate_reply(request.question, current_user.org_id, db)
        return {"status": "success", "reply": reply_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def chat_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook endpoint to receive incoming messages from the Baileys Node.js service.
    Expected JSON payload: {"org_id": "...", "customer_phone": "...", "content": "..."}
    """
    body = await request.json()
    org_id = body.get("org_id")
    customer_phone = body.get("customer_phone")
    content = body.get("content")
    
    if not all([org_id, customer_phone, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Verify organization exists
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = org_result.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Find or create conversation
    conv_result = await db.execute(select(Conversation).where(
        Conversation.org_id == org_id,
        Conversation.customer_phone == customer_phone,
        Conversation.status == "active"
    ))
    conversation = conv_result.scalars().first()
    
    if not conversation:
        conversation = Conversation(org_id=org_id, customer_phone=customer_phone, status="active")
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
    # Save incoming message
    inbound_msg = Message(
        conversation_id=conversation.id,
        content=content,
        direction="inbound"
    )
    db.add(inbound_msg)
    await db.commit()
    
    try:
        # Call RAG to generate reply
        reply_content = await generate_reply(content, org_id, db)
        
        # Send response via WhatsApp service
        await send_whatsapp_message(org_id, customer_phone, reply_content)
        
        # Save outgoing message
        outbound_msg = Message(
            conversation_id=conversation.id,
            content=reply_content,
            direction="outbound"
        )
        db.add(outbound_msg)
        await db.commit()
        
        return {"status": "success", "reply": reply_content}
    except Exception as e:
        print(f"Error handling webhook: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/conversations")
async def get_conversations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve all conversations for the current User's organization.
    """
    stmt = select(Conversation).where(Conversation.org_id == current_user.org_id).order_by(Conversation.id.desc()).limit(100)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve all messages for a specific conversation, ensuring it belongs to the user's organization.
    """
    # Verify ownership
    conv_stmt = select(Conversation).where(Conversation.id == conv_id, Conversation.org_id == current_user.org_id)
    conv_result = await db.execute(conv_stmt)
    if not conv_result.scalars().first():
        raise HTTPException(status_code=403, detail="Unauthorized access to conversation")

    msg_stmt = select(Message).where(Message.conversation_id == conv_id).order_by(Message.timestamp)
    result = await db.execute(msg_stmt)
    return result.scalars().all()
