/**
 * Acceptance Test Item Route
 *
 * PUT    /documents/:id/acceptance-tests/:testId  — update a test
 * DELETE /documents/:id/acceptance-tests/:testId  — delete a test
 */

import {
  getAcceptanceTest,
  updateAcceptanceTest,
  deleteAcceptanceTest,
} from "@/lib/specforge/acceptance-tests";
import { getAcceptanceTestDb } from "@/lib/specforge/acceptance-test-db";
import { getCurrentWorkspaceDocument } from "@/lib/specforge/workspace-access";
import { success, error } from "@/lib/specforge/api-response";

type Params = {
  params: Promise<{ id: string; testId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id, testId } = await params;

  try {
    const { document } = await getCurrentWorkspaceDocument(id);
    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const db = await getAcceptanceTestDb();
    const existing = await getAcceptanceTest(db, testId);
    if (!existing || existing.document_id !== id) {
      return error("Acceptance test not found", "TEST_NOT_FOUND", 404);
    }

    const body = await request.json() as {
      status?: unknown;
      notes?: unknown;
    };

    const updates: { status?: "pending" | "pass" | "fail" | "skip"; notes?: string } = {};
    if (typeof body.status === "string") {
      const validStatuses = ["pending", "pass", "fail", "skip"] as const;
      if (!validStatuses.includes(body.status as "pending")) {
        return error("Invalid status value", "INVALID_STATUS", 400);
      }
      updates.status = body.status as "pending" | "pass" | "fail" | "skip";
    }
    if (typeof body.notes === "string") {
      updates.notes = body.notes;
    }

    await updateAcceptanceTest(db, testId, updates);
    const updated = await getAcceptanceTest(db, testId);

    return success({ test: updated });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "ACCEPTANCE_TEST_UPDATE_FAILED",
      500,
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, testId } = await params;

  try {
    const { document } = await getCurrentWorkspaceDocument(id);
    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const db = await getAcceptanceTestDb();
    const existing = await getAcceptanceTest(db, testId);
    if (!existing || existing.document_id !== id) {
      return error("Acceptance test not found", "TEST_NOT_FOUND", 404);
    }

    await deleteAcceptanceTest(db, testId);
    return success({ deleted: testId });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "ACCEPTANCE_TEST_DELETE_FAILED",
      500,
    );
  }
}
