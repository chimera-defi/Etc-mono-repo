import { NextResponse } from "next/server";

import { listPatches, updateDocument } from "@/lib/specforge/store";
import { getCurrentWorkspaceDocument } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const { workspaceId, document } = await getCurrentWorkspaceDocument(id);

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const patches = await listPatches(id, { workspaceId });
      return NextResponse.json({ document, patches });
    },
    { action: "get document" }
  );
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const payload = await request.json();
      const { document: existing } = await getCurrentWorkspaceDocument(id);
      if (!existing) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      const document = await updateDocument(id, payload);
      return NextResponse.json({ document });
    },
    { action: "update document", resourceId: (await params).id }
  );
}
