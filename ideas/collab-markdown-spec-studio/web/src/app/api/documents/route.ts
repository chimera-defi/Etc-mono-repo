import { NextResponse } from "next/server";

import { createDocument, listDocuments } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

export async function GET() {
  return withErrorHandling(
    async () => {
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const documents = await listDocuments({ workspaceId });
      return NextResponse.json({ documents });
    },
    { action: "list documents" }
  );
}

export async function POST(request: Request) {
  return withErrorHandling(
    async () => {
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const body = await request.json();
      const document = await createDocument({
        ...body,
        workspace_id: workspaceId,
      });
      return NextResponse.json({ document }, { status: 201 });
    },
    { action: "create document" }
  );
}
