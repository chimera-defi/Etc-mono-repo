import Link from "next/link";
import { headers } from "next/headers";

import {
  answerClarificationAction,
  createCommentThreadAction,
  createClarificationAction,
  createDocumentAction,
  createWorkspaceMemberAction,
  createPatchAction,
  decidePatchAction,
  resolveCommentThreadAction,
  setAssistRuntimePreferenceAction,
  setWorkspacePlanAction,
  switchWorkspaceActorAction,
} from "../actions";
import { DocumentWorkspace } from "../document-workspace";
import { GuidedDraftBuilder } from "../guided-draft-builder";
import { LocalAdminPanel } from "../local-admin-panel";
import { ShareDocumentPanel } from "../share-document-panel";
import styles from "../page.module.css";
import { getAgentAssistToolStatuses } from "@/lib/specforge/agent-assist";
import { readBacklogState } from "@/lib/specforge/backlog";
import {
  getCurrentWorkspaceSession,
  getPreferredAssistTool,
  isGitHubAuthConfigured,
  listWorkspaceActors,
} from "@/lib/specforge/session";
import {
  listTemplates,
  resolveStarterTemplateId,
  type StarterTemplateId,
} from "@/lib/specforge/handoff";
import { heroVariantOrder, heroVariants, type HeroVariant } from "@/lib/specforge/marketing";
import { listShowcaseExamples } from "@/lib/specforge/showcase";
import {
  buildGuidedSteps,
  type GuidedStep,
  loadActiveWorkspaceDocumentState,
} from "@/lib/specforge/workspace-document-state";
import { loadWorkspaceSummary } from "@/lib/specforge/workspace-summary";

export const dynamic = "force-dynamic";

type Stage = "start" | "draft" | "review" | "decide" | "export";

type Props = {
  searchParams?: Promise<{
    document?: string;
    stage?: string;
    variant?: string;
    template?: string;
    membership_error?: string;
  }>;
};

const stageOrder: Stage[] = ["start", "draft", "review", "decide", "export"];

function getPatchRiskLabel(patchType: string) {
  switch (patchType) {
    case "requirement_change":
      return "high impact";
    case "task_export_change":
      return "handoff risk";
    case "structural_edit":
      return "medium impact";
    default:
      return "low impact";
  }
}

function getPatchStatusTone(status: string) {
  switch (status) {
    case "accepted":
    case "cherry_picked":
      return "success";
    case "rejected":
      return "danger";
    case "stale":
      return "warning";
    default:
      return "neutral";
  }
}

function renderDiffLines(before: string, after: string) {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const maxLength = Math.max(beforeLines.length, afterLines.length);

  return Array.from({ length: maxLength }, (_, index) => {
    const previous = beforeLines[index] ?? "";
    const next = afterLines[index] ?? "";

    if (previous === next) {
      return { key: `same-${index}`, before: previous, after: next, tone: "same" };
    }

    return {
      key: `change-${index}`,
      before: previous,
      after: next,
      tone: "changed",
    };
  });
}

function buildStageHref(documentId: string | null, stage: Stage) {
  const params = new URLSearchParams();
  if (documentId) {
    params.set("document", documentId);
  }
  params.set("stage", stage);
  return `/workspace?${params.toString()}`;
}

function buildTemplateHref(documentId: string | null, stage: Stage, templateId: StarterTemplateId) {
  const params = new URLSearchParams();
  if (documentId) {
    params.set("document", documentId);
  }
  params.set("stage", stage);
  params.set("template", templateId);
  return `/workspace?${params.toString()}`;
}

