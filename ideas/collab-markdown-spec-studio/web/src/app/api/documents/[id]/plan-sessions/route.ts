import { NextResponse } from "next/server";

import { planSessionCreateSchema } from "@/lib/specforge/contracts";
import {
  createPlanSession,
  listPlanSessions,
} from "@/lib/specforge/plan-session";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const sessions = await listPlanSessions(id, workspaceId);
      return NextResponse.json({ sessions });
    },
    { action: "list plan sessions" },
  );
}

export async function POST(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const { workspaceId } = await getCurrentWorkspaceAccess();
      const body = await request.json();
      planSessionCreateSchema.parse({ ...body, document_id: id });
      const session = await createPlanSession(id, workspaceId);
      return NextResponse.json({ session }, { status: 201 });
    },
    { action: "create plan session", resourceId: (await params).id },
  );
}
