import { cookies } from "next/headers";

/**
 * Returns the base URL for the API depending on the environment.
 * If running on the server (e.g. inside Docker), it reaches the backend container directly.
 * If running on the client, it reaches localhost.
 */
export function getApiUrl() {
  if (typeof window === "undefined") {
    // Server-side
    return process.env.BACKEND_INTERNAL_URL || "http://backend:8000/api";
  }
  // Client-side
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";
}

/**
 * A wrapper around fetch that automatically injects the Authorization header
 * if a token is present in the cookies.
 * NOTE: This should primarily be used in Server Components or Server Actions.
 */
export async function serverFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${getApiUrl()}${endpoint}`;
  
  const headers = new Headers(options.headers);
  
  // Try to get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
