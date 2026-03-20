import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";

import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

import {
  type DocumentRecord,
  type StoredPatch,
} from "./contracts";
import { deriveDocumentShape } from "./markdown";
import { createDocumentStore } from "./store-documents";
import { createWorkspaceStore } from "./store-workspaces";

export type StoreOptions = {
  backend?: "pglite" | "postgres";
  dbPath?: string;
  databaseUrl?: string;
  fixturesDir?: string;
  workspaceId?: string;
};

export type QuerySession = {
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

export type WorkspaceBehaviorSummary = {
  workspace_id: string;
  document_created_count: number;
  member_added_count: number;
  plan_changed_count: number;
  assist_preference_count: number;
  patch_decided_count: number;
  clarification_answered_count: number;
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

  for (const row of snapshot.documents ?? []) {
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

  for (const row of snapshot.patches ?? []) {
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
        row.proposed_by_actor_type ?? "agent",
        row.proposed_by_actor_id ?? "seed_agent",
        row.base_version,
        row.target_fingerprint,
        row.confidence ?? null,
        row.status,
        row.created_at,
      ],
    );
  }

  for (const row of snapshot.audit_events ?? []) {
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

  for (const row of snapshot.comment_threads ?? []) {
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

const workspaceStore = createWorkspaceStore({
  getDatabase,
  resolveOptions,
  persistSnapshot,
  insertAuditEvent,
});

export const {
  createWorkspaceMembership,
  deleteWorkspaceMembership,
  getWorkspaceBehaviorSummary,
  getUserByGitHubLogin,
  getWorkspaceActivityMetrics,
  getWorkspaceMembershipByActorId,
  getWorkspaceMembershipForUser,
  getWorkspaceUsageSummary,
  listUserWorkspaces,
  listWorkspaceMemberships,
  listWorkspaceRecords,
  recordWorkspaceEvent,
  updateWorkspacePlan,
  upsertUserFromGitHub,
} = workspaceStore;
const documentStore = createDocumentStore({
  getDatabase,
  resolveOptions,
  persistSnapshot,
  insertAuditEvent,
  insertSnapshot,
});

export const {
  answerClarification,
  createClarification,
  createCommentThread,
  createDocument,
  createPatchProposal,
  decidePatch,
  exportDocument,
  getDocument,
  listAuditEvents,
  listClarifications,
  listCommentThreads,
  listDocuments,
  listPatches,
  resetWorkspaceDocuments,
  resolveCommentThread,
  updateDocument,
} = documentStore;
