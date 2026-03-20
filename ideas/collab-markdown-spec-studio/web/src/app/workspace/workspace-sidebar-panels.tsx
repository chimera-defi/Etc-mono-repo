import Link from "next/link";

import styles from "../page.module.css";
import type { AgentAssistToolStatus } from "@/lib/specforge/agent-assist";
import type { DocumentRecord } from "@/lib/specforge/contracts";
import type { ReadinessReport } from "@/lib/specforge/readiness";
import type { WorkspaceMembershipRecord, WorkspaceRecord } from "@/lib/specforge/store";
import type { Stage } from "./stage-utils";

type WorkspaceMembersPanelProps = {
  activeWorkspace: WorkspaceRecord;
  activeWorkspaceActorId: string;
  activeWorkspaceMembers: WorkspaceMembershipRecord[];
  actorReturnTo: string;
  membershipError: string | null;
  createWorkspaceMemberAction: (formData: FormData) => Promise<void>;
  removeWorkspaceMemberAction: (formData: FormData) => Promise<void>;
};

type WorkspaceSignalsPanelProps = {
  workspaceSummary: {
    workspaceActivity: {
      document_count: number;
      reviewed_document_count: number;
      commented_document_count: number;
      clarified_document_count: number;
    };
    workspaceUsage: {
      assist_request_count: number;
      handoff_view_count: number;
      execution_view_count: number;
      launch_packet_view_count: number;
    };
    workspaceBehavior: {
      document_created_count: number;
      member_added_count: number;
      patch_decided_count: number;
    };
    designPartnerSignals: {
      activated: boolean;
      assisted: boolean;
      collaborating: boolean;
      reviewed: boolean;
      launchPrepared: boolean;
    };
    assistQuota: {
      limit: number | null;
      remaining: number | null;
    };
    memberQuota: {
      limit: number | null;
      remaining: number | null;
    };
    billingPreview: {
      estimatedMonthlyUsd: number | null;
    };
    billingStatus: {
      upgradeRequired: boolean;
      reasons: string[];
      recommendedPlan: string | null;
    };
  };
};

type DeliveryLoopPanelProps = {
  backlogState: {
    activeSection: string | null;
    deliveryTarget: string;
    remainingCount: number;
    nextItem: string | null;
    reviewEvery: number;
    reviewDue: boolean;
    latestIntent: { title: string; status: string } | null;
    latestClaim:
      | {
          claim_id: string;
          state: string;
          retry_count?: number;
          heartbeat_at: string;
          failure_summary?: string | null;
        }
      | null;
    latestSignal:
      | {
          type: string;
          intent_id: string;
          at: string;
          failure_summary?: string | null;
        }
      | null;
  };
};

type OpsPanelProps = {
  assistToolStatuses: AgentAssistToolStatus[];
};

type DocumentLibraryPanelProps = {
  documents: DocumentRecord[];
  activeStage: Stage;
  buildStageHref: (documentId: string | null, stage: Stage) => string;
};

type ReadinessPanelProps = {
  readinessReport: ReadinessReport | null;
};

