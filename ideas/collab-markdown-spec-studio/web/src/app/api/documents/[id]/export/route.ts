import { NextResponse } from "next/server";

import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { exportDocument } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

async function buildResponse(id: string, workspaceId: string) {
  const bundle = await exportDocument(id, { workspaceId });
  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `inline; filename="${id}-export.json"`,
    },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const currentActor = await getCurrentWorkspaceActor();
  return buildResponse(id, currentActor.workspace_id);
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const currentActor = await getCurrentWorkspaceActor();
  return buildResponse(id, currentActor.workspace_id);
}
