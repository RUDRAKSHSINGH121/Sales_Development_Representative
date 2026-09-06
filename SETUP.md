# LeadPilot - Setup & Installation Instructions

This document provides step-by-step instructions for installing, configuring, and running the **LeadPilot Mini AI SDR** platform locally on your machine.

---

## 🔑 Demo Account Credentials

For instant evaluation without creating a new account:
- **Email / Username**: `demo@leadpilot.dev`
- **Password**: `LeadPilot123!`
- *(Or click **"Sign up"** on the login page to register a new user)*

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: `v20+` and `npm`
- **Python**: `v3.11+`
- **PostgreSQL**: `v16+` (running as a local service or via Docker)
- **OpenAI API Key**: For Objective 4 Lead Qualification
- **Google Gemini API Key**: For Objective 5 Email Outreach Generation

---

## ⚡ Quick Start (TL;DR)

If you already have Python, Node.js, and PostgreSQL running:

```bash
# 1. Start PostgreSQL (if using Docker)
docker compose up -d db

# 2. Setup & Run Backend (Port 8000)
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows (.venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m scripts.seed
uvicorn app.main:app --reload --port 8000

# 3. Setup & Run Frontend (Port 3000) - in a new terminal:
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🐳 One-Command Docker Deployment (Recommended)

LeadPilot is fully containerized with Docker and Docker Compose. You can launch the entire platform (PostgreSQL 16, FastAPI backend, Next.js 15 frontend) with a single command without needing local Python or Node environments:

### 1. Launch All Services in Background
```bash
docker compose --env-file .env.docker up --build -d
```

### 2. Verify Container Health
```bash
docker compose ps
```
Services running:
- `leadpilot-db`: PostgreSQL 16 on host port `5433` (internal `5432`) with healthcheck
- `leadpilot-backend`: FastAPI on port `8000` (automatically runs migrations & prospect seeds)
- `leadpilot-frontend`: Next.js 15 on port `3000` (production SSR bundle)

### 3. Access the Application
- **Frontend Dashboard**: `http://localhost:3000` (Log in: `demo@leadpilot.dev` / `LeadPilot123!`)
- **Backend Swagger Docs**: `http://localhost:8000/docs`
- **Interactive OpenAPI ReDoc**: `http://localhost:8000/redoc`

### 4. View Container Logs
```bash
# Stream all logs
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend
```

### 5. Stop Containers
```bash
# Stop containers while preserving database volume
docker compose down

# Stop and wipe database volume for fresh re-seeding
docker compose down -v
```

