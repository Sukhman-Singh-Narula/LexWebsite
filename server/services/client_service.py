# services/client_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict
import uuid
from ..models import Client
from pydantic import EmailStr

class ClientService:
    def create_client(
        self,
        db: Session,
        email: EmailStr,
        full_name: str,
        phone: Optional[str] = None,
        address: Optional[Dict] = None,
        company_name: Optional[str] = None
    ) -> Client:
        if db.query(Client).filter(Client.email == email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        client = Client(
            email=email,
            full_name=full_name,
            phone=phone,
            address=address,
            company_name=company_name
        )
        
        db.add(client)
        db.commit()
        db.refresh(client)
        return client

    def get_client(self, db: Session, client_id: uuid.UUID) -> Client:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client

    def update_client(
        self,
        db: Session,
        client_id: uuid.UUID,
        update_data: dict
    ) -> Client:
        client = self.get_client(db, client_id)
        
        for key, value in update_data.items():
            if hasattr(client, key):
                setattr(client, key, value)
        
        db.commit()
        db.refresh(client)
        return client