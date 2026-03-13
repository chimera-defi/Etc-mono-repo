import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { PGlite } from "@electric-sql/pglite";

import {
  documentCreateSchema,
  documentUpdateSchema,
  patchProposalSchema,
  type DocumentCreateInput,
  type DocumentRecord,
  type DocumentUpdateInput,
  type PatchProposalInput,
  type StoredPatch,
} from "./contracts";
import { exportDocumentBundle } from "./export";
import { deriveDocumentShape, makeDocumentRecord } from "./markdown";

type StoreOptions = {
  dbPath?: string;
  fixturesDir?: string;
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

const databaseCache = new Map<string, Promise<PGlite>>();

function resolveOptions(options: StoreOptions = {}) {
  return {
    dbPath: options.dbPath ?? path.join(process.cwd(), ".data", "specforge-db"),
    fixturesDir: options.fixturesDir ?? path.resolve(process.cwd(), "..", "fixtures"),
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
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

async function createSchema(database: PGlite) {
  await database.exec(`
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
  `);
}

async function insertAuditEvent(
  database: Pick<PGlite, "query">,
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
  database: Pick<PGlite, "query">,
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

async function seedDatabase(database: PGlite, fixturesDir: string) {
  const workspace = await readJson<{
    workspace_id: string;
    document_id: string;
    title: string;
    version: number;
    markdown: string;
  }>(path.join(fixturesDir, "workspace.seed.json"));
  const now = new Date().toISOString();
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

async function getDatabase(options: StoreOptions = {}) {
  const { dbPath, fixturesDir } = resolveOptions(options);

  if (!databaseCache.has(dbPath)) {
    databaseCache.set(
      dbPath,
      (async () => {
        await mkdir(path.dirname(dbPath), { recursive: true });
        const database = await PGlite.create(dbPath);
        await createSchema(database);
        const countResult = await database.query<{ count: number }>(
          "SELECT COUNT(*)::int AS count FROM documents",
        );
        const count = Number(countResult.rows[0]?.count ?? 0);

        if (count === 0) {
          await seedDatabase(database, fixturesDir);
        }

        return database;
      })(),
    );
  }

  return databaseCache.get(dbPath)!;
}

export async function listDocuments(options?: StoreOptions) {
  const database = await getDatabase(options);
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
    ORDER BY updated_at DESC, created_at DESC`,
  );

  return result.rows.map(mapDocumentRow);
}

export async function getDocument(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
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
    LIMIT 1`,
    [documentId],
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

export async function createDocument(input: DocumentCreateInput, options?: StoreOptions) {
  const payload = documentCreateSchema.parse(input);
  const database = await getDatabase(options);
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

  return document;
}

export async function updateDocument(
  documentId: string,
  input: DocumentUpdateInput,
  options?: StoreOptions,
) {
  const payload = documentUpdateSchema.parse(input);
  const database = await getDatabase(options);
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

  return patch;
}

export async function exportDocument(documentId: string, options?: StoreOptions) {
  const document = await getDocument(documentId, options);

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  const patches = await listPatches(documentId, options);
  return exportDocumentBundle(document, patches);
}
