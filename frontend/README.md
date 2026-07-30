# Aztec PM - Frontend

This is the frontend client for Aztec Project Management, built with **Next.js 16** (App Router) and **React 19**.

## Architecture & Technology Choices

### Server Components & Data Fetching
We leverage Next.js Server Components heavily across the application. 
When rendering pages like the Dashboard Overview or the Projects Grid, the Next.js server makes the API calls to the backend via our `serverFetch` wrapper. 
This provides:
1. **Performance:** Eliminates client-side loading waterfalls.
2. **Security:** The JWT access token (stored as an `HttpOnly` cookie) is read directly on the server. The token is never exposed to the browser's JavaScript engine, neutralizing XSS risks.

### Authentication Flow (Proxy & Server Actions)
- **Server Actions:** Login and Logout are handled via Next.js Server Actions (`src/app/actions/auth-actions.ts`), which securely communicate with the FastAPI backend and set/delete the `HttpOnly` cookie.
- **Proxy Middleware:** We use Next.js `proxy.ts` (the Next.js 16 evolution of middleware) to protect the `/dashboard` routes. If a user attempts to access the dashboard without a valid token in their cookies, they are immediately redirected to `/login` at the edge, before the page even begins to render.

### Styling & UI
The interface is built to be modern, responsive, and premium:
- **Tailwind CSS 4:** Used for all utility classes and responsive design.
- **Dynamic Badges:** We use visual indicators (Red, Green, Yellow) to immediately map `status`, `health`, and `risk_level` fields from the API into actionable visual insights for the PM.
- **Lucide React:** Used for crisp, scalable SVG icons across the dashboard.

## Setup & Running

The frontend is intended to be run via Docker Compose from the root directory:

```bash
docker compose up --build frontend
```

The container uses `npm run dev` by default, leveraging Next.js's hot-reloading (via Turbopack) mapped directly to your local file system.
