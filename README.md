# Aztec PM

Aztec PM es una plataforma integral de gestión de proyectos diseñada para consolidar la visión operativa de un portafolio completo, automatizar la detección de riesgos (Risk Engine) y mejorar la claridad del equipo de Delivery (Project Managers y Tech Leads).

## Estructura del Repositorio

El proyecto está dividido en un esquema Full-Stack moderno:

- **`backend/`**: Construido con **FastAPI (Python 3.13)**. Implementa *Clean Architecture* aislando por completo la lógica de negocio, lo que permite cálculos de riesgo complejos y testeables de manera independiente. Utiliza **PostgreSQL** a través de SQLAlchemy asíncrono y Alembic.
- **`frontend/`**: Construido con **Next.js 16 App Router (React 19)**. Usa Server Components para realizar *data fetching* seguro hacia el backend e implementa Server Actions y Proxy Middleware para la protección segura de rutas mediante tokens JWT (`HttpOnly`).
- **`postman/`**: Contiene la colección completa de la API con scripts de automatización de tokens.

Para detalles arquitectónicos profundos, revisa:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## 🚀 Quickstart (Arranque con un click)

El sistema está orquestado completamente en **Docker Compose**. Puedes levantar toda la infraestructura (Base de datos PostgreSQL, Backend FastAPI, Frontend Next.js) con un solo comando:

```bash
docker compose up --build
```

### ¿Qué sucede durante el arranque?
1. Se levanta la base de datos PostgreSQL.
2. El contenedor del backend espera a que la base de datos esté lista.
3. Se ejecutan automáticamente las migraciones de Alembic.
4. **Seed Automático:** El script `seed.py` del backend lee el archivo Excel original de Aztec (`Data Aztec.xlsx`), limpia y transpone los datos con `pandas`, y puebla la base de datos de manera automática.
5. El **Risk Engine** realiza su primera corrida para calcular qué proyectos entran en riesgo inmediatamente basado en las tareas cargadas.
6. El frontend de Next.js se inicia en modo desarrollo (Turbo).

Una vez completado, visita:
- **Aplicación Frontend:** [http://localhost:3000](http://localhost:3000) (Login: `projectuser` / `password123`)
- **Documentación Swagger API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚙️ Criterios del Algoritmo de Priorización (Risk Engine)

Como parte de los entregables clave, se ha implementado un motor de riesgos analítico (`RiskEngineService`) ejecutado en el backend que prioriza la salud del portafolio.

### Lógica de Evaluación de Proyectos
El algoritmo escanea los proyectos activos y automáticamente actualiza su `health` a **"En riesgo"** si se cumple la siguiente regla heurística compuesta:
1. El proyecto tiene **más de 2 tareas vencidas** (`is_overdue == true`), Y
2. Al menos **una de esas tareas vencidas** es de prioridad **"Alta" o "Crítica"**.

*Racional:* Los retrasos menores en tareas de baja prioridad son comunes y manejables, pero la acumulación de retrasos combinada con cuellos de botella críticos requiere la atención inmediata del Project Manager.

### Evaluación de Carga de Trabajo del Equipo
De manera simultánea, el motor analiza a todo el equipo y consolida:
- Tareas abiertas totales asignadas.
- Cantidad de tareas **bloqueadas**.
- Cantidad de tareas **altas/críticas** abiertas.
- Un desglose de distribución de atención del miembro por tipo de proyecto (*Diagnóstico*, *Proyecto*, *Mantenimiento*).

Esta metadata permite a los mánagers balancear el equipo proactivamente.
