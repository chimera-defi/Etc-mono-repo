/**
 * Acceptance Test: Event Stream
 *
 * Matrix row: Event emission | fixtures/patches.seed.jsonl | Ordered events emitted with monotonic versions
 *
 * Validates that document lifecycle events are emitted in correct order
 * with monotonically increasing versions per contracts/v1/document_event.schema.json.
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

describe("Event stream", () => {
  it("should emit events in lifecycle order: created, proposed, accepted", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Propose and accept first patch
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

    const events = engine.getEvents(doc.document_id);
    const types = events.map((e) => e.event_type);

    expect(types[0]).toBe("document.created");
    expect(types[1]).toBe("patch.proposed");
    expect(types[2]).toBe("patch.accepted");
  });

  it("should emit monotonically increasing versions across events", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Run full workflow: propose + accept both patches
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

      engine.decidePatch({
        patch_id: ps.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    }

    const events = engine.getEvents(doc.document_id);
    const versions = events.map((e) => e.version);

    // Versions must be non-decreasing (monotonic)
    for (let i = 1; i < versions.length; i++) {
      expect(versions[i]).toBeGreaterThanOrEqual(versions[i - 1]);
    }
  });

  it("should include correct event types for the full workflow", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const patchSeeds = loadPatchSeeds();
    const doc = engine.loadDocument(seedToDocument(seed));

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

      engine.decidePatch({
        patch_id: ps.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    }

    const events = engine.getEvents(doc.document_id);
    const types = events.map((e) => e.event_type);

    // Expected sequence: created, proposed, accepted, proposed, accepted
    expect(types).toEqual([
      "document.created",
      "patch.proposed",
      "patch.accepted",
      "patch.proposed",
      "patch.accepted",
    ]);
  });

  it("should assign unique event_id to each event", () => {
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

    const events = engine.getEvents(doc.document_id);
    const eventIds = events.map((e) => e.event_id);
    const uniqueIds = new Set(eventIds);

    expect(uniqueIds.size).toBe(eventIds.length);
  });

  it("should include valid ISO timestamps on all events", () => {
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

    const events = engine.getEvents(doc.document_id);
    for (const event of events) {
      expect(event.timestamp).toBeDefined();
      expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
    }
  });
});
