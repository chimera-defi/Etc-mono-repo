import type { WorkspaceRecord, WorkspaceUsageSummary } from "./store";

export type WorkspacePlanPolicy = {
  assistRequestLimit: number | null;
  memberLimit: number | null;
  seatPriceMonthlyUsd: number | null;
};

export type WorkspaceAssistQuota = {
  plan: WorkspaceRecord["plan"];
  limit: number | null;
  used: number;
  remaining: number | null;
  blocked: boolean;
};

export type WorkspaceMemberQuota = {
  plan: WorkspaceRecord["plan"];
  limit: number | null;
  used: number;
  remaining: number | null;
  blocked: boolean;
};

export type WorkspaceBillingPreview = {
  plan: WorkspaceRecord["plan"];
  seatPriceMonthlyUsd: number | null;
  billableSeats: number;
  estimatedMonthlyUsd: number | null;
};

export type WorkspaceFeatureEntitlements = {
  plan: WorkspaceRecord["plan"];
  features: {
    githubAuth: boolean;
    localCliAssist: boolean;
    unlimitedAssist: boolean;
    memberInvites: boolean;
    opsSummary: boolean;
    backupRestore: boolean;
  };
};

const planPolicies: Record<WorkspaceRecord["plan"], WorkspacePlanPolicy> = {
  demo: {
    assistRequestLimit: 5,
    memberLimit: 8,
    seatPriceMonthlyUsd: null,
  },
  pilot: {
    assistRequestLimit: null,
    memberLimit: null,
    seatPriceMonthlyUsd: 24,
  },
};

export function getWorkspacePlanPolicy(plan: WorkspaceRecord["plan"]): WorkspacePlanPolicy {
  return planPolicies[plan];
}

export function getAssistQuotaState(
  workspace: Pick<WorkspaceRecord, "plan">,
  usage: Pick<WorkspaceUsageSummary, "assist_request_count">,
): WorkspaceAssistQuota {
  const policy = getWorkspacePlanPolicy(workspace.plan);
  const used = usage.assist_request_count;
  const limit = policy.assistRequestLimit;
  const remaining = limit === null ? null : Math.max(limit - used, 0);

  return {
    plan: workspace.plan,
    limit,
    used,
    remaining,
    blocked: limit !== null && used >= limit,
  };
}

export function getMemberQuotaState(
  workspace: Pick<WorkspaceRecord, "plan">,
  memberCount: number,
): WorkspaceMemberQuota {
  const policy = getWorkspacePlanPolicy(workspace.plan);
  const limit = policy.memberLimit;
  const remaining = limit === null ? null : Math.max(limit - memberCount, 0);

  return {
    plan: workspace.plan,
    limit,
    used: memberCount,
    remaining,
    blocked: limit !== null && memberCount >= limit,
  };
}

export function getWorkspaceBillingPreview(
  workspace: Pick<WorkspaceRecord, "plan">,
  memberCount: number,
): WorkspaceBillingPreview {
  const policy = getWorkspacePlanPolicy(workspace.plan);
  const seatPriceMonthlyUsd = policy.seatPriceMonthlyUsd;
  const billableSeats = Math.max(memberCount, 0);

  return {
    plan: workspace.plan,
    seatPriceMonthlyUsd,
    billableSeats,
    estimatedMonthlyUsd:
      seatPriceMonthlyUsd === null ? null : seatPriceMonthlyUsd * billableSeats,
  };
}

export function getWorkspaceFeatureEntitlements(
  workspace: Pick<WorkspaceRecord, "plan">,
): WorkspaceFeatureEntitlements {
  const isPilot = workspace.plan === "pilot";

  return {
    plan: workspace.plan,
    features: {
      githubAuth: isPilot,
      localCliAssist: true,
      unlimitedAssist: isPilot,
      memberInvites: true,
      opsSummary: true,
      backupRestore: true,
    },
  };
}
