# routers/cases.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Case, CaseStatus, CaseCreate, CaseUpdate, CaseResponse, Client
from auth import get_current_advocate  # Added this import
import uuid
from datetime import datetime
from pydantic import BaseModel

# Create a custom model for creating cases without requiring client_id
class CaseCreateWithOptionalClient(BaseModel):
    title: str
    description: Optional[str] = None
    case_number: str
    filing_date: Optional[datetime] = None
    case_metadata: Optional[dict] = {}
    client_id: Optional[uuid.UUID] = None
    status: Optional[str] = "draft"

# Create the router object that FastAPI will use
router = APIRouter()
@router.get("/", response_model=List[CaseResponse])
async def list_cases(
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db),
    status: Optional[CaseStatus] = None
):
    """
    Lists all cases for the current advocate.
    Optionally filters cases by their status.
    """
    query = db.query(Case).filter(Case.advocate_id == current_advocate.id)
    
    if status:
        query = query.filter(Case.status == status)
    
    return query.all()

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific case by its ID.
    Advocates can only access cases they are assigned to.
    """
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.advocate_id == current_advocate.id
    ).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or you don't have access to it"
        )
    
    return case

@router.get("/", response_model=List[CaseResponse])
async def list_cases(
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db),
    status: Optional[CaseStatus] = None
):
    """
    Lists all cases for the current advocate.
    Optionally filters cases by their status.
    """
    query = db.query(Case).filter(Case.advocate_id == current_advocate.id)
    
    if status:
        query = query.filter(Case.status == status)
    
    return query.all()

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: uuid.UUID,
    update_data: CaseUpdate,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Updates an existing case.
    Advocates can only update cases they are assigned to.
    """
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.advocate_id == current_advocate.id
    ).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or you don't have access to it"
        )
    
    # Update case fields from the request data
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(case, field, value)
    
    try:
        db.commit()
        db.refresh(case)
        return case
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update case: {str(e)}"
        )