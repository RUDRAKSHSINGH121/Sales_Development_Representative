# LeadPilot - Mini AI SDR Platform

LeadPilot is a high-performance, AI-assisted Sales Development Representative (SDR) workspace built for modern revenue teams. It manages sales prospects, scores lead qualification fit using **OpenAI (GPT-4o mini)**, and generates bespoke outreach drafts using **Google Gemini**.

Developed as the technical deliverable for the **AI SDR Intern Technical Assessment**.

> [!TIP]
> **Demo Account for Immediate Use**:
> - **Username / Email**: `demo@leadpilot.dev`
> - **Password**: `LeadPilot123!`

---

## Technical Assessment Requirements & Objectives

| Objective | Requirement | Implemented Solution | Status |
| :--- | :--- | :--- | :---: |
| **1. User Login (JWT)** | Authenticated access & password security | JWT (HS256) + bcrypt password hashing + `/auth/register` & `/auth/login`<br/>**Credentials:** `demo@leadpilot.dev` / `LeadPilot123!` | **Complete** |
| **2. Lead Management** | Full CRUD, search, filter, pagination, ownership boundaries | FastAPI + SQLAlchemy ORM with user-scoped isolation | **Complete** |
| **3. PostgreSQL Storage** | Relational persistence of users, leads, scores, and emails | PostgreSQL 16+ with standalone `scripts/schema.sql` and foreign keys | **Complete** |
| **4. Lead Qualification** | Structured ICP scoring (0-100), status, reasoning, and signals | **OpenAI API (`gpt-4o-mini`)** with strict JSON output | **Complete** |
| **5. Email Generation** | Tailored outreach drafts strictly reflecting lead facts | **Google Gemini API (`gemini-3.6-flash`)** with tone and purpose controls | **Complete** |
| **6. Frontend Dashboard** | Responsive sales workspace, charts, KPI metrics | Next.js 15 (React 19) + Vanilla CSS + Lucide Icons | **Complete** |

---

## Mandatory Deliverables Checklist

