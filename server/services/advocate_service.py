# services/advocate_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from passlib.context import CryptContext
from models import Advocate
from pydantic import EmailStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdvocateService:
    def create_advocate(
        self,
        db: Session,
        email: EmailStr,
        password: str,
        full_name: str,
        bar_number: str,
        license_state: str,
        phone: Optional[str] = None,
        firm_name: Optional[str] = None
    ) -> Advocate:
        # Check if advocate already exists
        if db.query(Advocate).filter(Advocate.email == email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if db.query(Advocate).filter(Advocate.bar_number == bar_number).first():
            raise HTTPException(status_code=400, detail="Bar number already registered")
        
        # Create new advocate
        advocate = Advocate(
            email=email,
            password_hash=pwd_context.hash(password),
            full_name=full_name,
            phone=phone,
            bar_number=bar_number,
            license_state=license_state,
            firm_name=firm_name
        )
        
        db.add(advocate)
        db.commit()
        db.refresh(advocate)
        return advocate

    def get_advocate(self, db: Session, advocate_id: uuid.UUID) -> Advocate:
        advocate = db.query(Advocate).filter(Advocate.id == advocate_id).first()
        if not advocate:
            raise HTTPException(status_code=404, detail="Advocate not found")
        return advocate

    def update_advocate(
        self,
        db: Session,
        advocate_id: uuid.UUID,
        update_data: dict
    ) -> Advocate:
        advocate = self.get_advocate(db, advocate_id)
        
        for key, value in update_data.items():
            if hasattr(advocate, key):
                setattr(advocate, key, value)
        
        db.commit()
        db.refresh(advocate)
        return advocate