/**
 * Acceptance Tests Collection Route
 *
 * GET  /documents/:id/acceptance-tests  — list all tests for a document
 * POST /documents/:id/acceptance-tests  — create a new acceptance test
 */

import {
  getTestMatrix,
  createAcceptanceTest,
} from "@/lib/specforge/acceptance-tests";
import { getAcceptanceTestDb } from "@/lib/specforge/acceptance-test-db";
import { getCurrentWorkspaceDocument } from "@/lib/specforge/workspace-access";
import { success, error } from "@/lib/specforge/api-response";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { document } = await getCurrentWorkspaceDocument(id);
    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const db = await getAcceptanceTestDb();
    const matrix = await getTestMatrix(db, id);
    return success({ matrix });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "ACCEPTANCE_TEST_LIST_FAILED",
      500,
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { document } = await getCurrentWorkspaceDocument(id);
    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const body = await request.json() as {
      feature?: unknown;
      test_case?: unknown;
      expected_result?: unknown;
    };

    const feature = typeof body.feature === "string" ? body.feature.trim() : "";
    const test_case = typeof body.test_case === "string" ? body.test_case.trim() : "";
    const expected_result =
      typeof body.expected_result === "string" ? body.expected_result.trim() : "";

    if (!feature || !test_case || !expected_result) {
      return error(
        "feature, test_case, and expected_result are required",
        "MISSING_FIELDS",
        400,
      );
    }

    const db = await getAcceptanceTestDb();
    const test = await createAcceptanceTest(db, id, { feature, test_case, expected_result });
    const matrix = await getTestMatrix(db, id);

    return success({ test, matrix }, { status: 201 });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "ACCEPTANCE_TEST_CREATE_FAILED",
      500,
    );
  }
}
