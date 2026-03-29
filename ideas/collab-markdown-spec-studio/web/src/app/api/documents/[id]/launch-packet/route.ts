import { NextResponse } from "next/server";

import { buildLaunchPacket } from "@/lib/specforge/workflow";
import { getCurrentWorkspaceLaunchResource } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await getCurrentWorkspaceLaunchResource(request, id, {
    eventType: "usage.launch_packet_viewed",
    select: (context) => buildLaunchPacket(context),
  });
  return NextResponse.json(result.body, { status: result.status });
}