- [x] **Source Code**: Clean, modular, fully typed Python FastAPI backend and Next.js frontend.
- [x] **Database Scripts**: Standalone PostgreSQL DDL schema with constraints, indexes, and seed data in [`database/schema.sql`](database/schema.sql) and documented in [`DATABASE.md`](DATABASE.md).
- [x] **Postman Collection**: Fully organized v2.1.0 collection with auto-setting bearer tokens in `postman/LeadPilot.postman_collection.json`.
- [x] **Setup Instructions**: Dedicated standalone guide in [`SETUP.md`](SETUP.md) and detailed in [Setup & Running Locally](#setup--running-locally).
- [x] **Screenshots**: High-resolution screen captures in `screenshots/` covering all key workflows.
- [x] **Word Documentation (.docx)**: Complete visual walkthrough and technical evaluation report in [`LeadPilot_Technical_Assessment_Report.docx`](LeadPilot_Technical_Assessment_Report.docx).
- [x] **GitHub Repository**: [`RUDRAKSHSINGH121/Sales_Development_Representative`](https://github.com/RUDRAKSHSINGH121/Sales_Development_Representative).

---

## Architecture & AI Provider Separation

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js 15)"]
        UI["Modern Sales Workspace UI<br/>(Dashboard, Leads, AI Qualification, Email Generator)"]
    end

    subgraph Server ["Backend (FastAPI)"]
        API["FastAPI App (JWT Security & Scoped CRUD)"]
        OAI_SVC["OpenAI Service<br/>(Lead Qualification)"]
        GEM_SVC["Google Gemini Service<br/>(Email Generation)"]
    end

    subgraph Data ["Data & AI Providers"]
        PG[("PostgreSQL 16+<br/>Users, Leads, Qualifications, Emails")]
        OAI["OpenAI API<br/>(gpt-4o-mini)"]
        GEM["Google Gemini API<br/>(gemini-3.6-flash)"]
    end

    UI -->|"Bearer JWT + REST"| API
    API -->|"SQLAlchemy ORM"| PG
    API -->|"Prompt + Lead Context"| OAI_SVC
    API -->|"Prompt + Lead Context"| GEM_SVC
    OAI_SVC -->|"Structured JSON Score & Signals"| OAI
    GEM_SVC -->|"Personalized Subject & Body"| GEM
```

> [!IMPORTANT]
> **Provider Isolation & Security**: The frontend never receives third-party AI credentials. FastAPI validates JWTs server-side, verifies lead ownership boundaries, invokes the designated AI engine, validates JSON structure, and persists results to PostgreSQL before responding.

---

## Database Design & Relational Schema

```mermaid
erDiagram
    USERS ||--o{ LEADS : "owns"
    LEADS ||--o| LEAD_QUALIFICATIONS : "evaluates"
    LEADS ||--o{ GENERATED_EMAILS : "receives"

    USERS {
        int id PK
        string email UK
        string name
        string password_hash
        timestamp created_at
    }

    LEADS {
        int id PK
        int owner_id FK
        string first_name
        string last_name
        string email
        string company
        string job_title
        string industry
        string company_size
        string website
        string location
        text notes
        timestamp created_at
    }

    LEAD_QUALIFICATIONS {
        int id PK
        int lead_id FK,UK
        int score
        string status
        text reasoning
        text signals
        timestamp analyzed_at
    }

    GENERATED_EMAILS {
        int id PK
        int lead_id FK
        string subject
        text body
        string purpose
        string tone
        string status
        timestamp created_at
    }
```

The database script is located at [`backend/scripts/schema.sql`](backend/scripts/schema.sql). It defines all tables, cascading foreign keys, unique compound constraints (`uq_owner_lead_email`), and performance indexes.

---

## Prerequisites

- **Node.js**: v20+
- **Python**: v3.11+
- **PostgreSQL**: v16+ (running locally on port 5432 or via Docker)
- **OpenAI API Key**: For Objective 4 Lead Qualification
- **Google Gemini API Key**: For Objective 5 Email Outreach Generation

---

## Setup & Deployment

### 🐳 Quick Deploy with Docker (Recommended)

LeadPilot is completely containerized. You can build and run the entire multi-tier stack with one command:

```bash
# Launch PostgreSQL 16, FastAPI backend, and Next.js frontend
docker compose --env-file .env.docker up --build -d
```

- **Frontend**: Accessible at `http://localhost:3000` (Demo user: `demo@leadpilot.dev` / `LeadPilot123!`)
- **Backend API**: Accessible at `http://localhost:8000` (Swagger UI: `/docs`, ReDoc: `/redoc`)
- **PostgreSQL**: Accessible at `localhost:5433` (internal Docker `db:5432`, db: `leadpilot`)

To monitor logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down
```

#### Published Docker Hub Images:
- **Backend**: `docker pull rudraksh121/leadpilot-backend:latest`
- **Frontend**: `docker pull rudraksh121/leadpilot-frontend:latest`

---

### 💻 Running Locally without Docker

#### 1. Database Startup (PostgreSQL)

You can run PostgreSQL either locally or via Docker:

- **Option A (Docker)**:
  ```bash
  docker compose up -d db
  ```
- **Option B (Local PostgreSQL service)**:
  Ensure PostgreSQL is running on port `5432` with database `leadpilot`, or run [`backend/scripts/schema.sql`](backend/scripts/schema.sql).

#### 2. Environment Configuration

Create `.env` in the `backend/` directory (or copy `.env.example`):

```env
DATABASE_URL=postgresql+psycopg://leadpilot:leadpilot@localhost:5432/leadpilot
JWT_SECRET_KEY=your-secure-random-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://aicredits.in/v1   # Optional custom proxy endpoint
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:3000
```

### 3. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations / seed data
python -m scripts.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Interactive OpenAPI Swagger docs will be live at `http://localhost:8000/docs`.

### 4. Frontend Setup (Next.js)

```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

**Demo Credentials**:
- **Email**: `demo@leadpilot.dev`
- **Password**: `LeadPilot123!`
*(Or click "Sign up" on the login page to create a new user)*

---

## API Reference & Postman Collection

Import the included Postman collection: [`postman/LeadPilot.postman_collection.json`](postman/LeadPilot.postman_collection.json).

### Core Endpoints

| Method | Route | Description | AI Engine |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register a new user | — |
| `POST` | `/auth/login` | Login and obtain JWT token | — |
| `GET` | `/auth/me` | Fetch authenticated user profile | — |
| `GET` | `/leads` | List user leads (supports search, industry, status filter) | — |
| `POST` | `/leads` | Create a new lead record | — |
| `GET` | `/leads/{id}` | Get lead details with qualification | — |
| `PUT` | `/leads/{id}` | Update lead details | — |
| `DELETE` | `/leads/{id}` | Delete lead (cascades related records) | — |
| `POST` | `/leads/{id}/qualify` | **Qualify lead fit (0-100 score, status, signals)** | **OpenAI** |
| `POST` | `/leads/{id}/generate-email` | **Generate bespoke sales email draft** | **Google Gemini** |
| `GET` | `/leads/{id}/emails` | Get generated emails for a lead | — |
| `GET` | `/emails` | Get all generated emails in workspace | — |
| `GET` | `/dashboard` | Get aggregate pipeline KPIs and breakdown | — |

---

## Running Automated Tests

Run backend tests using `pytest` inside `backend/`:

```bash
cd backend
.venv\Scripts\pytest -v
```

The test suite validates:
- User registration, duplicate checks, and JWT authentication
- Protected route authorization boundaries
- Lead CRUD operations and user ownership isolation
- **OpenAI-based lead qualification route** (mocked)
- **Gemini-based personalized email generation route** (mocked)
- Pipeline dashboard metric aggregation

---

## Screenshots Gallery

Screenshots demonstrating all required views are stored in the [`screenshots/`](screenshots/) directory:

1. **User Sign In & Registration**: `screenshots/01_login_and_auth.png`
2. **Executive Sales Dashboard**: `screenshots/02_dashboard_kpis_and_charts.png`
3. **Prospect Lead Management**: `screenshots/03_leads_table_and_filtering.png`
4. **OpenAI Lead Qualification**: `screenshots/04_openai_lead_qualification_detail.png`
5. **Gemini Personalized Email Generator**: `screenshots/05_gemini_email_generator.png`
6. **Outreach History & Drawer**: `screenshots/06_email_history_and_settings.png`

---

## Author & Assessment Submission

- **Candidate**: Rudraksh Singh
- **Assessment**: AI SDR Intern Technical Assessment
- **Role**: AI SDR Software Engineering Intern
