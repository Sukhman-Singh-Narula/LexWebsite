# routers/advocates.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.advocate_service import AdvocateService
from models import AdvocateCreate, AdvocateUpdate, AdvocateResponse
from auth import get_current_advocate
import uuid

router = APIRouter()
advocate_service = AdvocateService()

@router.post("/", response_model=AdvocateResponse)
def create_advocate(
    advocate_data: AdvocateCreate,
    db: Session = Depends(get_db)
):
    return advocate_service.create_advocate(db=db, **advocate_data.dict())

@router.get("/me", response_model=AdvocateResponse)
def get_current_advocate_info(
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    return advocate_service.get_advocate(db, current_advocate.id)

@router.put("/me", response_model=AdvocateResponse)
def update_advocate_info(
    update_data: AdvocateUpdate,
    current_advocate = Depends(get_current_advocate),
    db: Session = Depends(get_db)
):
    return advocate_service.update_advocate(
        db,
        current_advocate.id,
        update_data.dict(exclude_unset=True)
    )
@router.post("/signup", response_model=AdvocateResponse)
def signup_advocate(
    advocate_data: AdvocateCreate,
    db: Session = Depends(get_db)
):
    return advocate_service.create_advocate(db=db, **advocate_data.dict())