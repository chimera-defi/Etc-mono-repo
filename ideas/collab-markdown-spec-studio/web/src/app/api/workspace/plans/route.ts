import { NextResponse } from "next/server";

import { listWorkspacePlans } from "@/lib/specforge/plans";

export async function GET() {
  return NextResponse.json({
    plans: listWorkspacePlans(),
  });
}
