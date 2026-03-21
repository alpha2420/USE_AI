from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.whatsapp_service import connect_whatsapp, get_whatsapp_status

router = APIRouter()

@router.post("/connect")
async def request_whatsapp_connection(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Initiate WhatsApp connection for the organization.
    Returns Baileys QR code so the user can scan it safely.
    """
    try:
        response = await connect_whatsapp(current_user.org_id)
        return {"message": "WhatsApp connection initiated", "qr": response.get("qr")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def check_whatsapp_status(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Check the current WhatsApp connection status for the organization.
    """
    try:
        response = await get_whatsapp_status(current_user.org_id)
        return {"status": response.get("status")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
