import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  // If user visits /login, delete any stale access_token cookie to render login cleanly
  if (isAuthPage) {
    const response = NextResponse.next();
    if (token) {
      response.cookies.delete("access_token");
    }
    return response;
  }

  // If trying to access dashboard or root without a token, redirect to /login
  if (!token && (isDashboardPage || isRoot)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If root with valid token, redirect to dashboard
  if (token && isRoot) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
