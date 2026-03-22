/**
 * Individual ChangeSet API Routes
 *
 * GET    /documents/:id/changesets/:csId - Get changeset with patch list
 * PATCH  /documents/:id/changesets/:csId - Update name/description (draft only)
 * DELETE /documents/:id/changesets/:csId - Delete changeset (draft only)
 */

import { success, error } from "@/lib/specforge/api-response";
import {
  deleteChangeSet,
  fetchChangeSet,
  getDatabase,
  mapRowToChangeSet,
  updateChangeSet,
} from "@/lib/specforge/changeset-db";

type Params = {
  params: Promise<{ id: string; csId: string }>;
};

/**
 * GET /documents/:id/changesets/:csId
 * Returns the changeset with its full details and patch ID list.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id, csId } = await params;

  try {
    const database = await getDatabase();
    const csData = await fetchChangeSet(database, id, csId);

    if (!csData) {
      return error("Changeset not found", "CHANGESET_NOT_FOUND", 404);
    }

    const changeset = mapRowToChangeSet(csData.row, csData.patchIds);
    return success({ changeset });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CHANGESET_FETCH_FAILED",
      500,
    );
  }
}

/**
 * PATCH /documents/:id/changesets/:csId
 * Update name and/or description. Only allowed when status is "draft".
 *
 * Body: { name?: string; description?: string }
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id, csId } = await params;

  try {
    const body = await request.json();
    const database = await getDatabase();

    const csData = await fetchChangeSet(database, id, csId);
    if (!csData) {
      return error("Changeset not found", "CHANGESET_NOT_FOUND", 404);
    }

    if (csData.row.status !== "draft") {
      return error(
        `Cannot update changeset with status "${csData.row.status}". Only draft changesets can be edited.`,
        "CHANGESET_NOT_DRAFT",
        409,
      );
    }

    const fields: { name?: string; description?: string } = {};
    if (typeof body.name === "string") fields.name = body.name;
    if (typeof body.description === "string") fields.description = body.description;

    if (Object.keys(fields).length === 0) {
      return error("No updatable fields provided", "CHANGESET_NO_FIELDS", 400);
    }

    const now = new Date().toISOString();
    await updateChangeSet(database, csId, fields, now);

    // Re-fetch and return updated record
    const updated = await fetchChangeSet(database, id, csId);
    const changeset = mapRowToChangeSet(updated!.row, updated!.patchIds);

    return success({ changeset });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CHANGESET_UPDATE_FAILED",
      500,
    );
  }
}

/**
 * DELETE /documents/:id/changesets/:csId
 * Delete a changeset. Only allowed when status is "draft".
 */
export async function DELETE(_request: Request, { params }: Params) {
  const { id, csId } = await params;

  try {
    const database = await getDatabase();

    const csData = await fetchChangeSet(database, id, csId);
    if (!csData) {
      return error("Changeset not found", "CHANGESET_NOT_FOUND", 404);
    }

    if (csData.row.status !== "draft") {
      return error(
        `Cannot delete changeset with status "${csData.row.status}". Only draft changesets can be deleted.`,
        "CHANGESET_NOT_DRAFT",
        409,
      );
    }

    await deleteChangeSet(database, csId);

    return success({ deleted: true, id: csId });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CHANGESET_DELETE_FAILED",
      500,
    );
  }
}
