/**
 * ChangeSet API Routes
 *
 * GET /documents/:id/changesets - List all changesets
 * POST /documents/:id/changesets - Create new changeset from patches
 */

import { changeSetCreateInputSchema } from "@/lib/specforge/changeset";
import { createChangeSetFromPatches } from "@/lib/specforge/changeset-operations";
import { validateChangeSet } from "@/lib/specforge/changeset-validator";
import { success, error } from "@/lib/specforge/api-response";
import {
  fetchPatchesByIds,
  getDatabase,
  insertChangeSet,
  listChangeSets,
  mapRowToChangeSet,
} from "@/lib/specforge/changeset-db";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /documents/:id/changesets
 * List all changesets for a document, ordered newest-first.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const database = await getDatabase();
    const rows = await listChangeSets(database, id);
    const changesets = rows.map(({ row, patchIds }) =>
      mapRowToChangeSet(row, patchIds),
    );

    return success({ changesets, count: changesets.length });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CHANGESET_LIST_FAILED",
      500,
    );
  }
}

/**
 * POST /documents/:id/changesets
 * Create a new changeset from a collection of patches.
 *
 * Body:
 * {
 *   name: string;
 *   description?: string;
 *   patchIds: string[];
 *   createdBy: { actor_type: "human" | "agent"; actor_id: string };
 * }
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();

    const parsed = changeSetCreateInputSchema.parse({
      documentId: id,
      ...body,
    });

    const database = await getDatabase();

    // Fetch the patches referenced in the request
    const patches = await fetchPatchesByIds(database, id, parsed.patchIds);

    // Build changeset model (scope + impact analysis)
    const changeset = createChangeSetFromPatches(parsed, patches);

    // Validate and annotate with scores
    const validation = validateChangeSet(changeset, patches);
    changeset.changeabilityScore = validation.score;
    changeset.atomicityCheck = validation.checks.patchesAreAtomic;
    changeset.backwardCompatible = validation.checks.backwardCompatible;

    // Persist to database
    await insertChangeSet(database, changeset);

    return success({ changeset, validation }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("validation")) {
      return error(err.message, "CHANGESET_VALIDATION_FAILED");
    }

    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CHANGESET_CREATE_FAILED",
      500,
    );
  }
}
