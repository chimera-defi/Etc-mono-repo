import { NextResponse } from "next/server";

import {
  getCurrentWorkspaceLaunchContext,
  recordCurrentWorkspaceUsage,
  resolveLaunchTemplateFromRequest,
} from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const templateId = resolveLaunchTemplateFromRequest(request);
  const { actor, context } = await getCurrentWorkspaceLaunchContext(id, templateId);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await recordCurrentWorkspaceUsage({
    actor,
    eventType: "usage.handoff_viewed",
    documentId: context.document.document_id,
    templateId,
  });

  return NextResponse.json(context.starterBundle);
}
