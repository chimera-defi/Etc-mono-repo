import { NextResponse } from "next/server";
import { z } from "zod";

import { suggestGuidedSpecInput } from "@/lib/specforge/agent-assist";
import { getAssistQuotaState } from "@/lib/specforge/plans";
import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import {
  getWorkspaceUsageSummary,
  listWorkspaceRecords,
  recordWorkspaceEvent,
} from "@/lib/specforge/store";

const requestSchema = z.object({
  brief: z.string().min(1),
  tool: z.enum(["auto", "codex_cli", "claude_cli", "heuristic"]).optional(),
});

export async function POST(request: Request) {
  const payload = requestSchema.parse(await request.json());
  const actor = await getCurrentWorkspaceActor();
  const [workspaceRecords, usage] = await Promise.all([
    listWorkspaceRecords(),
    getWorkspaceUsageSummary(actor.workspace_id),
  ]);
  const workspace =
    workspaceRecords.find((item) => item.workspace_id === actor.workspace_id) ?? {
      workspace_id: actor.workspace_id,
      name: "SpecForge Demo Workspace",
      plan: "demo" as const,
      created_at: new Date(0).toISOString(),
    };
  const quota = getAssistQuotaState(workspace, usage);

  if (quota.blocked) {
    return NextResponse.json(
      {
        error: "assist_quota_exceeded",
        message:
          "This workspace has used its included assist quota. Upgrade the workspace plan or continue editing manually.",
        quota,
      },
      { status: 429 },
    );
  }

  const suggestion = await suggestGuidedSpecInput({
    brief: payload.brief,
    requestedTool: payload.tool,
  });

  await recordWorkspaceEvent({
    workspace_id: actor.workspace_id,
    event_type: "usage.assist_requested",
    actor_type: actor.actor_type,
    actor_id: actor.actor_id,
    payload: {
      requested_tool: payload.tool ?? "auto",
      selected_tool: suggestion.tool,
    },
  });

  return NextResponse.json(suggestion);
}
