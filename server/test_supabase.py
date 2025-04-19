# test_supabase_connection.py
"""
Run this script to test your connection to Supabase.
This will verify both database and storage connections.
"""

import httpx
import asyncio
import os
from sqlalchemy import text
from dotenv import load_dotenv
from database import engine
from config import get_settings

# Load environment variables
load_dotenv()
settings = get_settings()

async def test_database_connection():
    """Test the connection to Supabase PostgreSQL database"""
    print("\n========== Testing Database Connection ==========")
    try:
        # Use SQLAlchemy connection to test
        with engine.connect() as connection:
            result = connection.execute(text("SELECT current_database(), current_user, version()"))
            db_info = result.fetchone()
            
            print(f"✅ Connected to Supabase PostgreSQL database")
            print(f"   Database: {db_info[0]}")
            print(f"   User: {db_info[1]}")
            print(f"   Version: {db_info[2]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

async def test_storage_connection():
    """Test the connection to Supabase Storage"""
    print("\n========== Testing Storage Connection ==========")
    try:
        # Check if we have Supabase credentials
        if not settings.SUPABASE_PROJECT_ID or not settings.SUPABASE_ANON_KEY:
            print("❌ Missing Supabase credentials in environment variables")
            return False
            
        # Try the newer API path format
        storage_url = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/bucket"
        
        # Set up headers
        headers = {
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}"
        }
        
        # Make a request to list buckets
        async with httpx.AsyncClient() as client:
            response = await client.get(storage_url, headers=headers)
            
            if response.status_code == 200:
                buckets = response.json()
                bucket_names = [bucket["name"] for bucket in buckets]
                
                print(f"✅ Connected to Supabase Storage")
                print(f"   Available buckets: {', '.join(bucket_names) if bucket_names else 'None'}")
                
                # Check if documents bucket exists
                if "documents" in bucket_names:
                    print(f"✅ 'documents' bucket found")
                else:
                    print(f"⚠️ 'documents' bucket not found. You need to create it.")
                    
                return True
            else:
                print(f"❌ Storage connection failed: Status {response.status_code}")
                print(f"   Response: {response.text}")
                
                # Let's try to create a bucket to see if we can access the storage API
                print("\n   Attempting to create a 'documents' bucket...")
                create_url = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/bucket"
                create_data = {
                    "id": "documents",
                    "name": "documents",
                    "public": False
                }
                create_response = await client.post(create_url, headers=headers, json=create_data)
                print(f"   Create bucket response: Status {create_response.status_code}")
                print(f"   Response: {create_response.text}")
                
                return False
                
    except Exception as e:
        print(f"❌ Storage connection failed: {str(e)}")
        return False

async def main():
    """Run all tests"""
    print("Testing Supabase Connection")
    print("===========================")
    
    # Test database connection
    db_success = await test_database_connection()
    
    # Test storage connection
    storage_success = await test_storage_connection()
    
    # Summary
    print("\n========== Summary ==========")
    print(f"Database Connection: {'✅ Success' if db_success else '❌ Failed'}")
    print(f"Storage Connection: {'✅ Success' if storage_success else '❌ Failed'}")
    
    if db_success and storage_success:
        print("\n✨ All tests passed! Your Supabase connection is working properly.")
    else:
        print("\n⚠️ Some tests failed. Please check your configuration.")

if __name__ == "__main__":
    asyncio.run(main())