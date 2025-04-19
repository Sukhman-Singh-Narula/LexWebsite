# services/document_service.py
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
import os
import tempfile
import httpx
from models import Document, DocumentType, DocumentStatus, Case
from config import get_settings

settings = get_settings()

class DocumentService:
    def __init__(self):
        # Supabase storage API endpoint base URL
        self.storage_url = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co/storage/v1"
        # Default bucket name - create this in Supabase dashboard
        self.bucket_name = "documents"
        # Headers for Supabase API requests
        self.headers = {
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}"
        }
        
        # S3 client setup remains for backward compatibility
        # This can be used if you still need S3 for some features
        if hasattr(settings, 'AWS_ACCESS_KEY') and settings.AWS_ACCESS_KEY:
            import boto3
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY,
                aws_secret_access_key=settings.AWS_SECRET_KEY,
                region_name=settings.AWS_REGION
            )
            self.s3_bucket = settings.S3_BUCKET

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
        Upload a document to Supabase Storage and create a database record
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
        
        storage_path = None
        
        try:
            # Generate a file path similar to S3
            file_uuid = uuid.uuid4()
            storage_path = f"cases/{case_id}/documents/{file_uuid}-{file.filename}"
            
            # Create a temporary file to handle the upload
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Read file content
                contents = await file.read()
                # Write to temporary file
                temp_file.write(contents)
                temp_file.flush()
                
                # Upload to Supabase Storage using their REST API
                async with httpx.AsyncClient() as client:
                    with open(temp_file.name, "rb") as f:
                        upload_url = f"{self.storage_url}/object/{self.bucket_name}/{storage_path}"
                        response = await client.post(
                            upload_url,
                            headers=self.headers,
                            files={"file": (file.filename, f, file.content_type)}
                        )
                        
                        if response.status_code != 200:
                            raise Exception(f"Upload failed with status {response.status_code}: {response.text}")
                
            # Clean up temporary file
            os.unlink(temp_file.name)
            
            # Reset file pointer for potential future use
            await file.seek(0)
            
            # Create document record in database
            document = Document(
                case_id=case_id,
                title=file.filename,
                document_type=document_type,
                description=description,
                s3_path=storage_path,  # We're still using the same field name for compatibility
                original_filename=file.filename,
                file_size=file.size,
                mime_type=file.content_type,
                status=DocumentStatus.PROCESSED,
                document_metadata={}
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            return document
            
        except Exception as e:
            # If there was an error and we uploaded, try to delete the file
            if storage_path:
                try:
                    async with httpx.AsyncClient() as client:
                        delete_url = f"{self.storage_url}/object/{self.bucket_name}/{storage_path}"
                        await client.delete(delete_url, headers=self.headers)
                except Exception as delete_error:
                    print(f"Error deleting Supabase storage object after upload failure: {delete_error}")
            
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
    ) -> List[Document]:
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
        """Get document content from Supabase Storage"""
        try:
            # Get a download URL from Supabase
            download_url = f"{self.storage_url}/object/public/{self.bucket_name}/{s3_path}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    download_url,
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    raise Exception(f"Download failed with status {response.status_code}")
                    
                return response.content
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving document content: {str(e)}"
            )
    
    async def delete_document(
        self,
        document_id: uuid.UUID,
        advocate_id: uuid.UUID,
        db: Session
    ) -> bool:
        """Delete a document from storage and database"""
        # Get document (this will check permissions)
        document = await self.get_document(document_id, advocate_id, db)
        
        try:
            # Delete from Supabase Storage
            async with httpx.AsyncClient() as client:
                delete_url = f"{self.storage_url}/object/{self.bucket_name}/{document.s3_path}"
                response = await client.delete(delete_url, headers=self.headers)
                
                if response.status_code not in (200, 204):
                    print(f"Warning: Failed to delete file from storage: {response.status_code}")
                    # Continue to delete from database even if storage delete fails
            
            # Delete from database
            db.delete(document)
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting document: {str(e)}"
            )
    
    def generate_download_url(self, s3_path: str) -> str:
        """Generate a public download URL for a document"""
        # For Supabase Storage, we can use a signed URL
        signed_url = f"{self.storage_url}/object/sign/{self.bucket_name}/{s3_path}"
        
        # By default, sign URLs that expire in 60 minutes
        expires_in = 60 * 60
        
        try:
            # We need to make a synchronous request here since this method isn't async
            import requests
            response = requests.post(
                signed_url,
                headers=self.headers,
                json={"expiresIn": expires_in}
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to generate signed URL: {response.status_code}")
                
            # Get the signed URL from the response
            data = response.json()
            return data.get("signedURL")
            
        except Exception as e:
            print(f"Error generating download URL: {str(e)}")
            # Fallback to a public URL
            return f"{self.storage_url}/object/public/{self.bucket_name}/{s3_path}?download=true"