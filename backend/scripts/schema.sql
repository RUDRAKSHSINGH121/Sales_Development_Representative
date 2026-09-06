-- =============================================================================
-- LeadPilot - PostgreSQL Database Schema & Initial Data
-- AI SDR Technical Assessment Deliverable: Database Scripts
-- =============================================================================

-- Drop tables if resetting (in dependency order)
-- DROP TABLE IF EXISTS generated_emails CASCADE;
-- DROP TABLE IF EXISTS lead_qualifications CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Authentication & Ownership)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ensure server default on existing table if previously created by ORM
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'utc');

-- 2. Leads Table (Sales Prospects)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(160) NOT NULL,
    job_title VARCHAR(160),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(255),
    location VARCHAR(120),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    CONSTRAINT uq_owner_lead_email UNIQUE (owner_id, email)
);

CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Ensure server default on existing table if previously created by ORM
ALTER TABLE leads ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'utc');

-- 3. Lead Qualifications Table (Objective 4: OpenAI Lead Scoring)
CREATE TABLE IF NOT EXISTS lead_qualifications (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('qualified', 'review', 'unqualified')),
    reasoning TEXT NOT NULL,
    signals TEXT NOT NULL DEFAULT '[]',
    analyzed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qualifications_lead_id ON lead_qualifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_status ON lead_qualifications(status);

-- Ensure server default on existing table if previously created by ORM
ALTER TABLE lead_qualifications ALTER COLUMN analyzed_at SET DEFAULT (NOW() AT TIME ZONE 'utc');

-- 4. Generated Emails Table (Objective 5: Gemini Email Outreach)
CREATE TABLE IF NOT EXISTS generated_emails (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'generated',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_lead_id ON generated_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON generated_emails(created_at);

-- Ensure server default on existing table if previously created by ORM
ALTER TABLE generated_emails ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'utc');

-- =============================================================================
-- Initial Demo Seed Data
-- =============================================================================
-- Default demo user password is: LeadPilot123!
-- Bcrypt hash: $2b$12$4mU8QYd06aPqfE1GgO9L7.T5a79GZ2vRXZoR4Q7C9Y9DqZt11lE1K

INSERT INTO users (email, name, password_hash, created_at)
VALUES ('demo@leadpilot.dev', 'Rudraksh Singh', '$2b$12$e8p2u7sUeB1b4O.6tM5X..bYnJj1r/9Q6oXjP1Z1/oE2kK6rL4k7m', NOW() AT TIME ZONE 'utc')
ON CONFLICT (email) DO NOTHING;
