# routers/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Document, DocumentType, DocumentStatus, Case, DocumentResponse
from auth import get_current_advocate
from services.document_service import DocumentService
import uuid
from config import get_settings
from fastapi.responses import StreamingResponse, RedirectResponse

router = APIRouter()
document_service = DocumentService()
settings = get_settings()

@router.post("/upload/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    case_id: uuid.UUID = Form(...),
    document_type: DocumentType = Form(...),
    description: Optional[str] = Form(None),
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Uploads a new document to the system.
    The document is associated with a specific case and can only be uploaded
    by an authenticated advocate.
    """
    # Verify that the advocate has access to this case
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.advocate_id == current_advocate.id
    ).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or you don't have access to it"
        )
    
    try:
        # Call the document service to handle the upload
        document = await document_service.upload_document(
            file=file,
            case_id=case_id,
            advocate_id=current_advocate.id,
            document_type=document_type,
            description=description,
            db=db
        )
        return document
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific document by its ID.
    Only accessible to authenticated advocates.
    """
    try:
        document = await document_service.get_document(
            document_id=document_id,
            advocate_id=current_advocate.id,
            db=db
        )
        return document
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving document: {str(e)}"
        )

@router.get("/case/{case_id}", response_model=List[DocumentResponse])
async def get_documents_by_case(
    case_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Lists all documents associated with a specific case.
    Only accessible to advocates assigned to the case.
    """
    # Verify that the advocate has access to this case
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.advocate_id == current_advocate.id
    ).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or you don't have access to it"
        )
    
    # Query documents related to this case
    documents = db.query(Document).filter(Document.case_id == case_id).all()
    return documents

@router.get("/{document_id}/download")
async def download_document(
    document_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Generates a download URL for the document.
    Only accessible to advocates assigned to the corresponding case.
    """
    try:
        # Get the document first to verify access
        document = await document_service.get_document(
            document_id=document_id,
            advocate_id=current_advocate.id,
            db=db
        )
        
        # Get a signed URL for the document from Supabase
        download_url = document_service.generate_download_url(document.s3_path)
        
        # Return the URL
        return {"url": download_url}
        
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating download URL: {str(e)}"
        )
@router.get("/{document_id}/content")
async def get_document_content(
    document_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Retrieves the content of a specific document by its ID.
    Only accessible to authenticated advocates.
    """
    document = await document_service.get_document(
        document_id=document_id,
        advocate_id=current_advocate.id,
        db=db
    )
    
    # Get file from Supabase Storage
    file_content = await document_service.get_document_content(document.s3_path)
    
    # Return file with appropriate headers
    return StreamingResponse(
        iter([file_content]),
        media_type=document.mime_type,
        headers={
            'Content-Disposition': f'inline; filename="{document.original_filename}"'
        }
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    """
    Deletes a document from storage and database.
    Only accessible to advocates assigned to the corresponding case.
    """
    await document_service.delete_document(
        document_id=document_id,
        advocate_id=current_advocate.id,
        db=db
    )
    return {}
