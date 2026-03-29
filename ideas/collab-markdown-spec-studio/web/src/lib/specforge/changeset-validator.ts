/**
 * ChangeSet validation and scoring.
 *
 * Evaluates a changeset against its patches to produce a changeability score
 * and individual quality checks.
 */

import type { StoredPatch } from "./contracts";
import type { ChangeSet } from "./changeset";

export type ChangeSetValidation = {
  score: number;
  checks: {
    patchesAreAtomic: boolean;
    backwardCompatible: boolean;
    hasDescription: boolean;
    patchCountReasonable: boolean;
  };
  warnings: string[];
};

export function validateChangeSet(
  changeset: ChangeSet,
  patches: StoredPatch[],
): ChangeSetValidation {
  const warnings: string[] = [];
  let score = 100;

  // Check: patches target a limited number of blocks (atomicity)
  const uniqueBlocks = new Set(patches.map((p) => p.block_id));
  const patchesAreAtomic = uniqueBlocks.size <= Math.max(3, patches.length);
  if (!patchesAreAtomic) {
    score -= 15;
    warnings.push("Patches span many unrelated blocks; consider splitting.");
  }

  // Check: no delete operations (backward compatible)
  const hasDeletes = patches.some((p) => p.operation === "delete");
  const backwardCompatible = !hasDeletes;
  if (!backwardCompatible) {
    score -= 10;
    warnings.push("Changeset includes deletions which may break backward compatibility.");
  }

  // Check: description present
  const hasDescription = (changeset.description ?? "").trim().length > 0;
  if (!hasDescription) {
    score -= 5;
    warnings.push("Changeset has no description.");
  }

  // Check: patch count
  const patchCountReasonable = patches.length <= 20;
  if (!patchCountReasonable) {
    score -= 10;
    warnings.push("Changeset contains a large number of patches; review carefully.");
  }

  score = Math.max(0, score);

  return {
    score,
    checks: {
      patchesAreAtomic,
      backwardCompatible,
      hasDescription,
      patchCountReasonable,
    },
    warnings,
  };
}
