# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from auth import authenticate_advocate, generate_advocate_token
from typing import Dict

router = APIRouter()

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Endpoint for advocates to log in and receive an access token.
    This is used with the OAuth2PasswordRequestForm for standard OAuth2 compatibility.
    """
    # Authenticate the advocate
    advocate = authenticate_advocate(db, form_data.username, form_data.password)
    if not advocate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate the token
    access_token = generate_advocate_token(advocate)
    
    # Return the token
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }