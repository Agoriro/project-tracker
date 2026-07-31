#!/bin/bash
set -e

echo "==> Running Alembic migrations..."
alembic upgrade head || echo "WARNING: Alembic migrations skipped (not configured yet)"

echo "==> Seeding database..."
python -m app.seed

echo "==> Starting Aztec PM backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
