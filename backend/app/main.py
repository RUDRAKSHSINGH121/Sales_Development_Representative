import json
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload
from .config import settings
from .database import Base, engine, get_db
from .models import User, Lead, Qualification, GeneratedEmail
from .schemas import (
    LoginIn,
    UserRegister,
    UserOut,
    TokenOut,
    LeadCreate,
    LeadUpdate,
    LeadOut,
    LeadList,
    QualificationOut,
    GenerateEmailIn,
    EmailOut,
)
from .security import current_user, verify_password, hash_password, create_token
from .services import qualify, generate_email

app = FastAPI(
    title="LeadPilot API",
    description="Mini AI SDR Platform with OpenAI Lead Qualification and Google Gemini Email Generation",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def init():
    Base.metadata.create_all(bind=engine)

def lead_out(lead: Lead) -> dict:
    out = {c.name: getattr(lead, c.name) for c in Lead.__table__.columns if c.name != "owner_id"}
    if lead.qualification:
        q = lead.qualification
        try:
            signals = json.loads(q.signals)
        except Exception:
            signals = [q.signals]
        out["qualification"] = {
            "score": q.score,
            "status": q.status,
            "reasoning": q.reasoning,
            "signals": signals,
            "analyzed_at": q.analyzed_at,
        }
    return out

def owned_lead(lead_id: int, user: User, db: Session) -> Lead:
    lead = db.scalar(
        select(Lead)
        .options(joinedload(Lead.qualification))
        .where(Lead.id == lead_id, Lead.owner_id == user.id)
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

# ----------------- Authentication Routes -----------------

@app.post("/auth/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new SDR workspace user and return access token."""
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists")
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_token(user), "user": user}

@app.post("/auth/login", response_model=TokenOut, tags=["Authentication"])
def login(payload: LoginIn, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT token."""
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_token(user), "user": user}

@app.get("/auth/me", response_model=UserOut, tags=["Authentication"])
def me(user: User = Depends(current_user)):
    """Return the profile of the authenticated user."""
    return user

# ----------------- Lead Management Routes -----------------

@app.get("/leads", response_model=LeadList, tags=["Leads"])
def list_leads(
    search: str | None = None,
    industry: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """List leads owned by current user with optional search, industry, status filter and pagination."""
    q = select(Lead).options(joinedload(Lead.qualification)).where(Lead.owner_id == user.id)
    if search:
        term = f"%{search}%"
        q = q.where(
            or_(
                Lead.first_name.ilike(term),
                Lead.last_name.ilike(term),
                Lead.company.ilike(term),
                Lead.email.ilike(term),
            )
        )
    if industry:
        q = q.where(Lead.industry == industry)
    if status:
        q = q.join(Qualification).where(Qualification.status == status)
    
    total = db.scalar(select(func.count()).select_from(q.subquery())) or 0
    leads = (
        db.scalars(
            q.order_by(Lead.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .unique()
        .all()
    )
    return {"items": [lead_out(x) for x in leads], "total": total, "page": page, "page_size": page_size}

@app.post("/leads", response_model=LeadOut, status_code=status.HTTP_201_CREATED, tags=["Leads"])
def create_lead(payload: LeadCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Create a new prospect lead scoped to the authenticated user."""
    lead = Lead(**payload.model_dump(), owner_id=user.id)
    db.add(lead)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="A lead with this email already exists in your workspace")
    db.refresh(lead)
    return lead_out(lead)

@app.get("/leads/{lead_id}", response_model=LeadOut, tags=["Leads"])
def get_lead(lead_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Get lead details including latest qualification analysis."""
    return lead_out(owned_lead(lead_id, user, db))

@app.put("/leads/{lead_id}", response_model=LeadOut, tags=["Leads"])
def update_lead(lead_id: int, payload: LeadUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Update lead details."""
    lead = owned_lead(lead_id, user, db)
    for k, v in payload.model_dump().items():
        setattr(lead, k, v)
    db.commit()
    db.refresh(lead)
    return lead_out(lead)

@app.delete("/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Leads"])
def delete_lead(lead_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Delete a lead and cascade delete related qualification and email records."""
    lead = owned_lead(lead_id, user, db)
    db.delete(lead)
    db.commit()

# ----------------- AI Services: OpenAI Qualification -----------------

@app.post("/leads/{lead_id}/qualify", response_model=QualificationOut, tags=["AI Actions"])
def run_qualification(lead_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """
    Objective 4: OpenAI-based Lead Qualification.
    Runs structured ICP evaluation with OpenAI API (GPT-4o mini) and persists the score, status, reasoning, and signals.
    """
    lead = owned_lead(lead_id, user, db)
    try:
        result = qualify(lead)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"OpenAI qualification unavailable: {str(e)}")
    
    q = lead.qualification or Qualification(lead_id=lead.id, score=0, status="review", reasoning="", signals="[]")
    q.score = result["score"]
    q.status = result["status"]
    q.reasoning = result["reasoning"]
    q.signals = json.dumps(result["signals"])
    q.analyzed_at = datetime.utcnow()
    db.add(q)
    db.commit()
    db.refresh(q)
    return {**result, "analyzed_at": q.analyzed_at}

# ----------------- AI Services: Gemini Email Generation -----------------

@app.post("/leads/{lead_id}/generate-email", response_model=EmailOut, status_code=status.HTTP_201_CREATED, tags=["AI Actions"])
def create_email(lead_id: int, payload: GenerateEmailIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """
    Objective 5: Gemini-based Personalized Email Generation.
    Generates a personalized B2B outreach email draft using Google Gemini and saves it to history.
    """
    lead = owned_lead(lead_id, user, db)
    try:
        result = generate_email(lead, payload.purpose, payload.tone, payload.context)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Gemini email generation unavailable: {str(e)}")
    
    email = GeneratedEmail(
        lead_id=lead.id,
        subject=result["subject"],
        body=result["body"],
        purpose=payload.purpose,
        tone=payload.tone,
        status="generated",
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return {
        **{c.name: getattr(email, c.name) for c in GeneratedEmail.__table__.columns},
        "lead_name": f"{lead.first_name} {lead.last_name}",
    }

@app.get("/leads/{lead_id}/emails", response_model=list[EmailOut], tags=["Emails"])
def lead_emails(lead_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """List all emails generated for a specific lead."""
    lead = owned_lead(lead_id, user, db)
    rows = (
        db.scalars(
            select(GeneratedEmail)
            .where(GeneratedEmail.lead_id == lead.id)
            .order_by(GeneratedEmail.created_at.desc())
        )
        .all()
    )
    return [
        {**{c.name: getattr(e, c.name) for c in GeneratedEmail.__table__.columns}, "lead_name": f"{lead.first_name} {lead.last_name}"}
        for e in rows
    ]

@app.get("/emails", response_model=list[EmailOut], tags=["Emails"])
def all_emails(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """List all outreach emails generated across all leads owned by the current user."""
    rows = (
        db.execute(
            select(GeneratedEmail, Lead)
            .join(Lead)
            .where(Lead.owner_id == user.id)
            .order_by(GeneratedEmail.created_at.desc())
        )
        .all()
    )
    return [
        {**{c.name: getattr(e, c.name) for c in GeneratedEmail.__table__.columns}, "lead_name": f"{l.first_name} {l.last_name}"}
        for e, l in rows
    ]

# ----------------- Dashboard Analytics -----------------

@app.get("/dashboard", tags=["Dashboard"])
def get_dashboard(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Return aggregated SDR pipeline metrics, qualification breakdown, and recent leads."""
    leads = (
        db.scalars(
            select(Lead)
            .options(joinedload(Lead.qualification))
            .where(Lead.owner_id == user.id)
            .order_by(Lead.created_at.desc())
        )
        .unique()
        .all()
    )
    scores = [x.qualification.score for x in leads if x.qualification]
    statuses = {
        s: sum(1 for x in leads if x.qualification and x.qualification.status == s)
        for s in ("qualified", "review", "unqualified")
    }
    emails_count = (
        db.scalar(
            select(func.count())
            .select_from(GeneratedEmail)
            .join(Lead)
            .where(Lead.owner_id == user.id)
        )
        or 0
    )
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    return {
        "total_leads": len(leads),
        "qualified_leads": statuses["qualified"],
        "emails_generated": emails_count,
        "average_ai_score": avg_score,
        "status": statuses,
        "recent_leads": [lead_out(x) for x in leads[:5]],
    }
