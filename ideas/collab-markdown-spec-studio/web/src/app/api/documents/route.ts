import { NextResponse } from "next/server";

import { createDocument, listDocuments } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

export async function GET() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const documents = await listDocuments({ workspaceId });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const body = await request.json();
  const document = await createDocument({
    ...body,
    workspace_id: workspaceId,
  });
  return NextResponse.json({ document }, { status: 201 });
}
