/**
 * Spec Jobs — database helpers for the agent-service job workflow.
 *
 * A spec job tracks the lifecycle of an agent-initiated spec generation
 * request. Callers submit a brief, SpecForge creates a document and
 * optionally runs autonomous spec population.
 */

import { randomUUID } from "node:crypto";

import { getDatabase, type StoreOptions } from "./store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SpecJobMode = "assisted" | "autonomous";
export type SpecJobStatus =
  | "queued"
  | "running"
  | "blocked"
  | "completed"
  | "failed";

export interface SpecJob {
  job_id: string;
  workspace_id: string;
  document_id: string | null;
  mode: SpecJobMode;
  status: SpecJobStatus;
  brief: string;
  constraints: Record<string, unknown>;
  blocker: string | null;
  retry_count: number;
  artifacts: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

type SpecJobRow = {
  job_id: string;
  workspace_id: string;
  document_id: string | null;
  mode: string;
  status: string;
  brief: string;
  constraints_json: Record<string, unknown> | string | null;
  blocker: string | null;
  retry_count: number;
  artifacts_json: Record<string, unknown> | string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

function parseJsonField(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function mapRow(row: SpecJobRow): SpecJob {
  return {
    job_id: row.job_id,
    workspace_id: row.workspace_id,
    document_id: row.document_id,
    mode: row.mode as SpecJobMode,
    status: row.status as SpecJobStatus,
    brief: row.brief,
    constraints: parseJsonField(row.constraints_json),
    blocker: row.blocker,
    retry_count: row.retry_count ?? 0,
    artifacts: parseJsonField(row.artifacts_json),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

const SELECT_COLUMNS = `
  job_id,
  workspace_id,
  document_id,
  mode,
  status,
  brief,
  constraints_json,
  blocker,
  retry_count,
  artifacts_json,
  created_at,
  updated_at
`;

export type CreateSpecJobInput = {
  job_id?: string;
  workspace_id: string;
  document_id?: string | null;
  mode?: SpecJobMode;
  status?: SpecJobStatus;
  brief: string;
  constraints?: Record<string, unknown>;
  blocker?: string | null;
  retry_count?: number;
  artifacts?: Record<string, unknown>;
};

export async function createSpecJob(
  input: CreateSpecJobInput,
  options?: StoreOptions,
): Promise<SpecJob> {
  const database = await getDatabase(options);
  const now = new Date().toISOString();
  const jobId = input.job_id ?? `job_${randomUUID()}`;

  await database.query(
    `INSERT INTO spec_jobs (
      job_id,
      workspace_id,
      document_id,
      mode,
      status,
      brief,
      constraints_json,
      blocker,
      retry_count,
      artifacts_json,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::jsonb, $11, $12)`,
    [
      jobId,
      input.workspace_id,
      input.document_id ?? null,
      input.mode ?? "assisted",
      input.status ?? "queued",
      input.brief,
      JSON.stringify(input.constraints ?? {}),
      input.blocker ?? null,
      input.retry_count ?? 0,
      JSON.stringify(input.artifacts ?? {}),
      now,
      now,
    ],
  );

  const result = await database.query<SpecJobRow>(
    `SELECT ${SELECT_COLUMNS} FROM spec_jobs WHERE job_id = $1`,
    [jobId],
  );

  return mapRow(result.rows[0]);
}

export async function getSpecJob(
  jobId: string,
  options?: StoreOptions,
): Promise<SpecJob | null> {
  const database = await getDatabase(options);
  const result = await database.query<SpecJobRow>(
    `SELECT ${SELECT_COLUMNS} FROM spec_jobs WHERE job_id = $1 LIMIT 1`,
    [jobId],
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export type UpdateSpecJobFields = Partial<
  Pick<
    SpecJob,
    "status" | "document_id" | "blocker" | "retry_count" | "artifacts"
  > & { constraints: Record<string, unknown> }
>;

export async function updateSpecJob(
  jobId: string,
  updates: UpdateSpecJobFields,
  options?: StoreOptions,
): Promise<SpecJob | null> {
  const database = await getDatabase(options);
  const now = new Date().toISOString();

  const setClauses: string[] = ["updated_at = $2"];
  const params: unknown[] = [jobId, now];
  let paramIndex = 3;

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex}`);
    params.push(updates.status);
    paramIndex++;
  }
  if (updates.document_id !== undefined) {
    setClauses.push(`document_id = $${paramIndex}`);
    params.push(updates.document_id);
    paramIndex++;
  }
  if (updates.blocker !== undefined) {
    setClauses.push(`blocker = $${paramIndex}`);
    params.push(updates.blocker);
    paramIndex++;
  }
  if (updates.retry_count !== undefined) {
    setClauses.push(`retry_count = $${paramIndex}`);
    params.push(updates.retry_count);
    paramIndex++;
  }
  if (updates.artifacts !== undefined) {
    setClauses.push(`artifacts_json = $${paramIndex}::jsonb`);
    params.push(JSON.stringify(updates.artifacts));
    paramIndex++;
  }
  if (updates.constraints !== undefined) {
    setClauses.push(`constraints_json = $${paramIndex}::jsonb`);
    params.push(JSON.stringify(updates.constraints));
    paramIndex++;
  }

  await database.query(
    `UPDATE spec_jobs SET ${setClauses.join(", ")} WHERE job_id = $1`,
    params,
  );

  return getSpecJob(jobId, options);
}

export async function listSpecJobs(
  workspaceId: string,
  options?: StoreOptions,
): Promise<SpecJob[]> {
  const database = await getDatabase(options);
  const result = await database.query<SpecJobRow>(
    `SELECT ${SELECT_COLUMNS}
    FROM spec_jobs
    WHERE workspace_id = $1
    ORDER BY created_at DESC`,
    [workspaceId],
  );

  return result.rows.map(mapRow);
}
