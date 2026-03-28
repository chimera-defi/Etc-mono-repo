/**
 * Server-side proxy for collab server health.
 *
 * GET /api/collab/health
 *
 * Checks the configured collab server health endpoint and returns the result.
 * The client always hits this route — the server resolves the correct URL
 * (local 127.0.0.1:4322 in dev, hosted Fly.io URL in production).
 * This avoids CORS issues and works for both local and SaaS deployments.
 */

import { NextResponse } from "next/server";

function getCollabHealthUrl(): string {
  // In SaaS: set COLLAB_HEALTH_URL=https://specforge-collab.fly.dev/health
  // In local/desktop: defaults to the local health port
  const explicit = process.env.COLLAB_HEALTH_URL?.trim();
  if (explicit) return explicit;

  // Derive from NEXT_PUBLIC_COLLAB_URL if set (ws/wss → http/https, port 4321 → 4322)
  const collabWs = process.env.NEXT_PUBLIC_COLLAB_URL?.trim();
  if (collabWs) {
    const healthUrl = collabWs
      .replace(/^wss:\/\//, "https://")
      .replace(/^ws:\/\//, "http://")
      .replace(/:4321$/, ":4322")
      .replace(/\/$/, "");
    return `${healthUrl}/health`;
  }

  return "http://127.0.0.1:4322/health";
}

export async function GET() {
  const url = getCollabHealthUrl();

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, url, error: `HTTP ${res.status}` }, { status: 200 });
    }

    const body = await res.json() as Record<string, unknown>;
    return NextResponse.json({ ok: true, url, ...body });
  } catch (err) {
    return NextResponse.json(
      { ok: false, url, error: err instanceof Error ? err.message : String(err) },
      { status: 200 },
    );
  }
}
