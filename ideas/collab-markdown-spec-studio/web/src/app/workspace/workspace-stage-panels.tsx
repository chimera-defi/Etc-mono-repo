import Link from "next/link";

import { ExportFileBrowser } from "./export-file-browser";

import {
  answerClarificationAction,
  createClarificationAction,
  createCommentThreadAction,
  createDocumentAction,
  createPatchAction,
  decidePatchAction,
  resolveCommentThreadAction,
} from "../actions";
import { DocumentWorkspace } from "../document-workspace";
import { GuidedDraftBuilder } from "../guided-draft-builder";
import styles from "../page.module.css";
import { getAgentAssistToolStatuses } from "@/lib/specforge/agent-assist";
import { listTemplates, type StarterTemplateId } from "@/lib/specforge/handoff";
import { listShowcaseExamples } from "@/lib/specforge/showcase";
import { loadActiveWorkspaceDocumentState } from "@/lib/specforge/workspace-document-state";
import {
  buildStageHref,
  buildTemplateHref,
  getPatchRiskLabel,
  getPatchStatusTone,
  renderDiffLines,
} from "./stage-utils";

type ActiveDocumentState = Awaited<ReturnType<typeof loadActiveWorkspaceDocumentState>>;
type AssistToolStatus = Awaited<ReturnType<typeof getAgentAssistToolStatuses>>[number];
type ShowcaseExample = Awaited<ReturnType<typeof listShowcaseExamples>>[number];

export function StartStage(props: {
  activeDocument: ActiveDocumentState["activeDocument"];
  assistToolStatuses: AssistToolStatus[];
  activeWorkspaceSessionAuthMode: "local" | "github" | "unauthenticated";
  preferredAssistTool: "auto" | "codex_cli" | "claude_cli" | "heuristic";
  showcaseExamples: ShowcaseExample[];
}) {
  const {
    activeDocument,
    assistToolStatuses,
    activeWorkspaceSessionAuthMode,
    preferredAssistTool,
    showcaseExamples,
  } = props;

  return (
    <>
      <section className={styles.panel} id="create-document">
        <div className={styles.panelHeader}>
          <h2>Guided spec creation</h2>
          <span>Structured draft with assist</span>
        </div>
        <GuidedDraftBuilder
          toolStatuses={assistToolStatuses}
          cliAssistEnabled={activeWorkspaceSessionAuthMode === "local"}
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
  );
}

export function DraftStage(props: {
  activeDocument: ActiveDocumentState["activeDocument"];
  activeWorkspaceActor: {
    actor_id: string;
    name: string;
    color: string;
  };
  blockSummaries: ActiveDocumentState["blockSummaries"];
}) {
  const { activeDocument, activeWorkspaceActor, blockSummaries } = props;

  return (
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
  );
}

export function ReviewStage(props: {
  activeDocument: ActiveDocumentState["activeDocument"];
  activeBlock: ActiveDocumentState["activeBlock"];
  patches: ActiveDocumentState["patches"];
  commentThreads: ActiveDocumentState["commentThreads"];
  clarifications: ActiveDocumentState["clarifications"];
  blockSummaries: ActiveDocumentState["blockSummaries"];
}) {
  const { activeDocument, activeBlock, patches, commentThreads, clarifications, blockSummaries } =
    props;

  return (
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
  );
}

export function DecideStage(props: {
  activeDocument: ActiveDocumentState["activeDocument"];
  actionablePatches: ActiveDocumentState["actionablePatches"];
  resolvedPatches: ActiveDocumentState["resolvedPatches"];
  commentThreads: ActiveDocumentState["commentThreads"];
  clarifications: ActiveDocumentState["clarifications"];
  auditEvents: ActiveDocumentState["auditEvents"];
}) {
  const { activeDocument, actionablePatches, resolvedPatches, commentThreads, clarifications, auditEvents } = props;

  return (
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
              activeDocument?.blocks.find((block) => block.block_id === patch.block_id) ?? null;
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
                      {patch.confidence ? ` · confidence ${Math.round(patch.confidence * 100)}%` : ""}
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
  );
}

export function ExportStage(props: {
  activeDocument: ActiveDocumentState["activeDocument"];
  readinessReport: ActiveDocumentState["readinessReport"];
  launchPacket: ActiveDocumentState["launchPacket"];
  selectedTemplateId: StarterTemplateId;
  showcaseSourceId: ActiveDocumentState["showcaseSourceId"];
  showcaseSourcePath: ActiveDocumentState["showcaseSourcePath"];
  patches: ActiveDocumentState["patches"];
  commentThreads: ActiveDocumentState["commentThreads"];
  exportBundle: ActiveDocumentState["exportBundle"];
  handoffBundle: ActiveDocumentState["handoffBundle"];
  executionBrief: ActiveDocumentState["executionBrief"];
  agentProposedPatches: ActiveDocumentState["agentProposedPatches"];
  approvedAgentPatches: ActiveDocumentState["approvedAgentPatches"];
  humanComments: ActiveDocumentState["humanComments"];
  availableTemplates: ReturnType<typeof listTemplates>;
}) {
  const {
    activeDocument,
    readinessReport,
    launchPacket,
    selectedTemplateId,
    showcaseSourceId,
    showcaseSourcePath,
    patches,
    commentThreads,
    exportBundle,
    handoffBundle,
    executionBrief,
    agentProposedPatches,
    approvedAgentPatches,
    humanComments,
    availableTemplates,
  } = props;

  return (
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
              <ExportFileBrowser
                documentId={activeDocument?.document_id ?? "export"}
                initialFiles={exportBundle.files}
              />
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
  );
}
