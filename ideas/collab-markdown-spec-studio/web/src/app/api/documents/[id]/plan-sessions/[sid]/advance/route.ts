import { NextResponse } from "next/server";

import { planStageAdvanceSchema } from "@/lib/specforge/contracts";
import { advancePlanSession } from "@/lib/specforge/plan-session";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string; sid: string }>;
};

export async function POST(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { sid } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const body = await request.json();
      const input = planStageAdvanceSchema.parse(body);
      const { session, patchId } = await advancePlanSession(sid, input, workspaceId);
      return NextResponse.json({ session, patch_id: patchId }, { status: 200 });
    },
    { action: "advance plan session stage" },
  );
}
