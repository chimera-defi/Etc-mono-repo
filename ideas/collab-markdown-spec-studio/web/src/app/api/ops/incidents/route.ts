import { NextResponse } from "next/server";

import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { loadWorkspaceIncidents } from "@/lib/specforge/workspace-summary";

export async function GET() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  return NextResponse.json(await loadWorkspaceIncidents(workspaceId));
}
