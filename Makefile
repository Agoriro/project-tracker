.PHONY: up down build seed test-backend logs clean

# Start all services
up:
	docker compose up -d --build

# Stop all services
down:
	docker compose down

# Build without starting
build:
	docker compose build

# Seed database with Excel data
seed:
	docker compose exec backend python -m scripts.seed

# Run backend tests
test-backend:
	docker compose exec backend pytest tests/ -v

# Follow logs
logs:
	docker compose logs -f

# Logs for specific service
logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

# Clean everything (including volumes)
clean:
	docker compose down -v --remove-orphans
	docker system prune -f
