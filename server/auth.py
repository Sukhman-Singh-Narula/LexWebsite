# auth.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
from models import Advocate
from config import get_settings
from passlib.context import CryptContext

# Define the password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_advocate(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Advocate:
    """
    Validates the JWT token and returns the current authenticated advocate.
    This function serves as a dependency for protected routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        advocate_id: str = payload.get("sub")
        if advocate_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    advocate = db.query(Advocate).filter(Advocate.id == advocate_id).first()
    if advocate is None:
        raise credentials_exception
    if not advocate.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Advocate account is inactive"
        )
    return advocate

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify that a plain password matches its hashed version.
    This is used when advocates try to log in.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password for storage in the database.
    This is used when creating new advocate accounts.
    """
    return pwd_context.hash(password)

def authenticate_advocate(db: Session, email: str, password: str) -> Optional[Advocate]:
    """
    Authenticate an advocate using their email and password.
    Returns the advocate if authentication succeeds, None otherwise.
    """
    # Find the advocate by email
    advocate = db.query(Advocate).filter(Advocate.email == email).first()
    if not advocate:
        return None
    # Verify the password
    if not verify_password(password, advocate.password_hash):
        return None
    # Check if the advocate is active
    if not advocate.is_active:
        return None
    return advocate

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token for an authenticated advocate.
    The token includes the advocate's ID and expiration time.
    """
    to_encode = data.copy()
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    # Create the JWT token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

async def get_current_advocate(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Advocate:
    """
    Get the current authenticated advocate from their JWT token.
    This is used as a dependency in routes that require authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        advocate_id: str = payload.get("sub")
        if advocate_id is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    # Get the advocate from the database
    advocate = db.query(Advocate).filter(Advocate.id == advocate_id).first()
    if advocate is None:
        raise credentials_exception
    if not advocate.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Advocate account is inactive"
        )
    return advocate

# Additional helper function for token creation
def generate_advocate_token(advocate: Advocate) -> str:
    """
    Generate a token for a specific advocate.
    This is used when advocates log in successfully.
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": str(advocate.id)},
        expires_delta=access_token_expires
    )