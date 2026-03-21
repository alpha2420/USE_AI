import httpx
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def connect_whatsapp(org_id: str):
    """
    Request the Node.js service to generate a QR code for the given organization.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.WHATSAPP_SERVICE_URL}/connect",
                json={"org_id": org_id},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to connect WhatsApp for org {org_id}: {e}")
        raise

async def get_whatsapp_status(org_id: str):
    """
    Check the connection status from the Node.js service.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WHATSAPP_SERVICE_URL}/status/{org_id}",
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to get WhatsApp status for org {org_id}: {e}")
        raise

async def send_whatsapp_message(org_id: str, phone: str, text: str):
    """
    Send a WhatsApp message via the Node.js service.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.WHATSAPP_SERVICE_URL}/send",
                json={"org_id": org_id, "phone": phone, "text": text},
                timeout=20.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message for org {org_id}: {e}")
        raise
