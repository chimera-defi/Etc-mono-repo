import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WORKSPACE_SESSION_COOKIE = "specforge_session";

/**
 * Protect API routes when GitHub auth is enabled, while keeping local demo mode
 * and parity endpoints accessible for the delivery loop.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/parity/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_OVERRIDE === "true";
  const githubConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim() &&
      process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim(),
  );

  if (skipAuth || !githubConfigured) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const sessionCookie = request.cookies.get(WORKSPACE_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
