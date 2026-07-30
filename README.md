# Aztec PM

Aztec PM es una plataforma integral de gestión de proyectos diseñada para consolidar la visión operativa de un portafolio completo, automatizar la detección de riesgos (Risk Engine), gestionar miembros del equipo y optimizar el flujo de trabajo del equipo de Delivery (Project Managers y Tech Leads).

---

## 📁 Estructura del Repositorio

El proyecto está construido bajo un esquema Full-Stack moderno:

- **`backend/`**: Construido con **FastAPI (Python 3.13)**. Implementa *Clean Architecture* aislando por completo la lógica de negocio, lo que permite cálculos de riesgo complejos y testeables de manera independiente. Utiliza **PostgreSQL** a través de SQLAlchemy asíncrono y Alembic.
- **`frontend/`**: Construido con **Next.js 16 App Router (React 19)**. Usa Server Components para realizar *data fetching* seguro hacia el backend e implementa Server Actions y Proxy Middleware para la protección segura de rutas mediante tokens JWT (`HttpOnly`).
- **`postman/`**: Contiene la colección completa de la API con scripts de automatización de tokens.

Para detalles arquitectónicos profundos, revisa:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## 🚀 Quickstart (Arranque con un clic)

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

## 🔑 Autenticación, Usuarios y Gestión de Equipo

### Autenticación y Tokens JWT
- Sistema de autenticación seguro basado en JWT (JSON Web Tokens) almacenados en cookies de navegador de forma protegida.
- Expiración extendida a **7 días (10,080 minutos)** para mantener sesiones operativas fluidas sin interrupciones por inactividad breve.
- Manejo automático de redirección en caso de tokens inválidos o sesiones expiradas (`401 Unauthorized`).

### Administración de Miembros del Equipo y Roles (CRUD completo)
- **Registro y Edición de Miembros:** Creación y actualización de perfiles de integrantes del equipo desde el dashboard (`/dashboard/team/new` y `/dashboard/team/[alias]/edit`).
- **Asignación de Roles:** Selector de roles predefinidos (*PM, Lead Engineer, Delivery, Senior Backend Developer, Frontend Developer, Fullstack Developer, Solutions Architect, QA Specialist, DevOps Engineer*) con soporte para roles personalizados.
- **Monitoreo de Carga de Trabajo:** Cada tarjeta de integrante contabiliza automáticamente tareas abiertas, tareas bloqueadas, tareas críticas y un desglose por tipo de proyecto (**DG** - Diagnóstico, **PR** - Proyecto, **MT** - Mantenimiento/Recurrente).

---

## 📋 Gestión de Tareas y Operaciones Masivas

### Formulario y Edición de Tareas (CRUD completo)
- Creación y edición individual de tareas (`/dashboard/tasks/new` y `/dashboard/tasks/[task_code]/edit`).
- Formulario reactivo con validación de esquemas (Pydantic v2), manejo claro de errores de negocio y cálculo de fechas límite.
- Revalidación automática instantánea del portafolio al guardar o editar tareas.

### Reasignación y Actualización Masiva de Tareas
- **Cambio de Asignados (Reasignación):** Posibilidad de modificar rápidamente el responsable (`assigned_to`) de cualquier tarea hacia otro integrante del equipo directamente desde la interfaz o los formularios.
- **Actualizaciones de Estado y Prioridad:** Modificación en lote o individual de estados (*Pendiente, En Progreso, Bloqueada, Completada*) y prioridades (*Baja, Media, Alta, Crítica*).
- **Insignia Animada de Alta Visibilidad:** Badge rojo pulsante de atención inmediata para tareas etiquetadas como **"CRÍTICA"**.

### Grilla Interactiva de Tareas
- **Buscador en Tiempo Real:** Filtra simultáneamente por Código de Tarea, Nombre de Tarea o Proyecto.
- **Filtros Múltiples Combinados:** 4 desplegables independientes para filtrar por **Proyecto**, **Asignado**, **Prioridad** y **Estado**.
- **Paginación Fija a 25 Registros:** Control de paginación previa/siguiente con indicador de rango (*Mostrando 1 a 25 de N tareas*).

---

## 📊 Grilla Interactiva de Proyectos

- **Buscador General:** Búsqueda rápida por Código de Proyecto, Nombre de Proyecto o Cliente.
- **Filtros Combinables simultáneos:** 5 desplegables para filtrar por **Cliente**, **Tipo API**, **Owner**, **Salud** (Sano, En riesgo, Bloqueado) y **Nivel de Riesgo** (High, Medium, Low).
- **Indicador de Riesgo:** Renderizado explícito de `Score: 0` para proyectos con riesgo nulo o de baja prioridad.
- **Paginación a 25 Registros:** Paginación optimizada para listas grandes con reseteo automático al aplicar o limpiar filtros.

---

## ⚙️ Algoritmo de Priorización (Risk Engine)

El motor de riesgos analítico (`RiskEngineService`) escanea y evalúa el portafolio según las siguientes heurísticas:

### Lógica de Puntaje de Riesgo
- **+5 Puntos** por cada tarea abierta de prioridad **Alta** o **Crítica**.
- **+5 Puntos adicionales (Total 10 pts)** si la tarea Alta/Crítica está **Vencida** (`is_overdue == true`).
- **+3 Puntos** por cada tarea en estado **Bloqueada**.
- **+5 Puntos (Penalización de Gobernanza)** por cada proyecto activo que **NO posea un Siguiente Paso Claro** definido (`next_step`).

### Niveles de Clasificación
- **Score ≥ 20**: Nivel **High** (Salud: *En riesgo*)
- **Score ≥ 10**: Nivel **Medium** (Salud: *En riesgo*)
- **Score < 10**: Nivel **Low** (Salud: *Sano*)
