"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    // We don't use serverFetch here because login requires form data for OAuth2
    const url = `${getApiUrl()}/auth/login`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // fetch will automatically set the correct Content-Type for FormData
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Invalid credentials." };
      }
      return { error: `An error occurred: ${response.statusText}` };
    }

    const data = await response.json();
    
    // Set the token in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    
    // The backend also sets a refresh_token cookie, but since we are proxying 
    // the request from the Next.js server, the Set-Cookie header from backend
    // won't automatically reach the browser. For a robust App Router implementation,
    // we would extract the refresh_token from the backend's Set-Cookie header and 
    // set it via cookieStore here as well. Let's do that:
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Very basic parsing for demonstration.
      // In production, use a library like 'set-cookie-parser'.
      const match = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (match) {
        cookieStore.set("refresh_token", match[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });
      }
    }

    // Run Risk Engine asynchronously so metrics are updated by the time user lands on dashboard
    fetch(`${getApiUrl()}/risk/evaluate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.access_token}`
      }
    }).catch(err => console.error("Failed to trigger Risk Engine on login:", err));

  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Failed to connect to the server." };
  }
  
  // Redirect on success (must be outside try-catch to work correctly)
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect("/login");
}
