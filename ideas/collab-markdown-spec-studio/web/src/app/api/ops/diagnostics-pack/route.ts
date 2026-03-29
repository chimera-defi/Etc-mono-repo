/**
 * Local Diagnostics Pack Route
 *
 * GET /api/ops/diagnostics-pack
 *
 * Gathers web, collab, and CLI runtime state into a single downloadable
 * JSON bundle. Intended for users to share when filing bug reports or
 * working with design partners to reproduce failures.
 *
 * The bundle is returned as a JSON file download (Content-Disposition: attachment).
 * It contains no secrets — only runtime flags, versions, tool presence, and
 * summary-level workspace health data.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { detectCliEnvironment } from "@/lib/specforge/agent-assist";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { loadWorkspaceOpsSummary } from "@/lib/specforge/workspace-summary";
import { getPersistenceConfig } from "@/lib/specforge/store";

type DiagnosticsSection = {
  captured_at: string;
  bundle_version: string;
};

type WebDiagnostics = DiagnosticsSection & {
  node_version: string;
  next_version: string;
  app_origin: string;
  persistence_backend: string;
  db_path: string;
  auth_mode: string;
  env_flags: Record<string, string | undefined>;
};

type CollabDiagnostics = DiagnosticsSection & {
  collab_server_url: string;
  collab_health_endpoint: string;
  health_status: "ok" | "unreachable" | "unknown";
  response_time_ms: number | null;
  error: string | null;
};

type CliDiagnostics = DiagnosticsSection & {
  codex_available: boolean;
  claude_available: boolean;
  preferred_tool: string;
  reason: string;
};

type OpsDiagnostics = DiagnosticsSection & {
  backup_count: number;
  latest_backup: unknown;
  alerts: string[];
};

type DiagnosticsPack = {
  bundle_version: string;
  captured_at: string;
  web: WebDiagnostics;
  collab: CollabDiagnostics;
  cli: CliDiagnostics;
  ops: OpsDiagnostics;
};

async function probeCollabHealth(collabUrl: string): Promise<Pick<CollabDiagnostics, "health_status" | "response_time_ms" | "error">> {
  const healthUrl = `${collabUrl}/health`;
  const start = Date.now();
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
    const ms = Date.now() - start;
    if (res.ok) {
      return { health_status: "ok", response_time_ms: ms, error: null };
    }
    return {
      health_status: "unreachable",
      response_time_ms: ms,
      error: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      health_status: "unreachable",
      response_time_ms: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function GET() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const now = new Date().toISOString();
  const bundleVersion = "1";

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${proto}://${host}`;

  const collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_SERVER_URL ??
    "http://localhost:1234";

  const persistenceConfig = getPersistenceConfig();

  // Gather all diagnostics in parallel
  const [cliEnv, opsSummary, collabHealth] = await Promise.all([
    detectCliEnvironment(),
    loadWorkspaceOpsSummary(workspaceId).catch(() => null),
    probeCollabHealth(collabUrl),
  ]);

  const pack: DiagnosticsPack = {
    bundle_version: bundleVersion,
    captured_at: now,

    web: {
      bundle_version: bundleVersion,
      captured_at: now,
      node_version: process.version,
      next_version: process.env.npm_package_dependencies_next ?? "unknown",
      app_origin: origin,
      persistence_backend: persistenceConfig.backend,
      db_path: persistenceConfig.db_path ?? "(postgres)",
      auth_mode: process.env.GITHUB_CLIENT_ID ? "github_oauth_configured" : "local",
      env_flags: {
        SPECFORGE_PERSISTENCE_BACKEND: process.env.SPECFORGE_PERSISTENCE_BACKEND,
        SPECFORGE_DATA_DIR: process.env.SPECFORGE_DATA_DIR,
        BILLING_PROVIDER: process.env.BILLING_PROVIDER,
        NODE_ENV: process.env.NODE_ENV,
      },
    },

    collab: {
      bundle_version: bundleVersion,
      captured_at: now,
      collab_server_url: collabUrl,
      collab_health_endpoint: `${collabUrl}/health`,
      ...collabHealth,
    },

    cli: {
      bundle_version: bundleVersion,
      captured_at: now,
      codex_available: cliEnv.codexAvailable,
      claude_available: cliEnv.claudeAvailable,
      preferred_tool: cliEnv.preferredTool,
      reason: cliEnv.reason,
    },

    ops: {
      bundle_version: bundleVersion,
      captured_at: now,
      backup_count: opsSummary?.backups?.count ?? 0,
      latest_backup: opsSummary?.backups?.latest ?? null,
      alerts: (opsSummary?.alerts ?? []).map((a: { level: string; code: string; message: string }) => a.message),
    },
  };

  const filename = `specforge-diagnostics-${now.slice(0, 19).replace(/[:.]/g, "-")}.json`;

  return new NextResponse(JSON.stringify(pack, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
