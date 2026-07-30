# PLAN.md — Sistema de Gestión de Proyectos Aztec PM

> Generado: 2026-07-30  
> Estado: **Pendiente de aprobación**

---

## Resumen del sistema

Sistema fullstack de gestión de proyectos y tareas para una operación de consultoría/automatización. Permite visualizar, filtrar y priorizar un portafolio de 22 proyectos con 82 tareas asignadas a 5 miembros de equipo. Incluye detección automática de riesgo, bloqueos y proyectos sin siguiente paso claro, con un criterio de priorización transparente y explicable.

---

## Datos del dataset (fuente de verdad para seed)

| Entidad   | Registros | Notas clave |
|-----------|-----------|-------------|
| Projects  | 22        | 5 Sanos, 4 En riesgo, 13 Bloqueados. Tipos: Proyecto (12), Mantenimiento (5), Diagnóstico (4). PRJ-21 sin tareas. |
| Tasks     | 82        | Prioridades: Baja, Media, Alta, Crítica. Estados: Por hacer, En progreso, En revisión, Bloqueada. |
| Team      | 5         | Camila Torres (28 tareas), Daniel Rojas (11), Laura Gomez (19), Mateo Ruiz (16), Santiago Vera (4). |

---

## Fases de implementación

---

### Fase 0 — Scaffolding, Docker y `.gitignore`

**Objetivo:** Crear la estructura completa del monorepo, configurar Docker Compose con los 3 servicios (db, backend, frontend), y establecer `.gitignore` correctos.

**Tareas:**
1. Crear estructura de directorios:
   ```
   project-tracker/
   ├── backend/
   │   ├── app/
   │   │   ├── domain/          # Entidades de dominio (dataclasses)
   │   │   ├── application/     # Casos de uso, servicios, interfaces
   │   │   ├── infrastructure/  # Repos, DB, auth, seeds
   │   │   └── api/             # Routers FastAPI, DTOs Pydantic
   │   ├── alembic/
   │   ├── tests/
   │   ├── Dockerfile
   │   ├── requirements.txt
   │   ├── alembic.ini
   │   └── .gitignore
   ├── frontend/
   │   ├── src/
   │   │   ├── app/             # App Router pages
   │   │   ├── components/      # Componentes UI
   │   │   ├── lib/             # API client, auth, utils
   │   │   └── types/           # TypeScript types
   │   ├── Dockerfile
   │   ├── package.json
   │   └── .gitignore
   ├── data/
   │   └── Dataset — Reto ... .xlsx
   ├── postman/
   ├── docker-compose.yml
   ├── Makefile
   ├── .gitignore
   ├── PLAN.md
   └── PROGRESS.md
   ```
2. `docker-compose.yml` con servicios `db` (Postgres 16), `backend` (Python 3.13 + FastAPI), `frontend` (Next.js). Healthchecks en los 3 servicios.
3. `Dockerfile` del backend: Python 3.13-slim, instala dependencias, corre Alembic migrations al inicio, arranca uvicorn.
4. `Dockerfile` del frontend: Node 20-alpine, build multistage.
5. `Makefile` con targets: `up`, `down`, `seed`, `test-backend`, `test-frontend`, `logs`.
6. `.gitignore` en raíz, backend y frontend (según spec del prompt sección 6).
7. `backend/requirements.txt` con todas las dependencias.
8. `.env.example` con variables de entorno documentadas.

**Archivos a crear/modificar:**
- `docker-compose.yml` [NEW]
- `Makefile` [NEW]
- `.gitignore` (raíz) [NEW]
- `backend/Dockerfile` [NEW]
- `backend/.gitignore` [NEW]
- `backend/requirements.txt` [NEW]
- `backend/app/__init__.py` [NEW]
- `backend/app/main.py` [NEW] (FastAPI app mínima con healthcheck)
- `frontend/.gitignore` [NEW]
- `.env.example` [NEW]
- Mover Excel a `data/`

**Criterio de aceptación:**
- `docker compose up` levanta los 3 servicios sin errores.
- `GET /health` del backend responde `200 OK`.
- Frontend muestra la página default de Next.js.
- `git status` no muestra archivos que deberían estar ignorados.

**Esfuerzo:** M

---

### Fase 1 — Dominio, Modelos SQLAlchemy y Alembic

**Objetivo:** Definir las entidades de dominio como dataclasses, los modelos SQLAlchemy correspondientes, y generar la migración inicial con Alembic.

