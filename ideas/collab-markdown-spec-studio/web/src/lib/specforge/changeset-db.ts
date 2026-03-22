/**
 * ChangeSet Database Helpers
 *
 * Shared query and mapping functions for changeset API routes.
 * Wraps raw SQL queries against the changesets schema (migration 005).
 */

import type { DatabaseClient } from "./db-adapter";
import type { ChangeSet, ImpactAnalysis } from "./changeset";
import type { StoredPatch } from "./contracts";
import { getDatabase } from "./db";

// ---------------------------------------------------------------------------
// Row types (match DB columns from 005_changesets.sql)
// ---------------------------------------------------------------------------

export type ChangeSetRow = {
  changeset_id: string;
  document_id: string;
  name: string;
  description: string;
  status: string;
  created_by_actor_type: "human" | "agent";
  created_by_actor_id: string;
  created_at: string;
  reviewed_by_actor_type: "human" | "agent" | null;
  reviewed_by_actor_id: string | null;
  reviewed_at: string | null;
  approval_comment: string | null;
  affects_proposal: boolean;
  affects_design: boolean;
  affects_requirements: boolean;
  affects_acceptance: boolean;
  affects_tasks: boolean;
  changeability_score: number;
  atomicity_check: boolean;
  backward_compatible: boolean;
  impact_json: string;
};

