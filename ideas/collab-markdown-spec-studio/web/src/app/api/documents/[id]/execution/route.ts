import { NextResponse } from "next/server";

import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { buildDocumentLaunchContext } from "@/lib/specforge/workflow";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const currentActor = await getCurrentWorkspaceActor();
  const context = await buildDocumentLaunchContext(id, currentActor.workspace_id);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(context.executionBrief);
}