**Tareas:**
1. Entidades de dominio (dataclasses puras, sin dependencias de DB):
   - `Project`: project_code, engagement_type (enum), client_alias, project_name, project_type_api (enum), stage (enum), status, health (enum), owner_alias, owner_role, start_date, target_date, business_value, currency, open_tasks, overdue_tasks, blockers, summary, recent_completed_examples, **next_step** (nuevo), **notes** (nuevo).
   - `Task`: task_code, project_code (FK), assignee_alias, assignee_role, priority (enum), status (enum), due_date, is_overdue, dependency, title, detail, last_progress.
   - `TeamMember`: member_alias, role, projects_in_portfolio, open_tasks_assigned, blocked_tasks_assigned, high_or_critical_open, diagnostico_projects, proyecto_projects, mantenimiento_projects.
   - `User`: id, username, hashed_password, full_name, is_active (para autenticación).
2. Enums de dominio: `EngagementType`, `ProjectTypeAPI`, `Stage`, `Health`, `TaskPriority`, `TaskStatus`.
3. Modelos SQLAlchemy (async-compatible con `mapped_column`).
4. Configuración de Alembic con soporte async (usando `asyncpg`).
5. Migración inicial autogenerada.
6. Script de configuración de base de datos (`database.py`) con async session factory.

**Archivos a crear/modificar:**
- `backend/app/domain/entities.py` [NEW]
- `backend/app/domain/enums.py` [NEW]
- `backend/app/infrastructure/database.py` [NEW]
- `backend/app/infrastructure/models.py` [NEW]
- `backend/alembic/` [NEW] (configuración + migración inicial)
- `backend/alembic.ini` [NEW]

**Criterio de aceptación:**
- `docker compose up` aplica la migración y crea las tablas en Postgres.
- Inspeccionar las tablas con `psql` confirma que todos los campos, tipos y constraints están correctos.
- Los enums reflejan los valores exactos del dataset.

**Esfuerzo:** M

---

### Fase 2 — Autenticación JWT

**Objetivo:** Implementar auth completa con access token (corto, 15min) + refresh token (cookie httpOnly, 7 días), registro/login/refresh/logout.

**Tareas:**
1. Servicio de autenticación (`auth_service.py`): hash de passwords con bcrypt, generación/validación de JWT con pyjwt.
2. Repositorio de usuarios (`user_repository.py`).
3. DTOs Pydantic: `LoginRequest`, `LoginResponse`, `RegisterRequest`, `TokenPayload`.
4. Router `/api/auth`: `POST /login`, `POST /register`, `POST /refresh`, `POST /logout`.
5. Dependency `get_current_user` para proteger endpoints.
6. Refresh token como cookie httpOnly con `SameSite=Lax`, `Secure` en producción.
7. Migración para tabla `users` (si no fue incluida en Fase 1).
8. Tests: login exitoso, login con credenciales inválidas, acceso a ruta protegida sin token, refresh token flow.

**Archivos a crear/modificar:**
- `backend/app/infrastructure/auth.py` [NEW]
- `backend/app/application/auth_service.py` [NEW]
- `backend/app/infrastructure/repositories/user_repository.py` [NEW]
- `backend/app/api/routers/auth.py` [NEW]
- `backend/app/api/dependencies.py` [NEW]
- `backend/app/api/dtos/auth_dtos.py` [NEW]
- `backend/tests/test_auth.py` [NEW]

**Criterio de aceptación:**
- Login devuelve access_token en body y refresh_token en cookie httpOnly.
- Endpoints protegidos rechazan requests sin token (401).
- Refresh token renueva el access_token correctamente.
- Tests pasan al 100%.

**Esfuerzo:** M

---

### Fase 3 — Repository, Unit of Work y Endpoints de Projects

**Objetivo:** Implementar CRUD completo de proyectos con patrón Repository + Unit of Work, DTOs de entrada/salida, y documentación Swagger completa.

**Tareas:**
1. Interfaces (abstract classes) en application layer: `ProjectRepository`, `UnitOfWork`.
2. Implementaciones concretas en infrastructure.
3. Servicio de aplicación `ProjectService` con lógica de negocio.
4. DTOs Pydantic v2: `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`, `ProjectListResponse` (con paginación), `ProjectFilters`.
5. Mappers entre domain entities ↔ DTOs ↔ SQLAlchemy models.
6. Router `/api/projects`:
   - `GET /` — listar con filtros (health, stage, owner, engagement_type) y ordenamiento.
   - `GET /{project_code}` — detalle.
   - `POST /` — crear proyecto.
   - `PATCH /{project_code}` — actualizar (incluye next_step y notes).
