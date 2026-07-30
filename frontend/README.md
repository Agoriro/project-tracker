# Aztec PM - Frontend

Este es el cliente frontend para Aztec Project Management, construido con **Next.js 16** (App Router) y **React 19**.

---

## 🏛️ Arquitectura y Elecciones Tecnológicas

### Server Components y Data Fetching
Aprovechamos los Server Components de Next.js en toda la aplicación. Al renderizar páginas como el Dashboard Overview, Proyectos, Tareas o Equipo, el servidor realiza las llamadas a la API hacia el backend a través del wrapper `serverFetch`.
Esto proporciona:
1. **Rendimiento:** Elimina las cascadas de carga en el lado del cliente (*client-side waterfalls*).
2. **Seguridad:** El token de acceso JWT (almacenado como una cookie `HttpOnly`) se lee directamente en el servidor sin exponerse al motor de JavaScript del navegador.

### Server Actions (Autenticación, Tareas y Equipo)
- **Autenticación:** El inicio y cierre de sesión se manejan vía Server Actions (`src/app/actions/auth-actions.ts`) que administran la cookie `HttpOnly` con expiración de 7 días.
- **Operaciones de Tareas (`src/actions/task-actions.ts`):** Creación, edición, actualización de estado/prioridad y reasignación de tareas con revalidación instantánea de caché.
- **Operaciones de Equipo (`src/actions/team-actions.ts`):** Creación y edición de miembros del equipo con manejo amigable de errores.

### Componentes de Tablas Interactivas
- **`TasksTable.tsx`:** Tabla interactiva con buscador en tiempo real, 4 desplegables de filtrado por Proyecto, Asignado, Prioridad y Estado, paginación a 25 registros por página y badge animado para la prioridad **CRÍTICA**.
- **`ProjectsTable.tsx`:** Tabla interactiva con buscador, 5 desplegables de filtrado por Cliente, Tipo API, Owner, Salud y Riesgo, paginación a 25 registros por página y renderizado explícito de `Score: 0`.

### Formulario de Equipo (`TeamForm.tsx`)
- Permite seleccionar roles predefinidos (*PM, Lead Engineer, Delivery, QA*, etc.) o escribir roles personalizados.

---

## ⚙️ Configuración y Ejecución

El frontend está diseñado para ser ejecutado a través de Docker Compose desde el directorio raíz:

```bash
docker compose up --build frontend
```

El contenedor utiliza `npm run dev` por defecto, aprovechando la recarga en caliente (*hot-reloading*) de Next.js (a través de Turbopack) mapeada directamente a tu sistema de archivos local.
