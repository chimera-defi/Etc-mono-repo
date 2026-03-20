import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";

import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

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
  type PatchDecisionInput,
  type DocumentUpdateInput,
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

type StoreOptions = {
  backend?: "pglite" | "postgres";
  dbPath?: string;
  databaseUrl?: string;
  fixturesDir?: string;
  workspaceId?: string;
};

type QuerySession = {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec?: (sql: string) => Promise<unknown>;
};

type Queryable = QuerySession & {
  close?: () => Promise<void>;
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

type WorkspaceRow = {
  workspace_id: string;
  name: string;
  plan: "demo" | "pilot";
  created_at: string;
};

type WorkspaceMemberRow = {
  membership_id: string;
  workspace_id: string;
  actor_id: string;
  actor_type: "human" | "agent";
  name: string;
  role: string;
  color: string;
  github_login: string | null;
  created_at: string;
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

export type AuditEventRecord = {
  event_id: string;
  document_id?: string;
  patch_id?: string;
  event_type: string;
  actor_type: "human" | "agent" | "system";
  actor_id: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type WorkspaceRecord = {
  workspace_id: string;
  name: string;
  plan: "demo" | "pilot";
  created_at: string;
};

export type UserRecord = {
  user_id: string;
  github_id?: string;
  github_login?: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMembershipRecord = {
  membership_id: string;
  workspace_id: string;
  actor_id: string;
  actor_type: "human" | "agent";
  name: string;
  role: string;
  color: string;
  github_login?: string;
  created_at: string;
};

export type WorkspaceActivityMetrics = {
  workspace_id: string;
  document_count: number;
  reviewed_document_count: number;
  commented_document_count: number;
  clarified_document_count: number;
};

export type WorkspaceUsageSummary = {
  workspace_id: string;
  assist_request_count: number;
  handoff_view_count: number;
  execution_view_count: number;
  launch_packet_view_count: number;
};

type UserRow = {
  user_id: string;
  github_id: string | null;
  github_login: string | null;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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

export type CommentThreadRecord = {
  thread_id: string;
  document_id: string;
  block_id: string;
  body: string;
  status: "open" | "resolved";
  created_by: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  resolved_by?: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  created_at: string;
  resolved_at?: string;
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

type DocumentSnapshotRow = {
  snapshot_id: string;
  document_id: string;
  version: number;
  markdown: string;
  editor_json: unknown | null;
  created_at: string;
};

export type ClarificationRecord = {
  clarification_id: string;
  document_id: string;
  section_heading: string;
  question: string;
  status: "open" | "answered";
  created_by: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  answer_text?: string;
  answered_by?: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  created_at: string;
  answered_at?: string;
};

const databaseCache = new Map<string, Promise<Queryable>>();
const snapshotVersionCache = new Map<string, number>();

function normalizePathLike(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "pathname" in value &&
    typeof value.pathname === "string"
  ) {
    return value.pathname;
  }

  return String(value);
}

const currentWorkingDirectory = normalizePathLike(process.cwd());
const defaultDbPath = path.resolve(currentWorkingDirectory, ".data", "specforge-store.json");
const defaultFixturesDir = path.resolve(currentWorkingDirectory, "..", "fixtures");

function resolveOptions(options: StoreOptions = {}) {
  const envBackend = process.env.SPECFORGE_PERSISTENCE_BACKEND;
  const envDbPath = process.env.SPECFORGE_DB_PATH;
  const envDatabaseUrl = process.env.DATABASE_URL;
  const envFixturesDir = process.env.SPECFORGE_FIXTURES_DIR;
  const resolvedBackend =
    options.backend ??
    (envBackend === "postgres" || options.databaseUrl || envDatabaseUrl ? "postgres" : "pglite");
  const resolvedDbPath =
    options.dbPath ??
    (envDbPath ? normalizePathLike(envDbPath) : defaultDbPath);
  const resolvedDatabaseUrl = options.databaseUrl ?? envDatabaseUrl;

  return {
    backend: resolvedBackend,
    dbPath:
      resolvedDbPath.startsWith("memory://")
        ? resolvedDbPath
        : path.resolve(currentWorkingDirectory, resolvedDbPath),
    databaseUrl: resolvedDatabaseUrl,
    fixturesDir:
      options.fixturesDir ??
      (envFixturesDir
        ? path.resolve(currentWorkingDirectory, envFixturesDir)
        : defaultFixturesDir),
  };
}

export function getPersistenceConfig(options: StoreOptions = {}) {
  const { backend, dbPath, databaseUrl, fixturesDir } = resolveOptions(options);

  return {
    backend,
    database_url_configured: backend === "postgres" ? Boolean(databaseUrl) : false,
    db_path: dbPath,
    fixtures_dir: fixturesDir,
    mode:
      backend === "postgres"
        ? "postgres_pool"
        : dbPath.startsWith("memory://")
          ? "memory"
          : "snapshot_file",
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

type StoreSnapshot = {
  workspaces: WorkspaceRow[];
  workspace_members: WorkspaceMemberRow[];
  users: UserRow[];
  documents: DocumentRow[];
  document_snapshots: DocumentSnapshotRow[];
  patches: PatchRow[];
  audit_events: AuditEventRow[];
  comment_threads: CommentThreadRow[];
  clarifications: ClarificationRow[];
};

async function getSnapshotVersion(snapshotPath: string) {
  if (snapshotPath.startsWith("memory://")) {
    return 0;
  }

  try {
    const result = await stat(snapshotPath);
    return result.mtimeMs;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return 0;
    }

    throw error;
  }
}

async function dumpSnapshot(database: QuerySession): Promise<StoreSnapshot> {
  const [
    workspaces,
    workspaceMembers,
    users,
    documents,
    documentSnapshots,
    patches,
    auditEvents,
    commentThreads,
    clarifications,
  ] =
    await Promise.all([
      database.query<WorkspaceRow>(
        `SELECT workspace_id, name, plan, created_at
        FROM workspaces
        ORDER BY created_at ASC`,
      ),
      database.query<WorkspaceMemberRow>(
        `SELECT
          membership_id,
          workspace_id,
          actor_id,
          actor_type,
          name,
          role,
          color,
          github_login,
          created_at
        FROM workspace_members
        ORDER BY created_at ASC`,
      ),
      database.query<UserRow>(
        `SELECT
          user_id,
          github_id,
          github_login,
          email,
          display_name,
          avatar_url,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at ASC`,
      ),
    database.query<DocumentRow>(
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
      ORDER BY created_at ASC`,
    ),
    database.query<DocumentSnapshotRow>(
      `SELECT
        snapshot_id,
        document_id,
        version,
        markdown,
        editor_json,
        created_at
      FROM document_snapshots
      ORDER BY created_at ASC`,
    ),
    database.query<PatchRow>(
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
      ORDER BY created_at ASC`,
    ),
    database.query<AuditEventRow>(
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
      ORDER BY created_at ASC`,
    ),
    database.query<CommentThreadRow>(
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
      ORDER BY created_at ASC`,
    ),
    database.query<ClarificationRow>(
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
      ORDER BY created_at ASC`,
    ),
    ]);

  return {
    workspaces: workspaces.rows,
    workspace_members: workspaceMembers.rows,
    users: users.rows,
    documents: documents.rows,
    document_snapshots: documentSnapshots.rows,
    patches: patches.rows,
    audit_events: auditEvents.rows,
    comment_threads: commentThreads.rows,
    clarifications: clarifications.rows,
  };
}

async function execSql(database: QuerySession, sql: string) {
  if (database.exec) {
    await database.exec(sql);
    return;
  }

  await database.query(sql);
}

async function hydrateSnapshot(database: QuerySession, snapshot: StoreSnapshot) {
  await execSql(database, `
    DELETE FROM clarifications;
    DELETE FROM document_snapshots;
    DELETE FROM comment_threads;
    DELETE FROM audit_events;
    DELETE FROM patches;
    DELETE FROM documents;
    DELETE FROM workspace_members;
    DELETE FROM workspaces;
    DELETE FROM users;
  `);

  for (const row of snapshot.workspaces ?? []) {
    await database.query(
      `INSERT INTO workspaces (
        workspace_id,
        name,
        plan,
        created_at
      ) VALUES ($1, $2, $3, $4)`,
      [row.workspace_id, row.name, row.plan, row.created_at],
    );
  }

  for (const row of snapshot.workspace_members ?? []) {
    await database.query(
      `INSERT INTO workspace_members (
        membership_id,
        workspace_id,
        actor_id,
        actor_type,
        name,
        role,
        color,
        github_login,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.membership_id,
        row.workspace_id,
        row.actor_id,
        row.actor_type,
        row.name,
        row.role,
        row.color,
        row.github_login ?? null,
        row.created_at,
      ],
    );
  }

  for (const row of snapshot.users ?? []) {
    await database.query(
      `INSERT INTO users (
        user_id,
        github_id,
        github_login,
        email,
        display_name,
        avatar_url,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.user_id,
        row.github_id ?? null,
        row.github_login ?? null,
        row.email ?? null,
        row.display_name,
        row.avatar_url ?? null,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  for (const row of snapshot.documents) {
    await database.query(
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.document_id,
        row.workspace_id,
        row.title,
        row.version,
        row.markdown,
        row.editor_json ?? null,
        row.metadata_json ?? {},
        row.created_at,
        row.updated_at,
      ],
    );
  }

  for (const row of snapshot.document_snapshots ?? []) {
    await database.query(
      `INSERT INTO document_snapshots (
        snapshot_id,
        document_id,
        version,
        markdown,
        editor_json,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        row.snapshot_id,
        row.document_id,
        row.version,
        row.markdown,
        row.editor_json ?? null,
        row.created_at,
      ],
    );
  }

  for (const row of snapshot.patches) {
    await database.query(
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
        row.patch_id,
        row.document_id,
        row.block_id,
        row.section_id ?? null,
        row.operation,
        row.content ?? null,
        row.patch_type,
        row.rationale ?? null,
        row.proposed_by_actor_type,
        row.proposed_by_actor_id,
        row.base_version,
        row.target_fingerprint,
        row.confidence ?? null,
        row.status,
        row.created_at,
      ],
    );
  }

  for (const row of snapshot.audit_events) {
    await database.query(
      `INSERT INTO audit_events (
        event_id,
        document_id,
        patch_id,
        event_type,
        actor_type,
        actor_id,
        payload_json,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.event_id,
        row.document_id ?? null,
        row.patch_id ?? null,
        row.event_type,
        row.actor_type,
        row.actor_id,
        row.payload_json ?? {},
        row.created_at,
      ],
    );
  }

  for (const row of snapshot.comment_threads) {
    await database.query(
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        row.thread_id,
        row.document_id,
        row.block_id,
        row.body,
        row.status,
        row.created_by_actor_type,
        row.created_by_actor_id,
        row.resolved_by_actor_type ?? null,
        row.resolved_by_actor_id ?? null,
        row.created_at,
        row.resolved_at ?? null,
      ],
    );
  }

  for (const row of snapshot.clarifications ?? []) {
    await database.query(
      `INSERT INTO clarifications (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        row.clarification_id,
        row.document_id,
        row.section_heading,
        row.question,
        row.status,
        row.created_by_actor_type,
        row.created_by_actor_id,
        row.answer_text ?? null,
        row.answered_by_actor_type ?? null,
        row.answered_by_actor_id ?? null,
        row.created_at,
        row.answered_at ?? null,
      ],
    );
  }
}

async function persistSnapshot(database: QuerySession, snapshotPath: string) {
  if (snapshotPath.startsWith("memory://")) {
    return;
  }

  await mkdir(path.dirname(snapshotPath), { recursive: true });
  const snapshot = await dumpSnapshot(database);
  const tempPath = `${snapshotPath}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(snapshot, null, 2));
  await rename(tempPath, snapshotPath);
  snapshotVersionCache.set(snapshotPath, await getSnapshotVersion(snapshotPath));
}

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

async function createSchema(database: QuerySession) {
  await execSql(database, `
    CREATE TABLE IF NOT EXISTS workspaces (
      workspace_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      membership_id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
      actor_id TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      color TEXT NOT NULL,
      github_login TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      document_id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      version INTEGER NOT NULL,
      markdown TEXT NOT NULL,
      editor_json JSONB,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patches (
      patch_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
      block_id TEXT NOT NULL,
      section_id TEXT,
      operation TEXT NOT NULL,
      content TEXT,
      patch_type TEXT NOT NULL,
      rationale TEXT,
      proposed_by_actor_type TEXT NOT NULL,
      proposed_by_actor_id TEXT NOT NULL,
      base_version INTEGER NOT NULL,
      target_fingerprint TEXT NOT NULL,
      confidence DOUBLE PRECISION,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_snapshots (
      snapshot_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      markdown TEXT NOT NULL,
      editor_json JSONB,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      event_id TEXT PRIMARY KEY,
      document_id TEXT REFERENCES documents(document_id) ON DELETE CASCADE,
      patch_id TEXT REFERENCES patches(patch_id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comment_threads (
      thread_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
      block_id TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by_actor_type TEXT NOT NULL,
      created_by_actor_id TEXT NOT NULL,
      resolved_by_actor_type TEXT,
      resolved_by_actor_id TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS clarifications (
      clarification_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
      section_heading TEXT NOT NULL,
      question TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by_actor_type TEXT NOT NULL,
      created_by_actor_id TEXT NOT NULL,
      answer_text TEXT,
      answered_by_actor_type TEXT,
      answered_by_actor_id TEXT,
      created_at TEXT NOT NULL,
      answered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      github_id TEXT UNIQUE,
      github_login TEXT UNIQUE,
      email TEXT,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

async function insertAuditEvent(
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
) {
  await database.query(
    `INSERT INTO audit_events (
      event_id,
      document_id,
      patch_id,
      event_type,
      actor_type,
      actor_id,
      payload_json,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
    [
      `event_${randomUUID()}`,
      input.document_id ?? null,
      input.patch_id ?? null,
      input.event_type,
      input.actor_type,
      input.actor_id,
      JSON.stringify(input.payload ?? {}),
      input.created_at ?? new Date().toISOString(),
    ],
  );
}

async function insertSnapshot(
  database: QuerySession,
  document: Pick<DocumentRecord, "document_id" | "version" | "markdown" | "editor_json">,
  createdAt: string,
) {
  await database.query(
    `INSERT INTO document_snapshots (
      snapshot_id,
      document_id,
      version,
      markdown,
      editor_json,
      created_at
    ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [
      `snap_${randomUUID()}`,
      document.document_id,
      document.version,
      document.markdown,
      JSON.stringify(document.editor_json ?? null),
      createdAt,
    ],
  );
}

async function seedDatabase(database: QuerySession, fixturesDir: string) {
  const workspace = await readJson<{
    workspace_id: string;
    document_id: string;
    title: string;
    version: number;
    markdown: string;
  }>(path.join(fixturesDir, "workspace.seed.json"));
  const now = new Date().toISOString();
  await database.query(
    `INSERT INTO workspaces (
      workspace_id,
      name,
      plan,
      created_at
    ) VALUES ($1, $2, $3, $4)`,
    [workspace.workspace_id, "SpecForge Demo Workspace", "demo", now],
  );
  for (const member of [
    {
      membership_id: "membership_owner",
      actor_id: "workspace_owner",
      actor_type: "human",
      name: "Founder",
      role: "Workspace owner",
      color: "#0f766e",
      github_login: "chimera-defi",
    },
    {
      membership_id: "membership_reviewer",
      actor_id: "specforge_reviewer",
      actor_type: "human",
      name: "Reviewer",
      role: "Product reviewer",
      color: "#1d4ed8",
      github_login: null,
    },
    {
      membership_id: "membership_operator",
      actor_id: "specforge_operator",
      actor_type: "human",
      name: "Agent operator",
      role: "Build operator",
      color: "#c2410c",
      github_login: null,
    },
  ]) {
    await database.query(
      `INSERT INTO workspace_members (
        membership_id,
        workspace_id,
        actor_id,
        actor_type,
        name,
        role,
        color,
        github_login,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        member.membership_id,
        workspace.workspace_id,
        member.actor_id,
        member.actor_type,
        member.name,
        member.role,
        member.color,
        member.github_login,
        now,
      ],
    );
  }
  const document = mapDocumentRow({
    document_id: workspace.document_id,
    workspace_id: workspace.workspace_id,
    title: workspace.title,
    version: workspace.version,
    markdown: workspace.markdown,
    editor_json: null,
    metadata_json: {},
    created_at: now,
    updated_at: now,
  });

  await database.query(
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
  await insertSnapshot(database, document, now);
  await insertAuditEvent(database, {
    document_id: document.document_id,
    event_type: "document.seeded",
    actor_type: "system",
    actor_id: "fixtures",
    payload: {
      version: document.version,
    },
    created_at: now,
  });

  const patchesRaw = await readFile(path.join(fixturesDir, "patches.seed.jsonl"), "utf8");
  const patches: StoredPatch[] = patchesRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Partial<StoredPatch>)
    .map((patch) => ({
      patch_id: patch.patch_id ?? `patch_${randomUUID()}`,
      document_id: document.document_id,
      block_id: patch.block_id ?? document.blocks[0]!.block_id,
      section_id: patch.section_id ?? document.blocks[0]!.section_id,
      operation: patch.operation ?? "replace",
      content: patch.content,
      patch_type: patch.patch_type ?? "requirement_change",
      rationale: patch.rationale ?? "Seed patch for local demo.",
      proposed_by: patch.proposed_by ?? {
        actor_type: "agent",
        actor_id: "seed_agent",
      },
      base_version: patch.base_version ?? document.version,
      target_fingerprint:
        patch.target_fingerprint ?? document.blocks[0]!.target_fingerprint,
      confidence: patch.confidence ?? 0.75,
      status: patch.status ?? "proposed",
      created_at: patch.created_at ?? now,
    }));

  for (const patch of patches) {
    await database.query(
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
    await insertAuditEvent(database, {
      document_id: patch.document_id,
      patch_id: patch.patch_id,
      event_type: "patch.seeded",
      actor_type: patch.proposed_by.actor_type,
      actor_id: patch.proposed_by.actor_id,
      payload: {
        status: patch.status,
        patch_type: patch.patch_type,
      },
      created_at: patch.created_at,
    });
  }
}

async function ensureWorkspaceSeedData(database: QuerySession) {
  const documentWorkspace = await database.query<{ workspace_id: string }>(
    `SELECT workspace_id FROM documents ORDER BY created_at ASC LIMIT 1`,
  );
  const workspaceId = documentWorkspace.rows[0]?.workspace_id ?? "ws_demo";
  const existingWorkspace = await database.query<{ workspace_id: string }>(
    `SELECT workspace_id FROM workspaces WHERE workspace_id = $1 LIMIT 1`,
    [workspaceId],
  );
  const now = new Date().toISOString();

  if (existingWorkspace.rows.length === 0) {
    await database.query(
      `INSERT INTO workspaces (
        workspace_id,
        name,
        plan,
        created_at
      ) VALUES ($1, $2, $3, $4)`,
      [workspaceId, "SpecForge Demo Workspace", "demo", now],
    );
  }

  for (const member of [
    ["membership_owner", "workspace_owner", "human", "Founder", "Workspace owner", "#0f766e", "chimera-defi"],
    ["membership_reviewer", "specforge_reviewer", "human", "Reviewer", "Product reviewer", "#1d4ed8", null],
    ["membership_operator", "specforge_operator", "human", "Agent operator", "Build operator", "#c2410c", null],
  ]) {
    const existingMember = await database.query<{ membership_id: string }>(
      `SELECT membership_id
      FROM workspace_members
      WHERE workspace_id = $1 AND actor_id = $2
      LIMIT 1`,
      [workspaceId, member[1]],
    );

    if (existingMember.rows.length === 0) {
      await database.query(
        `INSERT INTO workspace_members (
          membership_id,
          workspace_id,
          actor_id,
          actor_type,
          name,
          role,
          color,
          github_login,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [member[0], workspaceId, member[1], member[2], member[3], member[4], member[5], member[6], now],
      );
    }
  }
}

async function getDatabase(options: StoreOptions = {}) {
  const { backend, dbPath, databaseUrl, fixturesDir } = resolveOptions(options);
  const isMemoryDatabase = backend === "pglite" && dbPath.startsWith("memory://");
  const cacheKey = backend === "postgres" ? `postgres:${databaseUrl ?? "missing"}` : dbPath;

  if (!databaseCache.has(cacheKey)) {
    databaseCache.set(
      cacheKey,
      (async () => {
        if (backend === "postgres") {
          if (!databaseUrl) {
            throw new Error(
              "DATABASE_URL is required when SPECFORGE_PERSISTENCE_BACKEND=postgres",
            );
          }

          const pool = new Pool({
            connectionString: databaseUrl,
            ssl:
              process.env.SPECFORGE_POSTGRES_SSL === "true"
                ? { rejectUnauthorized: false }
                : undefined,
          });
          const database: Queryable = {
            query: async <T = unknown>(sql: string, params?: unknown[]) => {
              const result = await pool.query(sql, params);
              return {
                rows: result.rows as T[],
              };
            },
            close: () => pool.end(),
            transaction: async <T>(fn: (tx: QuerySession) => Promise<T>) => {
              const client = await pool.connect();
              const tx: QuerySession = {
                query: async <R = unknown>(sql: string, params?: unknown[]) => {
                  const result = await client.query(sql, params);
                  return {
                    rows: result.rows as R[],
                  };
                },
              };

              try {
                await client.query("BEGIN");
                const result = await fn(tx);
                await client.query("COMMIT");
                return result;
              } catch (error) {
                await client.query("ROLLBACK");
                throw error;
              } finally {
                client.release();
              }
            },
          };
          await createSchema(database);
          const documentCount = await database.query<{ count: string }>(
            "SELECT COUNT(*)::text AS count FROM documents",
          );

          if ((documentCount.rows[0]?.count ?? "0") === "0") {
            await seedDatabase(database, fixturesDir);
          }

          await ensureWorkspaceSeedData(database);
          return database;
        }

        const rawDatabase = await PGlite.create();
        const database: Queryable = {
          query: (sql, params) => rawDatabase.query(sql, params),
          exec: (sql) => rawDatabase.exec(sql),
          transaction: async <T>(fn: (tx: QuerySession) => Promise<T>) =>
            rawDatabase.transaction((tx) =>
              fn({
                query: (sql, params) => tx.query(sql, params),
                exec: (sql) => tx.exec(sql),
              }),
            ),
        };
        await createSchema(database);

        if (isMemoryDatabase) {
          await seedDatabase(database, fixturesDir);
          await ensureWorkspaceSeedData(database);
          return database;
        }

        const snapshotVersion = await getSnapshotVersion(dbPath);

        if (snapshotVersion > 0) {
          const snapshot = await readJson<StoreSnapshot>(dbPath);
          await hydrateSnapshot(database, snapshot);
          await ensureWorkspaceSeedData(database);
          snapshotVersionCache.set(dbPath, snapshotVersion);
          return database;
        }

        await seedDatabase(database, fixturesDir);
        await ensureWorkspaceSeedData(database);
        await persistSnapshot(database, dbPath);
        return database;
      })(),
    );
  }

  const database = await databaseCache.get(cacheKey)!;

  if (backend === "pglite" && !isMemoryDatabase) {
    const diskVersion = await getSnapshotVersion(dbPath);
    const cachedVersion = snapshotVersionCache.get(cacheKey) ?? 0;

    if (diskVersion > cachedVersion) {
      const snapshot = await readJson<StoreSnapshot>(dbPath);
      await hydrateSnapshot(database, snapshot);
      await ensureWorkspaceSeedData(database);
      snapshotVersionCache.set(cacheKey, diskVersion);
    }
  }

  return database;
}

export async function resetStoreCacheForTests() {
  const databases = await Promise.all(databaseCache.values());

  await Promise.all(
    databases.map(async (database) => {
      if (database.close) {
        await database.close();
      }
    }),
  );

  databaseCache.clear();
  snapshotVersionCache.clear();
}

export async function listDocuments(options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function listWorkspaceRecords(options?: StoreOptions) {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceRow>(
    `SELECT workspace_id, name, plan, created_at
    FROM workspaces
    ORDER BY created_at ASC`,
  );

  return result.rows.map((row) => ({
    workspace_id: row.workspace_id,
    name: row.name,
    plan: row.plan,
    created_at: row.created_at,
  }));
}

export async function listWorkspaceMemberships(workspaceId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    FROM workspace_members
    WHERE workspace_id = $1
    ORDER BY created_at ASC`,
    [workspaceId],
  );

  return result.rows.map((row) => ({
    membership_id: row.membership_id,
    workspace_id: row.workspace_id,
    actor_id: row.actor_id,
    actor_type: row.actor_type,
    name: row.name,
    role: row.role,
    color: row.color,
    github_login: row.github_login ?? undefined,
    created_at: row.created_at,
  }));
}

export async function getWorkspaceMembershipByActorId(
  actorId: string,
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord | null> {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    FROM workspace_members
    WHERE actor_id = $1
    LIMIT 1`,
    [actorId],
  );

  const row = result.rows[0];

  return row
    ? {
        membership_id: row.membership_id,
        workspace_id: row.workspace_id,
        actor_id: row.actor_id,
        actor_type: row.actor_type,
        name: row.name,
        role: row.role,
        color: row.color,
        github_login: row.github_login ?? undefined,
        created_at: row.created_at,
      }
    : null;
}

export async function createWorkspaceMembership(
  input: {
    workspace_id: string;
    name: string;
    role: string;
    color: string;
    github_login?: string;
  },
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord> {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const now = new Date().toISOString();
  const actorIdBase =
    input.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "workspace_member";
  const actorId = `${actorIdBase}_${randomUUID().slice(0, 6)}`;
  const membershipId = `membership_${randomUUID()}`;

  await database.query(
    `INSERT INTO workspace_members (
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    ) VALUES ($1, $2, $3, 'human', $4, $5, $6, $7, $8)`,
    [
      membershipId,
      input.workspace_id,
      actorId,
      input.name.trim(),
      input.role.trim(),
      input.color.trim(),
      input.github_login?.trim() || null,
      now,
    ],
  );
  await persistSnapshot(database, dbPath);

  return {
    membership_id: membershipId,
    workspace_id: input.workspace_id,
    actor_id: actorId,
    actor_type: "human",
    name: input.name.trim(),
    role: input.role.trim(),
    color: input.color.trim(),
    github_login: input.github_login?.trim() || undefined,
    created_at: now,
  };
}

export async function getWorkspaceActivityMetrics(
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceActivityMetrics> {
  const database = await getDatabase(options);
  const [documents, reviewed, commented, clarified] = await Promise.all([
    database.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
      FROM documents
      WHERE workspace_id = $1`,
      [workspaceId],
    ),
    database.query<{ count: string }>(
      `SELECT COUNT(DISTINCT p.document_id)::text AS count
      FROM patches p
      INNER JOIN documents d ON d.document_id = p.document_id
      WHERE d.workspace_id = $1`,
      [workspaceId],
    ),
    database.query<{ count: string }>(
      `SELECT COUNT(DISTINCT c.document_id)::text AS count
      FROM comment_threads c
      INNER JOIN documents d ON d.document_id = c.document_id
      WHERE d.workspace_id = $1`,
      [workspaceId],
    ),
    database.query<{ count: string }>(
      `SELECT COUNT(DISTINCT c.document_id)::text AS count
      FROM clarifications c
      INNER JOIN documents d ON d.document_id = c.document_id
      WHERE d.workspace_id = $1`,
      [workspaceId],
    ),
  ]);

  return {
    workspace_id: workspaceId,
    document_count: Number(documents.rows[0]?.count ?? 0),
    reviewed_document_count: Number(reviewed.rows[0]?.count ?? 0),
    commented_document_count: Number(commented.rows[0]?.count ?? 0),
    clarified_document_count: Number(clarified.rows[0]?.count ?? 0),
  };
}

export async function recordWorkspaceEvent(
  input: {
    workspace_id: string;
    event_type: string;
    actor_type: "human" | "agent" | "system";
    actor_id: string;
    payload?: Record<string, unknown>;
  },
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  await insertAuditEvent(database, {
    event_type: input.event_type,
    actor_type: input.actor_type,
    actor_id: input.actor_id,
    payload: {
      workspace_id: input.workspace_id,
      ...(input.payload ?? {}),
    },
  });
  await persistSnapshot(database, dbPath);
}

export async function getWorkspaceUsageSummary(
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceUsageSummary> {
  const database = await getDatabase(options);
  const result = await database.query<{
    assist_request_count: string;
    handoff_view_count: string;
    execution_view_count: string;
    launch_packet_view_count: string;
  }>(
    `SELECT
      COUNT(*) FILTER (WHERE event_type = 'usage.assist_requested')::text AS assist_request_count,
      COUNT(*) FILTER (WHERE event_type = 'usage.handoff_viewed')::text AS handoff_view_count,
      COUNT(*) FILTER (WHERE event_type = 'usage.execution_viewed')::text AS execution_view_count,
      COUNT(*) FILTER (WHERE event_type = 'usage.launch_packet_viewed')::text AS launch_packet_view_count
    FROM audit_events
    WHERE document_id IS NULL
      AND payload_json->>'workspace_id' = $1`,
    [workspaceId],
  );

  return {
    workspace_id: workspaceId,
    assist_request_count: Number(result.rows[0]?.assist_request_count ?? 0),
    handoff_view_count: Number(result.rows[0]?.handoff_view_count ?? 0),
    execution_view_count: Number(result.rows[0]?.execution_view_count ?? 0),
    launch_packet_view_count: Number(result.rows[0]?.launch_packet_view_count ?? 0),
  };
}

export async function getDocument(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function listPatches(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function listAuditEvents(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function listCommentThreads(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function listClarifications(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
}

export async function resetWorkspaceDocuments(workspaceId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  return {
    workspace_id: workspaceId,
    deleted_documents: deletedDocuments.rows.length,
    reset_at: resetAt,
  };
}

export async function createDocument(input: DocumentCreateInput, options?: StoreOptions) {
  const payload = documentCreateSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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
    await insertSnapshot(tx, document, document.created_at);
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  return document;
}

export async function updateDocument(
  documentId: string,
  input: DocumentUpdateInput,
  options?: StoreOptions,
) {
  const payload = documentUpdateSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const current = await getDocument(documentId, options);

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
    await insertSnapshot(
      tx,
      {
        document_id: documentId,
        version: nextVersion,
        markdown: payload.markdown,
        editor_json: payload.editor_json,
      },
      updatedAt,
    );
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  const updated = await getDocument(documentId, options);
  if (!updated) {
    throw new Error(`Document ${documentId} not found after update`);
  }

  return updated;
}

export async function createPatchProposal(
  input: PatchProposalInput,
  options?: StoreOptions,
) {
  const payload = patchProposalSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const document = await getDocument(payload.document_id, options);

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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  return patch;
}

export async function decidePatch(
  input: PatchDecisionInput,
  options?: StoreOptions,
) {
  const payload = patchDecisionSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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

  const document = await getDocument(payload.document_id, options);
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
      await insertSnapshot(
        tx,
        {
          document_id: document.document_id,
          version: nextVersion,
          markdown: nextMarkdown,
          editor_json: undefined,
        },
        decisionAt,
      );
      await insertAuditEvent(tx, {
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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

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
}

export async function createCommentThread(
  input: CommentThreadCreateInput,
  options?: StoreOptions,
) {
  const payload = commentThreadCreateSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  const threads = await listCommentThreads(payload.document_id, options);
  return threads.find((thread) => thread.thread_id === threadId)!;
}

export async function resolveCommentThread(
  input: CommentThreadResolveInput,
  options?: StoreOptions,
) {
  const payload = commentThreadResolveSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

  const threads = await listCommentThreads(payload.document_id, options);
  const thread = threads.find((candidate) => candidate.thread_id === payload.thread_id);
  if (!thread) {
    throw new Error(`Comment thread ${payload.thread_id} not found`);
  }

  return thread;
}

export async function createClarification(
  input: ClarificationCreateInput,
  options?: StoreOptions,
) {
  const payload = clarificationCreateSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
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
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);
  const clarifications = await listClarifications(payload.document_id, options);
  return clarifications.find((item) => item.clarification_id === clarificationId)!;
}

export async function answerClarification(
  input: ClarificationAnswerInput,
  options?: StoreOptions,
) {
  const payload = clarificationAnswerSchema.parse(input);
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const document = await getDocument(payload.document_id, options);

  if (!document) {
    throw new Error(`Document ${payload.document_id} not found`);
  }

  const clarifications = await listClarifications(payload.document_id, options);
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
    await insertSnapshot(
      tx,
      {
        document_id: document.document_id,
        version: document.version + 1,
        markdown: nextMarkdown,
        editor_json: undefined,
      },
      answeredAt,
    );
    await insertAuditEvent(tx, {
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

  await persistSnapshot(database, dbPath);

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
      (await listClarifications(payload.document_id, options)).find(
        (item) => item.clarification_id === payload.clarification_id,
      ) ?? null,
  };
}

export async function exportDocument(documentId: string, options?: StoreOptions) {
  const document = await getDocument(documentId, options);

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  const patches = await listPatches(documentId, options);
  return exportDocumentBundle(document, patches);
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    user_id: row.user_id,
    github_id: row.github_id ?? undefined,
    github_login: row.github_login ?? undefined,
    email: row.email ?? undefined,
    display_name: row.display_name,
    avatar_url: row.avatar_url ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function upsertUserFromGitHub(
  input: {
    github_id: string;
    github_login: string;
    email?: string;
    display_name: string;
    avatar_url?: string;
  },
  options?: StoreOptions,
): Promise<UserRecord> {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const now = new Date().toISOString();

  const existing = await database.query<UserRow>(
    `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
    FROM users
    WHERE github_id = $1
    LIMIT 1`,
    [input.github_id],
  );

  if (existing.rows.length > 0) {
    await database.query(
      `UPDATE users
      SET github_login = $2, email = $3, display_name = $4, avatar_url = $5, updated_at = $6
      WHERE github_id = $1`,
      [
        input.github_id,
        input.github_login,
        input.email ?? null,
        input.display_name,
        input.avatar_url ?? null,
        now,
      ],
    );
    await persistSnapshot(database, dbPath);
    const updated = await database.query<UserRow>(
      `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
      FROM users WHERE github_id = $1 LIMIT 1`,
      [input.github_id],
    );
    return mapUserRow(updated.rows[0]!);
  }

  const userId = `user_${randomUUID()}`;
  await database.query(
    `INSERT INTO users (user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, input.github_id, input.github_login, input.email ?? null, input.display_name, input.avatar_url ?? null, now, now],
  );
  await persistSnapshot(database, dbPath);

  return {
    user_id: userId,
    github_id: input.github_id,
    github_login: input.github_login,
    email: input.email,
    display_name: input.display_name,
    avatar_url: input.avatar_url,
    created_at: now,
    updated_at: now,
  };
}

export async function getUserByGitHubLogin(
  githubLogin: string,
  options?: StoreOptions,
): Promise<UserRecord | null> {
  const database = await getDatabase(options);
  const result = await database.query<UserRow>(
    `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
    FROM users WHERE github_login = $1 LIMIT 1`,
    [githubLogin],
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function getWorkspaceMembershipForUser(
  githubLogin: string,
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord | null> {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id, workspace_id, actor_id, actor_type, name, role, color, github_login, created_at
    FROM workspace_members
    WHERE workspace_id = $1 AND github_login = $2
    LIMIT 1`,
    [workspaceId, githubLogin],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0]!;
  return {
    membership_id: row.membership_id,
    workspace_id: row.workspace_id,
    actor_id: row.actor_id,
    actor_type: row.actor_type,
    name: row.name,
    role: row.role,
    color: row.color,
    github_login: row.github_login ?? undefined,
    created_at: row.created_at,
  };
}

export async function listUserWorkspaces(
  githubLogin: string,
  options?: StoreOptions,
): Promise<WorkspaceRecord[]> {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceRow>(
    `SELECT DISTINCT w.workspace_id, w.name, w.plan, w.created_at
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.workspace_id = wm.workspace_id
    WHERE wm.github_login = $1
    ORDER BY w.created_at ASC`,
    [githubLogin],
  );

  return result.rows.map((row) => ({
    workspace_id: row.workspace_id,
    name: row.name,
    plan: row.plan,
    created_at: row.created_at,
  }));
}
