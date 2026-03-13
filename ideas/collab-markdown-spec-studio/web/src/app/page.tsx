import Link from "next/link";

import {
  createCommentThreadAction,
  createDocumentAction,
  createPatchAction,
  decidePatchAction,
  resolveCommentThreadAction,
} from "./actions";
import { DocumentWorkspace } from "./document-workspace";
import styles from "./page.module.css";
import {
  exportDocument,
  listAuditEvents,
  listCommentThreads,
  listDocuments,
  listPatches,
} from "@/lib/specforge/store";
import { evaluateReadiness } from "@/lib/specforge/readiness";

export const dynamic = "force-dynamic";

type Stage = "start" | "draft" | "review" | "decide" | "export";
type HeroVariant = "handoff" | "multiplayer" | "ship";

type Props = {
  searchParams?: Promise<{ document?: string; stage?: string; variant?: string }>;
};

type BlockSummary = {
  block_id: string;
  heading: string;
  openComments: number;
  pendingPatches: number;
  touchedBy: string[];
};

type GuidedStep = {
  id: string;
  stage: Stage;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
};

const stageOrder: Stage[] = ["start", "draft", "review", "decide", "export"];
const heroVariantOrder: HeroVariant[] = ["handoff", "multiplayer", "ship"];

const heroVariants: Record<
  HeroVariant,
  {
    eyebrow: string;
    headline: string;
    subhead: string;
    tagline: string;
  }
> = {
  handoff: {
    eyebrow: "Build-ready specs, not scattered docs",
    headline: "SpecForge turns multiplayer specs into one-shot build handoffs.",
    subhead:
      "Draft with humans and agents on the same canvas, review attributed patches, and export a clean bundle that a coding agent can build from without extra interpretation.",
    tagline: "Multiplayer specs for one-shot builds",
  },
  multiplayer: {
    eyebrow: "One canvas for humans and agents",
    headline: "SpecForge is multiplayer spec writing that stays build-ready.",
    subhead:
      "Write together, review attributed changes, and keep the handoff bundle clean enough for a coding agent to execute without another planning pass.",
    tagline: "Shared specs, shared context, cleaner buildouts",
  },
  ship: {
    eyebrow: "From idea to build without losing the thread",
    headline: "SpecForge helps teams write specs that agents can ship from in one shot.",
    subhead:
      "Keep authors, reviewers, and coding agents in the same workflow so the final spec is readable, attributable, and ready to turn into working code.",
    tagline: "Specs that move straight into build mode",
  },
};

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

function summarizeBlocks(
  activeDocument: NonNullable<Awaited<ReturnType<typeof listDocuments>>[number]>,
  patches: Awaited<ReturnType<typeof listPatches>>,
  commentThreads: Awaited<ReturnType<typeof listCommentThreads>>,
) {
  const summaries = activeDocument.blocks.map<BlockSummary>((block) => {
    const blockPatches = patches.filter((patch) => patch.block_id === block.block_id);
    const blockComments = commentThreads.filter((thread) => thread.block_id === block.block_id);
    const touchedBy = Array.from(
      new Set([
        ...blockPatches.map(
          (patch) => `${patch.proposed_by.actor_type}:${patch.proposed_by.actor_id}`,
        ),
        ...blockComments.map(
          (thread) => `${thread.created_by.actor_type}:${thread.created_by.actor_id}`,
        ),
      ]),
    );

    return {
      block_id: block.block_id,
      heading: block.heading,
      openComments: blockComments.filter((thread) => thread.status === "open").length,
      pendingPatches: blockPatches.filter((patch) =>
        ["proposed", "stale"].includes(patch.status),
      ).length,
      touchedBy,
    };
  });

  return summaries.sort((left, right) => {
    const leftWeight = left.openComments + left.pendingPatches;
    const rightWeight = right.openComments + right.pendingPatches;
    return rightWeight - leftWeight;
  });
}

