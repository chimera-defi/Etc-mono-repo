import { NextResponse } from "next/server";

import { resolveStarterTemplateId } from "@/lib/specforge/handoff";
import { buildLaunchPacket } from "@/lib/specforge/workflow";
import { getCurrentWorkspaceLaunchContext } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const templateId = resolveStarterTemplateId(
    new URL(request.url).searchParams.get("template") ?? undefined,
  );
  const { context } = await getCurrentWorkspaceLaunchContext(id, templateId);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(buildLaunchPacket(context));
}
