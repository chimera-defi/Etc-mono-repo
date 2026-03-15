import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WORKSPACE_SESSION_COOKIE = "specforge_session";

/**
 * Middleware for SpecForge route protection.
 *
 * Protected API routes require a valid workspace session cookie when GitHub
 * auth is configured and NEXT_PUBLIC_SKIP_AUTH_OVERRIDE is not set.
 *
 * Public routes (auth callbacks, parity endpoints, static assets) are excluded.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth routes, parity endpoints, and static assets
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/parity/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Skip auth enforcement when override is enabled or GitHub auth is not configured
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_OVERRIDE === "true";
  const githubConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim() &&
      process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim(),
  );

  if (skipAuth || !githubConfigured) {
    return NextResponse.next();
  }

  // Protect API routes: require a valid session cookie
  if (pathname.startsWith("/api/")) {
    const sessionCookie = request.cookies.get(WORKSPACE_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
