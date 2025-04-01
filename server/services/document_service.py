# services/document_service.py
# services/document_service.py
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from models import Document, DocumentType, DocumentStatus, Case  # Added Case import
from utils.s3 import S3Client

class DocumentService:
    def __init__(self):
        self.s3_client = S3Client()

    async def upload_document(
        self,
        file: UploadFile,
        case_id: uuid.UUID,
        advocate_id: uuid.UUID,
        document_type: DocumentType,
        db: Session,
        description: Optional[str] = None
    ) -> Document:
        s3_path = None  # Initialize s3_path before try block
        try:
            # Generate S3 path
            s3_path = await self.s3_client.upload_file(
                file=file,
                path=f"cases/{case_id}/documents"
            )
            
            # Create document record
            document = Document(
                case_id=case_id,
                title=file.filename,
                document_type=document_type,
                description=description,
                s3_path=s3_path,
                original_filename=file.filename,
                file_size=file.size,
                mime_type=file.content_type,
                status=DocumentStatus.PENDING
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            return document
            
        except Exception as e:
            if s3_path:
                await self.s3_client.delete_file(s3_path)
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_document(
        self,
        document_id: uuid.UUID,
        advocate_id: uuid.UUID,
        db: Session
    ) -> Document:
        """Get a document with advocate permission check"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get the case to check advocate access
        case = db.query(Case).filter(Case.id == document.case_id).first()
        if not case or case.advocate_id != advocate_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this document"
            )
        
        return document
    
    