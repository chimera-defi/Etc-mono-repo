import { NextResponse } from "next/server";

import { resolveStarterTemplateId } from "@/lib/specforge/handoff";
import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { recordWorkspaceEvent } from "@/lib/specforge/store";
import { getCurrentWorkspaceLaunchContext } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const templateId = resolveStarterTemplateId(
    new URL(request.url).searchParams.get("template") ?? undefined,
  );
  const { context } = await getCurrentWorkspaceLaunchContext(id, templateId);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const actor = await getCurrentWorkspaceActor();
  await recordWorkspaceEvent({
    workspace_id: actor.workspace_id,
    event_type: "usage.execution_viewed",
    actor_type: actor.actor_type,
    actor_id: actor.actor_id,
    payload: {
      document_id: context.document.document_id,
      template_id: templateId,
    },
  });

  return NextResponse.json(context.executionBrief);
}
