/**
 * Acceptance Test: Accept Patch
 *
 * Matrix row: Accept patch | fixtures/patches.seed.jsonl | Accepted patch updates canonical markdown
 *
 * Validates that accepting a patch updates the document's canonical markdown
 * and increments the version per contracts/v1/patch_decision.request.schema.json.
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  loadPatchSeeds,
  seedToDocument,
  TEST_AGENT,
  TEST_REVIEWER,
} from "../helpers.js";

describe("Accept patch", () => {
  it("should change patch status to accepted", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    engine.proposePatchWithId(firstPatch.patch_id, {
      document_id: doc.document_id,
      block_id: firstPatch.block_id,
      section_id: firstPatch.section_id,
      operation: firstPatch.operation,
      patch_type: firstPatch.patch_type,
      content: firstPatch.content,
      proposed_by: TEST_AGENT,
      base_version: doc.version,
      target_fingerprint: firstPatch.target_fingerprint,
    });

    const decided = engine.decidePatch({
      patch_id: firstPatch.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    expect(decided.status).toBe("accepted");
  });

  it("should update canonical markdown with patch content", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    engine.proposePatchWithId(firstPatch.patch_id, {
      document_id: doc.document_id,
      block_id: firstPatch.block_id,
      section_id: firstPatch.section_id,
      operation: firstPatch.operation,
      patch_type: firstPatch.patch_type,
      content: firstPatch.content,
      proposed_by: TEST_AGENT,
      base_version: doc.version,
      target_fingerprint: firstPatch.target_fingerprint,
    });

    engine.decidePatch({
      patch_id: firstPatch.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    const updated = engine.getDocument(doc.document_id)!;
    expect(updated.markdown).toContain(
      "1. Reduce spec-to-first-commit by 40%."
    );
  });

  it("should increment document version after accepting a patch", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    expect(doc.version).toBe(1);

    const firstPatch = patchSeeds[0];
    engine.proposePatchWithId(firstPatch.patch_id, {
      document_id: doc.document_id,
      block_id: firstPatch.block_id,
      section_id: firstPatch.section_id,
      operation: firstPatch.operation,
      patch_type: firstPatch.patch_type,
      content: firstPatch.content,
      proposed_by: TEST_AGENT,
      base_version: doc.version,
      target_fingerprint: firstPatch.target_fingerprint,
    });

    engine.decidePatch({
      patch_id: firstPatch.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    const updated = engine.getDocument(doc.document_id)!;
    expect(updated.version).toBe(2);
  });

  it("should apply multiple patches sequentially and increment version each time", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Apply all patches: accept 1, 2, 4; reject 3 (stale)
    for (const ps of patchSeeds) {
      engine.proposePatchWithId(ps.patch_id, {
        document_id: doc.document_id,
        block_id: ps.block_id,
        section_id: ps.section_id,
        operation: ps.operation,
        patch_type: ps.patch_type,
        content: ps.content,
        proposed_by: TEST_AGENT,
        base_version: doc.version,
        target_fingerprint: ps.target_fingerprint,
      });

      // Patch 3 is stale, reject it; accept all others
      const decision = ps.patch_id === "patch_3" ? "reject" : "accept";
      engine.decidePatch({
        patch_id: ps.patch_id,
        decision,
        reviewer_id: TEST_REVIEWER,
      });
    }

    const final = engine.getDocument(doc.document_id)!;
    // version=1 initial + 3 accepted patches (1, 2, 4) = version 4
    expect(final.version).toBe(4);
  });

  it("should not allow deciding an already-decided patch", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    engine.proposePatchWithId(firstPatch.patch_id, {
      document_id: doc.document_id,
      block_id: firstPatch.block_id,
      section_id: firstPatch.section_id,
      operation: firstPatch.operation,
      patch_type: firstPatch.patch_type,
      content: firstPatch.content,
      proposed_by: TEST_AGENT,
      base_version: doc.version,
      target_fingerprint: firstPatch.target_fingerprint,
    });

    engine.decidePatch({
      patch_id: firstPatch.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    expect(() =>
      engine.decidePatch({
        patch_id: firstPatch.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      })
    ).toThrow(/already accepted/);
  });
});
