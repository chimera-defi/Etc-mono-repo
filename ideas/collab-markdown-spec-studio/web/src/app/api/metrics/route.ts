import { NextResponse } from "next/server";

import { readBacklogState } from "@/lib/specforge/backlog";
import { getRequestId, logServerEvent } from "@/lib/specforge/observability";
import {
  getWorkspaceActivityMetrics,
  getPersistenceConfig,
  listCommentThreads,
  listDocuments,
  listWorkspaceMemberships,
  listWorkspaceRecords,
} from "@/lib/specforge/store";

export async function GET(request: Request) {
  const requestId = getRequestId(request.headers);
  const persistenceConfig = getPersistenceConfig();
  const [workspaces, documents, backlogState] = await Promise.all([
    listWorkspaceRecords(),
    listDocuments(),
    readBacklogState(),
  ]);

  const workspaceCounts = await Promise.all(
    workspaces.map(async (workspace) => {
      const workspaceDocuments = documents.filter(
        (document) => document.workspace_id === workspace.workspace_id,
      );
      const activity = await getWorkspaceActivityMetrics(workspace.workspace_id);
      const documentComments = await Promise.all(
        workspaceDocuments.map((document) =>
          listCommentThreads(document.document_id, { workspaceId: workspace.workspace_id }),
        ),
      );

      return {
        workspace_id: workspace.workspace_id,
        member_count: (await listWorkspaceMemberships(workspace.workspace_id)).length,
        document_count: workspaceDocuments.length,
        open_comment_count: documentComments.flat().filter((thread) => thread.status === "open")
          .length,
        reviewed_document_count: activity.reviewed_document_count,
        commented_document_count: activity.commented_document_count,
        clarified_document_count: activity.clarified_document_count,
      };
    }),
  );

  const payload = {
    status: "ok",
    service: "specforge-web",
    request_id: requestId,
    checked_at: new Date().toISOString(),
    persistence: persistenceConfig,
    backlog: {
      active_phase: backlogState.activeSection,
      remaining_count: backlogState.remainingCount,
      review_due: backlogState.reviewDue,
    },
    counts: {
      workspace_count: workspaces.length,
      document_count: documents.length,
      open_comment_count: workspaceCounts.reduce(
        (total, item) => total + item.open_comment_count,
        0,
      ),
    },
    funnel: {
      reviewed_document_count: workspaceCounts.reduce(
        (total, item) => total + item.reviewed_document_count,
        0,
      ),
      commented_document_count: workspaceCounts.reduce(
        (total, item) => total + item.commented_document_count,
        0,
      ),
      clarified_document_count: workspaceCounts.reduce(
        (total, item) => total + item.clarified_document_count,
        0,
      ),
    },
    workspaces: workspaces.map((workspace) => ({
      workspace_id: workspace.workspace_id,
      name: workspace.name,
      plan: workspace.plan,
      member_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.member_count ?? 0,
      document_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.document_count ?? 0,
      open_comment_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.open_comment_count ?? 0,
      reviewed_document_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.reviewed_document_count ?? 0,
      commented_document_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.commented_document_count ?? 0,
      clarified_document_count:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)
          ?.clarified_document_count ?? 0,
    })),
  };

  logServerEvent("metrics_check", {
    request_id: requestId,
    persistence_backend: persistenceConfig.backend,
    workspace_count: payload.counts.workspace_count,
    document_count: payload.counts.document_count,
  });

  return NextResponse.json(payload);
}
