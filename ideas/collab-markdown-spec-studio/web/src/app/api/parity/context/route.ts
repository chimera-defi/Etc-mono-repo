import { NextResponse } from "next/server";

import { buildBacklogContext } from "@/lib/specforge/backlog";

export async function GET() {
  return NextResponse.json(await buildBacklogContext());
}
