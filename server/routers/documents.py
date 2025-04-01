# routers/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import DocumentType
from auth import get_current_advocate  # Changed from get_current_user
from services.document_service import DocumentService
import uuid

router = APIRouter()
document_service = DocumentService()

@router.post("/upload/")
async def upload_document(
    file: UploadFile = File(...),
    case_id: uuid.UUID = Form(...),
    document_type: DocumentType = Form(...),
    description: Optional[str] = Form(None),
    current_advocate = Depends(get_current_advocate),  # Changed from current_user
    db: Session = Depends(get_db)
):
    """
    Uploads a new document to the system.
    The document is associated with a specific case and can only be uploaded
    by an authenticated advocate.
    """
    return await document_service.upload_document(
        file=file,
        case_id=case_id,
        advocate_id=current_advocate.id,  # Changed from user_id
        document_type=document_type,
        description=description,
        db=db
    )

@router.get("/{document_id}")
async def get_document(
    document_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific document by its ID.
    Only accessible to authenticated advocates.
    """
    return await document_service.get_document(
        document_id=document_id,
        advocate_id=current_advocate.id,  # Pass advocate_id instead of advocate
        db=db
    )