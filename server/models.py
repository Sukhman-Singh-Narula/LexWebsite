# models.py
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import Optional, Dict, List
from datetime import datetime
import enum
import uuid

Base = declarative_base()

# Database Models
class TimestampMixin:
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

class Advocate(Base, TimestampMixin):
    __tablename__ = 'advocates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    bar_number = Column(String, unique=True, nullable=False)
    license_state = Column(String, nullable=False)
    firm_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    cases = relationship("Case", back_populates="advocate")

# Pydantic models for Advocate API
class AdvocateBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    bar_number: str
    license_state: str
    firm_name: Optional[str] = None

class AdvocateCreate(AdvocateBase):
    password: str

class AdvocateUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    firm_name: Optional[str] = None
    license_state: Optional[str] = None

class AdvocateResponse(AdvocateBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class Client(Base, TimestampMixin):
    __tablename__ = 'clients'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(JSONB)
    company_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    cases = relationship("Case", back_populates="client")

# Pydantic models for Client API
class ClientBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[Dict] = None
    company_name: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict] = None
    company_name: Optional[str] = None

class ClientResponse(ClientBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class CaseStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PENDING = "pending"
    CLOSED = "closed"

class Case(Base, TimestampMixin):
    __tablename__ = 'cases'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advocate_id = Column(UUID(as_uuid=True), ForeignKey('advocates.id'), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    
    cnr = Column(String(100))
    court_case_title = Column(String(255))
    court_case_type = Column(String(100))
    filing_number = Column(String(100))
    registration_number = Column(String(100))
    court_status = Column(JSONB, default={})
    parties_details = Column(JSONB, default={})
    acts_sections = Column(JSONB, default={})
    fir_details = Column(JSONB, default={})
    court_history = Column(JSONB, default=[])
    # Change 'metadata' to 'case_metadata' or another descriptive name
    case_metadata = Column(JSONB, default={})  # Renamed from 'metadata'
    
    # Relationships
    advocate = relationship("Advocate", back_populates="cases")
    client = relationship("Client", back_populates="cases")
    documents = relationship("Document", back_populates="case")

# Pydantic models for Case API
class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    case_number: str
    filing_date: Optional[datetime] = None
    case_metadata: Optional[Dict] = Field(default_factory=dict)  # Changed from metadata
    cnr: Optional[str] = None
    court_case_title: Optional[str] = None
    court_case_type: Optional[str] = None
    filing_number: Optional[str] = None
    registration_number: Optional[str] = None
    court_status: Optional[Dict] = Field(default_factory=dict)
    parties_details: Optional[Dict] = Field(default_factory=dict)
    acts_sections: Optional[Dict] = Field(default_factory=dict)
    fir_details: Optional[Dict] = Field(default_factory=dict)
    court_history: Optional[List] = Field(default_factory=list)
    
class CaseCreate(CaseBase):
    client_id: UUID4

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    case_metadata: Optional[Dict] = None  # Changed from metadata

class CaseResponse(CaseBase):
    id: UUID4
    advocate_id: UUID4
    client_id: UUID4
    status: CaseStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentType(enum.Enum):
    PLEADING = "pleading"
    CONTRACT = "contract"
    EVIDENCE = "evidence"
    CORRESPONDENCE = "correspondence"
    OTHER = "other"

class DocumentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"

class Document(Base, TimestampMixin):
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey('cases.id'), nullable=False)
    title = Column(String, nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    description = Column(Text)
    s3_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    paperless_id = Column(Integer, unique=True)
    document_metadata = Column(JSONB, default={})
    
    case = relationship("Case", back_populates="documents")

# Pydantic models for Document API
class DocumentBase(BaseModel):
    title: str
    document_type: DocumentType
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    case_id: UUID4

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict] = None

class DocumentResponse(DocumentBase):
    id: UUID4
    case_id: UUID4
    status: DocumentStatus
    original_filename: str
    file_size: Optional[int]
    mime_type: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True