### 6. Published Docker Hub Images
The production container images are officially published on Docker Hub:
- **Backend Image**: [`rudraksh121/leadpilot-backend:latest`](https://hub.docker.com/r/rudraksh121/leadpilot-backend)
  ```bash
  docker pull rudraksh121/leadpilot-backend:latest
  ```
- **Frontend Image**: [`rudraksh121/leadpilot-frontend:latest`](https://hub.docker.com/r/rudraksh121/leadpilot-frontend)
  ```bash
  docker pull rudraksh121/leadpilot-frontend:latest
  ```

---

## 🛠 Local Manual Installation Guide

### Step 1: Database Setup (PostgreSQL)

LeadPilot requires a PostgreSQL database named `leadpilot`. You can run it via Docker or as a local service.

#### Option A: Docker (Recommended)
From the repository root:
```bash
docker compose up -d db
```
This starts PostgreSQL 16 on port `5432` with user `leadpilot` and password `leadpilot`.

#### Option B: Local PostgreSQL Service
1. Ensure your PostgreSQL service is running on port `5432`.
2. Connect to PostgreSQL and create the user and database using the provided script:
   ```bash
   psql -U postgres -f backend/scripts/schema.sql
   ```
   *(Or run [`database/schema.sql`](database/schema.sql) directly inside pgAdmin / DBeaver; for the complete ERD and schema design, see [`DATABASE.md`](DATABASE.md))*.

---

### Step 2: Configure Environment Variables

1. In the `backend/` directory, create a `.env` file (or copy `.env.example`):
   ```bash
   cd backend
   copy .env.example .env    # Windows (or cp .env.example .env on Mac/Linux)
   ```

2. Open `backend/.env` and configure your settings:
   ```env
   DATABASE_URL=postgresql+psycopg://leadpilot:leadpilot@localhost:5432/leadpilot
   JWT_SECRET_KEY=LtW7VPSTrEfUXKrpzD7SNapZpIcHNWcWMGxHbwu0jJXtgW5LuTJyEbpgfO3cKyDT
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_BASE_URL=https://aicredits.in/v1   # Optional: proxy or leave blank for default OpenAI
   GEMINI_API_KEY=your-gemini-api-key
   CORS_ORIGINS=http://localhost:3000
   ```

3. In the `frontend/` directory, verify that `.env.local` contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

---

### Step 3: Backend Installation & Launch (FastAPI)

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows:
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database schema and seed demo records:
   ```bash
   python -m scripts.seed
   ```
   *This seeds the demo user (`demo@leadpilot.dev`) and 5 realistic B2B prospects across diverse industries with pre-analyzed OpenAI qualification scores and Gemini emails.*

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. Verify backend health:
   - Open your browser to `http://localhost:8000/docs` to view the interactive OpenAPI / Swagger documentation.

---

### Step 4: Frontend Installation & Launch (Next.js)

1. Open a new terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Open `http://localhost:3000` in your browser.
   - Log in using `demo@leadpilot.dev` / `LeadPilot123!`.

---

## 🧪 Testing & Verification

### Running Automated Tests
Run the backend test suite from the `backend/` directory:
```bash
cd backend
.venv\Scripts\pytest -v     # Windows
# pytest -v                 # macOS / Linux
```

**Verified Test Cases:**
- `test_user_registration_and_login`: User sign-up, password hashing, and JWT token issuance
- `test_unauthorized_access`: Protection of private endpoints without tokens
- `test_lead_crud`: Creation, reading, updating, and deletion of prospects
- `test_openai_qualification_route`: OpenAI ICP scoring, status, reasoning, and signals extraction
- `test_gemini_email_generation_route`: Google Gemini personalized email drafting
- `test_dashboard_metrics`: Pipeline aggregation metrics and status counts

---

## 📬 Postman API Collection Testing

1. Open Postman.
2. Click **Import** and select: [`postman/LeadPilot.postman_collection.json`](postman/LeadPilot.postman_collection.json).
3. The collection is pre-configured with collection variables (`base_url`, `token`, `lead_id`).
4. Run the requests in folder order:
   - **1. Authentication -> Login**: Automatically parses and saves the JWT token into `{{token}}`.
   - **2. Lead Management -> List All Leads / Create Lead**: Tests prospect CRUD operations.
   - **3. AI Integrations -> Qualify Lead (OpenAI)**: Runs structured lead qualification.
   - **3. AI Integrations -> Generate Outreach Email (Gemini)**: Generates tailored sales email drafts.
   - **4. Analytics -> Get Dashboard Metrics**: Retrieves live pipeline insights.

---

## 🔍 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **503 Error on AI action** | Invalid or missing API key, or provider network timeout | Verify `OPENAI_API_KEY` and `GEMINI_API_KEY` in `backend/.env`. |
| **CORS error in browser** | Frontend origin mismatch | Ensure `CORS_ORIGINS=http://localhost:3000` is set in `backend/.env`. |
| **Database connection error** | PostgreSQL service not running | Start Docker (`docker compose up -d db`) or ensure PostgreSQL service is active on port 5432. |
| **Port 8000 / 3000 in use** | Another process is occupying the port | Terminate the process holding the port or change the port flags (`--port 8001`, `npm run dev -- -p 3001`). |