export function WorkspaceMembersPanel({
  activeWorkspace,
  activeWorkspaceActorId,
  activeWorkspaceMembers,
  actorReturnTo,
  membershipError,
  createWorkspaceMemberAction,
  removeWorkspaceMemberAction,
}: WorkspaceMembersPanelProps) {
  return (
    <details className={styles.wizardSection}>
      <summary className={styles.disclosureSummary}>
        <span>Workspace members</span>
        <span>{activeWorkspaceMembers.length} listed</span>
      </summary>
      <div className={styles.disclosureBody}>
        <ul className={styles.documentList}>
          {activeWorkspaceMembers.map((member) => (
            <li key={member.membership_id} className={styles.documentItem}>
              <div>
                <strong>{member.name}</strong> <span className={styles.badge}>{member.role}</span>
                {member.github_login ? (
                  <span className={styles.mutedInline}>@{member.github_login}</span>
                ) : null}
                {member.actor_id === activeWorkspaceActorId ? (
                  <span className={styles.mutedInline}>Current session</span>
                ) : null}
              </div>
              {member.actor_id !== activeWorkspaceActorId && activeWorkspaceMembers.length > 1 ? (
                <form action={removeWorkspaceMemberAction}>
                  <input type="hidden" name="return_to" value={actorReturnTo} />
                  <input type="hidden" name="membership_id" value={member.membership_id} />
                  <button type="submit">Remove</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {membershipError ? (
          <div className={styles.actorCard}>
            <strong>Membership issue</strong>
            <span>{membershipError}</span>
          </div>
        ) : null}
        <form action={createWorkspaceMemberAction} className={styles.form}>
          <input type="hidden" name="return_to" value={actorReturnTo} />
          <label>
            Member name
            <input name="name" placeholder="Jordan Reviewer" required />
          </label>
          <label>
            Role
            <select name="role" className={styles.selectInput} defaultValue="Reviewer">
              <option value="Reviewer">Reviewer</option>
              <option value="Engineer">Engineer</option>
              <option value="Operator">Operator</option>
              <option value="Founder">Founder</option>
            </select>
          </label>
          <label>
            GitHub login
            <input
              name="github_login"
              placeholder="jordan-dev"
              required={activeWorkspace.plan === "pilot"}
            />
          </label>
          <label>
            Color
            <input name="color" type="color" defaultValue="#475569" />
          </label>
          <p className={styles.context}>
            {activeWorkspace.plan === "pilot"
              ? "Pilot invites are membership-gated. Add the teammate's GitHub login, then share the spec URL."
              : "Local demo mode can add members without GitHub-linked pilot access."}
          </p>
          <button type="submit">Add workspace member</button>
        </form>
      </div>
    </details>
  );
}

export function WorkspaceSignalsPanel({ workspaceSummary }: WorkspaceSignalsPanelProps) {
  const {
    workspaceActivity,
    workspaceUsage,
    workspaceBehavior,
    designPartnerSignals,
    assistQuota,
    memberQuota,
    billingPreview,
    billingStatus,
  } = workspaceSummary;

  return (
    <details className={styles.panel}>
      <summary className={styles.disclosureSummary}>
        <span>Pilot signals</span>
        <span>{workspaceActivity.document_count} docs tracked</span>
      </summary>
      <div className={styles.disclosureBody}>
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <strong>{workspaceActivity.document_count}</strong>
            <span>documents</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceActivity.reviewed_document_count}</strong>
            <span>reviewed</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceActivity.commented_document_count}</strong>
            <span>commented</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceActivity.clarified_document_count}</strong>
            <span>clarified</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceUsage.assist_request_count}</strong>
            <span>assist runs</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{assistQuota.limit === null ? "∞" : assistQuota.remaining}</strong>
            <span>assist remaining</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{memberQuota.limit === null ? "∞" : memberQuota.remaining}</strong>
            <span>member slots left</span>
          </div>
          <div className={styles.metricCard}>
            <strong>
              {billingPreview.estimatedMonthlyUsd === null
                ? "Free"
                : `$${billingPreview.estimatedMonthlyUsd}`}
            </strong>
            <span>monthly preview</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceUsage.handoff_view_count}</strong>
            <span>handoffs</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceUsage.execution_view_count}</strong>
            <span>execution views</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceUsage.launch_packet_view_count}</strong>
            <span>launch packets</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceBehavior.document_created_count}</strong>
            <span>specs created</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceBehavior.member_added_count}</strong>
            <span>members added</span>
          </div>
          <div className={styles.metricCard}>
            <strong>{workspaceBehavior.patch_decided_count}</strong>
            <span>patch decisions</span>
          </div>
        </div>
        <div className={styles.actorCard}>
          <strong>Design-partner funnel</strong>
          <span>Activated: {designPartnerSignals.activated ? "yes" : "no"}</span>
          <span>Assisted: {designPartnerSignals.assisted ? "yes" : "no"}</span>
          <span>Collaborating: {designPartnerSignals.collaborating ? "yes" : "no"}</span>
          <span>Reviewed: {designPartnerSignals.reviewed ? "yes" : "no"}</span>
          <span>Launch prepared: {designPartnerSignals.launchPrepared ? "yes" : "no"}</span>
        </div>
        {billingStatus.upgradeRequired ? (
          <div className={styles.actorCard}>
            <strong>Upgrade path suggested</strong>
            {billingStatus.reasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
            <span>Recommended plan: {billingStatus.recommendedPlan ?? "none"}</span>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function DeliveryLoopPanel({ backlogState }: DeliveryLoopPanelProps) {
  return (
    <details className={styles.panel}>
      <summary className={styles.disclosureSummary}>
        <span>Delivery loop</span>
        <span>{backlogState.remainingCount} remaining</span>
      </summary>
      <div className={styles.disclosureBody}>
        <div className={styles.actorCard}>
          <strong>{backlogState.activeSection ?? "Backlog clear"}</strong>
          <span>Target: {backlogState.deliveryTarget.replaceAll("_", " ")}</span>
          <span>
            {backlogState.remainingCount} remaining item
            {backlogState.remainingCount === 1 ? "" : "s"}
          </span>
          <span>{backlogState.nextItem ?? "No queued work."}</span>
          <span>
            Review cadence: every {backlogState.reviewEvery} pass
            {backlogState.reviewEvery === 1 ? "" : "es"}
            {backlogState.reviewDue ? " · review due now" : ""}
          </span>
        </div>
        {backlogState.latestIntent ? (
          <div className={styles.actorCard}>
            <strong>Latest intent</strong>
            <span>{backlogState.latestIntent.title}</span>
            <span>{backlogState.latestIntent.status}</span>
          </div>
        ) : null}
        {backlogState.latestClaim ? (
          <div className={styles.actorCard}>
            <strong>Latest claim</strong>
            <span>{backlogState.latestClaim.claim_id}</span>
            <span>{backlogState.latestClaim.state}</span>
            {typeof backlogState.latestClaim.retry_count === "number" ? (
              <span>Retry {backlogState.latestClaim.retry_count}</span>
            ) : null}
            <span>{backlogState.latestClaim.heartbeat_at}</span>
            {backlogState.latestClaim.failure_summary ? (
              <span>{backlogState.latestClaim.failure_summary}</span>
            ) : null}
          </div>
        ) : null}
        {backlogState.latestSignal ? (
          <div className={styles.actorCard}>
            <strong>Latest signal</strong>
            <span>{backlogState.latestSignal.type}</span>
            <span>{backlogState.latestSignal.intent_id}</span>
            <span>{backlogState.latestSignal.at}</span>
            {backlogState.latestSignal.failure_summary ? (
              <span>{backlogState.latestSignal.failure_summary}</span>
            ) : null}
          </div>
        ) : null}
        <div className={styles.inlineActions}>
          <Link href="/api/parity/status" className={styles.secondaryLink} target="_blank">
            Open status JSON
          </Link>
          <Link href="/api/parity/context" className={styles.secondaryLink} target="_blank">
            Open context package
          </Link>
          <Link href="/api/parity/brief" className={styles.secondaryLink} target="_blank">
            Open next-pass brief
          </Link>
        </div>
      </div>
    </details>
  );
}

export function OpsPanel({ assistToolStatuses }: OpsPanelProps) {
  return (
    <>
      <details className={styles.panel}>
        <summary className={styles.disclosureSummary}>
          <span>Ops</span>
          <span>Health and restore</span>
        </summary>
        <div className={styles.disclosureBody}>
          <div className={styles.actorCard}>
            <strong>Runtime endpoints</strong>
            <div className={styles.inlineActions}>
              <Link href="/api/health" className={styles.secondaryLink}>
                Web health
              </Link>
              <Link href="/api/ops/summary" className={styles.secondaryLink}>
                Ops summary
              </Link>
              <Link href="/api/ops/incidents" className={styles.secondaryLink}>
                Incidents
              </Link>
              <Link href="/api/ops/backups" className={styles.secondaryLink}>
                Backup index
              </Link>
              <Link href="/api/metrics" className={styles.secondaryLink}>
                Web metrics
              </Link>
              <Link href="/api/workspace/entitlements" className={styles.secondaryLink}>
                Entitlements
              </Link>
              <Link href="/api/workspace/billing" className={styles.secondaryLink}>
                Billing
              </Link>
              <Link href="/api/workspace/plans" className={styles.secondaryLink}>
                Plans
              </Link>
              <Link href="http://127.0.0.1:4322/health" className={styles.secondaryLink}>
                Collab health
              </Link>
              <Link href="http://127.0.0.1:4322/metrics" className={styles.secondaryLink}>
                Collab metrics
              </Link>
            </div>
          </div>
          <div className={styles.actorCard}>
            <strong>Local restore flow</strong>
            <span>`bun run state:backup` snapshots web, collab, and runner state.</span>
            <span>`bun run state:restore` restores the latest backup, or a specific path if supplied.</span>
          </div>
        </div>
      </details>

      <details className={styles.panel}>
        <summary className={styles.disclosureSummary}>
          <span>Agent runtimes</span>
          <span>{assistToolStatuses.filter((tool) => tool.available).length} available</span>
        </summary>
        <div className={styles.disclosureBody}>
          <ul className={styles.patchList}>
            {assistToolStatuses.map((tool) => (
              <li key={tool.id} className={styles.patchItem}>
                <strong>{tool.label}</strong>
                <span
                  className={`${styles.badge} ${tool.available ? styles.success : styles.neutral}`}
                >
                  {tool.available ? "available" : "unavailable"}
                </span>
                <span>{tool.detail}</span>
              </li>
            ))}
          </ul>
          <p className={styles.context}>
            Local mode can reuse existing Codex or Claude Code CLI logins from the server runtime.
            Hosted mode should use encrypted workspace-scoped credentials instead.
          </p>
        </div>
      </details>
    </>
  );
}

export function DocumentLibraryPanel({
  documents,
  activeStage,
  buildStageHref,
}: DocumentLibraryPanelProps) {
  return (
    <details className={styles.panel}>
      <summary className={styles.disclosureSummary}>
        <span>Document library</span>
        <span>{documents.length} total</span>
      </summary>
      <div className={styles.disclosureBody}>
        <ul className={styles.documentList} data-testid="document-list">
          {documents.map((document) => (
            <li key={document.document_id} className={styles.documentItem}>
              <Link
                href={buildStageHref(document.document_id, activeStage)}
                className={styles.documentLink}
              >
                <strong>{document.title}</strong>
                <span>{document.document_id}</span>
                <span>v{document.version}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function ReadinessPanel({ readinessReport }: ReadinessPanelProps) {
  if (!readinessReport) {
    return null;
  }

  return (
    <details className={styles.panel}>
      <summary className={styles.disclosureSummary}>
        <span>Readiness</span>
        <span>
          {readinessReport.score}/100 · {readinessReport.status}
        </span>
      </summary>
      <div className={styles.disclosureBody}>
        <div className={styles.readinessCard}>
          <strong>{readinessReport.score}/100</strong>
          <span className={styles.status}>{readinessReport.status}</span>
          <ul className={styles.readinessList}>
            {readinessReport.recap.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
