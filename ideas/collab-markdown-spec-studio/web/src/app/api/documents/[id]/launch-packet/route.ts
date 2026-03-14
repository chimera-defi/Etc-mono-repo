import { NextResponse } from "next/server";

import { buildLaunchPacket } from "@/lib/specforge/workflow";
import { getCurrentWorkspaceLaunchContext } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const { context } = await getCurrentWorkspaceLaunchContext(id);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(buildLaunchPacket(context));
}