function getAppOrigin(headerList: Headers) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "127.0.0.1:3000";
  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}`;
}

function getStageMeta(stage: Stage) {
  switch (stage) {
    case "start":
      return {
        title: "Start the spec",
        description: "Choose an existing draft or create a fresh document to work on.",
      };
    case "draft":
      return {
        title: "Draft on the canvas",
        description: "Use the shared editor as the canonical source of truth.",
      };
    case "review":
      return {
        title: "Prepare review work",
        description: "Open comments, inspect activity, and queue targeted patch proposals.",
      };
    case "decide":
      return {
        title: "Resolve proposed changes",
        description: "Make human decisions on the patch queue and keep an audit trail.",
      };
    case "export":
      return {
        title: "Launch the build handoff",
        description:
          "Check readiness, inspect the starter output, and package one-shot build context.",
      };
  }
}

export default async function Home({ searchParams }: Props) {
  const headerList = await headers();
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedDocumentId =
    typeof resolvedSearchParams.document === "string"
      ? resolvedSearchParams.document
      : undefined;
  const requestedStage =
    typeof resolvedSearchParams.stage === "string" &&
    stageOrder.includes(resolvedSearchParams.stage as Stage)
      ? (resolvedSearchParams.stage as Stage)
      : undefined;
  const heroVariant =
    typeof resolvedSearchParams.variant === "string" &&
    heroVariantOrder.includes(resolvedSearchParams.variant as HeroVariant)
      ? (resolvedSearchParams.variant as HeroVariant)
      : "handoff";
  const heroCopy = heroVariants[heroVariant];
  const membershipError =
    resolvedSearchParams.membership_error === "limit"
      ? "This workspace has reached its current member limit."
      : null;
  const availableTemplates = listTemplates();
  const selectedTemplateId = resolveStarterTemplateId(
    typeof resolvedSearchParams.template === "string"
      ? resolvedSearchParams.template
      : undefined,
  );
  const workspaceActors = await listWorkspaceActors();
  const activeWorkspaceSession = await getCurrentWorkspaceSession();
  const preferredAssistTool = await getPreferredAssistTool();
  const activeWorkspaceActor = activeWorkspaceSession.actor;
  const githubAuthConfigured = isGitHubAuthConfigured();
  const backlogState = await readBacklogState();
  const [workspaceSummary, assistToolStatuses] =
    await Promise.all([
      loadWorkspaceSummary(activeWorkspaceActor.workspace_id),
      getAgentAssistToolStatuses(),
    ]);
  const {
    workspaceRecords,
    activeWorkspace,
    activeWorkspaceMembers,
    workspaceActivity,
    workspaceUsage,
    documents,
    assistQuota,
    memberQuota,
    billingPreview,
  } = workspaceSummary;
  const [showcaseExamples, activeDocumentState] = await Promise.all([
    listShowcaseExamples(),
    loadActiveWorkspaceDocumentState({
      documents,
      requestedDocumentId,
      workspaceId: activeWorkspaceActor.workspace_id,
      templateId: selectedTemplateId,
    }),
  ]);
  const {
    activeDocumentId,
    activeDocument,
    patches,
    commentThreads,
    clarifications,
    exportBundle,
    readinessReport,
    handoffBundle,
    executionBrief,
    launchPacket,
    auditEvents,
    activeBlock,
    showcaseSourceId,
    showcaseSourcePath,
    blockSummaries,
    agentProposedPatches,
    approvedAgentPatches,
    humanComments,
    actionablePatches,
    resolvedPatches,
  } = activeDocumentState;
  const guidedSteps = buildGuidedSteps({
    hasDocument: Boolean(activeDocument),
    hasDraft: Boolean(activeDocument?.markdown.trim()),
    hasPatches: patches.length > 0,
    hasOpenComments: commentThreads.some((thread) => thread.status === "open"),
    hasPendingPatches: patches.some((patch) => ["proposed", "stale"].includes(patch.status)),
    isReadyToExport: Boolean(readinessReport && readinessReport.score >= 70),
  });
  const activeStage =
    requestedStage ?? (activeDocument ? "draft" : "start");
  const stageMeta = getStageMeta(activeStage);
  const actorReturnTo = buildStageHref(activeDocument?.document_id ?? null, activeStage);
  const sharePath = buildStageHref(activeDocument?.document_id ?? null, activeDocument ? activeStage : "start");
  const shareUrl = `${getAppOrigin(headerList)}${sharePath}`;

  return (
    <div className={styles.shell}>
      <div className={styles.brandBar}>
        <div>
          <span className={styles.brandMark}>SpecForge</span>
          <p className={styles.brandTagline}>{heroCopy.tagline ?? heroCopy.eyebrow}</p>
        </div>
      </div>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{heroCopy.eyebrow}</p>
          <h1>{heroCopy.headline}</h1>
          <p className={styles.subhead}>{heroCopy.subhead}</p>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>{documents.length}</strong>
            <span>documents</span>
          </div>
          <div>
            <strong>{patches.length}</strong>
            <span>patches</span>
          </div>
        </div>
      </header>

      <main className={styles.focusLayout}>
        <aside className={styles.focusSidebar}>
          <details className={styles.panel} open>
            <summary className={styles.disclosureSummary}>
              <span>Workspace session</span>
              <span>
                {activeWorkspaceSession.authMode === "github"
                  ? "Pilot auth"
                  : activeWorkspaceSession.authMode === "unauthenticated"
                    ? "Not signed in"
                    : "Local demo"}
              </span>
            </summary>
            <div className={styles.disclosureBody}>
              {activeWorkspaceSession.authMode === "unauthenticated" ? (
                <div className={styles.actorCard}>
                  <strong>Sign in to continue</strong>
                  <span>GitHub authentication is required to access this workspace.</span>
                  <div className={styles.inlineActions}>
                    <Link href="/api/auth/login" className={styles.exportLink}>
                      Sign in with GitHub
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.actorCard}>
                    <strong>{activeWorkspaceActor.name}</strong>
                    <span>{activeWorkspaceActor.role}</span>
                    <span>{activeWorkspaceActor.actor_id}</span>
                    {activeWorkspaceSession.githubLogin ? (
                      <span>GitHub: @{activeWorkspaceSession.githubLogin}</span>
                    ) : null}
                  </div>
                  <div className={styles.actorCard}>
                    <strong>{activeWorkspace.name}</strong>
                    <span>{activeWorkspace.plan} workspace</span>
                    <span>
                      Members:{" "}
                      {memberQuota.limit === null
                        ? activeWorkspaceMembers.length
                        : `${activeWorkspaceMembers.length}/${memberQuota.limit}`}
                    </span>
                    <span>{documents.length} visible documents</span>
                    <span>
                      Assist quota:{" "}
                      {activeWorkspaceSession.authMode === "local"
                        ? "local demo bypass"
                        : assistQuota.limit === null
                        ? "unlimited"
                        : `${assistQuota.used}/${assistQuota.limit} used`}
                    </span>
                    <span>
                      Assist runtime:{" "}
                      {preferredAssistTool === "auto"
                        ? "auto-select"
                        : preferredAssistTool.replaceAll("_", " ")}
                    </span>
                  </div>
                  <details className={styles.wizardSection}>
                    <summary className={styles.disclosureSummary}>
                      <span>Assist runtime</span>
                      <span>
                        {preferredAssistTool === "auto"
                          ? "auto-select"
                          : preferredAssistTool.replaceAll("_", " ")}
                      </span>
                    </summary>
                    <div className={styles.disclosureBody}>
                      <p className={styles.context}>
                        Local testing can reuse whichever CLI you are already logged into. Save a
                        default runtime here and the guided draft builder will start with that
                        choice instead of resetting to auto every time.
                      </p>
                      <form action={setAssistRuntimePreferenceAction} className={styles.form}>
                        <input type="hidden" name="return_to" value={actorReturnTo} />
                        <label>
                          Preferred assist runtime
                          <select
                            name="assist_tool"
                            className={styles.selectInput}
                            defaultValue={preferredAssistTool}
                          >
                            <option value="auto">Auto-select the best local assist</option>
                            <option value="codex_cli">Codex CLI</option>
                            <option value="claude_cli">Claude Code CLI</option>
                            <option value="heuristic">Built-in fallback</option>
                          </select>
                        </label>
                        <button type="submit">Save assist preference</button>
                      </form>
                    </div>
                  </details>
                  <details className={styles.wizardSection}>
                    <summary className={styles.disclosureSummary}>
                      <span>Workspace plan</span>
                      <span>{activeWorkspace.plan}</span>
                    </summary>
                    <div className={styles.disclosureBody}>
                      <p className={styles.context}>
                        Switch between demo and pilot locally so you can rehearse quotas, member
                        limits, and billing preview without editing the store by hand.
                      </p>
                      <form action={setWorkspacePlanAction} className={styles.form}>
                        <input type="hidden" name="return_to" value={actorReturnTo} />
                        <label>
                          Current plan
                          <select
                            name="plan"
                            className={styles.selectInput}
                            defaultValue={activeWorkspace.plan}
                          >
                            <option value="demo">Demo</option>
                            <option value="pilot">Pilot</option>
                          </select>
                        </label>
                        <button type="submit">Save workspace plan</button>
                      </form>
                    </div>
                  </details>
                  <details className={styles.wizardSection}>
                    <summary className={styles.disclosureSummary}>
                      <span>Share current spec</span>
                      <span>{activeDocument ? "Copy URL" : "Workspace link"}</span>
                    </summary>
                    <ShareDocumentPanel
                      shareUrl={shareUrl}
                      documentTitle={activeDocument?.title ?? null}
                      workspaceName={activeWorkspace.name}
                      requiresMembership={activeWorkspaceSession.authMode !== "local"}
                    />
                  </details>
                  <details className={styles.wizardSection}>
                    <summary className={styles.disclosureSummary}>
                      <span>Workspace members</span>
                      <span>{activeWorkspaceMembers.length} listed</span>
                    </summary>
                    <div className={styles.disclosureBody}>
                      <ul className={styles.documentList}>
                        {activeWorkspaceMembers.map((member) => (
                          <li key={member.membership_id} className={styles.documentItem}>
                            <span>
                              <strong>{member.name}</strong>{" "}
                              <span className={styles.badge}>{member.role}</span>
                              {member.github_login ? (
                                <span className={styles.mutedInline}>@{member.github_login}</span>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {membershipError ? (
                        <div className={styles.actorCard}>
                          <strong>Membership limit reached</strong>
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
                          <input name="role" placeholder="Reviewer" required />
                        </label>
                        <label>
                          GitHub login
                          <input name="github_login" placeholder="jordan-dev" />
                        </label>
                        <label>
                          Color
                          <input name="color" type="color" defaultValue="#475569" />
                        </label>
                        <button type="submit">Add workspace member</button>
                      </form>
                    </div>
                  </details>
                  {workspaceRecords.length > 1 ? (
                    <details className={styles.wizardSection}>
                      <summary className={styles.disclosureSummary}>
                        <span>Switch workspace</span>
                        <span>{workspaceRecords.length} available</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <ul className={styles.documentList}>
                          {workspaceRecords.map((ws) => (
                            <li key={ws.workspace_id} className={styles.documentItem}>
                              <span>
                                <strong>{ws.name}</strong>{" "}
                                <span className={styles.badge}>{ws.plan}</span>
                                {ws.workspace_id === activeWorkspace.workspace_id ? (
                                  <span className={styles.badge}>current</span>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ) : null}
                  {githubAuthConfigured ? (
                    <div className={styles.inlineActions}>
                      {activeWorkspaceSession.authMode === "github" ? (
                        <Link href="/api/auth/logout" className={styles.secondaryLink}>
                          Log out
                        </Link>
                      ) : (
                        <Link href="/api/auth/login" className={styles.secondaryLink}>
                          Sign in with GitHub
                        </Link>
                      )}
                    </div>
                  ) : (
                    <form action={switchWorkspaceActorAction} className={styles.form}>
                      <input type="hidden" name="return_to" value={actorReturnTo} />
                      <label>
                        Active role
                        <select
                          name="actor_id"
                          className={styles.selectInput}
                          defaultValue={activeWorkspaceActor.actor_id}
                        >
                          {workspaceActors.map((actor) => (
                            <option key={actor.actor_id} value={actor.actor_id}>
                              {actor.name} · {actor.role}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit">Switch local actor</button>
                    </form>
                  )}
                </>
              )}
            </div>
          </details>

          <LocalAdminPanel
            authMode={activeWorkspaceSession.authMode}
            activeDocumentId={activeDocument?.document_id ?? null}
          />

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
                  <strong>
                    {assistQuota.limit === null ? "∞" : assistQuota.remaining}
                  </strong>
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
              </div>
            </div>
          </details>

          <details className={styles.panel} open>
            <summary className={styles.disclosureSummary}>
              <span>Workflow</span>
              <span>Guided path</span>
            </summary>
            <div className={styles.disclosureBody}>
              <nav className={styles.stepGrid}>
                {guidedSteps.map((step, index) => (
                  <Link
                    key={step.id}
                    href={buildStageHref(activeDocument?.document_id ?? null, step.stage)}
                    className={`${styles.stepCard} ${styles[step.status]}`}
                  >
                    <span className={styles.stepNumber}>Step {index + 1}</span>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </Link>
                ))}
              </nav>
            </div>
          </details>

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
                  <Link href="/api/ops/backups" className={styles.secondaryLink}>
                    Backup index
                  </Link>
                  <Link href="/api/metrics" className={styles.secondaryLink}>
                    Web metrics
                  </Link>
                  <Link href="/api/workspace/entitlements" className={styles.secondaryLink}>
                    Entitlements
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
                    <span className={`${styles.badge} ${tool.available ? styles.success : styles.neutral}`}>
                      {tool.available ? "available" : "unavailable"}
                    </span>
                    <span>{tool.detail}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.context}>
                Local mode can reuse existing Codex or Claude Code CLI logins from the server
                runtime. Hosted mode should use encrypted workspace-scoped credentials instead.
              </p>
            </div>
          </details>

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

          {readinessReport ? (
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
          ) : null}
        </aside>

        <section className={styles.focusMain}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>{stageMeta.title}</h2>
              <span>{activeDocument ? activeDocument.title : "No active document"}</span>
            </div>
            <p className={styles.stageDescription}>{stageMeta.description}</p>
          </section>

          {activeStage === "start" ? (
            <>
              <section className={styles.panel} id="create-document">
                <div className={styles.panelHeader}>
                  <h2>Guided spec creation</h2>
                  <span>Structured draft with assist</span>
                </div>
                <GuidedDraftBuilder
                  toolStatuses={assistToolStatuses}
                  cliAssistEnabled={activeWorkspaceSession.authMode === "local"}
                  preferredTool={preferredAssistTool}
                />
              </section>

              {showcaseExamples.length > 0 ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Canonical showcase</h2>
                    <span>Import from ideas/</span>
                  </div>
                  <div className={styles.showcaseList}>
                    {showcaseExamples.map((example) => (
                      <article key={example.id} className={styles.showcaseCard}>
                        <div className={styles.patchHeader}>
                          <strong>{example.title}</strong>
                          <span className={styles.badge}>{example.id}</span>
                        </div>
                        <p className={styles.context}>{example.summary}</p>
                        <ul className={styles.readinessList}>
                          <li>{example.highlight}</li>
                          <li>{example.nextAction}</li>
                          <li>
                            Source pack: <code>{example.pathLabel}</code>
                          </li>
                        </ul>
                        <form action={createDocumentAction} className={styles.inlineForm}>
                          <input type="hidden" name="mode" value="example" />
                          <input type="hidden" name="example_id" value={example.id} />
                          <input type="hidden" name="title" value={example.title} />
                          <button type="submit">Import showcase draft</button>
                        </form>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeDocument ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Current draft</h2>
                    <span>Continue where you left off</span>
                  </div>
                  <p className={styles.context}>
                    Active document: <strong>{activeDocument.title}</strong>
                  </p>
                  <div className={styles.inlineActions}>
                    <Link
                      href={buildStageHref(activeDocument.document_id, "draft")}
                      className={styles.exportLink}
                    >
                      Open draft workspace
                    </Link>
                    <Link
                      href={buildStageHref(activeDocument.document_id, "review")}
                      className={styles.secondaryLink}
                    >
                      Jump to review prep
                    </Link>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {activeStage === "draft" ? (
            <section className={`${styles.panel} ${styles.editorPanel}`} id="document-workspace">
              <div className={styles.panelHeader}>
                <h2>Document workspace</h2>
                <span>Tiptap-backed local editor</span>
              </div>
              {activeDocument ? (
                <DocumentWorkspace
                  key={`${activeDocument.document_id}:${activeDocument.version}`}
                  document={activeDocument}
                  activeActor={activeWorkspaceActor}
                  blockSummaries={blockSummaries}
                />
              ) : (
                <p className={styles.empty}>Create a document first.</p>
              )}
            </section>
          ) : null}

          {activeStage === "review" ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Review inbox</h2>
                  <span>What needs attention now</span>
                </div>
                <ul className={styles.readinessList}>
                  <li>{patches.filter((patch) => ["proposed", "stale"].includes(patch.status)).length} patches need a human decision.</li>
                  <li>{commentThreads.filter((thread) => thread.status === "open").length} comment threads are still open.</li>
                  <li>{clarifications.filter((item) => item.status === "open").length} clarifications still need answers.</li>
                  <li>{blockSummaries.filter((block) => block.pendingPatches + block.openComments > 0).length} blocks have active review work.</li>
                </ul>
                {activeDocument ? (
                  <div className={styles.inlineActions}>
                    <Link
                      href={buildStageHref(activeDocument.document_id, "decide")}
                      className={styles.exportLink}
                    >
                      Open decision queue
                    </Link>
                  </div>
                ) : null}
              </section>

              <details className={styles.panel} open id="patch-proposal">
                <summary className={styles.disclosureSummary}>
                  <span>Queue a patch</span>
                  <span>Against any block</span>
                </summary>
                <div className={styles.disclosureBody}>
                  {activeDocument && activeBlock ? (
                    <form
                      action={createPatchAction}
                      className={styles.form}
                      data-testid="patch-proposal-form"
                    >
                      <input type="hidden" name="document_id" value={activeDocument.document_id} />
                      <input type="hidden" name="base_version" value={activeDocument.version} />
                      <p className={styles.context}>
                        Default target: <code>{activeBlock.block_id}</code> in{" "}
                        <code>{activeDocument.title}</code>
                      </p>
                      <label>
                        Target block
                        <select
                          name="target_descriptor"
                          className={styles.selectInput}
                          defaultValue={`${activeBlock.block_id}||${activeBlock.section_id}||${activeBlock.target_fingerprint}`}
                          data-testid="patch-target-select"
                        >
                          {activeDocument.blocks.map((block) => (
                            <option
                              key={block.block_id}
                              value={`${block.block_id}||${block.section_id}||${block.target_fingerprint}`}
                            >
                              {block.heading} · {block.block_id}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Patch type
                        <select
                          name="patch_type"
                          className={styles.selectInput}
                          defaultValue="requirement_change"
                          data-testid="patch-type-select"
                        >
                          <option value="requirement_change">Requirement change</option>
                          <option value="structural_edit">Structural edit</option>
                          <option value="task_export_change">Task/export change</option>
                          <option value="wording_formatting">Wording / formatting</option>
                        </select>
                      </label>
                      <label>
                        Replacement content
                        <textarea
                          name="content"
                          rows={6}
                          defaultValue={`${activeBlock.content}\n\n- Added from the SpecForge review workspace.`}
                          data-testid="patch-content-input"
                        />
                      </label>
                      <button type="submit">Queue patch</button>
                    </form>
                  ) : (
                    <p className={styles.empty}>Create a document first.</p>
                  )}
                </div>
              </details>

              <details className={styles.panel} open={commentThreads.some((thread) => thread.status === "open")} id="comments">
                <summary className={styles.disclosureSummary}>
                  <span>Comments</span>
                  <span>{commentThreads.filter((thread) => thread.status === "open").length} open</span>
                </summary>
                <div className={styles.disclosureBody}>
                  {activeDocument ? (
                    <div className={styles.commentPanel}>
                      <form action={createCommentThreadAction} className={styles.form}>
                        <input type="hidden" name="document_id" value={activeDocument.document_id} />
                        <label>
                          Block
                          <select
                            name="block_id"
                            className={styles.selectInput}
                            defaultValue={activeBlock?.block_id}
                          >
                            {activeDocument.blocks.map((block) => (
                              <option key={block.block_id} value={block.block_id}>
                                {block.heading} · {block.block_id}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Comment
                          <textarea
                            name="body"
                            rows={4}
                            placeholder="Call out ambiguity, risk, or missing detail."
                          />
                        </label>
                        <button type="submit">Add comment</button>
                      </form>
                      <ul className={styles.patchList}>
                        {commentThreads.map((thread) => (
                          <li key={thread.thread_id} className={styles.patchItem}>
                            <strong>{thread.block_id}</strong>
                            <span>{thread.status}</span>
                            <span>{thread.body}</span>
                            {thread.status === "open" ? (
                              <form action={resolveCommentThreadAction}>
                                <input type="hidden" name="document_id" value={thread.document_id} />
                                <input type="hidden" name="thread_id" value={thread.thread_id} />
                                <button type="submit">Resolve</button>
                              </form>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={styles.empty}>Create a document first.</p>
                  )}
                </div>
              </details>

              <details
                className={styles.panel}
                open={clarifications.some((item) => item.status === "open")}
                id="clarifications"
              >
                <summary className={styles.disclosureSummary}>
                  <span>Clarifications</span>
                  <span>{clarifications.filter((item) => item.status === "open").length} open</span>
                </summary>
                <div className={styles.disclosureBody}>
                  {activeDocument ? (
                    <div className={styles.commentPanel}>
                      <form action={createClarificationAction} className={styles.form}>
                        <input type="hidden" name="document_id" value={activeDocument.document_id} />
                        <label>
                          Section
                          <select name="section_heading" className={styles.selectInput} defaultValue={activeBlock?.heading}>
                            {activeDocument.sections.map((section) => (
                              <option key={section.section_id} value={section.heading}>
                                {section.heading}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Question
                          <textarea
                            name="question"
                            rows={3}
                            placeholder="Ask for the missing detail that blocks a clean handoff."
                          />
                        </label>
                        <button type="submit">Queue clarification</button>
                      </form>
                      <ul className={styles.patchList}>
                        {clarifications.map((item) => (
                          <li key={item.clarification_id} className={styles.patchItem}>
                            <strong>{item.section_heading}</strong>
                            <span>{item.status}</span>
                            <span>{item.question}</span>
                            {item.status === "open" ? (
                              <form action={answerClarificationAction} className={styles.form}>
                                <input type="hidden" name="document_id" value={item.document_id} />
                                <input type="hidden" name="clarification_id" value={item.clarification_id} />
                                <label>
                                  Answer
                                  <textarea name="answer" rows={3} placeholder="Write the accepted clarification into the spec." />
                                </label>
                                <button type="submit">Answer and write back</button>
                              </form>
                            ) : (
                              <span>{item.answer_text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={styles.empty}>Create a document first.</p>
                  )}
                </div>
              </details>

              <details className={styles.panel}>
                <summary className={styles.disclosureSummary}>
                  <span>Block activity</span>
                  <span>{blockSummaries.length} tracked blocks</span>
                </summary>
                <div className={styles.disclosureBody}>
                  {activeDocument ? (
                    <ul className={styles.blockSummaryList}>
                      {blockSummaries.map((block) => (
                        <li key={block.block_id} className={styles.blockSummaryItem}>
                          <div className={styles.patchHeader}>
                            <strong>{block.heading}</strong>
                            <span className={styles.badge}>{block.block_id}</span>
                          </div>
                          <div className={styles.blockSummaryMeta}>
                            <span
                              className={`${styles.badge} ${
                                block.pendingPatches > 0 ? styles.warning : styles.neutral
                              }`}
                            >
                              {block.pendingPatches} pending patches
                            </span>
                            <span
                              className={`${styles.badge} ${
                                block.openComments > 0 ? styles.warning : styles.neutral
                              }`}
                            >
                              {block.openComments} open comments
                            </span>
                          </div>
                          <span className={styles.blockSummaryActors}>
                            {block.touchedBy.length > 0
                              ? `Touched by ${block.touchedBy.join(", ")}`
                              : "No review activity yet."}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>Create a document first.</p>
                  )}
                </div>
              </details>
            </>
          ) : null}

          {activeStage === "decide" ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Decision queue</h2>
                  <span>Human approvals</span>
                </div>
                <ul className={styles.readinessList}>
                  <li>{actionablePatches.length} patches need a decision now.</li>
                  <li>{resolvedPatches.length} patches are already resolved.</li>
                  <li>{commentThreads.filter((thread) => thread.status === "open").length} open comments may still affect decisions.</li>
                  <li>{clarifications.filter((item) => item.status === "open").length} unanswered clarifications still block clean handoff.</li>
                </ul>
                {activeDocument ? (
                  <div className={styles.inlineActions}>
                    <Link
                      href={buildStageHref(activeDocument.document_id, "review")}
                      className={styles.secondaryLink}
                    >
                      Back to review prep
                    </Link>
                    <Link
                      href={buildStageHref(activeDocument.document_id, "export")}
                      className={styles.exportLink}
                    >
                      Continue to handoff
                    </Link>
                  </div>
                ) : null}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Actionable patches</h2>
                  <span>Resolve these first</span>
                </div>
                <ul className={styles.patchList} data-testid="patch-queue">
                  {actionablePatches.map((patch) => {
                    const targetBlock =
                      activeDocument?.blocks.find((block) => block.block_id === patch.block_id) ??
                      null;
                    const originalContent = targetBlock?.content ?? "";
                    const reviewedContent = patch.content ?? "";
                    const diffLines = renderDiffLines(originalContent, reviewedContent);

                    return (
                      <li key={patch.patch_id} className={styles.patchItem}>
                        <details open>
                          <summary className={styles.disclosureSummary}>
                            <span>{patch.patch_type}</span>
                            <span>{patch.patch_id}</span>
                          </summary>
                          <div className={styles.disclosureBody}>
                            <div className={styles.patchHeader}>
                              <span>
                                {patch.proposed_by.actor_type}:{patch.proposed_by.actor_id} on{" "}
                                <code>{patch.block_id}</code>
                              </span>
                              <div className={styles.patchMeta}>
                                <span
                                  className={`${styles.badge} ${styles[getPatchStatusTone(patch.status)]}`}
                                >
                                  {patch.status}
                                </span>
                                <span className={styles.badge}>
                                  {getPatchRiskLabel(patch.patch_type)}
                                </span>
                              </div>
                            </div>
                            <span>
                              base v{patch.base_version}
                              {patch.confidence
                                ? ` · confidence ${Math.round(patch.confidence * 100)}%`
                                : ""}
                            </span>
                            <div className={styles.diffGrid}>
                              <article className={styles.diffCard}>
                                <h3>Current block</h3>
                                <div className={styles.diffBody}>
                                  {diffLines.map((line) => (
                                    <div
                                      key={`${patch.patch_id}-before-${line.key}`}
                                      className={`${styles.diffLine} ${
                                        line.tone === "changed" ? styles.diffRemoved : ""
                                      }`}
                                    >
                                      <span className={styles.diffMarker}>
                                        {line.tone === "changed" ? "-" : " "}
                                      </span>
                                      <code>{line.before || " "}</code>
                                    </div>
                                  ))}
                                </div>
                              </article>
                              <article className={styles.diffCard}>
                                <h3>Proposed block</h3>
                                <div className={styles.diffBody}>
                                  {diffLines.map((line) => (
                                    <div
                                      key={`${patch.patch_id}-after-${line.key}`}
                                      className={`${styles.diffLine} ${
                                        line.tone === "changed" ? styles.diffAdded : ""
                                      }`}
                                    >
                                      <span className={styles.diffMarker}>
                                        {line.tone === "changed" ? "+" : " "}
                                      </span>
                                      <code>{line.after || " "}</code>
                                    </div>
                                  ))}
                                </div>
                              </article>
                            </div>
                            <form action={decidePatchAction} className={styles.patchActionForm}>
                              <input type="hidden" name="document_id" value={patch.document_id} />
                              <input type="hidden" name="patch_id" value={patch.patch_id} />
                              <label>
                                Reviewed content
                                <textarea
                                  name="resolved_content"
                                  rows={5}
                                  defaultValue={patch.content ?? ""}
                                  className={styles.patchTextarea}
                                />
                              </label>
                              <div className={styles.patchActions}>
                                <button type="submit" name="decision" value="accept">
                                  Accept
                                </button>
                                <button type="submit" name="decision" value="cherry_pick">
                                  Cherry-pick
                                </button>
                                <button type="submit" name="decision" value="reject">
                                  Reject
                                </button>
                              </div>
                            </form>
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <details className={styles.panel}>
                <summary className={styles.disclosureSummary}>
                  <span>Resolved patches</span>
                  <span>{resolvedPatches.length} completed</span>
                </summary>
                <div className={styles.disclosureBody}>
                  <ul className={styles.patchList}>
                    {resolvedPatches.map((patch) => (
                      <li key={patch.patch_id} className={styles.patchItem}>
                        <div className={styles.patchHeader}>
                          <strong>{patch.patch_type}</strong>
                          <span
                            className={`${styles.badge} ${styles[getPatchStatusTone(patch.status)]}`}
                          >
                            {patch.status}
                          </span>
                        </div>
                        <span>{patch.patch_id}</span>
                        <span>
                          {patch.proposed_by.actor_type}:{patch.proposed_by.actor_id} on{" "}
                          <code>{patch.block_id}</code>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              <details className={styles.panel}>
                <summary className={styles.disclosureSummary}>
                  <span>Audit trail</span>
                  <span>{auditEvents.length} recent events</span>
                </summary>
                <div className={styles.disclosureBody}>
                  <ul className={styles.patchList}>
                    {auditEvents.map((event) => (
                      <li key={event.event_id} className={styles.patchItem}>
                        <strong>{event.event_type}</strong>
                        <span>
                          {event.actor_type}:{event.actor_id}
                        </span>
                        <span>{event.created_at}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </>
          ) : null}

          {activeStage === "export" ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Run readiness</h2>
                  <span>Pre-build check</span>
                </div>
                {readinessReport ? (
                  <>
                    <div className={styles.exportActions}>
                      <Link
                        href={`/api/documents/${activeDocument?.document_id}/launch-packet?template=${selectedTemplateId}`}
                        className={styles.exportLink}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="open-launch-packet-json"
                      >
                        Open launch packet
                      </Link>
                      <span>One JSON payload for the build agent</span>
                    </div>
                    <div className={styles.readinessCard}>
                      <strong>{readinessReport.score}/100</strong>
                      <span className={styles.status}>{readinessReport.status}</span>
                      <ul className={styles.readinessList}>
                        {readinessReport.recap.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className={styles.empty}>Create a document first.</p>
                )}
              </section>

              {launchPacket && activeDocument ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Launch packet snapshot</h2>
                    <span>{selectedTemplateId}</span>
                  </div>
                  <ul className={styles.readinessList}>
                    <li>{launchPacket.packet_id}</li>
                    <li>
                      {launchPacket.document.title} · v{launchPacket.document.version}
                    </li>
                    <li>
                      {launchPacket.execution_brief.deliverables.length} deliverables across export
                      and starter output
                    </li>
                  </ul>
                  <div className={styles.exportGrid}>
                    <article className={styles.exportCard}>
                      <h3>Starter output</h3>
                      <pre>{Object.keys(launchPacket.starter_bundle.files).join("\n")}</pre>
                    </article>
                    <article className={styles.exportCard}>
                      <h3>Agent commands</h3>
                      <pre>{launchPacket.execution_brief.commands.join("\n")}</pre>
                    </article>
                  </div>
                </section>
              ) : null}

              {showcaseSourceId ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Showcase walkthrough</h2>
                    <span>Idea to launch packet</span>
                  </div>
                  <p className={styles.context}>
                    This document started from the canonical <code>{showcaseSourceId}</code> idea
                    pack and is now in the executable handoff stage.
                  </p>
                  <div className={styles.walkthroughGrid}>
                    <article className={styles.walkthroughCard}>
                      <strong>1. Import</strong>
                      <span>Seeded from {showcaseSourcePath || "the ideas workspace"}.</span>
                    </article>
                    <article className={styles.walkthroughCard}>
                      <strong>2. Review</strong>
                      <span>
                        {patches.length} patches and {commentThreads.length} comments shaped the
                        final spec.
                      </span>
                    </article>
                    <article className={styles.walkthroughCard}>
                      <strong>3. Handoff</strong>
                      <span>
                        Export, starter bundle, and launch packet are aligned for one-shot build
                        execution.
                      </span>
                    </article>
                  </div>
                </section>
              ) : null}

              <details className={styles.panel} id="export-preview">
                <summary className={styles.disclosureSummary}>
                  <span>Export preview</span>
                  <span>Deterministic bundle</span>
                </summary>
                <div className={styles.disclosureBody}>
                {exportBundle ? (
                  <>
                    <div className={styles.exportActions}>
                      <Link
                        href={`/api/documents/${activeDocument?.document_id}/export`}
                        className={styles.exportLink}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="open-export-json"
                      >
                        Open export JSON
                      </Link>
                      <span>{Object.keys(exportBundle.files).length} files ready for handoff</span>
                    </div>
                    <details className={styles.exportDisclosure}>
                      <summary className={styles.disclosureSummary}>
                        <span>Bundle contents</span>
                        <span>{Object.keys(exportBundle.files).length} files</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <div className={styles.exportGrid}>
                          {Object.entries(exportBundle.files).map(([name, content]) => (
                            <article key={name} className={styles.exportCard}>
                              <h3>{name}</h3>
                              <pre>{content}</pre>
                            </article>
                          ))}
                        </div>
                      </div>
                    </details>
                  </>
                ) : (
                  <p className={styles.empty}>No export available yet.</p>
                )}
                </div>
              </details>

              <details className={styles.panel} id="handoff-preview">
                <summary className={styles.disclosureSummary}>
                  <span>Starter handoff</span>
                  <span>{handoffBundle?.template_id ?? selectedTemplateId}</span>
                </summary>
                <div className={styles.disclosureBody}>
                {handoffBundle ? (
                  <>
                    <div className={styles.templateGrid} data-testid="template-grid">
                      {availableTemplates.map((template) => {
                        const isActive = selectedTemplateId === template.id;
                        return (
                          <Link
                            key={template.id}
                            href={buildTemplateHref(
                              activeDocument?.document_id ?? null,
                              "export",
                              template.id,
                            )}
                            className={`${styles.templateCard} ${isActive ? styles.templateCardActive : ""}`}
                            data-testid={`template-option-${template.id}`}
                          >
                            <strong>{template.label}</strong>
                            <span className={styles.badge}>{template.stack}</span>
                            <p>{template.description}</p>
                          </Link>
                        );
                      })}
                    </div>
                    <div className={styles.exportActions}>
                      <Link
                        href={`/api/documents/${activeDocument?.document_id}/handoff?template=${selectedTemplateId}`}
                        className={styles.exportLink}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="open-handoff-json"
                      >
                        Open starter JSON
                      </Link>
                      <span>
                        {handoffBundle.template_id} · {Math.round(handoffBundle.confidence * 100)}%
                        confidence
                      </span>
                    </div>
                    <ul className={styles.readinessList}>
                      {handoffBundle.next_steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                    <details className={styles.exportDisclosure}>
                      <summary className={styles.disclosureSummary}>
                        <span>Starter files</span>
                        <span>{Object.keys(handoffBundle.files).length} files</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <div className={styles.exportGrid}>
                          {Object.entries(handoffBundle.files).map(([name, content]) => (
                            <article key={name} className={styles.exportCard}>
                              <h3>{name}</h3>
                              <pre>{content}</pre>
                            </article>
                          ))}
                        </div>
                      </div>
                    </details>
                  </>
                ) : (
                  <p className={styles.empty}>No starter handoff available yet.</p>
                )}
                </div>
              </details>

              <details className={styles.panel} id="execution-brief">
                <summary className={styles.disclosureSummary}>
                  <span>Execution brief</span>
                  <span>One-shot build context</span>
                </summary>
                <div className={styles.disclosureBody}>
                {executionBrief ? (
                  <>
                    <div className={styles.exportActions}>
                      <Link
                        href={`/api/documents/${activeDocument?.document_id}/execution?template=${selectedTemplateId}`}
                        className={styles.exportLink}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="open-execution-json"
                      >
                        Open execution JSON
                      </Link>
                      <span>{executionBrief.run_ready ? "Run ready" : "Needs review"}</span>
                    </div>
                    <ul className={styles.readinessList}>
                      <li>Primary goal: {executionBrief.primary_goal}</li>
                      <li>
                        Provenance: v{executionBrief.provenance.version} ·{" "}
                        {executionBrief.provenance.approved_patch_count} approved patches
                      </li>
                      <li>
                        Pending review: {executionBrief.provenance.pending_patch_count} patches ·{" "}
                        {executionBrief.provenance.open_comment_count} comments
                      </li>
                    </ul>
                    <details className={styles.exportDisclosure}>
                      <summary className={styles.disclosureSummary}>
                        <span>Agent run instructions</span>
                        <span>{executionBrief.agent_instructions.length} steps</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <ul className={styles.readinessList}>
                          {executionBrief.agent_instructions.map((instruction) => (
                            <li key={instruction}>{instruction}</li>
                          ))}
                        </ul>
                        <div className={styles.exportGrid}>
                          <article className={styles.exportCard}>
                            <h3>Suggested commands</h3>
                            <pre>{executionBrief.commands.join("\n")}</pre>
                          </article>
                          <article className={styles.exportCard}>
                            <h3>Blockers</h3>
                            <pre>
                              {(executionBrief.blockers.length > 0
                                ? executionBrief.blockers
                                : ["No blockers"])
                                .join("\n")}
                            </pre>
                          </article>
                        </div>
                      </div>
                    </details>
                    <details className={styles.exportDisclosure}>
                      <summary className={styles.disclosureSummary}>
                        <span>Agent provenance</span>
                        <span>{approvedAgentPatches.length} approved agent changes</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <div className={styles.exportGrid}>
                          <article className={styles.exportCard}>
                            <h3>Patch activity</h3>
                            <pre>
                              {[
                                `Agent proposals: ${agentProposedPatches.length}`,
                                `Approved agent patches: ${approvedAgentPatches.length}`,
                                `Human comments: ${humanComments.length}`,
                              ].join("\n")}
                            </pre>
                          </article>
                          <article className={styles.exportCard}>
                            <h3>Approved agent patches</h3>
                            <pre>
                              {(approvedAgentPatches.length > 0
                                ? approvedAgentPatches.map(
                                    (patch) => `${patch.patch_id} · ${patch.patch_type} · ${patch.block_id}`,
                                  )
                                : ["No approved agent patches yet"])
                                .join("\n")}
                            </pre>
                          </article>
                        </div>
                      </div>
                    </details>
                  </>
                ) : (
                  <p className={styles.empty}>No execution brief available yet.</p>
                )}
                </div>
              </details>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
