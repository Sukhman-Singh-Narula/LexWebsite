# create_default_client.py - Run this script to create a default client in your database

from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Client, Base
import uuid

def create_default_client():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if default client already exists
        default_client_id = uuid.UUID('00000000-0000-0000-0000-000000000000')
        existing_client = db.query(Client).filter(Client.id == default_client_id).first()
        
        if existing_client:
            print(f"Default client already exists with ID: {default_client_id}")
            return
        
        # Create a new default client with the predefined UUID
        default_client = Client(
            id=default_client_id,
            email="sususu@gmail.com",
            full_name="Default Client",
            address={},
            company_name="Default Company",
            is_active=True
        )
        
        # Add to database
        db.add(default_client)
        db.commit()
        db.refresh(default_client)
        
        print(f"Successfully created default client with ID: {default_client.id}")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating default client: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_default_client()