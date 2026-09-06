from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LeadBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    company: str = Field(min_length=1, max_length=160)
    job_title: str | None = None
    industry: str | None = None
    company_size: str | None = None
    website: str | None = None
    location: str | None = None
    notes: str | None = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(LeadBase):
    pass

class QualificationOut(BaseModel):
    score: int
    status: str
    reasoning: str
    signals: list[str]
    analyzed_at: datetime

class LeadOut(LeadBase):
    id: int
    created_at: datetime
    qualification: QualificationOut | None = None

class LeadList(BaseModel):
    items: list[LeadOut]
    total: int
    page: int
    page_size: int

class GenerateEmailIn(BaseModel):
    purpose: str = "Outreach"
    tone: str = "Professional"
    context: str | None = None

class EmailOut(BaseModel):
    id: int
    lead_id: int
    subject: str
    body: str
    purpose: str
    tone: str
    status: str
    created_at: datetime
    lead_name: str | None = None
