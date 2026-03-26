import Link from "next/link";

import styles from "../page.module.css";
import { IterateWithAI } from "@/components/specforge/IterateWithAI";
import type { DocumentRecord, StoredPatch } from "@/lib/specforge/contracts";
import type { CommentThreadRecord, ClarificationRecord } from "@/lib/specforge/store";
import type { BlockSummary } from "@/lib/specforge/workspace-document-state";
import type { Stage } from "./stage-utils";

type ReviewStageProps = {
  activeDocument: DocumentRecord | null;
  activeBlock: DocumentRecord["blocks"][number] | null;
  activeWorkspaceActorId: string;
  patches: StoredPatch[];
  commentThreads: CommentThreadRecord[];
  clarifications: ClarificationRecord[];
  blockSummaries: BlockSummary[];
  buildStageHref: (documentId: string | null, stage: Stage) => string;
  createPatchAction: (formData: FormData) => Promise<void>;
  createCommentThreadAction: (formData: FormData) => Promise<void>;
  resolveCommentThreadAction: (formData: FormData) => Promise<void>;
  createClarificationAction: (formData: FormData) => Promise<void>;
  answerClarificationAction: (formData: FormData) => Promise<void>;
};

export function ReviewStage({
  activeDocument,
  activeBlock,
  activeWorkspaceActorId,
  patches,
  commentThreads,
  clarifications,
  blockSummaries,
  buildStageHref,
  createPatchAction,
  createCommentThreadAction,
  resolveCommentThreadAction,
  createClarificationAction,
  answerClarificationAction,
}: ReviewStageProps) {
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Review inbox</h2>
          <span>What needs attention now</span>
        </div>
        <ul className={styles.readinessList}>
          <li>
            {patches.filter((patch) => ["proposed", "stale"].includes(patch.status)).length}{" "}
            patches need a human decision.
          </li>
          <li>
            {commentThreads.filter((thread) => thread.status === "open").length} comment
            threads are still open.
          </li>
          <li>
            {clarifications.filter((item) => item.status === "open").length} clarifications
            still need answers.
          </li>
          <li>
            {blockSummaries.filter((block) => block.pendingPatches + block.openComments > 0).length}{" "}
            blocks have active review work.
          </li>
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

      <details
        className={styles.panel}
        open={commentThreads.some((thread) => thread.status === "open")}
        id="comments"
      >
        <summary className={styles.disclosureSummary}>
          <span>Comments</span>
          <span>
            {commentThreads.filter((thread) => thread.status === "open").length} open
          </span>
        </summary>
        <div className={styles.disclosureBody}>
          {activeDocument ? (
            <div className={styles.commentPanel}>
              <form action={createCommentThreadAction} className={styles.form}>
                <input
                  type="hidden"
                  name="document_id"
                  value={activeDocument.document_id}
                />
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
                        <input
                          type="hidden"
                          name="document_id"
                          value={thread.document_id}
                        />
                        <input
                          type="hidden"
                          name="thread_id"
                          value={thread.thread_id}
                        />
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
          <span>
            {clarifications.filter((item) => item.status === "open").length} open
          </span>
        </summary>
        <div className={styles.disclosureBody}>
          {activeDocument ? (
            <div className={styles.commentPanel}>
              <form action={createClarificationAction} className={styles.form}>
                <input
                  type="hidden"
                  name="document_id"
                  value={activeDocument.document_id}
                />
                <label>
                  Section
                  <select
                    name="section_heading"
                    className={styles.selectInput}
                    defaultValue={activeBlock?.heading}
                  >
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
                        <input
                          type="hidden"
                          name="document_id"
                          value={item.document_id}
                        />
                        <input
                          type="hidden"
                          name="clarification_id"
                          value={item.clarification_id}
                        />
                        <label>
                          Answer
                          <textarea
                            name="answer"
                            rows={3}
                            placeholder="Write the accepted clarification into the spec."
                          />
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

      <details className={styles.panel} open>
        <summary className={styles.disclosureSummary}>
          <span>Block activity + iterate</span>
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
                  <IterateWithAI
                    documentId={activeDocument.document_id}
                    blockId={block.block_id}
                    blockHeading={block.heading}
                    actorId={activeWorkspaceActorId}
                    decideHref={buildStageHref(activeDocument.document_id, "decide")}
                  />
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
