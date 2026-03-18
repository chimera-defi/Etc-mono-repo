import { NextResponse } from "next/server";

import { readBacklogState } from "@/lib/specforge/backlog";
import {
  getPersistenceConfig,
  listDocuments,
  listWorkspaceRecords,
} from "@/lib/specforge/store";

export async function GET() {
  const persistenceConfig = getPersistenceConfig();
  const [workspaces, documents, backlogState] = await Promise.all([
    listWorkspaceRecords(),
    listDocuments(),
    readBacklogState(),
  ]);

  return NextResponse.json({
    status: "ok",
    service: "specforge-web",
    checked_at: new Date().toISOString(),
    persistence: {
      ...persistenceConfig,
      workspaces: workspaces.length,
      documents: documents.length,
    },
    parity: {
      active_phase: backlogState.activeSection,
      remaining_count: backlogState.remainingCount,
      review_due: backlogState.reviewDue,
    },
  });
}
