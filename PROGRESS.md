# PROGRESS.md — Aztec PM

> Última actualización: 2026-07-30 11:45 CST

## Estado de fases

- [ ] Fase 0 — Scaffolding, Docker y `.gitignore`
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

Ninguna — plan en revisión.

## Decisiones de arquitectura

_(Se irán documentando conforme avance el proyecto)_

## Desviaciones del plan

_(Ninguna hasta el momento)_

## Comandos de verificación

```bash
# Levantar todo
docker compose up

# Ejecutar seed
make seed

# Tests backend
make test-backend

# Healthcheck
curl http://localhost:8000/health
```

## Próximo paso

Esperar aprobación del `PLAN.md` para iniciar Fase 0.
