import { NextResponse } from "next/server";

import { planStageSkipSchema } from "@/lib/specforge/contracts";
import { skipPlanStage } from "@/lib/specforge/plan-session";
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
      const input = planStageSkipSchema.parse(body);
      const session = await skipPlanStage(sid, input, workspaceId);
      return NextResponse.json({ session });
    },
    { action: "skip plan session stage" },
  );
}
