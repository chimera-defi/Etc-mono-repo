/**
 * Acceptance Test: Propose Patch
 *
 * Matrix row: Propose patch | fixtures/patches.seed.jsonl | Patch queue contains proposed patch
 *
 * Validates that a patch can be proposed and enqueued correctly
 * per contracts/v1/patch_proposal.request.schema.json.
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  loadPatchSeeds,
  seedToDocument,
  TEST_AGENT,
} from "../helpers.js";

describe("Propose patch", () => {
  it("should enqueue a proposed patch from fixture data", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    const proposal = engine.proposePatchWithId(firstPatch.patch_id, {
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

    expect(proposal.status).toBe("proposed");
    expect(proposal.patch_id).toBe("patch_1");
    expect(proposal.base_version).toBe(1);
  });

  it("should capture the base_version from the current document", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    const proposal = engine.proposePatchWithId(firstPatch.patch_id, {
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

    expect(proposal.base_version).toBe(doc.version);
    expect(proposal.base_version).toBeGreaterThanOrEqual(1);
  });

  it("should record the proposal timestamp and agent identity", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    const proposal = engine.proposePatchWithId(firstPatch.patch_id, {
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

    expect(proposal.proposed_at).toBeDefined();
    expect(new Date(proposal.proposed_at).getTime()).not.toBeNaN();
    expect(proposal.proposed_by.actor_type).toBe("agent");
    expect(proposal.proposed_by.actor_id).toBe("test-agent-001");
  });

  it("should appear in the patch queue for the document", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Propose all patches (including edge cases)
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
    }

    const queue = engine.getPatchQueue(doc.document_id);
    expect(queue).toHaveLength(4);
    expect(queue.every((p) => p.status === "proposed")).toBe(true);
  });

  it("should preserve the target_fingerprint from the fixture", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    const firstPatch = patchSeeds[0];
    const proposal = engine.proposePatchWithId(firstPatch.patch_id, {
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

    expect(proposal.target_fingerprint).toBe(
      "sha256:blk_goals_1:v1:seed"
    );
  });
});