7. Swagger: descripciones, ejemplos, response models poblados correctamente.
8. Tests: CRUD completo, filtros, validaciones.

**Archivos a crear/modificar:**
- `backend/app/application/interfaces.py` [NEW]
- `backend/app/application/project_service.py` [NEW]
- `backend/app/infrastructure/repositories/project_repository.py` [NEW]
- `backend/app/infrastructure/unit_of_work.py` [NEW]
- `backend/app/api/routers/projects.py` [NEW]
- `backend/app/api/dtos/project_dtos.py` [NEW]
- `backend/app/api/mappers/project_mapper.py` [NEW]
- `backend/tests/test_projects.py` [NEW]

**Criterio de aceptación:**
- CRUD funciona end-to-end via HTTP.
- Filtros de health, stage, owner funcionan correctamente.
- Swagger documenta todos los endpoints con ejemplos.
- Tests pasan al 100%.

**Esfuerzo:** L

---

### Fase 4 — Endpoints de Tasks

**Objetivo:** CRUD de tareas vinculadas a proyectos, con filtros por proyecto, asignado, prioridad, estado.

**Tareas:**
1. `TaskRepository` (interfaz + implementación).
2. `TaskService` con lógica de negocio.
3. DTOs: `TaskCreate`, `TaskUpdate`, `TaskResponse`, `TaskListResponse`, `TaskFilters`.
4. Mappers Task.
5. Router `/api/tasks`:
   - `GET /` — listar con filtros (project_code, assignee, priority, status, is_overdue).
   - `GET /{task_code}` — detalle.
   - `POST /` — crear tarea.
   - `PATCH /{task_code}` — actualizar (estado, progreso, etc).
6. Tests: CRUD, filtros, vinculación con proyecto.

**Archivos a crear/modificar:**
- `backend/app/application/task_service.py` [NEW]
- `backend/app/infrastructure/repositories/task_repository.py` [NEW]
- `backend/app/api/routers/tasks.py` [NEW]
- `backend/app/api/dtos/task_dtos.py` [NEW]
- `backend/app/api/mappers/task_mapper.py` [NEW]
- `backend/tests/test_tasks.py` [NEW]

**Criterio de aceptación:**
- CRUD completo funcional.
- Tareas vinculadas correctamente a proyectos.
- Filtros funcionan.
- Tests pasan.

**Esfuerzo:** M

---

### Fase 5 — Detección de riesgo y motor de priorización

**Objetivo:** Implementar las reglas de detección automática (en riesgo, bloqueado, sin siguiente paso) y el score compuesto de priorización con desglose explicable.

**Tareas:**
1. **Patrón Strategy** para detección de riesgo:
   - `RiskDetector` (interfaz) con implementaciones:
     - `BlockedDetector`: proyecto con tareas bloqueadas o bloqueadores registrados.
     - `AtRiskDetector`: tareas vencidas, alta proporción de overdue, fecha límite próxima.
     - `NoNextStepDetector`: campo `next_step` vacío o nulo.
   - `CompositeRiskDetector` que ejecuta todas las estrategias.
2. **Patrón Strategy** para priorización:
   - `PriorityScorer` (interfaz) con factores ponderados:
     - **Health** (30%): Bloqueado=100, En riesgo=70, Sano=0.
     - **Overdue tasks ratio** (25%): (overdue_tasks / max(open_tasks, 1)) × 100.
     - **Engagement type** (15%): Proyecto=80, Mantenimiento=50, Diagnóstico=30.
     - **Deadline proximity** (20%): días restantes → score inverso (más cercano = más urgente).
     - **Business value** (10%): normalizado sobre el rango del portafolio (separando USD y COP).
   - Score total 0–100, con desglose por factor en la respuesta.
3. Endpoint `GET /api/projects/priorities` — devuelve proyectos ordenados por score con desglose.
4. Endpoint `GET /api/projects/{code}/risk-assessment` — devuelve evaluación de riesgo detallada.
5. Integración en `ProjectResponse`: campos `priority_score`, `priority_breakdown`, `risk_flags`, `detected_health`.
6. Tests unitarios para cada estrategia y para el score compuesto.

