/**
 * Acceptance Test: Stale Patch Detection
 *
 * Validates that patches with mismatched base_version are rejected
 * as stale when the document has evolved since the patch was proposed.
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

describe("Stale patch detection", () => {
  it("should reject patch when base_version does not match current doc version", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Propose all patches concurrently (they all have base_version from fixture)
    for (const ps of patchSeeds) {
      engine.proposePatchWithId(ps.patch_id, {
        document_id: doc.document_id,
        block_id: ps.block_id,
        section_id: ps.section_id,
        operation: ps.operation,
        patch_type: ps.patch_type,
        content: ps.content,
        proposed_by: TEST_AGENT,
        base_version: ps.base_version,
        target_fingerprint: ps.target_fingerprint,
      });
    }

    // Accept first patch: doc version goes 1 -> 2
    const patch1 = patchSeeds[0];
    engine.decidePatch({
      patch_id: patch1.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Accept second patch: doc version goes 2 -> 3
    const patch2 = patchSeeds[1];
    engine.decidePatch({
      patch_id: patch2.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Now document is at version 3
    const updated = engine.getDocument(doc.document_id)!;
    expect(updated.version).toBe(3);

    // Third patch has base_version=1, which is now stale
    const patch3 = patchSeeds[2];
    const decision3 = engine.decidePatch({
      patch_id: patch3.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Should be rejected as stale
    expect(decision3.status).toBe("rejected");
  });

  it("should emit patch.rejected event with stale-patch reason", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Propose all patches
    for (const ps of patchSeeds) {
      engine.proposePatchWithId(ps.patch_id, {
        document_id: doc.document_id,
        block_id: ps.block_id,
        section_id: ps.section_id,
        operation: ps.operation,
        patch_type: ps.patch_type,
        content: ps.content,
        proposed_by: TEST_AGENT,
        base_version: ps.base_version,
        target_fingerprint: ps.target_fingerprint,
      });
    }

    // Accept patches 1 and 2 to make 3 stale
    engine.decidePatch({
      patch_id: patchSeeds[0].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });
    engine.decidePatch({
      patch_id: patchSeeds[1].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Decide on stale patch
    engine.decidePatch({
      patch_id: patchSeeds[2].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    const events = engine.getEvents(doc.document_id);
    const rejectionEvent = events.find(
      (e) => e.event_type === "patch.rejected" && e.payload.patch_id === patchSeeds[2].patch_id
    );

    expect(rejectionEvent).toBeDefined();
    expect(rejectionEvent?.payload.reason).toBe("stale-patch");
  });

  it("should not modify document when rejecting stale patch", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Propose all patches
    for (const ps of patchSeeds) {
      engine.proposePatchWithId(ps.patch_id, {
        document_id: doc.document_id,
        block_id: ps.block_id,
        section_id: ps.section_id,
        operation: ps.operation,
        patch_type: ps.patch_type,
        content: ps.content,
        proposed_by: TEST_AGENT,
        base_version: ps.base_version,
        target_fingerprint: ps.target_fingerprint,
      });
    }

    // Accept patches 1 and 2
    engine.decidePatch({
      patch_id: patchSeeds[0].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });
    engine.decidePatch({
      patch_id: patchSeeds[1].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Save state before rejecting stale patch
    const updated = engine.getDocument(doc.document_id)!;
    const versionBefore = updated.version;
    const markdownBefore = updated.markdown;

    // Decide on stale patch
    engine.decidePatch({
      patch_id: patchSeeds[2].patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    // Document should be unchanged
    const final = engine.getDocument(doc.document_id)!;
    expect(final.version).toBe(versionBefore);
    expect(final.markdown).toBe(markdownBefore);
  });
});
