from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import io
import pypdf

from app.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.scraper import scrape_url
from app.services.rag import process_text

router = APIRouter()

class URLRequest(BaseModel):
    url: str

class ManualTextRequest(BaseModel):
    text: str

@router.post("/url")
async def extract_url(request: URLRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        text = await scrape_url(request.url)
        await process_text(text, current_user.org_id, db)
        return {"message": "URL content processed successfully"}
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pdf")
async def extract_pdf(file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")
            
        await process_text(text, current_user.org_id, db)
        return {"message": "PDF content processed successfully"}
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/manual")
async def extract_manual(request: ManualTextRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        await process_text(request.text, current_user.org_id, db)
        return {"message": "Text processed successfully"}
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
