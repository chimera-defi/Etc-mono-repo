import { NextResponse } from "next/server";

import { decidePatch } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string; patchId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id, patchId } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const body = await request.json();

      const patch = await decidePatch(
        {
          ...body,
          document_id: id,
          patch_id: patchId,
        },
        { workspaceId },
      );

      return NextResponse.json({ patch });
    },
    { action: "decide patch" }
  );
}
