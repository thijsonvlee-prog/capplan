import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection middleware.
 *
 * When auth is configured (NEXTAUTH_SECRET is set), unauthenticated users
 * are redirected to the login page. When auth is not configured, all
 * requests pass through — matching the same pattern used by requireRole()
 * in api-route-utils.ts.
 */
export async function middleware(request: NextRequest) {
  // Skip auth when not configured (development/preview without auth)
  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.next();
  }

  // Check for session cookie (database session strategy)
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/planning/:path*",
    "/capacity/:path*",
    "/drivers/:path*",
    "/settings/:path*",
    "/documentatie/:path*",
  ],
};
