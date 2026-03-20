import Link from "next/link";
import { headers } from "next/headers";

import {
  createWorkspaceMemberAction,
  setAssistRuntimePreferenceAction,
  setWorkspacePlanAction,
  switchWorkspaceAction,
  switchWorkspaceActorAction,
} from "../actions";
import { LocalAdminPanel } from "../local-admin-panel";
import { ShareDocumentPanel } from "../share-document-panel";
import styles from "../page.module.css";
import { getAgentAssistToolStatuses } from "@/lib/specforge/agent-assist";
import { readBacklogState } from "@/lib/specforge/backlog";
import {
  getCurrentWorkspaceSession,
  getPreferredAssistTool,
  isGitHubAuthConfigured,
  listVisibleWorkspaces,
  listWorkspaceActors,
} from "@/lib/specforge/session";
import {
  listTemplates,
  resolveStarterTemplateId,
} from "@/lib/specforge/handoff";
import { heroVariantOrder, heroVariants, type HeroVariant } from "@/lib/specforge/marketing";
import { listShowcaseExamples } from "@/lib/specforge/showcase";
import {
  buildGuidedSteps,
  loadActiveWorkspaceDocumentState,
} from "@/lib/specforge/workspace-document-state";
import { loadWorkspaceSummary } from "@/lib/specforge/workspace-summary";
import { DraftStage, DecideStage, ExportStage, ReviewStage, StartStage } from "./workspace-stage-panels";
import { buildStageHref, getStageMeta, stageOrder, type Stage } from "./stage-utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    document?: string;
    stage?: string;
    variant?: string;
    template?: string;
    membership_error?: string;
  }>;
};

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
      : resolvedSearchParams.membership_error === "duplicate"
        ? "That GitHub login is already a workspace member."
        : resolvedSearchParams.membership_error === "github_required"
          ? "Pilot workspaces require a GitHub login for each invited member."
      : null;
  const availableTemplates = listTemplates();
  const selectedTemplateId = resolveStarterTemplateId(
    typeof resolvedSearchParams.template === "string"
      ? resolvedSearchParams.template
      : undefined,
  );
  const [workspaceActors, visibleWorkspaces] = await Promise.all([
    listWorkspaceActors(),
    listVisibleWorkspaces(),
  ]);
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
                          <select
                            name="role"
                            className={styles.selectInput}
                            defaultValue="Reviewer"
                          >
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
                  {visibleWorkspaces.length > 1 ? (
                    <details className={styles.wizardSection}>
                      <summary className={styles.disclosureSummary}>
                        <span>Switch workspace</span>
                        <span>{visibleWorkspaces.length} available</span>
                      </summary>
                      <div className={styles.disclosureBody}>
                        <form action={switchWorkspaceAction} className={styles.form}>
                          <input type="hidden" name="return_to" value={actorReturnTo} />
                          <label>
                            Visible workspaces
                            <select
                              name="workspace_id"
                              className={styles.selectInput}
                              defaultValue={activeWorkspace.workspace_id}
                            >
                              {visibleWorkspaces.map((ws) => (
                                <option key={ws.workspace_id} value={ws.workspace_id}>
                                  {ws.name} · {ws.plan}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit">Switch workspace</button>
                        </form>
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
                <div className={styles.metricCard}>
                  <strong>{workspaceSummary.workspaceBehavior.document_created_count}</strong>
                  <span>specs created</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{workspaceSummary.workspaceBehavior.member_added_count}</strong>
                  <span>members added</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{workspaceSummary.workspaceBehavior.patch_decided_count}</strong>
                  <span>patch decisions</span>
                </div>
              </div>
              <div className={styles.actorCard}>
                <strong>Design-partner funnel</strong>
                <span>Activated: {workspaceSummary.designPartnerSignals.activated ? "yes" : "no"}</span>
                <span>Assisted: {workspaceSummary.designPartnerSignals.assisted ? "yes" : "no"}</span>
                <span>
                  Collaborating: {workspaceSummary.designPartnerSignals.collaborating ? "yes" : "no"}
                </span>
                <span>Reviewed: {workspaceSummary.designPartnerSignals.reviewed ? "yes" : "no"}</span>
                <span>
                  Launch prepared:{" "}
                  {workspaceSummary.designPartnerSignals.launchPrepared ? "yes" : "no"}
                </span>
              </div>
              {workspaceSummary.billingStatus.upgradeRequired ? (
                <div className={styles.actorCard}>
                  <strong>Upgrade path suggested</strong>
                  {workspaceSummary.billingStatus.reasons.map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                  <span>
                    Recommended plan: {workspaceSummary.billingStatus.recommendedPlan ?? "none"}
                  </span>
                </div>
              ) : null}
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
                  <Link href="/api/workspace/billing" className={styles.secondaryLink}>
                    Billing
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
            <StartStage
              activeDocument={activeDocument}
              assistToolStatuses={assistToolStatuses}
              activeWorkspaceSessionAuthMode={activeWorkspaceSession.authMode}
              preferredAssistTool={preferredAssistTool}
              showcaseExamples={showcaseExamples}
            />
          ) : null}

          {activeStage === "draft" ? (
            <DraftStage
              activeDocument={activeDocument}
              activeWorkspaceActor={activeWorkspaceActor}
              blockSummaries={blockSummaries}
            />
          ) : null}

          {activeStage === "review" ? (
            <ReviewStage
              activeDocument={activeDocument}
              activeBlock={activeBlock}
              patches={patches}
              commentThreads={commentThreads}
              clarifications={clarifications}
              blockSummaries={blockSummaries}
            />
          ) : null}

          {activeStage === "decide" ? (
            <DecideStage
              activeDocument={activeDocument}
              actionablePatches={actionablePatches}
              resolvedPatches={resolvedPatches}
              commentThreads={commentThreads}
              clarifications={clarifications}
              auditEvents={auditEvents}
            />
          ) : null}

          {activeStage === "export" ? (
            <ExportStage
              activeDocument={activeDocument}
              readinessReport={readinessReport}
              launchPacket={launchPacket}
              selectedTemplateId={selectedTemplateId}
              showcaseSourceId={showcaseSourceId}
              showcaseSourcePath={showcaseSourcePath}
              patches={patches}
              commentThreads={commentThreads}
              exportBundle={exportBundle}
              handoffBundle={handoffBundle}
              executionBrief={executionBrief}
              agentProposedPatches={agentProposedPatches}
              approvedAgentPatches={approvedAgentPatches}
              humanComments={humanComments}
              availableTemplates={availableTemplates}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
