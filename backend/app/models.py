from __future__ import annotations

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    leads: Mapped[list[Lead]] = relationship(back_populates="owner", cascade="all, delete-orphan")

class Lead(Base):
    __tablename__ = "leads"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    first_name: Mapped[str] = mapped_column(String(80)); last_name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), index=True)
    company: Mapped[str] = mapped_column(String(160)); job_title: Mapped[Optional[str]] = mapped_column(String(160))
    industry: Mapped[Optional[str]] = mapped_column(String(100)); company_size: Mapped[Optional[str]] = mapped_column(String(50))
    website: Mapped[Optional[str]] = mapped_column(String(255)); location: Mapped[Optional[str]] = mapped_column(String(120))
    notes: Mapped[Optional[str]] = mapped_column(Text); created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    owner: Mapped[User] = relationship(back_populates="leads")
    qualification: Mapped[Optional[Qualification]] = relationship(back_populates="lead", cascade="all, delete-orphan", uselist=False)
    emails: Mapped[list[GeneratedEmail]] = relationship(back_populates="lead", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("owner_id", "email", name="uq_owner_lead_email"),)

class Qualification(Base):
    __tablename__ = "lead_qualifications"
    id: Mapped[int] = mapped_column(primary_key=True); lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), unique=True)
    score: Mapped[int] = mapped_column(Integer); status: Mapped[str] = mapped_column(String(20)); reasoning: Mapped[str] = mapped_column(Text)
    signals: Mapped[str] = mapped_column(Text, default="[]"); analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    lead: Mapped[Lead] = relationship(back_populates="qualification")

class GeneratedEmail(Base):
    __tablename__ = "generated_emails"
    id: Mapped[int] = mapped_column(primary_key=True); lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), index=True)
    subject: Mapped[str] = mapped_column(String(255)); body: Mapped[str] = mapped_column(Text); purpose: Mapped[str] = mapped_column(String(50)); tone: Mapped[str] = mapped_column(String(50)); status: Mapped[str] = mapped_column(String(20), default="generated")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    lead: Mapped[Lead] = relationship(back_populates="emails")
