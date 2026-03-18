import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WORKSPACE_SESSION_COOKIE = "specforge_session";

function continueWithRequestId(requestHeaders: Headers, requestId: string) {
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("x-specforge-request-id", requestId);
  return response;
}

/**
 * Protect API routes when GitHub auth is enabled, while keeping local demo mode
 * and parity endpoints accessible for the delivery loop.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  const requestId =
    requestHeaders.get("x-specforge-request-id") ?? crypto.randomUUID();

  requestHeaders.set("x-specforge-request-id", requestId);

  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/parity/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return continueWithRequestId(requestHeaders, requestId);
  }

  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_OVERRIDE === "true";
  const githubConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim() &&
      process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim(),
  );

  if (skipAuth || !githubConfigured) {
    return continueWithRequestId(requestHeaders, requestId);
  }

  if (pathname.startsWith("/api/")) {
    const sessionCookie = request.cookies.get(WORKSPACE_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      const response = NextResponse.json({ error: "Authentication required" }, { status: 401 });
      response.headers.set("x-specforge-request-id", requestId);
      return response;
    }
  }

  return continueWithRequestId(requestHeaders, requestId);
}

export const config = {
  matcher: ["/api/:path*"],
};
