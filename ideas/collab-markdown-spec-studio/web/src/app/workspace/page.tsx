import Link from "next/link";
import { headers } from "next/headers";

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
import {
  createWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  setAssistRuntimePreferenceAction,
  setWorkspacePlanAction,
  switchWorkspaceAction,
  switchWorkspaceActorAction,
  updateWorkspaceMemberRoleAction,
} from "./workspace-actions";
import { buildStageHref, getStageMeta, stageOrder, type Stage } from "./stage-utils";
import {
  DeliveryLoopPanel,
  DocumentLibraryPanel,
  OpsPanel,
  ReadinessPanel,
  WorkspaceMembersPanel,
  WorkspaceSignalsPanel,
} from "./workspace-sidebar-panels";

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
        : resolvedSearchParams.membership_error === "self_remove"
          ? "Switch to another member before removing your current workspace session."
        : resolvedSearchParams.membership_error === "last_member"
          ? "This workspace needs at least one member."
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
    documents,
    assistQuota,
    memberQuota,
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
                  <WorkspaceMembersPanel
                    activeWorkspace={activeWorkspace}
                    activeWorkspaceActorId={activeWorkspaceActor.actor_id}
                    activeWorkspaceMembers={activeWorkspaceMembers}
                    actorReturnTo={actorReturnTo}
                    membershipError={membershipError}
                    createWorkspaceMemberAction={createWorkspaceMemberAction}
                    removeWorkspaceMemberAction={removeWorkspaceMemberAction}
                    updateWorkspaceMemberRoleAction={updateWorkspaceMemberRoleAction}
                  />
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

          <WorkspaceSignalsPanel workspaceSummary={workspaceSummary} />

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

          <DeliveryLoopPanel backlogState={backlogState} />
          <OpsPanel assistToolStatuses={assistToolStatuses} />
          <DocumentLibraryPanel
            documents={documents}
            activeStage={activeStage}
            buildStageHref={buildStageHref}
          />
          <ReadinessPanel readinessReport={readinessReport} />
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
