/**
 * CLI Environment Diagnostics Route
 *
 * GET /api/agent/assist/diagnostics
 *
 * Returns which CLI tools (codex, claude) are available in the runtime,
 * which one SpecForge will prefer, and a human-readable reason string.
 * The workspace status panel uses this to show assist readiness.
 */

import { detectCliEnvironment } from "@/lib/specforge/agent-assist";
import { success, error } from "@/lib/specforge/api-response";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

export async function GET() {
  try {
    await getCurrentWorkspaceAccess();
    const env = await detectCliEnvironment();
    return success(env as unknown as Record<string, unknown>);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "DIAGNOSTICS_FAILED",
      500,
    );
  }
}
