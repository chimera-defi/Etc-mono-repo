import { NextResponse } from "next/server";
import { z } from "zod";

import { suggestGuidedSpecInput } from "@/lib/specforge/agent-assist";
import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { recordWorkspaceEvent } from "@/lib/specforge/store";

const requestSchema = z.object({
  brief: z.string().min(1),
  tool: z.enum(["auto", "codex_cli", "claude_cli", "heuristic"]).optional(),
});

export async function POST(request: Request) {
  const payload = requestSchema.parse(await request.json());
  const actor = await getCurrentWorkspaceActor();
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
