import type { WorkspaceRecord, WorkspaceUsageSummary } from "./store";

export type WorkspacePlanPolicy = {
  assistRequestLimit: number | null;
  memberLimit: number | null;
};

export type WorkspaceAssistQuota = {
  plan: WorkspaceRecord["plan"];
  limit: number | null;
  used: number;
  remaining: number | null;
  blocked: boolean;
};

const planPolicies: Record<WorkspaceRecord["plan"], WorkspacePlanPolicy> = {
  demo: {
    assistRequestLimit: 5,
    memberLimit: 8,
  },
  pilot: {
    assistRequestLimit: null,
    memberLimit: null,
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
