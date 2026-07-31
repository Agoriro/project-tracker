FROM python:3.13-slim

WORKDIR /app

# System dependencies for psycopg2 and asyncpg
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev dos2unix && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Entrypoint: run Alembic migrations then start uvicorn
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
