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

type Props = {
  searchParams?: Promise<{ document?: string }>;
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

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedDocumentId =
    typeof resolvedSearchParams.document === "string"
      ? resolvedSearchParams.document
      : undefined;
  const documents = await listDocuments();
  const activeDocument =
    documents.find((document) => document.document_id === requestedDocumentId) ??
    documents[0] ??
    null;
  const patches = activeDocument
    ? await listPatches(activeDocument.document_id)
    : [];
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

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SpecForge MVP kickoff</p>
          <h1>Authoring, patches, and export in one local slice.</h1>
          <p className={styles.subhead}>
            This first implementation is intentionally narrow: seeded documents,
            governed patch proposals, and deterministic exports from the local
            store.
          </p>
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

      <main className={styles.grid}>
        <section className={`${styles.panel} ${styles.wide}`}>
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Create document</h2>
            <span>Server action</span>
          </div>
          <form action={createDocumentAction} className={styles.form} data-testid="create-document-form">
            <label>
              Title
              <input name="title" defaultValue="New SpecForge Draft" data-testid="create-document-title" />
            </label>
            <label>
              Initial markdown
              <textarea
                name="initial_markdown"
                rows={8}
                defaultValue={"# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n"}
              />
            </label>
            <button type="submit">Create document</button>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Document list</h2>
            <span>Seeded from fixtures</span>
          </div>
          <ul className={styles.documentList} data-testid="document-list">
            {documents.map((document) => (
              <li key={document.document_id} className={styles.documentItem}>
                <Link
                  href={`/?document=${document.document_id}`}
                  className={styles.documentLink}
                >
                  <strong>{document.title}</strong>
                  <span>{document.document_id}</span>
                  <span>v{document.version}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Readiness</h2>
            <span>Depth gate</span>
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Comments</h2>
            <span>Anchored threads</span>
          </div>
          {activeDocument ? (
            <div className={styles.commentPanel}>
              <form action={createCommentThreadAction} className={styles.form}>
                <input type="hidden" name="document_id" value={activeDocument.document_id} />
                <label>
                  Block
                  <select name="block_id" className={styles.selectInput} defaultValue={activeBlock?.block_id}>
                    {activeDocument.blocks.map((block) => (
                      <option key={block.block_id} value={block.block_id}>
                        {block.heading} · {block.block_id}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Comment
                  <textarea name="body" rows={4} placeholder="Call out ambiguity, risk, or missing detail." />
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
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Patch proposal</h2>
            <span>Against any block</span>
          </div>
          {activeDocument && activeBlock ? (
            <form action={createPatchAction} className={styles.form} data-testid="patch-proposal-form">
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Audit trail</h2>
            <span>Recent actions</span>
          </div>
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
        </section>

        <section className={`${styles.panel} ${styles.wide}`}>
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
              <div className={styles.exportGrid}>
                {Object.entries(exportBundle.files).map(([name, content]) => (
                  <article key={name} className={styles.exportCard}>
                    <h3>{name}</h3>
                    <pre>{content}</pre>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.empty}>No export available yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
