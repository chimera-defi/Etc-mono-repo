/**
 * Acceptance Test Types and Database Queries
 *
 * Provides the AcceptanceTest type and query helpers for reading/updating
 * acceptance tests stored in the acceptance_tests table.
 */

import type { DatabaseClient } from "./db-adapter";

export type AcceptanceTest = {
  test_id: string;
  document_id: string;
  feature: string;
  test_case: string;
  expected_result: string;
  status: "pending" | "pass" | "fail" | "skip";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AcceptanceTestMatrix = {
  tests: AcceptanceTest[];
};

type AcceptanceTestRow = {
  test_id: string;
  document_id: string;
  feature: string;
  test_case: string;
  expected_result: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: AcceptanceTestRow): AcceptanceTest {
  return {
    test_id: row.test_id,
    document_id: row.document_id,
    feature: row.feature,
    test_case: row.test_case,
    expected_result: row.expected_result,
    status: row.status as AcceptanceTest["status"],
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Retrieve all acceptance tests for a document, ordered by feature then test_case.
 */
export async function getTestMatrix(
  db: DatabaseClient,
  documentId: string,
): Promise<AcceptanceTestMatrix> {
  const result = await db.query<AcceptanceTestRow>(
    `SELECT test_id, document_id, feature, test_case, expected_result,
            status, notes, created_at, updated_at
     FROM acceptance_tests
     WHERE document_id = $1
     ORDER BY feature, test_case`,
    [documentId],
  );

  return { tests: result.rows.map(mapRow) };
}

/**
 * Create a new acceptance test for a document.
 */
export async function createAcceptanceTest(
  db: DatabaseClient,
  documentId: string,
  fields: {
    feature: string;
    test_case: string;
    expected_result: string;
  },
): Promise<AcceptanceTest> {
  const testId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.query(
    `INSERT INTO acceptance_tests
       (test_id, document_id, feature, test_case, expected_result, status, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', NULL, $6, $6)`,
    [testId, documentId, fields.feature, fields.test_case, fields.expected_result, now],
  );

  return {
    test_id: testId,
    document_id: documentId,
    feature: fields.feature,
    test_case: fields.test_case,
    expected_result: fields.expected_result,
    status: "pending",
    notes: null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Delete a single acceptance test.
 */
export async function deleteAcceptanceTest(
  db: DatabaseClient,
  testId: string,
): Promise<void> {
  await db.query(`DELETE FROM acceptance_tests WHERE test_id = $1`, [testId]);
}

/**
 * Get a single acceptance test by ID.
 */
export async function getAcceptanceTest(
  db: DatabaseClient,
  testId: string,
): Promise<AcceptanceTest | null> {
  const result = await db.query<AcceptanceTestRow>(
    `SELECT test_id, document_id, feature, test_case, expected_result,
            status, notes, created_at, updated_at
     FROM acceptance_tests
     WHERE test_id = $1`,
    [testId],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

/**
 * Update mutable fields on a single acceptance test.
 */
export async function updateAcceptanceTest(
  db: DatabaseClient,
  testId: string,
  fields: {
    status?: AcceptanceTest["status"];
    notes?: string;
    changed_by?: string;
  },
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(fields.status);
  }
  if (fields.notes !== undefined) {
    sets.push(`notes = $${i++}`);
    values.push(fields.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = $${i++}`);
  values.push(new Date().toISOString());
  values.push(testId);

  await db.query(
    `UPDATE acceptance_tests SET ${sets.join(", ")} WHERE test_id = $${i}`,
    values,
  );
}
