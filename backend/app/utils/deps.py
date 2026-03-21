from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import settings
from app.database import get_db
from app.models.user import User, Organization
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # For MVP, decode the Clerk token. (In production, verify signature via JWKS)
        payload = jwt.get_unverified_claims(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user is None:
        # Auto-provision user from Clerk signup
        org = Organization(name=f"Org for {user_id}")
        db.add(org)
        await db.commit()
        await db.refresh(org)
        
        user = User(
            id=user_id,
            name="Clerk User",
            email=payload.get("email") or f"{user_id}@clerk.dev",
            password_hash="oauth_managed",
            org_id=org.id
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user

