import { randomUUID } from "node:crypto";

import {
  clarificationAnswerSchema,
  clarificationCreateSchema,
  commentThreadCreateSchema,
  commentThreadResolveSchema,
  documentCreateSchema,
  documentUpdateSchema,
  patchDecisionSchema,
  patchProposalSchema,
  type ClarificationAnswerInput,
  type ClarificationCreateInput,
  type CommentThreadCreateInput,
  type CommentThreadResolveInput,
  type DocumentCreateInput,
  type DocumentRecord,
  type DocumentUpdateInput,
  type PatchDecisionInput,
  type PatchProposalInput,
  type StoredPatch,
} from "./contracts";
import { exportDocumentBundle } from "./export";
import {
  applyPatchToMarkdown,
  deriveDocumentShape,
  makeDocumentRecord,
  upsertSectionBullet,
} from "./markdown";
import type {
  AuditEventRecord,
  ClarificationRecord,
  CommentThreadRecord,
  QuerySession,
  StoreOptions,
} from "./store";

type Queryable = QuerySession & {
  transaction: <T>(fn: (tx: QuerySession) => Promise<T>) => Promise<T>;
};

type DocumentRow = {
  document_id: string;
  workspace_id: string;
  title: string;
  version: number;
  markdown: string;
  editor_json: unknown | null;
  metadata_json: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

type PatchRow = {
  patch_id: string;
  document_id: string;
  block_id: string;
  section_id: string | null;
  operation: "insert" | "replace" | "delete";
  content: string | null;
  patch_type: StoredPatch["patch_type"];
  rationale: string | null;
  proposed_by_actor_type: "human" | "agent";
  proposed_by_actor_id: string;
  base_version: number;
  target_fingerprint: string;
  confidence: number | null;
  status: StoredPatch["status"];
  created_at: string;
};

type AuditEventRow = {
  event_id: string;
  document_id: string | null;
  patch_id: string | null;
  event_type: string;
  actor_type: "human" | "agent" | "system";
  actor_id: string;
  payload_json: Record<string, unknown> | null;
  created_at: string;
};

type CommentThreadRow = {
  thread_id: string;
  document_id: string;
  block_id: string;
  body: string;
  status: "open" | "resolved";
  created_by_actor_type: "human" | "agent";
  created_by_actor_id: string;
  resolved_by_actor_type: "human" | "agent" | null;
  resolved_by_actor_id: string | null;
  created_at: string;
  resolved_at: string | null;
};

type ClarificationRow = {
  clarification_id: string;
  document_id: string;
  section_heading: string;
  question: string;
  status: "open" | "answered";
  created_by_actor_type: "human" | "agent";
  created_by_actor_id: string;
  answer_text: string | null;
  answered_by_actor_type: "human" | "agent" | null;
  answered_by_actor_id: string | null;
  created_at: string;
  answered_at: string | null;
};

type ResolveStoreOptions = (options?: StoreOptions) => { dbPath: string };

type DocumentStoreDeps = {
  getDatabase: (options?: StoreOptions) => Promise<Queryable>;
  resolveOptions: ResolveStoreOptions;
  persistSnapshot: (database: QuerySession, snapshotPath: string) => Promise<void>;
  insertAuditEvent: (
    database: QuerySession,
    input: {
      document_id?: string;
      patch_id?: string;
      event_type: string;
      actor_type: "human" | "agent" | "system";
      actor_id: string;
      payload: unknown;
      created_at?: string;
    },
  ) => Promise<void>;
  insertSnapshot: (
    database: QuerySession,
    document: Pick<DocumentRecord, "document_id" | "version" | "markdown" | "editor_json">,
    createdAt: string,
  ) => Promise<void>;
};

function mapDocumentRow(row: DocumentRow): DocumentRecord {
  const shape = deriveDocumentShape(row.markdown);

  return {
    document_id: row.document_id,
    workspace_id: row.workspace_id,
    title: row.title,
    version: Number(row.version),
    markdown: row.markdown,
    editor_json: row.editor_json ?? undefined,
    sections: shape.sections,
    blocks: shape.blocks,
    metadata: row.metadata_json ?? {},
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapPatchRow(row: PatchRow): StoredPatch {
  return {
    patch_id: row.patch_id,
    document_id: row.document_id,
    block_id: row.block_id,
    section_id: row.section_id ?? undefined,
    operation: row.operation,
    content: row.content ?? undefined,
    patch_type: row.patch_type,
    rationale: row.rationale ?? undefined,
    proposed_by: {
      actor_type: row.proposed_by_actor_type,
      actor_id: row.proposed_by_actor_id,
    },
    base_version: Number(row.base_version),
    target_fingerprint: row.target_fingerprint,
    confidence: row.confidence ?? undefined,
    status: row.status,
    created_at: row.created_at,
  };
}

function mapAuditEventRow(row: AuditEventRow): AuditEventRecord {
  return {
    event_id: row.event_id,
    document_id: row.document_id ?? undefined,
    patch_id: row.patch_id ?? undefined,
    event_type: row.event_type,
    actor_type: row.actor_type,
    actor_id: row.actor_id,
    payload: row.payload_json ?? {},
    created_at: row.created_at,
  };
}

function mapCommentThreadRow(row: CommentThreadRow): CommentThreadRecord {
  return {
    thread_id: row.thread_id,
    document_id: row.document_id,
    block_id: row.block_id,
    body: row.body,
    status: row.status,
    created_by: {
      actor_type: row.created_by_actor_type,
      actor_id: row.created_by_actor_id,
    },
    resolved_by:
      row.resolved_by_actor_type && row.resolved_by_actor_id
        ? {
            actor_type: row.resolved_by_actor_type,
            actor_id: row.resolved_by_actor_id,
          }
        : undefined,
    created_at: row.created_at,
    resolved_at: row.resolved_at ?? undefined,
  };
}

function mapClarificationRow(row: ClarificationRow): ClarificationRecord {
  return {
    clarification_id: row.clarification_id,
    document_id: row.document_id,
    section_heading: row.section_heading,
    question: row.question,
    status: row.status,
    created_by: {
      actor_type: row.created_by_actor_type,
      actor_id: row.created_by_actor_id,
    },
    answer_text: row.answer_text ?? undefined,
    answered_by:
      row.answered_by_actor_type && row.answered_by_actor_id
        ? {
            actor_type: row.answered_by_actor_type,
            actor_id: row.answered_by_actor_id,
          }
        : undefined,
    created_at: row.created_at,
    answered_at: row.answered_at ?? undefined,
  };
}

export function createDocumentStore(deps: DocumentStoreDeps) {
  const store = {
    async listDocuments(options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const workspaceClause = options?.workspaceId ? "WHERE workspace_id = $1" : "";
      const result = await database.query<DocumentRow>(
        `SELECT
          document_id,
          workspace_id,
          title,
          version,
          markdown,
          editor_json,
          metadata_json,
          created_at,
          updated_at
        FROM documents
        ${workspaceClause}
        ORDER BY updated_at DESC, created_at DESC`,
        options?.workspaceId ? [options.workspaceId] : [],
      );

      return result.rows.map(mapDocumentRow);
    },

    async getDocument(documentId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const workspaceClause = options?.workspaceId ? "AND workspace_id = $2" : "";
      const result = await database.query<DocumentRow>(
        `SELECT
          document_id,
          workspace_id,
          title,
          version,
          markdown,
          editor_json,
          metadata_json,
          created_at,
          updated_at
        FROM documents
        WHERE document_id = $1
        ${workspaceClause}
        LIMIT 1`,
        options?.workspaceId ? [documentId, options.workspaceId] : [documentId],
      );

      return result.rows[0] ? mapDocumentRow(result.rows[0]) : null;
    },

    async listPatches(documentId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const result = await database.query<PatchRow>(
        `SELECT
          patch_id,
          document_id,
          block_id,
          section_id,
          operation,
          content,
          patch_type,
          rationale,
          proposed_by_actor_type,
          proposed_by_actor_id,
          base_version,
          target_fingerprint,
          confidence,
          status,
          created_at
        FROM patches
        WHERE document_id = $1
        ORDER BY created_at DESC`,
        [documentId],
      );

      return result.rows.map(mapPatchRow);
    },

    async listAuditEvents(documentId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const result = await database.query<AuditEventRow>(
        `SELECT
          event_id,
          document_id,
          patch_id,
          event_type,
          actor_type,
          actor_id,
          payload_json,
          created_at
        FROM audit_events
        WHERE document_id = $1
        ORDER BY created_at DESC
        LIMIT 20`,
        [documentId],
      );

      return result.rows.map(mapAuditEventRow);
    },

    async listCommentThreads(documentId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const result = await database.query<CommentThreadRow>(
        `SELECT
          thread_id,
          document_id,
          block_id,
          body,
          status,
          created_by_actor_type,
          created_by_actor_id,
          resolved_by_actor_type,
          resolved_by_actor_id,
          created_at,
          resolved_at
        FROM comment_threads
        WHERE document_id = $1
        ORDER BY created_at DESC`,
        [documentId],
      );

      return result.rows.map(mapCommentThreadRow);
    },

    async listClarifications(documentId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const result = await database.query<ClarificationRow>(
        `SELECT
          clarification_id,
          document_id,
          section_heading,
          question,
          status,
          created_by_actor_type,
          created_by_actor_id,
          answer_text,
          answered_by_actor_type,
          answered_by_actor_id,
          created_at,
          answered_at
        FROM clarifications
        WHERE document_id = $1
        ORDER BY created_at DESC`,
        [documentId],
      );

      return result.rows.map(mapClarificationRow);
    },

    async resetWorkspaceDocuments(workspaceId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const deletedDocuments = await database.query<{ document_id: string }>(
        `SELECT document_id
        FROM documents
        WHERE workspace_id = $1`,
        [workspaceId],
      );
      const resetAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        await tx.query(
          `DELETE FROM documents
          WHERE workspace_id = $1`,
          [workspaceId],
        );
        await deps.insertAuditEvent(tx, {
          event_type: "workspace.documents_reset",
          actor_type: "system",
          actor_id: "specforge_admin",
          payload: {
            workspace_id: workspaceId,
            deleted_documents: deletedDocuments.rows.length,
          },
          created_at: resetAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      return {
        workspace_id: workspaceId,
        deleted_documents: deletedDocuments.rows.length,
        reset_at: resetAt,
      };
    },

    async createDocument(input: DocumentCreateInput, options?: StoreOptions) {
      const payload = documentCreateSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const document = makeDocumentRecord(payload);

      await database.transaction(async (tx) => {
        await tx.query(
          `INSERT INTO documents (
            document_id,
            workspace_id,
            title,
            version,
            markdown,
            editor_json,
            metadata_json,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)`,
          [
            document.document_id,
            document.workspace_id,
            document.title,
            document.version,
            document.markdown,
            JSON.stringify(document.editor_json ?? null),
            JSON.stringify(document.metadata),
            document.created_at,
            document.updated_at,
          ],
        );
        await deps.insertSnapshot(tx, document, document.created_at);
        await deps.insertAuditEvent(tx, {
          document_id: document.document_id,
          event_type: "document.created",
          actor_type: "human",
          actor_id: "workspace_owner",
          payload: {
            title: document.title,
            version: document.version,
          },
          created_at: document.created_at,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      return document;
    },

    async updateDocument(
      documentId: string,
      input: DocumentUpdateInput,
      options?: StoreOptions,
    ) {
      const payload = documentUpdateSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const current = await store.getDocument(documentId, options);

      if (!current) {
        throw new Error(`Document ${documentId} not found`);
      }

      const nextVersion = current.version + 1;
      const updatedAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        await tx.query(
          `UPDATE documents
          SET
            title = $2,
            version = $3,
            markdown = $4,
            editor_json = $5::jsonb,
            updated_at = $6
          WHERE document_id = $1`,
          [
            documentId,
            payload.title ?? current.title,
            nextVersion,
            payload.markdown,
            JSON.stringify(payload.editor_json ?? null),
            updatedAt,
          ],
        );
        await deps.insertSnapshot(
          tx,
          {
            document_id: documentId,
            version: nextVersion,
            markdown: payload.markdown,
            editor_json: payload.editor_json,
          },
          updatedAt,
        );
        await deps.insertAuditEvent(tx, {
          document_id: documentId,
          event_type: "document.updated",
          actor_type: "human",
          actor_id: "workspace_editor",
          payload: {
            from_version: current.version,
            to_version: nextVersion,
          },
          created_at: updatedAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      const updated = await store.getDocument(documentId, options);
      if (!updated) {
        throw new Error(`Document ${documentId} not found after update`);
      }

      return updated;
    },

    async createPatchProposal(input: PatchProposalInput, options?: StoreOptions) {
      const payload = patchProposalSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const document = await store.getDocument(payload.document_id, options);

      if (!document) {
        throw new Error(`Document ${payload.document_id} not found`);
      }

      const block = document.blocks.find((candidate) => candidate.block_id === payload.block_id);

      if (!block) {
        throw new Error(`Block ${payload.block_id} not found`);
      }

      const status: StoredPatch["status"] =
        payload.base_version === document.version &&
        payload.target_fingerprint === block.target_fingerprint
          ? "proposed"
          : "stale";

      const patch: StoredPatch = {
        patch_id: `patch_${randomUUID()}`,
        created_at: new Date().toISOString(),
        status,
        ...payload,
      };

      await database.transaction(async (tx) => {
        await tx.query(
          `INSERT INTO patches (
            patch_id,
            document_id,
            block_id,
            section_id,
            operation,
            content,
            patch_type,
            rationale,
            proposed_by_actor_type,
            proposed_by_actor_id,
            base_version,
            target_fingerprint,
            confidence,
            status,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            patch.patch_id,
            patch.document_id,
            patch.block_id,
            patch.section_id ?? null,
            patch.operation,
            patch.content ?? null,
            patch.patch_type,
            patch.rationale ?? null,
            patch.proposed_by.actor_type,
            patch.proposed_by.actor_id,
            patch.base_version,
            patch.target_fingerprint,
            patch.confidence ?? null,
            patch.status,
            patch.created_at,
          ],
        );
        await deps.insertAuditEvent(tx, {
          document_id: patch.document_id,
          patch_id: patch.patch_id,
          event_type: "patch.proposed",
          actor_type: patch.proposed_by.actor_type,
          actor_id: patch.proposed_by.actor_id,
          payload: {
            status: patch.status,
            patch_type: patch.patch_type,
            block_id: patch.block_id,
          },
          created_at: patch.created_at,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      return patch;
    },

    async decidePatch(input: PatchDecisionInput, options?: StoreOptions) {
      const payload = patchDecisionSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const patchResult = await database.query<PatchRow>(
        `SELECT
          patch_id,
          document_id,
          block_id,
          section_id,
          operation,
          content,
          patch_type,
          rationale,
          proposed_by_actor_type,
          proposed_by_actor_id,
          base_version,
          target_fingerprint,
          confidence,
          status,
          created_at
        FROM patches
        WHERE patch_id = $1 AND document_id = $2
        LIMIT 1`,
        [payload.patch_id, payload.document_id],
      );
      const patchRow = patchResult.rows[0];

      if (!patchRow) {
        throw new Error(`Patch ${payload.patch_id} not found`);
      }

      const patch = mapPatchRow(patchRow);
      if (!["proposed", "stale"].includes(patch.status)) {
        throw new Error(`Patch ${patch.patch_id} is already ${patch.status}`);
      }

      const document = await store.getDocument(payload.document_id, options);
      if (!document) {
        throw new Error(`Document ${payload.document_id} not found`);
      }

      const resolvedContent = payload.resolved_content?.trim() || patch.content;
      const nextStatus: StoredPatch["status"] =
        payload.decision === "accept"
          ? "accepted"
          : payload.decision === "reject"
            ? "rejected"
            : "cherry_picked";
      const decisionAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        if (payload.decision !== "reject") {
          const nextMarkdown = applyPatchToMarkdown({
            markdown: document.markdown,
            block_id: patch.block_id,
            operation: patch.operation,
            content: resolvedContent,
          });
          const nextVersion = document.version + 1;

          await tx.query(
            `UPDATE documents
            SET
              version = $2,
              markdown = $3,
              editor_json = $4::jsonb,
              updated_at = $5
            WHERE document_id = $1`,
            [
              document.document_id,
              nextVersion,
              nextMarkdown,
              JSON.stringify(null),
              decisionAt,
            ],
          );
          await deps.insertSnapshot(
            tx,
            {
              document_id: document.document_id,
              version: nextVersion,
              markdown: nextMarkdown,
              editor_json: undefined,
            },
            decisionAt,
          );
          await deps.insertAuditEvent(tx, {
            document_id: document.document_id,
            patch_id: patch.patch_id,
            event_type: "document.updated_from_patch",
            actor_type: payload.decided_by.actor_type,
            actor_id: payload.decided_by.actor_id,
            payload: {
              decision: payload.decision,
              from_version: document.version,
              to_version: nextVersion,
            },
            created_at: decisionAt,
          });
        }

        await tx.query(
          `UPDATE patches
          SET status = $3
          WHERE patch_id = $1 AND document_id = $2`,
          [patch.patch_id, patch.document_id, nextStatus],
        );
        await deps.insertAuditEvent(tx, {
          document_id: patch.document_id,
          patch_id: patch.patch_id,
          event_type: "patch.decided",
          actor_type: payload.decided_by.actor_type,
          actor_id: payload.decided_by.actor_id,
          payload: {
            decision: payload.decision,
            status: nextStatus,
          },
          created_at: decisionAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      const updatedResult = await database.query<PatchRow>(
        `SELECT
          patch_id,
          document_id,
          block_id,
          section_id,
          operation,
          content,
          patch_type,
          rationale,
          proposed_by_actor_type,
          proposed_by_actor_id,
          base_version,
          target_fingerprint,
          confidence,
          status,
          created_at
        FROM patches
        WHERE patch_id = $1
        LIMIT 1`,
        [patch.patch_id],
      );

      return mapPatchRow(updatedResult.rows[0]!);
    },

    async createCommentThread(input: CommentThreadCreateInput, options?: StoreOptions) {
      const payload = commentThreadCreateSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const threadId = `thread_${randomUUID()}`;
      const createdAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        await tx.query(
          `INSERT INTO comment_threads (
            thread_id,
            document_id,
            block_id,
            body,
            status,
            created_by_actor_type,
            created_by_actor_id,
            resolved_by_actor_type,
            resolved_by_actor_id,
            created_at,
            resolved_at
          ) VALUES ($1, $2, $3, $4, 'open', $5, $6, NULL, NULL, $7, NULL)`,
          [
            threadId,
            payload.document_id,
            payload.block_id,
            payload.body,
            payload.created_by.actor_type,
            payload.created_by.actor_id,
            createdAt,
          ],
        );
        await deps.insertAuditEvent(tx, {
          document_id: payload.document_id,
          event_type: "comment.created",
          actor_type: payload.created_by.actor_type,
          actor_id: payload.created_by.actor_id,
          payload: {
            thread_id: threadId,
            block_id: payload.block_id,
          },
          created_at: createdAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      const threads = await store.listCommentThreads(payload.document_id, options);
      return threads.find((thread) => thread.thread_id === threadId)!;
    },

    async resolveCommentThread(input: CommentThreadResolveInput, options?: StoreOptions) {
      const payload = commentThreadResolveSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const resolvedAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        await tx.query(
          `UPDATE comment_threads
          SET
            status = 'resolved',
            resolved_by_actor_type = $3,
            resolved_by_actor_id = $4,
            resolved_at = $5
          WHERE thread_id = $1 AND document_id = $2`,
          [
            payload.thread_id,
            payload.document_id,
            payload.resolved_by.actor_type,
            payload.resolved_by.actor_id,
            resolvedAt,
          ],
        );
        await deps.insertAuditEvent(tx, {
          document_id: payload.document_id,
          event_type: "comment.resolved",
          actor_type: payload.resolved_by.actor_type,
          actor_id: payload.resolved_by.actor_id,
          payload: {
            thread_id: payload.thread_id,
          },
          created_at: resolvedAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      const threads = await store.listCommentThreads(payload.document_id, options);
      const thread = threads.find((candidate) => candidate.thread_id === payload.thread_id);
      if (!thread) {
        throw new Error(`Comment thread ${payload.thread_id} not found`);
      }

      return thread;
    },

    async createClarification(input: ClarificationCreateInput, options?: StoreOptions) {
      const payload = clarificationCreateSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const clarificationId = `clar_${randomUUID()}`;
      const createdAt = new Date().toISOString();

      await database.transaction(async (tx) => {
        await tx.query(
          `INSERT INTO clarifications (
            clarification_id,
            document_id,
            section_heading,
            question,
            status,
            created_by_actor_type,
            created_by_actor_id,
            created_at
          ) VALUES ($1, $2, $3, $4, 'open', $5, $6, $7)`,
          [
            clarificationId,
            payload.document_id,
            payload.section_heading,
            payload.question,
            payload.created_by.actor_type,
            payload.created_by.actor_id,
            createdAt,
          ],
        );
        await deps.insertAuditEvent(tx, {
          document_id: payload.document_id,
          event_type: "clarification.created",
          actor_type: payload.created_by.actor_type,
          actor_id: payload.created_by.actor_id,
          payload: {
            clarification_id: clarificationId,
            section_heading: payload.section_heading,
          },
          created_at: createdAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);
      const clarifications = await store.listClarifications(payload.document_id, options);
      return clarifications.find((item) => item.clarification_id === clarificationId)!;
    },

    async answerClarification(input: ClarificationAnswerInput, options?: StoreOptions) {
      const payload = clarificationAnswerSchema.parse(input);
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const document = await store.getDocument(payload.document_id, options);

      if (!document) {
        throw new Error(`Document ${payload.document_id} not found`);
      }

      const clarifications = await store.listClarifications(payload.document_id, options);
      const clarification = clarifications.find(
        (item) => item.clarification_id === payload.clarification_id,
      );

      if (!clarification) {
        throw new Error(`Clarification ${payload.clarification_id} not found`);
      }

      const answeredAt = new Date().toISOString();
      const nextMarkdown = upsertSectionBullet(
        document.markdown,
        clarification.section_heading,
        payload.answer,
      );
      const nextShape = deriveDocumentShape(nextMarkdown);

      await database.transaction(async (tx) => {
        await tx.query(
          `UPDATE clarifications
          SET
            status = 'answered',
            answer_text = $2,
            answered_by_actor_type = $3,
            answered_by_actor_id = $4,
            answered_at = $5
          WHERE clarification_id = $1`,
          [
            payload.clarification_id,
            payload.answer,
            payload.answered_by.actor_type,
            payload.answered_by.actor_id,
            answeredAt,
          ],
        );
        await tx.query(
          `UPDATE documents
          SET
            version = $2,
            markdown = $3,
            editor_json = $4::jsonb,
            updated_at = $5
          WHERE document_id = $1`,
          [
            document.document_id,
            document.version + 1,
            nextMarkdown,
            JSON.stringify(null),
            answeredAt,
          ],
        );
        await deps.insertSnapshot(
          tx,
          {
            document_id: document.document_id,
            version: document.version + 1,
            markdown: nextMarkdown,
            editor_json: undefined,
          },
          answeredAt,
        );
        await deps.insertAuditEvent(tx, {
          document_id: document.document_id,
          event_type: "clarification.answered",
          actor_type: payload.answered_by.actor_type,
          actor_id: payload.answered_by.actor_id,
          payload: {
            clarification_id: payload.clarification_id,
            section_heading: clarification.section_heading,
          },
          created_at: answeredAt,
        });
      });

      await deps.persistSnapshot(database, dbPath);

      return {
        document: {
          ...document,
          markdown: nextMarkdown,
          version: document.version + 1,
          sections: nextShape.sections,
          blocks: nextShape.blocks,
          updated_at: answeredAt,
        },
        clarification:
          (await store.listClarifications(payload.document_id, options)).find(
            (item) => item.clarification_id === payload.clarification_id,
          ) ?? null,
      };
    },

    async exportDocument(documentId: string, options?: StoreOptions) {
      const document = await store.getDocument(documentId, options);

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      const patches = await store.listPatches(documentId, options);
      return exportDocumentBundle(document, patches);
    },
  };

  return store;
}
