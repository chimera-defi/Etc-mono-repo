import { NextResponse } from "next/server";

import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { getDocument, listPatches, updateDocument } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const currentActor = await getCurrentWorkspaceActor();
  const document = await getDocument(id, { workspaceId: currentActor.workspace_id });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const patches = await listPatches(id);
  return NextResponse.json({ document, patches });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const payload = await request.json();
  const currentActor = await getCurrentWorkspaceActor();

  try {
    const existing = await getDocument(id, { workspaceId: currentActor.workspace_id });
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const document = await updateDocument(id, payload);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update document" },
      { status: 400 },
    );
  }
}
