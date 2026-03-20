import { NextResponse } from "next/server";

import { getCurrentWorkspaceLaunchResource } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await getCurrentWorkspaceLaunchResource(request, id, {
    eventType: "usage.handoff_viewed",
    select: (context) => context.starterBundle,
  });
  return NextResponse.json(result.body, { status: result.status });
}
