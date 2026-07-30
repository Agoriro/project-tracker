# PROGRESS.md — Aztec PM

> Última actualización: 2026-07-30 12:25 CST

## Estado de fases

- [x] Fase 0 — Scaffolding, Docker y `.gitignore`
- [x] Fase 1 — Dominio, modelos y Alembic
- [x] Fase 2 — Auth JWT
- [x] Fase 3 — Endpoints de Projects (Repository + UoW)
- [x] Fase 4 — Endpoints de Tasks
- [x] Fase 5 — Detección de riesgo y motor de priorización
- [x] Fase 6 — Seed de datos del Excel
- [x] Fase 7 — Frontend base + Auth
- [x] Fase 8 — Vista operativa de proyectos
- [x] Fase 9 — Dashboard y vista de tareas
- [x] Fase 10 — Colección de Postman
- [x] Fase 11 — READMEs y pulido final

## Última fase completada

**Fase 11 (Proyecto Finalizado)** — 2026-07-30 13:30 CST

## Decisiones de arquitectura

- **Next.js 15.4.3** inicializado con App Router + TypeScript + Tailwind CSS.
- **`.dockerignore`** añadidos en backend y frontend para reducir context size.
- **Entrypoint del backend** incluye fallback graceful si Alembic no está configurado aún.
- **Docker healthchecks** implementados en los 3 servicios.
- **Enums como `StrEnum`** para serialización JSON nativa y compatibilidad con Pydantic v2.
- **Enums almacenados como VARCHAR** en PostgreSQL (no PG native enums) para facilitar migraciones futuras sin ALTER TYPE.
- **FK en `project_code`** (natural key) en vez de FK en `id` (surrogate) — más legible en queries y en el dataset.
- **Alembic async** configurado con `asyncpg` y autogenerate que detecta los 4 modelos.
- **Bcrypt nativo:** Se utiliza `bcrypt` directamente en lugar de `passlib` debido a incompatibilidades de passlib con versiones recientes de bcrypt.
- **Auth Tokens:** JWT (Access Token 15 min) + Refresh Token en cookie HttpOnly (7 días).
- **Validación Estricta con Enums:** Los DTOs usan los enums definidos (ej. `EngagementType`, `Stage`) asegurando que FastAPI/Pydantic valide automáticamente (HTTP 422) que el payload coincida exactamente con los valores del dataset Aztec.

## Desviaciones del plan

- Añadidos `.dockerignore` en backend y frontend (mejora de build no prevista).

## Comandos de verificación

```bash
# Levantar todo
docker compose up -d --build

# Health check
curl http://localhost:8000/health

# Verificar tablas en Postgres
docker compose exec db psql -U aztec_user -d aztec_pm -c "\dt"

# Ejecutar migraciones manualmente
docker compose exec backend alembic upgrade head

# Estado de migraciones
docker compose exec backend alembic current
```

## Próximo paso

Iniciar **Fase 2** — Auth JWT (access token + refresh token + endpoints + tests).
