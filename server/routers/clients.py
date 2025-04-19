# routers/clients.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Client, ClientCreate, ClientUpdate, ClientResponse, Case  # Import Case here
from auth import get_current_advocate
import uuid

router = APIRouter()

@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Lists all clients.
    In a production system, this would be filtered by advocate or firm.
    """
    # For now, return all clients
    # In production, you would filter by advocate_id or firm_id
    clients = db.query(Client).all()
    return clients

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific client by ID.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return client
@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Creates a new client.
    """
    # Create a new client
    client = Client(
        email=client_data.email,
        full_name=client_data.full_name,
        phone=client_data.phone,
        address=client_data.address,
        company_name=client_data.company_name,
        is_active=True
    )
    
    try:
        db.add(client)
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create client: {str(e)}"
        )
@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: uuid.UUID,
    update_data: ClientUpdate,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Updates an existing client.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update client fields from the request data
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(client, field, value)
    
    try:
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update client: {str(e)}"
        )