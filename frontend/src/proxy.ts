import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  if (!token && (isDashboardPage || isRoot)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (isAuthPage || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
