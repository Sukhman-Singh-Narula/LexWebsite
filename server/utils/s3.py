# utils/s3.py
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException
import uuid
from config import get_settings

settings = get_settings()

class S3Client:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.S3_BUCKET

    async def upload_file(self, file: UploadFile, path: str) -> str:
        try:
            filename = f"{path}/{uuid.uuid4()}-{file.filename}"
            
            # boto3's upload_fileobj is not async, so we need to use regular await
            self.s3.upload_fileobj(  # Remove await here
                file.file,
                self.bucket,
                filename,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ServerSideEncryption': 'AES256',
                    'Metadata': {
                        'original_filename': file.filename
                    }
                }
            )
            
            return filename
            
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"S3 upload failed: {str(e)}"
            )