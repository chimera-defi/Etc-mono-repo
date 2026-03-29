import { NextResponse } from "next/server";

import { getPlanSession } from "@/lib/specforge/plan-session";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string; sid: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { sid } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const session = await getPlanSession(sid, workspaceId);
      return NextResponse.json({ session });
    },
    { action: "get plan session" },
  );
}
