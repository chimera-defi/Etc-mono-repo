import { NextResponse } from "next/server";

import { iterationRequestSchema } from "@/lib/specforge/contracts";
import { iterateSection } from "@/lib/specforge/iterate";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string; blockId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id, blockId } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const body = await request.json();
      const input = iterationRequestSchema.parse(body);
      const result = await iterateSection(id, blockId, input, workspaceId);
      return NextResponse.json(result, { status: 201 });
    },
    { action: "iterate section" },
  );
}
