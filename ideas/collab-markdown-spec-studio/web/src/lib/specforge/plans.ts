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

export type WorkspaceBillingStatus = {
  plan: WorkspaceRecord["plan"];
  estimatedMonthlyUsd: number | null;
  upgradeRequired: boolean;
  recommendedPlan: WorkspaceRecord["plan"] | null;
  reasons: string[];
};

export type WorkspacePlanDefinition = {
  plan: WorkspaceRecord["plan"] | "enterprise";
  label: string;
  seatPriceMonthlyUsd: number | null;
  memberLimit: number | null;
  assistRequestLimit: number | null;
  usageModel: "included" | "metered" | "custom";
  summary: string;
  features: string[];
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

const planCatalog: WorkspacePlanDefinition[] = [
  {
    plan: "demo",
    label: "Local / OSS",
    seatPriceMonthlyUsd: null,
    memberLimit: planPolicies.demo.memberLimit,
    assistRequestLimit: planPolicies.demo.assistRequestLimit,
    usageModel: "included",
    summary: "Run SpecForge locally or self-host it for internal rehearsal.",
    features: [
      "Full workspace app + real-time collab",
      "Local admin panel",
      "Included AI assist requests",
      `Up to ${planPolicies.demo.memberLimit} collaborators`,
      "Bring your own Claude or Codex key",
    ],
  },
  {
    plan: "pilot",
    label: "Team SaaS",
    seatPriceMonthlyUsd: planPolicies.pilot.seatPriceMonthlyUsd,
    memberLimit: planPolicies.pilot.memberLimit,
    assistRequestLimit: planPolicies.pilot.assistRequestLimit,
    usageModel: "metered",
    summary: "Managed multiplayer spec workspaces for product and engineering teams.",
    features: [
      "Hosted collaboration and persistence",
      "Governed AI patch review workflow",
      "Unlimited AI assist requests",
      `$${planPolicies.pilot.seatPriceMonthlyUsd} / seat / month`,
      "Launch packet and starter handoff",
    ],
  },
  {
    plan: "enterprise",
    label: "Enterprise",
    seatPriceMonthlyUsd: null,
    memberLimit: null,
    assistRequestLimit: null,
    usageModel: "custom",
    summary: "Stronger audit, tenancy, and rollout support for larger organizations.",
    features: [
      "Advanced retention and governance",
      "SSO / compliance roadmap",
      "Dedicated support and rollout help",
    ],
  },
];

export function listWorkspacePlans() {
  return planCatalog;
}

export function getWorkspacePlanDefinition(
  plan: WorkspacePlanDefinition["plan"],
): WorkspacePlanDefinition | null {
  return planCatalog.find((entry) => entry.plan === plan) ?? null;
}

export function formatWorkspacePlanSeatPrice(
  plan: Pick<WorkspacePlanDefinition, "plan" | "seatPriceMonthlyUsd">,
) {
  if (plan.seatPriceMonthlyUsd === null) {
    return plan.plan === "demo" ? "Free" : "Custom";
  }

  return `$${plan.seatPriceMonthlyUsd}`;
}

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

export function getWorkspaceBillingStatus(
  workspace: Pick<WorkspaceRecord, "plan">,
  usage: Pick<WorkspaceUsageSummary, "assist_request_count">,
  memberCount: number,
): WorkspaceBillingStatus {
  const assistQuota = getAssistQuotaState(workspace, usage);
  const memberQuota = getMemberQuotaState(workspace, memberCount);
  const billingPreview = getWorkspaceBillingPreview(workspace, memberCount);
  const reasons: string[] = [];

  if (assistQuota.blocked) {
    reasons.push("Assist quota exhausted");
  }
  if (memberQuota.blocked) {
    reasons.push("Member limit reached");
  }

  return {
    plan: workspace.plan,
    estimatedMonthlyUsd: billingPreview.estimatedMonthlyUsd,
    upgradeRequired: reasons.length > 0,
    recommendedPlan: reasons.length > 0 ? "pilot" : null,
    reasons,
  };
}
