-- PostgreSQL initialization is handled by SQLAlchemy at application startup.
-- This script creates the application role/database when executed by a PostgreSQL superuser.
CREATE USER leadpilot WITH PASSWORD 'leadpilot';
CREATE DATABASE leadpilot OWNER leadpilot;
