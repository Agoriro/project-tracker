# PROGRESS.md — Aztec PM

> Última actualización: 2026-07-30 12:13 CST

## Estado de fases

- [x] Fase 0 — Scaffolding, Docker y `.gitignore`
- [ ] Fase 1 — Dominio, modelos y Alembic
- [ ] Fase 2 — Auth JWT
- [ ] Fase 3 — Endpoints de Projects (Repository + UoW)
- [ ] Fase 4 — Endpoints de Tasks
- [ ] Fase 5 — Detección de riesgo y motor de priorización
- [ ] Fase 6 — Seed de datos del Excel
- [ ] Fase 7 — Frontend base + Auth
- [ ] Fase 8 — Vista operativa de proyectos
- [ ] Fase 9 — Dashboard y vista de tareas
- [ ] Fase 10 — Colección de Postman
- [ ] Fase 11 — READMEs y pulido final

## Última fase completada

**Fase 0** — 2026-07-30 12:13 CST

## Decisiones de arquitectura

- **Next.js 15.4.3** inicializado con App Router + TypeScript + Tailwind CSS.
- **`.dockerignore`** añadidos en backend y frontend para reducir context size (frontend pasó de ~425MB a ~5MB).
- **Entrypoint del backend** incluye fallback graceful si Alembic no está configurado aún.
- **Docker healthchecks** implementados en los 3 servicios con intervalos apropiados.

## Desviaciones del plan

- Añadidos `.dockerignore` en backend y frontend (no estaban en el plan pero son necesarios para builds rápidos).

## Comandos de verificación

```bash
# Levantar todo
docker compose up -d --build

# Verificar servicios
docker compose ps -a

# Health check del backend
curl http://localhost:8000/health
# Debe devolver: {"status":"healthy","service":"aztec-pm-backend","version":"0.1.0"}

# Frontend
# Abrir http://localhost:3000 — debe mostrar la página default de Next.js

# Swagger docs
# Abrir http://localhost:8000/docs
```

## Próximo paso

Iniciar **Fase 1** — Dominio, modelos SQLAlchemy y Alembic.
