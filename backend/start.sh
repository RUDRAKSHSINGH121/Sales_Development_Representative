#!/bin/sh
set -e

echo "[LeadPilot] Starting container..."
echo "[LeadPilot] Running database seed..."
python -m scripts.seed
echo "[LeadPilot] Database ready. Starting Uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