function buildGuidedSteps(input: {
  hasDocument: boolean;
  hasDraft: boolean;
  hasPatches: boolean;
  hasOpenComments: boolean;
  hasPendingPatches: boolean;
  isReadyToExport: boolean;
}) {
  const baseSteps = [
    {
      id: "create",
      stage: "start" as const,
      title: "Create or open a spec",
      description: "Start from a seeded document or open a fresh draft.",
      completed: input.hasDocument,
    },
    {
      id: "draft",
      stage: "draft" as const,
      title: "Draft on the shared canvas",
      description: "Edit live, collaborate, and save a canonical snapshot.",
      completed: input.hasDraft,
    },
    {
      id: "review",
      stage: "review" as const,
      title: "Queue review work",
      description: "Open comments, activity, and targeted patch proposals.",
      completed: input.hasPatches || input.hasOpenComments,
    },
    {
      id: "decide",
      stage: "decide" as const,
      title: "Resolve the patch queue",
      description: "Accept, cherry-pick, or reject proposed changes.",
      completed: !input.hasOpenComments && !input.hasPendingPatches && input.hasPatches,
    },
    {
      id: "export",
      stage: "export" as const,
      title: "Export the handoff bundle",
      description: "Open the deterministic JSON bundle when the draft is ready.",
      completed: input.isReadyToExport,
    },
  ];

  const currentIndex = baseSteps.findIndex((step) => !step.completed);

  return baseSteps.map<GuidedStep>((step, index) => ({
    id: step.id,
    stage: step.stage,
    title: step.title,
    description: step.description,
    status:
      currentIndex === -1 || index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

function buildStageHref(documentId: string | null, stage: Stage) {
  const params = new URLSearchParams();
  if (documentId) {
    params.set("document", documentId);
  }
  params.set("stage", stage);
  return `/?${params.toString()}`;
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
        title: "Ship the handoff bundle",
        description: "Check readiness and open the deterministic export payload.",
      };
  }
}

export default async function Home({ searchParams }: Props) {
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

  const documents = await listDocuments();
  const activeDocument =
    documents.find((document) => document.document_id === requestedDocumentId) ??
    documents[0] ??
    null;
  const patches = activeDocument ? await listPatches(activeDocument.document_id) : [];
  const auditEvents = activeDocument
    ? await listAuditEvents(activeDocument.document_id)
    : [];
  const commentThreads = activeDocument
    ? await listCommentThreads(activeDocument.document_id)
    : [];
  const exportBundle = activeDocument
    ? await exportDocument(activeDocument.document_id)
    : null;
  const activeBlock = activeDocument?.blocks[0] ?? null;
  const readinessReport = activeDocument
    ? evaluateReadiness({
        document: activeDocument,
        patches,
        comments: commentThreads,
      })
    : null;
  const blockSummaries = activeDocument
    ? summarizeBlocks(activeDocument, patches, commentThreads)
    : [];
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

  return (
    <div className={styles.shell}>
      <div className={styles.brandBar}>
        <div>
          <span className={styles.brandMark}>SpecForge</span>
          <p className={styles.brandTagline}>{heroCopy.tagline}</p>
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
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Workflow</h2>
              <span>Guided path</span>
            </div>
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
          </section>

          <details className={styles.panel} open>
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
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Readiness</h2>
                <span>Live status</span>
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
            </section>
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
                  <h2>Create document</h2>
                  <span>Server action</span>
                </div>
                <form
                  action={createDocumentAction}
                  className={styles.form}
                  data-testid="create-document-form"
                >
                  <label>
                    Title
                    <input
                      name="title"
                      defaultValue="New SpecForge Draft"
                      data-testid="create-document-title"
                    />
                  </label>
                  <label>
                    Initial markdown
                    <textarea
                      name="initial_markdown"
                      rows={10}
                      defaultValue={"# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n"}
                    />
                  </label>
                  <button type="submit">Create document</button>
                </form>
              </section>

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
                />
              ) : (
                <p className={styles.empty}>Create a document first.</p>
              )}
            </section>
          ) : null}

          {activeStage === "review" ? (
            <>
              <section className={styles.panel} id="patch-proposal">
                <div className={styles.panelHeader}>
                  <h2>Patch proposal</h2>
                  <span>Against any block</span>
                </div>
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
                        defaultValue={`${activeBlock.content}\n\n- Added from the MVP dashboard.`}
                        data-testid="patch-content-input"
                      />
                    </label>
                    <button type="submit">Queue patch</button>
                  </form>
                ) : (
                  <p className={styles.empty}>Create a document first.</p>
                )}
              </section>

              <details className={styles.panel} open id="comments">
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
                  <h2>Patch queue</h2>
                  <span>Current document</span>
                </div>
                <ul className={styles.patchList} data-testid="patch-queue">
                  {patches.map((patch) => {
                    const targetBlock =
                      activeDocument?.blocks.find((block) => block.block_id === patch.block_id) ??
                      null;
                    const originalContent = targetBlock?.content ?? "";
                    const reviewedContent = patch.content ?? "";
                    const diffLines = renderDiffLines(originalContent, reviewedContent);

                    return (
                      <li key={patch.patch_id} className={styles.patchItem}>
                        <div className={styles.patchHeader}>
                          <strong>{patch.patch_type}</strong>
                          <div className={styles.patchMeta}>
                            <span
                              className={`${styles.badge} ${styles[getPatchStatusTone(patch.status)]}`}
                            >
                              {patch.status}
                            </span>
                            <span className={styles.badge}>{getPatchRiskLabel(patch.patch_type)}</span>
                          </div>
                        </div>
                        <span>{patch.patch_id}</span>
                        <span>
                          {patch.proposed_by.actor_type}:{patch.proposed_by.actor_id} on{" "}
                          <code>{patch.block_id}</code>
                        </span>
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
                        {["proposed", "stale"].includes(patch.status) ? (
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
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>

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
                  <h2>Readiness summary</h2>
                  <span>Pre-handoff check</span>
                </div>
                {readinessReport ? (
                  <div className={styles.readinessCard}>
                    <strong>{readinessReport.score}/100</strong>
                    <span className={styles.status}>{readinessReport.status}</span>
                    <ul className={styles.readinessList}>
                      {readinessReport.recap.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={styles.empty}>Create a document first.</p>
                )}
              </section>

              <section className={styles.panel} id="export-preview">
                <div className={styles.panelHeader}>
                  <h2>Export preview</h2>
                  <span>Deterministic bundle</span>
                </div>
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
                    <details className={styles.exportDisclosure} open>
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
              </section>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
