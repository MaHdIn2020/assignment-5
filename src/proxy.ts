// proxy.ts — Next.js 16 route protection (replaces the deprecated middleware.ts).
//
// WHAT IT DOES:
//   1. Reads the `accessToken` cookie (set on login in authStore.setAuth).
//   2. Base64-decodes the JWT payload to extract the user's role.
//      (Full verification still happens on the backend — this is a UX guard.)
//   3. Gates /dashboard/tenant, /dashboard/landlord, /dashboard/admin by role.
//   4. Unauthenticated visitors → /auth/login (with redirect param preserved).
//   5. Wrong-role visitors → redirected to their correct dashboard.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  id: string;
  role: "ADMIN" | "LANDLORD" | "TENANT";
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

// In Next.js 16 the function must be named `proxy` (not `middleware`)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isTenantRoute = pathname.startsWith("/dashboard/tenant");
  const isLandlordRoute = pathname.startsWith("/dashboard/landlord");
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isProtected = isTenantRoute || isLandlordRoute || isAdminRoute;

  if (!isProtected) return NextResponse.next();

  // No token → login
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwt(token);

  // Invalid or expired token
  if (!payload || payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = payload;

  // Correct role — allow through
  if (
    (isTenantRoute && role === "TENANT") ||
    (isLandlordRoute && role === "LANDLORD") ||
    (isAdminRoute && role === "ADMIN")
  ) {
    return NextResponse.next();
  }

  // Wrong role → correct dashboard
  const roleMap: Record<string, string> = {
    TENANT: "/dashboard/tenant",
    LANDLORD: "/dashboard/landlord",
    ADMIN: "/dashboard/admin",
  };
  return NextResponse.redirect(new URL(roleMap[role], request.url));
}

// Only run on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
