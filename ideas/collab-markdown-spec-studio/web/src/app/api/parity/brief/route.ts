import { NextResponse } from "next/server";

import { buildBacklogBrief } from "@/lib/specforge/backlog";

export async function GET() {
  return new NextResponse(await buildBacklogBrief(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