export type PatchRow = {
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

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

export function mapRowToChangeSet(row: ChangeSetRow, patchIds: string[]): ChangeSet {
  let impact: ImpactAnalysis;
  try {
    impact = JSON.parse(row.impact_json);
  } catch {
    impact = {
      affectedBlocks: [],
      newBlocks: [],
      deletedBlocks: [],
      dependencies: [],
      riskLevel: "low",
      breakingChanges: [],
      estimatedReviewTime: 5,
    };
  }

  return {
    id: row.changeset_id,
    documentId: row.document_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    createdBy: {
      actor_type: row.created_by_actor_type,
      actor_id: row.created_by_actor_id,
    },
    scope: {
      affectsProposal: row.affects_proposal,
      affectsDesign: row.affects_design,
      affectsRequirements: row.affects_requirements,
      affectsAcceptance: row.affects_acceptance,
      affectsTasks: row.affects_tasks,
    },
    patches: patchIds,
    impact,
    status: row.status as ChangeSet["status"],
    reviewedBy:
      row.reviewed_by_actor_type && row.reviewed_by_actor_id
        ? {
            actor_type: row.reviewed_by_actor_type,
            actor_id: row.reviewed_by_actor_id,
          }
        : undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    approvalComment: row.approval_comment ?? undefined,
    changeabilityScore: row.changeability_score,
    atomicityCheck: row.atomicity_check,
    backwardCompatible: row.backward_compatible,
  };
}

export function mapPatchRow(row: PatchRow): StoredPatch {
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

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

const CHANGESET_SELECT = `
  changeset_id, document_id, name, description, status,
  created_by_actor_type, created_by_actor_id, created_at,
  reviewed_by_actor_type, reviewed_by_actor_id, reviewed_at,
  approval_comment,
  affects_proposal, affects_design, affects_requirements,
  affects_acceptance, affects_tasks,
  changeability_score, atomicity_check, backward_compatible,
  impact_json
`;

/**
 * Fetch a changeset row by ID, scoped to a document.
 */
export async function fetchChangeSet(
  db: DatabaseClient,
  documentId: string,
  changesetId: string,
): Promise<{ row: ChangeSetRow; patchIds: string[] } | null> {
  const csResult = await db.query<ChangeSetRow>(
    `SELECT ${CHANGESET_SELECT} FROM changesets
     WHERE changeset_id = $1 AND document_id = $2 LIMIT 1`,
    [changesetId, documentId],
  );
  const csRow = csResult.rows[0];
  if (!csRow) return null;

  const assocResult = await db.query<{ patch_id: string }>(
    `SELECT patch_id FROM changeset_patches WHERE changeset_id = $1`,
    [changesetId],
  );
  const patchIds = assocResult.rows.map((r) => r.patch_id);

  return { row: csRow, patchIds };
}

/**
 * Fetch StoredPatch records for a list of patch IDs scoped to a document.
 */
export async function fetchPatchesByIds(
  db: DatabaseClient,
  documentId: string,
  patchIds: string[],
): Promise<StoredPatch[]> {
  if (patchIds.length === 0) return [];

  const patches: StoredPatch[] = [];

  for (const patchId of patchIds) {
    const result = await db.query<PatchRow>(
      `SELECT patch_id, document_id, block_id, section_id, operation, content,
              patch_type, rationale, proposed_by_actor_type, proposed_by_actor_id,
              base_version, target_fingerprint, confidence, status, created_at
       FROM patches WHERE patch_id = $1 AND document_id = $2 LIMIT 1`,
      [patchId, documentId],
    );
    if (result.rows[0]) {
      patches.push(mapPatchRow(result.rows[0]));
    }
  }

  return patches;
}

/**
 * List all changesets for a document, ordered by creation date descending.
 */
export async function listChangeSets(
  db: DatabaseClient,
  documentId: string,
): Promise<Array<{ row: ChangeSetRow; patchIds: string[] }>> {
  const csResult = await db.query<ChangeSetRow>(
    `SELECT ${CHANGESET_SELECT} FROM changesets
     WHERE document_id = $1 ORDER BY created_at DESC`,
    [documentId],
  );

  const results: Array<{ row: ChangeSetRow; patchIds: string[] }> = [];

  for (const row of csResult.rows) {
    const assocResult = await db.query<{ patch_id: string }>(
      `SELECT patch_id FROM changeset_patches WHERE changeset_id = $1`,
      [row.changeset_id],
    );
    results.push({ row, patchIds: assocResult.rows.map((r) => r.patch_id) });
  }

  return results;
}

/**
 * Insert a new changeset row plus its patch associations.
 */
export async function insertChangeSet(
  db: DatabaseClient,
  changeset: ChangeSet,
): Promise<void> {
  await db.query(
    `INSERT INTO changesets (
       changeset_id, document_id, name, description, status,
       created_by_actor_type, created_by_actor_id, created_at,
       affects_proposal, affects_design, affects_requirements,
       affects_acceptance, affects_tasks,
       changeability_score, atomicity_check, backward_compatible, impact_json
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      changeset.id,
      changeset.documentId,
      changeset.name,
      changeset.description ?? "",
      changeset.status,
      changeset.createdBy.actor_type,
      changeset.createdBy.actor_id,
      changeset.createdAt,
      changeset.scope.affectsProposal,
      changeset.scope.affectsDesign,
      changeset.scope.affectsRequirements,
      changeset.scope.affectsAcceptance,
      changeset.scope.affectsTasks,
      changeset.changeabilityScore ?? 0,
      changeset.atomicityCheck ?? true,
      changeset.backwardCompatible ?? true,
      JSON.stringify(changeset.impact ?? {}),
    ],
  );

  for (const patchId of changeset.patches) {
    await db.query(
      `INSERT INTO changeset_patches (changeset_id, patch_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [changeset.id, patchId],
    );
  }
}

/**
 * Update mutable draft fields on a changeset.
 */
export async function updateChangeSet(
  db: DatabaseClient,
  changesetId: string,
  fields: { name?: string; description?: string },
  now: string,
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    values.push(fields.name);
  }
  if (fields.description !== undefined) {
    sets.push(`description = $${i++}`);
    values.push(fields.description);
  }
  sets.push(`updated_at = $${i++}`);
  values.push(now);
  values.push(changesetId);

  await db.query(
    `UPDATE changesets SET ${sets.join(", ")} WHERE changeset_id = $${i}`,
    values,
  );
}

/**
 * Delete a changeset and its patch associations.
 */
export async function deleteChangeSet(
  db: DatabaseClient,
  changesetId: string,
): Promise<void> {
  await db.query(
    `DELETE FROM changeset_patches WHERE changeset_id = $1`,
    [changesetId],
  );
  await db.query(
    `DELETE FROM changesets WHERE changeset_id = $1`,
    [changesetId],
  );
}

export { getDatabase };
