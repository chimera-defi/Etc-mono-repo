import { NextResponse } from "next/server";

import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { createDocument, listDocuments } from "@/lib/specforge/store";

export async function GET() {
  const currentActor = await getCurrentWorkspaceActor();
  const documents = await listDocuments({ workspaceId: currentActor.workspace_id });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const currentActor = await getCurrentWorkspaceActor();
  const body = await request.json();
  const document = await createDocument({
    ...body,
    workspace_id: currentActor.workspace_id,
  });
  return NextResponse.json({ document }, { status: 201 });
}