**Archivos a crear/modificar:**
- `backend/app/domain/scoring.py` [NEW] — interfaces de Strategy
- `backend/app/application/risk_service.py` [NEW]
- `backend/app/application/priority_service.py` [NEW]
- `backend/app/application/strategies/` [NEW] — implementaciones de cada factor
- `backend/app/api/routers/projects.py` [MODIFY] — nuevos endpoints
- `backend/app/api/dtos/priority_dtos.py` [NEW]
- `backend/tests/test_risk_detection.py` [NEW]
- `backend/tests/test_priority_scoring.py` [NEW]

**Criterio de aceptación:**
- PRJ-01 (Bloqueado, 2 overdue, Proyecto, $28K) tiene score más alto que PRJ-17 (Sano, 0 overdue).
- PRJ-21 (Sano, 0 overdue, 0 open tasks) detectado como "sin siguiente paso" si next_step está vacío.
- Desglose del score visible en la respuesta JSON (cada factor con su peso, valor crudo y contribución).
- Cambiar el health de un proyecto re-calcula su score correctamente.
- Tests pasan.

**Esfuerzo:** L

---

### Fase 6 — Seed de datos del Excel

**Objetivo:** Script que lee el Excel del dataset y carga los datos como seed inicial en la base de datos, incluyendo un usuario admin por defecto.

**Tareas:**
1. Script `backend/scripts/seed.py`:
   - Lee el Excel con openpyxl.
   - Crea un usuario admin (`admin/admin123` — solo para desarrollo).
   - Inserta los 22 proyectos con todos sus campos (mapeando tipos, enums, etc).
   - Inserta las 82 tareas vinculadas.
   - Inserta los 5 miembros del equipo.
   - Idempotente: si ya hay datos, no duplica (UPSERT o truncate+insert).
2. Target `make seed` en el Makefile.
3. Verificación: queries de conteo y muestreo post-seed.

**Archivos a crear/modificar:**
- `backend/scripts/seed.py` [NEW]
- `backend/scripts/__init__.py` [NEW]
- `Makefile` [MODIFY] — agregar target `seed`
- `docker-compose.yml` [MODIFY] — montar `data/` en backend

**Criterio de aceptación:**
- `make seed` carga todos los datos sin errores.
- `GET /api/projects` devuelve 22 proyectos con datos correctos.
- `GET /api/tasks` devuelve 82 tareas.
- Los health y prioridades del dataset están representados.
- Se puede hacer login con `admin/admin123`.

**Esfuerzo:** M

---

### Fase 7 — Frontend base + Autenticación

**Objetivo:** Inicializar Next.js con App Router, configurar shadcn/ui con paleta personalizada, implementar flujo de login/logout con JWT.

