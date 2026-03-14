import { NextResponse } from "next/server";

import { exportDocument } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

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
  const { workspaceId } = await getCurrentWorkspaceAccess();
  return buildResponse(id, workspaceId);
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const { workspaceId } = await getCurrentWorkspaceAccess();
  return buildResponse(id, workspaceId);
}
