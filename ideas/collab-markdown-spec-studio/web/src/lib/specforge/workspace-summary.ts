import { readBacklogState } from "./backlog";
import { buildBackupsPayload, buildArtifactsPayload } from "../../../../orchestrator/src/runtime.js";
import { findLatestVerification } from "../../../../orchestrator/src/loop-state.js";
import {
  getAssistQuotaState,
  getWorkspaceBillingStatus,
  getWorkspaceFeatureEntitlements,
  getMemberQuotaState,
  getWorkspaceBillingPreview,
} from "./plans";
import {
  getWorkspaceBehaviorSummary,
  getPersistenceConfig,
  getWorkspaceActivityMetrics,
  getWorkspaceUsageSummary,
  listDocuments,
  listWorkspaceMemberships,
  listWorkspaceRecords,
} from "./store";

export async function loadWorkspaceSummary(workspaceId: string) {
  const [
    workspaceRecords,
    activeWorkspaceMembers,
    workspaceActivity,
    workspaceUsage,
    workspaceBehavior,
    documents,
  ] =
    await Promise.all([
      listWorkspaceRecords(),
      listWorkspaceMemberships(workspaceId),
      getWorkspaceActivityMetrics(workspaceId),
      getWorkspaceUsageSummary(workspaceId),
      getWorkspaceBehaviorSummary(workspaceId),
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
    workspaceBehavior,
    documents,
    assistQuota: getAssistQuotaState(activeWorkspace, workspaceUsage),
    memberQuota: getMemberQuotaState(activeWorkspace, activeWorkspaceMembers.length),
    billingPreview: getWorkspaceBillingPreview(activeWorkspace, activeWorkspaceMembers.length),
    billingStatus: getWorkspaceBillingStatus(
      activeWorkspace,
      workspaceUsage,
      activeWorkspaceMembers.length,
    ),
    featureEntitlements: getWorkspaceFeatureEntitlements(activeWorkspace),
  };
}

export async function loadWorkspaceBillingSummary(workspaceId: string) {
  const summary = await loadWorkspaceSummary(workspaceId);

  return {
    workspace: {
      workspace_id: summary.activeWorkspace.workspace_id,
      name: summary.activeWorkspace.name,
      plan: summary.activeWorkspace.plan,
    },
    billing: summary.billingPreview,
    status: summary.billingStatus,
    quotas: {
      assist: summary.assistQuota,
      members: summary.memberQuota,
    },
    features: summary.featureEntitlements,
    usage: summary.workspaceUsage,
    behavior: summary.workspaceBehavior,
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
    billing_status: summary.billingStatus,
    usage: summary.workspaceUsage,
    behavior: summary.workspaceBehavior,
    features: summary.featureEntitlements,
  };
}

export async function loadWorkspaceOpsSummary(workspaceId: string) {
  const [summary, backlogState, backups, artifacts] = await Promise.all([
    loadWorkspaceSummary(workspaceId),
    readBacklogState(),
    buildBackupsPayload(),
    buildArtifactsPayload(findLatestVerification),
  ]);
  const persistence = getPersistenceConfig();
  const alerts = [
    ...(summary.billingStatus.upgradeRequired
      ? summary.billingStatus.reasons.map((reason) => ({
          level: "warning" as const,
          code: "upgrade_required",
          message: reason,
        }))
      : []),
    ...(backups.backups.length === 0
      ? [
          {
            level: "warning" as const,
            code: "missing_backup",
            message: "No local state backups have been captured yet.",
          },
        ]
      : []),
    ...(artifacts.latest_verification
      ? []
      : [
          {
            level: "warning" as const,
            code: "missing_verification",
            message: "No successful verification record is attached to the delivery loop yet.",
          },
        ]),
  ];

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
    behavior: summary.workspaceBehavior,
    backups: {
      count: backups.backups.length,
      latest: backups.backups[0] ?? null,
    },
    verification: artifacts.latest_verification ?? null,
    alerts,
    entitlements: {
      assist: summary.assistQuota,
      members: summary.memberQuota,
      billing: summary.billingPreview,
      billing_status: summary.billingStatus,
      features: summary.featureEntitlements,
    },
  };
}
