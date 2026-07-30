# Aztec PM - Frontend

Este es el cliente frontend para Aztec Project Management, construido con **Next.js 16** (App Router) y **React 19**.

## Arquitectura y Elecciones Tecnológicas

### Server Components y Data Fetching (Obtención de Datos)
Aprovechamos en gran medida los Server Components de Next.js en toda la aplicación. 
Al renderizar páginas como el Dashboard Overview o la Cuadrícula de Proyectos (Projects Grid), el servidor de Next.js realiza las llamadas a la API hacia el backend a través de nuestro wrapper `serverFetch`. 
Esto proporciona:
1. **Rendimiento:** Elimina las cascadas de carga en el lado del cliente (client-side waterfalls).
2. **Seguridad:** El token de acceso JWT (almacenado como una cookie `HttpOnly`) se lee directamente en el servidor. El token nunca se expone al motor de JavaScript del navegador, neutralizando así los riesgos de ataques XSS.

### Flujo de Autenticación (Proxy y Server Actions)
- **Server Actions:** El inicio de sesión (Login) y el cierre de sesión (Logout) se manejan a través de los Server Actions de Next.js (`src/app/actions/auth-actions.ts`), los cuales se comunican de forma segura con el backend en FastAPI y configuran/eliminan la cookie `HttpOnly`.
- **Proxy Middleware:** Utilizamos `proxy.ts` de Next.js (la evolución del middleware en Next.js 16) para proteger las rutas del `/dashboard`. Si un usuario intenta acceder al dashboard sin un token válido en sus cookies, es redirigido inmediatamente a `/login` en el edge, incluso antes de que la página comience a renderizarse.

### Estilos e Interfaz de Usuario (UI)
La interfaz está construida para ser moderna, responsiva y de aspecto premium:
- **Tailwind CSS 4:** Utilizado para todas las clases de utilidad y el diseño responsivo.
- **Badges Dinámicos:** Usamos indicadores visuales (Rojo, Verde, Amarillo) para mapear inmediatamente los campos de `status`, `health` y `risk_level` de la API en información visual procesable para el Project Manager.
- **Lucide React:** Usado para iconos SVG nítidos y escalables en todo el dashboard.

## Configuración y Ejecución

El frontend está diseñado para ser ejecutado a través de Docker Compose desde el directorio raíz:

```bash
docker compose up --build frontend
```

El contenedor utiliza `npm run dev` por defecto, aprovechando la recarga en caliente (hot-reloading) de Next.js (a través de Turbopack) mapeada directamente a tu sistema de archivos local.
