/**
 * ChangeSet construction helpers.
 *
 * Builds a ChangeSet model from a validated create input and the resolved patches.
 */

import { randomUUID } from "crypto";
import type { StoredPatch } from "./contracts";
import type { ChangeSet, ChangeSetCreateInput, ImpactAnalysis } from "./changeset";

function analyseImpact(patches: StoredPatch[]): ImpactAnalysis {
  const affectedBlocks = Array.from(new Set(patches.map((p) => p.block_id)));
  const newBlocks = patches
    .filter((p) => p.operation === "insert")
    .map((p) => p.block_id);
  const deletedBlocks = patches
    .filter((p) => p.operation === "delete")
    .map((p) => p.block_id);

  const hasDelete = deletedBlocks.length > 0;
  const riskLevel: ImpactAnalysis["riskLevel"] =
    hasDelete ? "high" : patches.length > 5 ? "medium" : "low";

  return {
    affectedBlocks,
    newBlocks,
    deletedBlocks,
    dependencies: [],
    riskLevel,
    breakingChanges: hasDelete
      ? deletedBlocks.map((b) => `Block ${b} deleted`)
      : [],
    estimatedReviewTime: Math.max(5, patches.length * 2),
  };
}

function detectScope(patches: StoredPatch[]) {
  const types = new Set(patches.map((p) => p.patch_type));
  return {
    affectsProposal: types.has("requirement_change") || types.has("structural_edit"),
    affectsDesign: types.has("structural_edit"),
    affectsRequirements: types.has("requirement_change"),
    affectsAcceptance: types.has("requirement_change") || types.has("task_export_change"),
    affectsTasks: types.has("structural_edit") || types.has("task_export_change"),
  };
}

export function createChangeSetFromPatches(
  input: ChangeSetCreateInput,
  patches: StoredPatch[],
): ChangeSet {
  const impact = analyseImpact(patches);
  const scope = detectScope(patches);

  return {
    id: randomUUID(),
    documentId: input.documentId,
    name: input.name,
    description: input.description ?? "",
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    scope,
    patches: patches.map((p) => p.patch_id),
    impact,
    status: "draft",
  };
}
