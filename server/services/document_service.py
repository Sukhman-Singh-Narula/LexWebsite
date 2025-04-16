# services/document_service.py
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from models import Document, DocumentType, DocumentStatus, Case
import boto3
from config import get_settings
import os
import tempfile
settings = get_settings()

class DocumentService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.S3_BUCKET

    async def upload_document(
        self,
        file: UploadFile,
        case_id: uuid.UUID,
        advocate_id: uuid.UUID,
        document_type: DocumentType,
        db: Session,
        description: Optional[str] = None
    ) -> Document:
        """
        Upload a document to S3 and create a database record
        """
        # Verify case exists and belongs to the advocate
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.advocate_id == advocate_id
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found or you don't have access to it"
            )
        
        s3_path = None  # Initialize s3_path before try block
        
        try:
            # Generate unique S3 path
            s3_key = f"cases/{case_id}/documents/{uuid.uuid4()}-{file.filename}"
            
            # Create a temporary file to handle the upload
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Read file content
                contents = await file.read()
                # Write to temporary file
                temp_file.write(contents)
                temp_file.flush()
                
                # Upload to S3
                self.s3_client.upload_file(
                    temp_file.name,
                    self.bucket,
                    s3_key,
                    ExtraArgs={
                        'ContentType': file.content_type,
                        'Metadata': {
                            'original_filename': file.filename
                        }
                    }
                )
                
            # Clean up the temporary file
            os.unlink(temp_file.name)
            
            # Reset file pointer for potential future use
            await file.seek(0)
            
            s3_path = s3_key
            
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
                status=DocumentStatus.PROCESSED,  # Mark as processed since we're not doing async processing
                document_metadata={}  # Empty metadata for now
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            return document
            
        except Exception as e:
            # If there was an error and we uploaded to S3, delete the file
            if s3_path:
                try:
                    self.s3_client.delete_object(
                        Bucket=self.bucket,
                        Key=s3_path
                    )
                except Exception as delete_error:
                    # Log but don't raise this secondary error
                    print(f"Error deleting S3 object after upload failure: {delete_error}")
            
            # Roll back the database transaction
            db.rollback()
            
            # Re-raise the original error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Document upload failed: {str(e)}"
            )
    
    async def get_document(
        self,
        document_id: uuid.UUID,
        advocate_id: uuid.UUID,
        db: Session
    ) -> Document:
        """Get a document with advocate permission check"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get the case to check advocate access
        case = db.query(Case).filter(Case.id == document.case_id).first()
        if not case or case.advocate_id != advocate_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this document"
            )
        
        return document
    
    async def get_case_documents(
        self,
        case_id: uuid.UUID,
        advocate_id: uuid.UUID,
        db: Session
    ) -> list[Document]:
        """Get all documents for a case with advocate permission check"""
        # Check if the case exists and belongs to the advocate
        case = db.query(Case).filter(
            Case.id == case_id,
            Case.advocate_id == advocate_id
        ).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found or you don't have access to it"
            )
        
        # Get all documents for the case
        documents = db.query(Document).filter(Document.case_id == case_id).all()
        return documents

    async def get_document_content(self, s3_path: str) -> bytes:
        """Get document content from S3"""
        try:
            response = self.s3_client.get_object(
                Bucket=settings.S3_BUCKET,
                Key=s3_path
            )
            return response['Body'].read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving document content: {str(e)}"
            )