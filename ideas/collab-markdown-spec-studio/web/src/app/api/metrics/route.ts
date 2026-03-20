import { NextResponse } from "next/server";

import { readBacklogState } from "@/lib/specforge/backlog";
import { getRequestId, logServerEvent } from "@/lib/specforge/observability";
import {
  getWorkspaceActivityMetrics,
  getWorkspaceBehaviorSummary,
  getPersistenceConfig,
  getWorkspaceUsageSummary,
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
      const [activity, usage] = await Promise.all([
        getWorkspaceActivityMetrics(workspace.workspace_id),
        getWorkspaceUsageSummary(workspace.workspace_id),
      ]);
      const behavior = await getWorkspaceBehaviorSummary(workspace.workspace_id);
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
        behavior,
        usage,
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
    usage: {
      assist_request_count: workspaceCounts.reduce(
        (total, item) => total + item.usage.assist_request_count,
        0,
      ),
      handoff_view_count: workspaceCounts.reduce(
        (total, item) => total + item.usage.handoff_view_count,
        0,
      ),
      execution_view_count: workspaceCounts.reduce(
        (total, item) => total + item.usage.execution_view_count,
        0,
      ),
      launch_packet_view_count: workspaceCounts.reduce(
        (total, item) => total + item.usage.launch_packet_view_count,
        0,
      ),
    },
    behavior: {
      document_created_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.document_created_count,
        0,
      ),
      member_added_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.member_added_count,
        0,
      ),
      plan_changed_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.plan_changed_count,
        0,
      ),
      assist_preference_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.assist_preference_count,
        0,
      ),
      patch_decided_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.patch_decided_count,
        0,
      ),
      clarification_answered_count: workspaceCounts.reduce(
        (total, item) => total + item.behavior.clarification_answered_count,
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
      usage:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)?.usage ?? {
          assist_request_count: 0,
          handoff_view_count: 0,
          execution_view_count: 0,
          launch_packet_view_count: 0,
        },
      behavior:
        workspaceCounts.find((item) => item.workspace_id === workspace.workspace_id)?.behavior ?? {
          document_created_count: 0,
          member_added_count: 0,
          plan_changed_count: 0,
          assist_preference_count: 0,
          patch_decided_count: 0,
          clarification_answered_count: 0,
        },
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
