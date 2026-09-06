import os
import json
from unittest.mock import patch
import pytest

# Ensure SQLite test database is used during testing
os.environ["DATABASE_URL"] = "sqlite:///./test_leadpilot.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-1234567890"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import User
from app.security import hash_password

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    if not db.query(User).filter_by(email="test@leadpilot.dev").first():
        db.add(
            User(
                name="Test User",
                email="test@leadpilot.dev",
                password_hash=hash_password("Password123!"),
            )
        )
        db.commit()
    db.close()
    yield

def get_client_and_auth():
    client = TestClient(app)
    res = client.post(
        "/auth/login",
        json={"email": "test@leadpilot.dev", "password": "Password123!"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return client, headers

def test_user_registration_and_login():
    client = TestClient(app)
    # 1. Register new user
    reg_payload = {
        "name": "New SDR",
        "email": "newsdr@leadpilot.dev",
        "password": "SecurePassword123!",
    }
    r = client.post("/auth/register", json=reg_payload)
    assert r.status_code in (201, 409)

    # 2. Login with registered user
    login_r = client.post(
        "/auth/login",
        json={"email": "newsdr@leadpilot.dev", "password": "SecurePassword123!"},
    )
    assert login_r.status_code == 200
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Fetch profile
    me_r = client.get("/auth/me", headers=headers)
    assert me_r.status_code == 200
    assert me_r.json()["email"] == "newsdr@leadpilot.dev"

def test_unauthorized_access():
    client = TestClient(app)
    assert client.get("/leads").status_code in (401, 403)
    assert client.get("/dashboard").status_code in (401, 403)

def test_lead_crud():
    client, headers = get_client_and_auth()
    lead_data = {
        "first_name": "Test",
        "last_name": "Prospect",
        "email": "test.prospect@cloudcorp.io",
        "company": "CloudCorp Systems",
        "job_title": "CTO",
        "industry": "SaaS",
        "company_size": "51 - 200",
        "notes": "Testing CRUD cycle",
    }

    # Create lead
    create_res = client.post("/leads", headers=headers, json=lead_data)
    assert create_res.status_code in (201, 409)

    # List leads
    list_res = client.get("/leads", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    lead = next(x for x in items if x["email"] == lead_data["email"])
    lead_id = lead["id"]

    # Get single lead
    get_res = client.get(f"/leads/{lead_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["company"] == "CloudCorp Systems"

    # Update lead
    lead_data["job_title"] = "Chief Technology Officer"
    update_res = client.put(f"/leads/{lead_id}", headers=headers, json=lead_data)
    assert update_res.status_code == 200
    assert update_res.json()["job_title"] == "Chief Technology Officer"

    # Delete lead
    del_res = client.delete(f"/leads/{lead_id}", headers=headers)
    assert del_res.status_code == 204

def test_openai_qualification_route():
    client, headers = get_client_and_auth()
    lead_data = {
        "first_name": "Samantha",
        "last_name": "Fox",
        "email": "samantha@datasync.ai",
        "company": "DataSync AI",
        "job_title": "VP Marketing",
        "industry": "Fintech",
        "company_size": "51 - 200",
        "notes": "Inquiring about automated email pipeline",
    }
    r = client.post("/leads", headers=headers, json=lead_data)
    assert r.status_code in (201, 409)
    items = client.get("/leads", headers=headers).json()["items"]
    lead = next(x for x in items if x["email"] == lead_data["email"])

    mock_openai_response = json.dumps({
        "score": 90,
        "status": "qualified",
        "reasoning": "VP Marketing at mid-sized Fintech AI company demonstrates strong ICP fit and decision authority.",
        "signals": [
            "Executive leadership role (VP Marketing)",
            "Target Fintech vertical",
            "Mid-sized company size (51-200)",
        ],
    })

    with patch("app.services._generate_with_openai", return_value=mock_openai_response):
        q_res = client.post(f"/leads/{lead['id']}/qualify", headers=headers)
        assert q_res.status_code == 200
        data = q_res.json()
        assert data["score"] == 90
        assert data["status"] == "qualified"
        assert "VP Marketing" in data["reasoning"]
        assert len(data["signals"]) >= 2

    # Clean up
    client.delete(f"/leads/{lead['id']}", headers=headers)

def test_gemini_email_generation_route():
    client, headers = get_client_and_auth()
    lead_data = {
        "first_name": "Arthur",
        "last_name": "Dent",
        "email": "arthur@galacticcorp.co",
        "company": "Galactic Corp",
        "job_title": "Head of Operations",
        "industry": "Logistics",
        "company_size": "201 - 500",
    }
    client.post("/leads", headers=headers, json=lead_data)
    items = client.get("/leads", headers=headers).json()["items"]
    lead = next(x for x in items if x["email"] == lead_data["email"])

    mock_gemini_response = json.dumps({
        "subject": "Streamlining Operations at Galactic Corp",
        "body": "Hi Arthur,\n\nI noticed Galactic Corp's expanding logistics operations. With your focus as Head of Operations, automating workflow qualification could save substantial manual hours.\n\nBest,\nSDR Team",
    })

    with patch("app.services._generate_with_gemini", return_value=mock_gemini_response):
        gen_res = client.post(
            f"/leads/{lead['id']}/generate-email",
            headers=headers,
            json={"purpose": "Outreach", "tone": "Professional"},
        )
        assert gen_res.status_code == 201
        data = gen_res.json()
        assert data["subject"] == "Streamlining Operations at Galactic Corp"
        assert "Hi Arthur" in data["body"]

    # Verify email appears in lead emails and all emails
    lead_emails = client.get(f"/leads/{lead['id']}/emails", headers=headers).json()
    assert len(lead_emails) >= 1

    all_emails = client.get("/emails", headers=headers).json()
    assert len(all_emails) >= 1

    # Clean up
    client.delete(f"/leads/{lead['id']}", headers=headers)

def test_dashboard_metrics():
    client, headers = get_client_and_auth()
    dash_res = client.get("/dashboard", headers=headers)
    assert dash_res.status_code == 200
    d = dash_res.json()
    assert "total_leads" in d
    assert "qualified_leads" in d
    assert "emails_generated" in d
    assert "average_ai_score" in d
    assert "status" in d
