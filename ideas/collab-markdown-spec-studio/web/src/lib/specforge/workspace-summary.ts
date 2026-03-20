import { readBacklogState } from "./backlog";
import {
  getAssistQuotaState,
  getMemberQuotaState,
  getWorkspaceBillingPreview,
} from "./plans";
import {
  getPersistenceConfig,
  getWorkspaceActivityMetrics,
  getWorkspaceUsageSummary,
  listDocuments,
  listWorkspaceMemberships,
  listWorkspaceRecords,
} from "./store";

export async function loadWorkspaceSummary(workspaceId: string) {
  const [workspaceRecords, activeWorkspaceMembers, workspaceActivity, workspaceUsage, documents] =
    await Promise.all([
      listWorkspaceRecords(),
      listWorkspaceMemberships(workspaceId),
      getWorkspaceActivityMetrics(workspaceId),
      getWorkspaceUsageSummary(workspaceId),
      listDocuments({ workspaceId }),
    ]);

  const activeWorkspace =
    workspaceRecords.find((workspace) => workspace.workspace_id === workspaceId) ?? {
      workspace_id: workspaceId,
      name: "SpecForge Demo Workspace",
      plan: "demo" as const,
      created_at: new Date(0).toISOString(),
    };

  return {
    workspaceRecords,
    activeWorkspace,
    activeWorkspaceMembers,
    workspaceActivity,
    workspaceUsage,
    documents,
    assistQuota: getAssistQuotaState(activeWorkspace, workspaceUsage),
    memberQuota: getMemberQuotaState(activeWorkspace, activeWorkspaceMembers.length),
    billingPreview: getWorkspaceBillingPreview(activeWorkspace, activeWorkspaceMembers.length),
  };
}

export async function loadWorkspaceEntitlements(workspaceId: string) {
  const summary = await loadWorkspaceSummary(workspaceId);

  return {
    workspace: {
      workspace_id: summary.activeWorkspace.workspace_id,
      name: summary.activeWorkspace.name,
      plan: summary.activeWorkspace.plan,
    },
    quotas: {
      assist: summary.assistQuota,
      members: summary.memberQuota,
    },
    billing: summary.billingPreview,
    usage: summary.workspaceUsage,
  };
}

export async function loadWorkspaceOpsSummary(workspaceId: string) {
  const [summary, backlogState] = await Promise.all([
    loadWorkspaceSummary(workspaceId),
    readBacklogState(),
  ]);
  const persistence = getPersistenceConfig();

  return {
    workspace: {
      workspace_id: summary.activeWorkspace.workspace_id,
      name: summary.activeWorkspace.name,
      plan: summary.activeWorkspace.plan,
    },
    persistence,
    parity: {
      active_phase: backlogState.activeSection,
      remaining_count: backlogState.remainingCount,
      review_due: backlogState.reviewDue,
    },
    counts: {
      member_count: summary.activeWorkspaceMembers.length,
      document_count: summary.documents.length,
      reviewed_document_count: summary.workspaceActivity.reviewed_document_count,
      commented_document_count: summary.workspaceActivity.commented_document_count,
      clarified_document_count: summary.workspaceActivity.clarified_document_count,
    },
    usage: summary.workspaceUsage,
    entitlements: {
      assist: summary.assistQuota,
      members: summary.memberQuota,
      billing: summary.billingPreview,
    },
  };
}
