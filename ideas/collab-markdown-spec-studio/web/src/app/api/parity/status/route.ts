import { NextResponse } from "next/server";

import { readBacklogState } from "@/lib/specforge/backlog";

export async function GET() {
  return NextResponse.json(await readBacklogState());
}
