// Next.js Middleware — runs on the Edge (before the page renders).
//
// WHAT IT DOES:
//   1. Reads the `accessToken` cookie (set on login).
//   2. Decodes the JWT payload (no verification — signing happens server-side).
//   3. Gates /dashboard/tenant, /dashboard/landlord, /dashboard/admin by role.
//   4. Unauthenticated visitors → /auth/login.
//   5. Wrong-role visitors → their correct dashboard.
//
// WHY NO FULL JWT VERIFICATION HERE?
//   Edge runtime doesn't have Node.js crypto. We do a simple Base64-decode of
//   the payload. Full verification still happens on the backend for every
//   protected API call — middleware is just a UX guard, not a security boundary.

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // Determine which dashboard section is being accessed
  const isTenantRoute = pathname.startsWith("/dashboard/tenant");
  const isLandlordRoute = pathname.startsWith("/dashboard/landlord");
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isProtected = isTenantRoute || isLandlordRoute || isAdminRoute;

  if (!isProtected) return NextResponse.next();

  // No token → redirect to login, preserving the original URL as a redirect param
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

  // Wrong role — redirect to their actual dashboard
  const roleMap = {
    TENANT: "/dashboard/tenant",
    LANDLORD: "/dashboard/landlord",
    ADMIN: "/dashboard/admin",
  };
  return NextResponse.redirect(new URL(roleMap[role], request.url));
}

// Only run middleware on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