**Tareas:**
1. Inicializar Next.js con TypeScript + App Router.
2. Instalar y configurar shadcn/ui + Tailwind con paleta empresarial personalizada:
   - Primario: azul profundo (#1e3a5f → tonos).
   - Acento: ámbar/dorado (#f59e0b).
   - Semánticos: rojo (bloqueado), naranja (en riesgo), verde (sano).
   - Dark mode como default.
3. Layout principal con sidebar de navegación (Dashboard, Proyectos, Equipo).
4. Página de login con React Hook Form + Zod.
5. Auth provider: access token en memoria (React context), refresh token en cookie httpOnly (seteada por backend).
6. `middleware.ts` para proteger rutas `/dashboard/*`.
7. API client (`lib/api.ts`) con interceptor para auto-refresh de tokens.
8. TanStack Query provider configurado.

**Archivos a crear/modificar:**
- `frontend/` completo [NEW] — scaffold Next.js
- `frontend/src/app/layout.tsx` [NEW]
- `frontend/src/app/login/page.tsx` [NEW]
- `frontend/src/app/dashboard/layout.tsx` [NEW]
- `frontend/src/components/sidebar.tsx` [NEW]
- `frontend/src/lib/api.ts` [NEW]
- `frontend/src/lib/auth.tsx` [NEW]
- `frontend/src/middleware.ts` [NEW]
- `frontend/tailwind.config.ts` [MODIFY] — paleta personalizada
- `frontend/Dockerfile` [MODIFY] — ajustar si es necesario

**Criterio de aceptación:**
- Login funciona end-to-end contra el backend.
- Rutas protegidas redirigen a login si no hay sesión.
- Refresh token renueva automáticamente cuando el access token expira.
- El diseño se ve empresarial y atractivo (dark mode, paleta propia, no defaults).

**Esfuerzo:** L

---

### Fase 8 — Vista operativa de proyectos

**Objetivo:** Tabla filtrable/ordenable de proyectos con TanStack Table, mostrando health, prioridad, responsable, fecha límite, y score de priorización con desglose.

**Tareas:**
1. Página `/dashboard/projects` con TanStack Table:
   - Columnas: código, nombre, cliente, tipo, health (badge con color), owner, fecha límite, score (con tooltip de desglose), next_step, acciones.
   - Filtros: health, engagement_type, owner, stage.
   - Ordenamiento por cualquier columna.
   - Búsqueda por texto (nombre, cliente).
2. Badges de health con colores semánticos:
   - Sano: verde
   - En riesgo: naranja/ámbar
   - Bloqueado: rojo
   - Sin siguiente paso: morado/gris pulsante
3. Panel lateral o modal de detalle de proyecto al hacer clic:
   - Información completa.
   - Lista de tareas del proyecto.
   - Desglose del score de priorización (barra apilada o radar).
   - Campo editable para `next_step` y `notes`.
   - Risk flags detectados.
4. Formulario de edición de proyecto (React Hook Form + Zod).
5. Integración con TanStack Query para data fetching y mutations.

**Archivos a crear/modificar:**
- `frontend/src/app/dashboard/projects/page.tsx` [NEW]
- `frontend/src/components/projects/projects-table.tsx` [NEW]
- `frontend/src/components/projects/project-detail-panel.tsx` [NEW]
- `frontend/src/components/projects/project-edit-form.tsx` [NEW]
- `frontend/src/components/projects/health-badge.tsx` [NEW]
- `frontend/src/components/projects/priority-breakdown.tsx` [NEW]
- `frontend/src/components/projects/project-filters.tsx` [NEW]
- `frontend/src/lib/queries/projects.ts` [NEW]
- `frontend/src/types/project.ts` [NEW]

**Criterio de aceptación:**
- La tabla muestra los 22 proyectos del seed con datos correctos.
- Filtros de health y owner funcionan.
- Ordenar por score muestra PRJ-01/PRJ-08 en las primeras posiciones.
- El desglose del score es visible (tooltip o panel) — no es caja negra.
- Editar `next_step` persiste en el backend.
- El detector de riesgo reacciona: si se pone next_step vacío, aparece el flag correspondiente.

**Esfuerzo:** L

---

### Fase 9 — Vista de tareas y dashboard de resumen

**Objetivo:** Página de tareas por proyecto y dashboard con gráficos de distribución.

**Tareas:**
1. Sección de tareas dentro del detalle de proyecto (o página dedicada `/dashboard/tasks`):
   - Lista/tabla de tareas con filtros (prioridad, estado, overdue).
   - Actualización de estado de tarea (drag & drop o select).
2. Dashboard principal `/dashboard`:
   - **Tarjetas KPI**: total proyectos, bloqueados, en riesgo, sin siguiente paso.
   - **Gráfico de dona/pie** (Recharts): distribución por health.
   - **Gráfico de barras**: carga por persona (open tasks, blocked tasks, high/critical).
   - **Tabla resumen**: top 5 proyectos por urgencia (score más alto).
   - **Timeline**: proyectos por fecha límite (próximos vencimientos).

**Archivos a crear/modificar:**
- `frontend/src/app/dashboard/page.tsx` [MODIFY] — dashboard con gráficos
- `frontend/src/components/dashboard/kpi-cards.tsx` [NEW]
- `frontend/src/components/dashboard/health-chart.tsx` [NEW]
- `frontend/src/components/dashboard/team-workload-chart.tsx` [NEW]
- `frontend/src/components/dashboard/urgent-projects.tsx` [NEW]
- `frontend/src/components/tasks/task-list.tsx` [NEW]
- `frontend/src/components/tasks/task-status-select.tsx` [NEW]
- `frontend/src/lib/queries/tasks.ts` [NEW]
- `frontend/src/lib/queries/dashboard.ts` [NEW]
- `frontend/src/types/task.ts` [NEW]

**Criterio de aceptación:**
- Dashboard muestra KPIs correctos (13 bloqueados, 4 en riesgo, 5 sanos).
- Gráfico de health refleja la distribución real.
- Gráfico de carga muestra a Camila Torres con la mayor carga (28 tareas).
- Actualizar estado de tarea se refleja en tiempo real.

**Esfuerzo:** L

---

### Fase 10 — Colección de Postman

**Objetivo:** Generar colección de Postman completa y funcional con tests automatizados.

**Tareas:**
1. `postman/Aztec-PM.postman_collection.json`:
   - Carpeta **Auth**: login (con pre-request script que guarda access_token), refresh, register.
   - Carpeta **Projects**: crear, listar (con filtros), obtener por ID, actualizar, prioridades, risk assessment.
   - Carpeta **Tasks**: crear, listar por proyecto, actualizar estado.
   - Tests por request: status code, campos clave en respuesta.
   - Ejemplos realistas: proyecto sano, en riesgo, bloqueado, sin siguiente paso.
2. `postman/Aztec-PM.postman_environment.json`: `base_url`, `access_token`, `refresh_token`.
3. Instrucciones de uso en README del backend.

**Archivos a crear/modificar:**
- `postman/Aztec-PM.postman_collection.json` [NEW]
- `postman/Aztec-PM.postman_environment.json` [NEW]
- `backend/README.md` [MODIFY] — agregar sección Postman

**Criterio de aceptación:**
- Importar la colección en Postman funciona sin errores.
- Ejecutar login guarda automáticamente el token.
- Los demás requests usan el token guardado.
- Los tests de Postman pasan al ejecutar la colección completa.

**Esfuerzo:** M

---

### Fase 11 — READMEs, PROGRESS.md y pulido final

**Objetivo:** Documentación completa y verificación del checklist final.

**Tareas:**
1. `README.md` raíz:
   - Visión general del sistema.
   - Cómo levantar todo con `docker compose up`.
   - Criterio de priorización explicado en lenguaje simple.
   - Link a READMEs de backend y frontend.
2. `backend/README.md`:
   - Qué es, tecnologías, decisiones de arquitectura, cómo levantar, cómo probar.
3. `frontend/README.md`:
   - Qué es, tecnologías, decisiones de arquitectura, cómo levantar, cómo probar.
4. `PROGRESS.md` actualizado con estado final.
5. Verificación del checklist completo (sección 8 del prompt).
6. Revisión de Swagger: que los ejemplos y descripciones estén completos.
7. Smoke test end-to-end: login → ver proyectos → actualizar → verificar riesgo.

**Archivos a crear/modificar:**
- `README.md` (raíz) [NEW]
- `backend/README.md` [NEW o MODIFY]
- `frontend/README.md` [NEW o MODIFY]
- `PROGRESS.md` [MODIFY]

**Criterio de aceptación:**
- Todos los items del checklist final (sección 8) están completados y verificados.
- Un clon fresco del repo levanta con `docker compose up` sin pasos manuales extra (excepto `make seed` para datos).
- Los 3 READMEs tienen las secciones requeridas completas.

**Esfuerzo:** M

---

## Resumen de esfuerzo

| Fase | Nombre | Esfuerzo | Dependencias |
|------|--------|----------|--------------|
| 0 | Scaffolding y Docker | M | — |
| 1 | Dominio, modelos y Alembic | M | Fase 0 |
| 2 | Auth JWT | M | Fase 1 |
| 3 | Endpoints de Projects | L | Fase 1, 2 |
| 4 | Endpoints de Tasks | M | Fase 3 |
| 5 | Detección de riesgo y priorización | L | Fase 3, 4 |
| 6 | Seed de datos | M | Fase 1, 3, 4 |
| 7 | Frontend base + auth | L | Fase 2 |
| 8 | Vista operativa de proyectos | L | Fase 3, 5, 7 |
| 9 | Dashboard y tareas | L | Fase 4, 5, 8 |
| 10 | Postman | M | Fase 2, 3, 4 |
| 11 | READMEs y pulido | M | Todas |

## Ruta crítica para MVP end-to-end

Si el tiempo aprieta, la prioridad es: **Fases 0→1→2→3→4→5→6→7→8**. Eso entrega login → ver proyectos con filtros → editar → priorización visible. Las Fases 9 (dashboard con gráficos), 10 (Postman) y 11 (READMEs) son valiosas pero no bloquean el flujo principal.

---

**⏳ Esperando tu aprobación para comenzar. Responde "OK plan" para iniciar con la Fase 0, o indica qué ajustes necesitas.**
