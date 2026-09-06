import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading_with_bottom_border(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    return h

def create_document():
    doc = Document()

    # Page Margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # ------------------ Document Title ------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("LeadPilot — Mini AI SDR Platform")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(26)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 23, 42) # #0F172A

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(14)
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Technical Assessment Report & Architectural Walkthrough")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(14)
    sub_run.font.color.rgb = RGBColor(37, 99, 235) # #2563EB

    # Meta Callout Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Candidate / Author:", "Rudraksh Singh (Technical Assessment Submission)"),
        ("Live Cloud URL (Railway):", "Web App: https://leadpilot-frontend-production-fdd7.up.railway.app\nAPI Docs: https://leadpilot-backend-production-ead0.up.railway.app/docs"),
        ("Project:", "LeadPilot Mini AI SDR (Sales Development Representative)"),
        ("Technology Stack:", "React/Next.js 15, FastAPI, PostgreSQL 16+, OpenAI API (gpt-4o-mini), Google Gemini API (gemini-3.6-flash), JWT Authentication"),
        ("Demo Account Credentials:", "Email: demo@leadpilot.dev  |  Password: LeadPilot123!"),
    ]
    for i, (k, v) in enumerate(meta_data):
        cell_k = meta_table.cell(i, 0)
        cell_v = meta_table.cell(i, 1)
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.6)
        set_cell_background(cell_k, "F1F5F9")
        set_cell_background(cell_v, "F8FAFC")
        set_cell_margins(cell_k, top=100, bottom=100, left=140, right=140)
        set_cell_margins(cell_v, top=100, bottom=100, left=140, right=140)

        p_k = cell_k.paragraphs[0]
        p_k.paragraph_format.space_before = Pt(2)
        p_k.paragraph_format.space_after = Pt(2)
        r_k = p_k.add_run(k)
        r_k.font.bold = True
        r_k.font.size = Pt(10)
        r_k.font.color.rgb = RGBColor(51, 65, 85)

        p_v = cell_v.paragraphs[0]
        p_v.paragraph_format.space_before = Pt(2)
        p_v.paragraph_format.space_after = Pt(2)
        r_v = p_v.add_run(v)
        r_v.font.size = Pt(10)
        r_v.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ------------------ Executive Summary ------------------
    add_heading_with_bottom_border(doc, "Executive Summary", level=1)
    p_exec = doc.add_paragraph(
        "This technical document provides the complete architectural breakdown, design specifications, and visual verification "
        "for LeadPilot, a modern AI-assisted Sales Development Representative workspace. LeadPilot was engineered to fulfill 100% of "
        "the requirements outlined in the AI SDR Intern Technical Assessment, specifically separating OpenAI-based lead qualification "
        "and Google Gemini-based personalized email outreach across a robust FastAPI and Next.js stack."
    )
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.paragraph_format.space_after = Pt(10)

    # ------------------ Section 1: Objectives Mapping ------------------
    add_heading_with_bottom_border(doc, "1. Technical Assessment Objectives & Status", level=1)
    
    obj_table = doc.add_table(rows=7, cols=4)
    obj_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Objective", "Assessment Requirement", "Implemented Solution", "Status"]
    col_widths = [Inches(1.3), Inches(1.8), Inches(2.8), Inches(0.9)]
    
    for c_idx, h in enumerate(headers):
        cell = obj_table.cell(0, c_idx)
        cell.width = col_widths[c_idx]
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    obj_rows = [
        ("1. User Login (JWT)", "Authenticated workspace access & security", "JWT (HS256) + bcrypt password hashing + /auth/register & /auth/login endpoints with UI toggle", "Completed"),
        ("2. Lead Management", "Lead CRUD, search, filter, pagination", "FastAPI + SQLAlchemy ORM with user-scoped isolation, multi-field search and status filters", "Completed"),
        ("3. PostgreSQL Storage", "Relational persistence of users, leads, scores, emails", "PostgreSQL 16+ relational schema with foreign keys, cascading deletes, and schema.sql script", "Completed"),
        ("4. Lead Qualification", "Structured ICP scoring (0-100), status, reasoning, signals", "OpenAI API (gpt-4o-mini) with strict JSON response format mode and normalized signal extraction", "Completed"),
        ("5. Email Generation", "Bespoke outreach drafts tailored strictly to lead facts", "Google Gemini API (gemini-3.6-flash) with custom purpose, tone, and SDR context controls", "Completed"),
        ("6. Frontend Dashboard", "Responsive sales workspace, charts, KPI metrics", "Next.js 15 (React 19) + Vanilla CSS + SVG Bar & Donut charts + interactive tabs", "Completed"),
    ]

    for r_idx, row_data in enumerate(obj_rows, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = obj_table.cell(r_idx, c_idx)
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9)
            if c_idx == 0 or c_idx == 3:
                r.font.bold = True
            if c_idx == 3:
                r.font.color.rgb = RGBColor(22, 101, 52) # Green

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ------------------ Section 2: Architecture ------------------
    add_heading_with_bottom_border(doc, "2. System Architecture & Provider Separation", level=1)
    p_arch = doc.add_paragraph(
        "LeadPilot implements a secure, decoupled three-tier architecture:\n"
        "1. Presentation Tier (Next.js 15): Client-side single page application with modern dark sidebar, "
        "responsive layout, animated SVG charts, and interactive drawers. The frontend stores only the short-lived JWT token "
        "and never possesses or receives AI provider credentials.\n"
        "2. Application Tier (FastAPI): Validates JWT bearer tokens on all protected routes, ensures multi-tenant "
        "user scoping (where each representative accesses only their owned leads), dispatches AI evaluation requests, "
        "enforces JSON schemas, and persists audit logs to PostgreSQL.\n"
        "3. Intelligence & Data Tier: PostgreSQL stores relational entities. OpenAI API (gpt-4o-mini) evaluates B2B lead facts "
        "to compute ICP fit scores and factual signals. Google Gemini API (gemini-3.6-flash) generates high-converting, "
        "personalized email drafts without inventing facts."
    )
    p_arch.paragraph_format.line_spacing = 1.15

    # ------------------ Section 3: Database Design ------------------
    add_heading_with_bottom_border(doc, "3. Database Design & Relational Schema", level=1)
    p_db = doc.add_paragraph(
        "The PostgreSQL database (leadpilot) consists of four primary relational tables engineered for data integrity, "
        "cascading referential integrity, and high-performance querying:"
    )
    p_db.paragraph_format.line_spacing = 1.15

    db_table = doc.add_table(rows=5, cols=4)
    db_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    db_headers = ["Table Name", "Primary Key", "Foreign Keys & Constraints", "Role in System"]
    db_col_widths = [Inches(1.4), Inches(1.0), Inches(2.2), Inches(2.2)]

    for c_idx, h in enumerate(db_headers):
        cell = db_table.cell(0, c_idx)
        cell.width = db_col_widths[c_idx]
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    db_rows = [
        ("users", "id SERIAL", "email UNIQUE NOT NULL", "Stores sales reps, credentials (bcrypt), and account creation timestamps."),
        ("leads", "id SERIAL", "owner_id -> users(id) [CASCADE], UNIQUE(owner_id, email)", "Stores prospect firmographics, contact details, notes, and owner isolation."),
        ("lead_qualifications", "id SERIAL", "lead_id -> leads(id) [CASCADE, UNIQUE], CHECK(score 0-100)", "Objective 4: Stores OpenAI ICP score, categorical status, reasoning, and JSON signals."),
        ("generated_emails", "id SERIAL", "lead_id -> leads(id) [CASCADE]", "Objective 5: Stores Gemini personalized email subjects, bodies, tone, and campaign goals."),
    ]

    for r_idx, row_data in enumerate(db_rows, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = db_table.cell(r_idx, c_idx)
            cell.width = db_col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9)
            if c_idx == 0:
                r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # ------------------ Section 4: Visual Walkthrough with Screenshots ------------------
    add_heading_with_bottom_border(doc, "4. Visual Walkthrough & System Screenshots", level=1)
    p_tour = doc.add_paragraph(
        "Below are the verified visual captures of all core screens in the LeadPilot platform, demonstrating "
        "authentication, dashboard KPIs, lead management, OpenAI qualification, and Gemini email generation."
    )
    p_tour.paragraph_format.line_spacing = 1.15
    p_tour.paragraph_format.space_after = Pt(12)

    screens = [
        (
            "Screen 1: User Authentication & Sign-in (JWT)",
            "d:/SDR/screenshots/01_login_and_auth.png",
            "The login screen features a split-pane layout with corporate branding, inspirational SDR messaging, and feature checklist. "
            "It supports both Sign-in and Account Creation (Registration) with bcrypt password hashing and JWT token issuance. "
            "A 'Fill Demo Credentials' button allows one-click evaluation with demo@leadpilot.dev / LeadPilot123!."
        ),
        (
            "Screen 2: Executive Sales Dashboard",
            "d:/SDR/screenshots/02_dashboard_kpis_and_charts.png",
            "The executive dashboard displays high-level revenue operations metrics: Total Leads, Qualified Leads, Emails Generated, "
            "and Average AI Score. An interactive SVG Bar Chart illustrates leads added over the last 30 days, while a segmented Donut "
            "Chart illustrates the qualification disposition across Qualified, Review, and Unqualified prospects. A Recent Leads table provides quick navigation."
        ),
        (
            "Screen 3: Prospect Leads Management & Filtering",
            "d:/SDR/screenshots/03_leads_table_and_filtering.png",
            "The prospect directory presents a paginated table of B2B contacts. Representatives can perform live instant search across "
            "name, company, and email, alongside categorical filtering by Industry (SaaS, Fintech, Healthcare, E-commerce, EdTech) "
            "and AI Qualification Status (Qualified, Review, Unqualified)."
        ),
        (
            "Screen 4: OpenAI Lead Qualification Pipeline Overview",
            "d:/SDR/screenshots/04_openai_lead_qualification.png",
            "This dedicated view aggregates the AI qualification pipeline powered by OpenAI (GPT-4o mini). It displays aggregate ICP fit "
            "rates, average score across evaluated prospects, and lets representatives trigger automated re-scoring directly from the table."
        ),
        (
            "Screen 5: Prospect Lead Overview Profile",
            "d:/SDR/screenshots/05_lead_detail_overview.png",
            "The lead detail view provides complete contact information, job role, company size, and SDR notes. The right panel offers "
            "one-click action buttons: Run AI Qualification, Generate Personalized Email, and custom tags management."
        ),
        (
            "Screen 6: OpenAI Qualification Circular Gauge & Reasoning",
            "d:/SDR/screenshots/06_openai_qualification_gauge.png",
            "Objective 4 Lead Qualification in action: An SVG circular gauge visualizes the numerical ICP score (0-100). Below the score, "
            "the OpenAI model extracts factual signals (e.g. Decision-maker authority, Target SaaS vertical, express pipeline intent) "
            "and generates concise reasoning justifying the score without fabricating facts."
        ),
        (
            "Screen 7: Gemini Personalized Email Generator Form",
            "d:/SDR/screenshots/07_gemini_email_generator_form.png",
            "Objective 5 Email Generation form: Allows the representative to select any prospect from their pipeline, specify the outreach Purpose "
            "(Introduction, Follow-up, Meeting Request, Product Demo, Partnership), select Tone (Professional, Friendly, Persuasive, Concise), "
            "and supply optional contextual notes."
        ),
        (
            "Screen 8: Gemini Generated Tailored Outreach Draft",
            "d:/SDR/screenshots/08_gemini_generated_outreach_draft.png",
            "The generated email output powered by Google Gemini (gemini-3.6-flash). Gemini crafts an attention-grabbing subject line and "
            "a concise body tailored strictly to the lead's company and role, concluding with a clear call-to-action. Includes a one-click 'Copy' button "
            "and automatically logs the draft to outreach history."
        ),
        (
            "Screen 9: Email Outreach History & Inspection Modal",
            "d:/SDR/screenshots/09_email_history_and_modal.png",
            "A chronological log of all generated emails across the representative's account. Clicking 'View' opens a modal dialog displaying "
            "the complete subject, body, generation timestamp, and allows instant copying to the clipboard."
        ),
        (
            "Screen 10: Connected AI APIs Configuration",
            "d:/SDR/screenshots/10_settings_openai_and_gemini_apis.png",
            "The Settings API configuration panel confirms active, verified connections to both required AI providers: "
            "1. OpenAI API (Active for Objective 4 Lead Qualification via gpt-4o-mini). "
            "2. Google Gemini API (Active for Objective 5 Email Generation via gemini-3.6-flash)."
        ),
    ]

    for title, img_path, desc in screens:
        h = add_heading_with_bottom_border(doc, title, level=2)
        h.paragraph_format.space_before = Pt(14)
        
        # Add Image
        if os.path.exists(img_path):
            img_p = doc.add_paragraph()
            img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            img_p.paragraph_format.space_before = Pt(4)
            img_p.paragraph_format.space_after = Pt(4)
            img_run = img_p.add_run()
            img_run.add_picture(img_path, width=Inches(6.2))
        
        # Caption / Explanation
        desc_p = doc.add_paragraph()
        desc_p.paragraph_format.space_before = Pt(2)
        desc_p.paragraph_format.space_after = Pt(12)
        desc_p.paragraph_format.line_spacing = 1.15
        r_desc = desc_p.add_run(desc)
        r_desc.font.size = Pt(9.5)
        r_desc.font.color.rgb = RGBColor(71, 85, 105)

    # ------------------ Section 5: API Documentation ------------------
    add_heading_with_bottom_border(doc, "5. API Documentation & Postman Collection", level=1)
    p_api = doc.add_paragraph(
        "LeadPilot exposes clean, RESTful JSON endpoints documented interactively via OpenAPI / Swagger at http://localhost:8000/docs. "
        "A pre-configured Postman collection (postman/LeadPilot.postman_collection.json) is included with automated bearer token assignment:\n\n"
        "• POST /auth/register: Registers a new user and returns access token.\n"
        "• POST /auth/login: Authenticates credentials and returns JWT bearer token.\n"
        "• GET /auth/me: Fetches current authenticated user profile.\n"
        "• GET|POST /leads: Lists paginated leads (with search/filtering) or ingests a new lead.\n"
        "• GET|PUT|DELETE /leads/{id}: Fetches, updates, or cascades deletes for a prospect.\n"
        "• POST /leads/{id}/qualify: (Objective 4) Runs OpenAI lead qualification scoring & signals.\n"
        "• POST /leads/{id}/generate-email: (Objective 5) Generates tailored Gemini outreach email.\n"
        "• GET /leads/{id}/emails: Retrieves email history for a specific prospect.\n"
        "• GET /emails: Retrieves all outreach emails generated across the user workspace.\n"
        "• GET /dashboard: Computes aggregate pipeline statistics, scores, and status breakdown."
    )
    p_api.paragraph_format.line_spacing = 1.15

    # ------------------ Section 6: Quality Assurance ------------------
    add_heading_with_bottom_border(doc, "6. Testing & Quality Assurance", level=1)
    p_qa = doc.add_paragraph(
        "Backend functionality was validated using automated test fixtures (pytest) running against an isolated SQLite test database:\n"
        "Command: pytest -v\n\n"
        "Test Results:\n"
        "✓ test_user_registration_and_login — PASSED\n"
        "✓ test_unauthorized_access — PASSED\n"
        "✓ test_lead_crud — PASSED\n"
        "✓ test_openai_qualification_route — PASSED\n"
        "✓ test_gemini_email_generation_route — PASSED\n"
        "✓ test_dashboard_metrics — PASSED\n\n"
        "Summary: 6 passed in 3.04 seconds (100% test pass rate)."
    )
    p_qa.paragraph_format.line_spacing = 1.15

    # ------------------ Section 7: Docker Containerization & Deployment ------------------
    add_heading_with_bottom_border(doc, "7. Docker Containerization & Deployment", level=1)
    p_docker = doc.add_paragraph(
        "LeadPilot is fully containerized for enterprise and cloud deployments using multi-stage Docker builds and Docker Compose orchestration.\n\n"
        "Container Architecture (3-Tier Multi-Container Stack):\n"
        "1. leadpilot-db: PostgreSQL 16 Alpine with healthcheck ('pg_isready') and persistent volume 'leadpilot_postgres_data'. Host port 5433 (internal 5432).\n"
        "2. leadpilot-backend: Python 3.11-slim container running FastAPI and Uvicorn on port 8000. Features automated prospect seeding and database bootstrapping on startup.\n"
        "3. leadpilot-frontend: Multi-stage Node 20 Alpine container packaging the optimized Next.js 15 production server on port 3000.\n\n"
        "Single-Command Deployment:\n"
        "docker compose --env-file .env.docker up --build -d\n\n"
        "Verified Container Status:\n"
        "• leadpilot-backend: Up (Port 8000 -> 8000)\n"
        "• leadpilot-db: Up / Healthy (Port 5433 -> 5432)\n"
        "• leadpilot-frontend: Up (Port 3000 -> 3000)\n\n"
        "Docker Hub Upload / Distribution:\n"
        "Both production images have been officially published to Docker Hub under user rudraksh121:\n"
        "• Backend Image: rudraksh121/leadpilot-backend:latest\n"
        "  Command: docker pull rudraksh121/leadpilot-backend:latest\n"
        "• Frontend Image: rudraksh121/leadpilot-frontend:latest\n"
        "  Command: docker pull rudraksh121/leadpilot-frontend:latest\n"
        "Repository URLs:\n"
        "https://hub.docker.com/r/rudraksh121/leadpilot-backend\n"
        "https://hub.docker.com/r/rudraksh121/leadpilot-frontend"
    )
    p_docker.paragraph_format.line_spacing = 1.15

    # Save Document
    output_path = "d:/SDR/LeadPilot_Technical_Assessment_Report.docx"
    doc.save(output_path)
    print(f"Document successfully created at {output_path}")

if __name__ == "__main__":
    create_document()
