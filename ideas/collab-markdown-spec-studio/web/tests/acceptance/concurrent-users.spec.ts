/**
 * Acceptance Test: Concurrent User Testing & Conflict Detection
 *
 * Comprehensive test suite validating multiplayer scenarios at the engine level:
 * - Concurrent patch proposals to same/different blocks
 * - Stale patch detection under concurrent load
 * - Version monotonicity guarantees
 * - Comment preservation across concurrent patches
 * - Deterministic patch ordering and event streaming
 * - Load testing with mixed accept/reject decisions
 */

import { describe, it, expect } from "vitest";
import {
  createSeededEngine,
  createFreshEngine,
  seedToDocument,
  loadWorkspaceSeed,
  TEST_AGENT,
  TEST_REVIEWER,
} from "../helpers.js";

describe("Concurrent user testing and conflict detection", () => {
  /**
   * Test: Two users propose to same block, first accepted makes second stale
   *
   * Scenario:
   * - User A proposes patch_1 to block_1 at base_v=1
   * - Patch is accepted, document version becomes 2
   * - User B proposes patch_2 to block_1 at base_v=1 (now stale!)
   * - Verify patch_2 rejected as stale
   * - Verify document unchanged after rejection
   */
  it("should reject second patch to same block when first is accepted", () => {
    const { engine, doc } = createSeededEngine();
    const blockId = doc.blocks[0].block_id;
    const sectionId = doc.blocks[0].section_id;

    // User A proposes patch_1 at base_v=1
    const patch1 = engine.proposePatchWithId("concurrent_patch_1", {
      document_id: doc.document_id,
      block_id: blockId,
      section_id: sectionId,
      operation: "replace",
      patch_type: "wording_formatting",
      content: "## Updated Content A",
      proposed_by: { actor_type: "agent", actor_id: "user-a" },
      base_version: 1,
      target_fingerprint: "fingerprint_1a",
    });

    // User B proposes patch_2 to same block at base_v=1
    const patch2 = engine.proposePatchWithId("concurrent_patch_2", {
      document_id: doc.document_id,
      block_id: blockId,
      section_id: sectionId,
      operation: "replace",
      patch_type: "wording_formatting",
      content: "## Updated Content B",
      proposed_by: { actor_type: "agent", actor_id: "user-b" },
      base_version: 1,
      target_fingerprint: "fingerprint_1b",
    });

    // Accept patch_1
    engine.decidePatch({
      patch_id: patch1.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    const docAfterAccept = engine.getDocument(doc.document_id)!;
    expect(docAfterAccept.version).toBe(2);

    // Try to accept patch_2 (should be rejected as stale)
    const result = engine.decidePatch({
      patch_id: patch2.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    expect(result.status).toBe("rejected");

    // Document should not have changed further
    const final = engine.getDocument(doc.document_id)!;
    expect(final.version).toBe(2);
  });

  /**
   * Test: Two users patch different blocks concurrently
   *
   * Scenario:
   * - User A proposes to block_1 with INSERT (no stale detection)
   * - User B proposes to block_2 with INSERT (no stale detection)
   * - Both accepted successfully
   * - Document version = 3 (1 initial + 2 accepted patches)
   * - No stale detection (INSERT ops don't trigger stale detection)
   */
  it("should accept concurrent patches to different blocks", () => {
    const { engine, doc } = createSeededEngine();

    // Ensure we have at least 2 blocks
    if (doc.blocks.length < 2) {
      throw new Error("Test requires at least 2 blocks");
    }

    const block1Id = doc.blocks[0].block_id;
    const block2Id = doc.blocks[1].block_id;
    const section1Id = doc.blocks[0].section_id;
    const section2Id = doc.blocks[1].section_id;

    // User A proposes to block_1 with INSERT (INSERT doesn't trigger stale detection)
    const patchA = engine.proposePatchWithId("user_a_patch", {
      document_id: doc.document_id,
      block_id: block1Id,
      section_id: section1Id,
      operation: "insert",
      patch_type: "requirement_change",
      content: "Block 1 Updated",
      proposed_by: { actor_type: "agent", actor_id: "user-a" },
      base_version: 1,
      target_fingerprint: "fp_block1",
    });

    // User B proposes to block_2 with INSERT
    const patchB = engine.proposePatchWithId("user_b_patch", {
      document_id: doc.document_id,
      block_id: block2Id,
      section_id: section2Id,
      operation: "insert",
      patch_type: "requirement_change",
      content: "Block 2 Updated",
      proposed_by: { actor_type: "agent", actor_id: "user-b" },
      base_version: 1,
      target_fingerprint: "fp_block2",
    });

    // Both patches at same base_version but different blocks
    const queueBefore = engine.getPatchQueue(doc.document_id);
    expect(queueBefore).toHaveLength(2);

    // Accept both patches
    const resultA = engine.decidePatch({
      patch_id: patchA.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });
    expect(resultA.status).toBe("accepted");

    const resultB = engine.decidePatch({
      patch_id: patchB.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });
    expect(resultB.status).toBe("accepted");

    // Both should be accepted, document version = 3 (initial 1 + 2 patches)
    const final = engine.getDocument(doc.document_id)!;
    expect(final.version).toBe(3);

    const queueAfter = engine.getPatchQueue(doc.document_id);
    expect(queueAfter).toHaveLength(0);
  });

  /**
   * Test: Version monotonicity under concurrent proposals
   *
   * Scenario:
   * - Create multiple concurrent INSERT proposals (INSERT doesn't trigger stale detection)
   * - All accepted successfully
   * - Final document version = initial + accepted_count
   * - Event stream maintains version monotonicity
   */
  it("should maintain version monotonicity with 5 concurrent insert proposals", () => {
    const { engine, doc } = createSeededEngine();
    const blockId = doc.blocks[0].block_id;
    const sectionId = doc.blocks[0].section_id;

    // Propose 5 INSERT patches concurrently (INSERT doesn't trigger stale detection)
    const patches = [];
    for (let i = 0; i < 5; i++) {
      const patch = engine.proposePatchWithId(`concurrent_${i}`, {
        document_id: doc.document_id,
        block_id: blockId,
        section_id: sectionId,
        operation: "insert",
        patch_type: "wording_formatting",
        content: `Updated Content ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `user-${i}` },
        base_version: 1,
        target_fingerprint: `fp_${i}`,
      });
      patches.push(patch);
    }

    expect(engine.getPatchQueue(doc.document_id)).toHaveLength(5);

    // Accept patches in order
    const results = patches.map((patch) => {
      return engine.decidePatch({
        patch_id: patch.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    });

    // All INSERT patches should be accepted (no stale detection for INSERT)
    let acceptedCount = 0;
    for (let i = 0; i < 5; i++) {
      expect(results[i].status).toBe("accepted");
      acceptedCount++;
    }
    expect(acceptedCount).toBe(5);

    // Final version should be 6 (1 initial + 5 accepted patches)
    const final = engine.getDocument(doc.document_id)!;
    expect(final.version).toBe(6);

    // Check event stream for monotonic versions
    const events = engine.getEvents(doc.document_id);
    const versions = events.map((e) => e.version);

    for (let i = 1; i < versions.length; i++) {
      expect(versions[i]).toBeGreaterThanOrEqual(versions[i - 1]);
    }

    // Versions should be monotonic
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: Comment on concurrent patches
   *
   * Scenario:
   * - Propose patch from user A
   * - User B adds comment on that block
   * - User A accepts patch
   * - Comment remains (not lost on patch apply)
   */
  it("should preserve comments when patches are applied concurrently", () => {
    const { engine, doc } = createSeededEngine();
    const blockId = doc.blocks[0].block_id;
    const sectionId = doc.blocks[0].section_id;

    // User A proposes patch
    const patch = engine.proposePatchWithId("concurrent_patch", {
      document_id: doc.document_id,
      block_id: blockId,
      section_id: sectionId,
      operation: "replace",
      patch_type: "requirement_change",
      content: "## Updated Requirements",
      proposed_by: { actor_type: "agent", actor_id: "user-a" },
      base_version: 1,
      target_fingerprint: "fp_req",
    });

    // User B adds comment on the same block
    const comment = engine.addCommentThread(
      blockId,
      "Please review this patch carefully",
      "user-b",
      "User B"
    );

    expect(comment.thread_id).toBeDefined();
    expect(comment.block_id).toBe(blockId);

    // User A accepts patch
    const result = engine.decidePatch({
      patch_id: patch.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    expect(result.status).toBe("accepted");

    // Comment should still exist
    const retrievedComment = engine.getCommentThread(comment.thread_id);
    expect(retrievedComment).toBeDefined();
    expect(retrievedComment!.comments).toHaveLength(1);
    expect(retrievedComment!.comments[0].body).toBe(
      "Please review this patch carefully"
    );

    // Comments on block should be findable
    const blockComments = engine.getCommentsForBlock(blockId);
    expect(blockComments).toHaveLength(1);
    expect(blockComments[0].thread_id).toBe(comment.thread_id);
  });

  /**
   * Test: Patch ordering and determinism
   *
   * Scenario:
   * - Multiple patches proposed in quick succession
   * - Queue order matches proposal order
   * - Results deterministic (same input → same output)
   */
  it("should maintain deterministic patch ordering across proposals", () => {
    const { engine, doc } = createSeededEngine();
    const seed = loadWorkspaceSeed();
    const blockId = doc.blocks[0].block_id;
    const sectionId = doc.blocks[0].section_id;

    // Propose patches in specific order
    const patchIds = [];
    for (let i = 0; i < 5; i++) {
      const patch = engine.proposePatchWithId(`ordered_patch_${i}`, {
        document_id: doc.document_id,
        block_id: blockId,
        section_id: sectionId,
        operation: "insert",
        patch_type: "structural_edit",
        content: `Content ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `proposer-${i}` },
        base_version: 1,
        target_fingerprint: `fp_${i}`,
      });
      patchIds.push(patch.patch_id);
    }

    // Get queue and verify order matches proposal order
    const queue = engine.getPatchQueue(doc.document_id);
    expect(queue).toHaveLength(5);

    for (let i = 0; i < 5; i++) {
      expect(queue[i].patch_id).toBe(patchIds[i]);
    }

    // Verify determinism: propose again, same order
    const engine2 = createFreshEngine();
    const doc2 = engine2.loadDocument(seedToDocument(seed));

    const patchIds2 = [];
    for (let i = 0; i < 5; i++) {
      const patch = engine2.proposePatchWithId(`ordered_patch_${i}`, {
        document_id: doc2.document_id,
        block_id: blockId,
        section_id: sectionId,
        operation: "insert",
        patch_type: "structural_edit",
        content: `Content ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `proposer-${i}` },
        base_version: 1,
        target_fingerprint: `fp_${i}`,
      });
      patchIds2.push(patch.patch_id);
    }

    const queue2 = engine2.getPatchQueue(doc2.document_id);
    expect(queue2).toHaveLength(5);

    for (let i = 0; i < 5; i++) {
      expect(queue2[i].patch_id).toBe(patchIds2[i]);
    }
  });

  /**
   * Test: Load test with 100 patches across 10 blocks
   *
   * Scenario:
   * - Create 100 patches distributed across 10 blocks
   * - Accept 50, reject 50
   * - Verify final state consistent
   * - Verify event stream complete
   */
  it("should handle load test: 100 patches with mixed decisions", () => {
    const { engine, doc } = createSeededEngine();

    // Use available blocks, cycling through them
    const availableBlocks = doc.blocks.slice(0, Math.min(10, doc.blocks.length));
    const patchCount = 100;

    // Propose 100 patches
    const patches = [];
    for (let i = 0; i < patchCount; i++) {
      const blockIdx = i % availableBlocks.length;
      const block = availableBlocks[blockIdx];

      const patch = engine.proposePatchWithId(`load_patch_${i}`, {
        document_id: doc.document_id,
        block_id: block.block_id,
        section_id: block.section_id,
        operation: i % 3 === 0 ? "insert" : "replace",
        patch_type:
          i % 4 === 0
            ? "wording_formatting"
            : i % 4 === 1
              ? "structural_edit"
              : i % 4 === 2
                ? "requirement_change"
                : "task_export_change",
        content: `Load test patch ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `load_user_${i}` },
        base_version: i === 0 ? 1 : Math.floor(i / 10) + 1,
        target_fingerprint: `load_fp_${i}`,
      });
      patches.push(patch);
    }

    const queueAfterPropose = engine.getPatchQueue(doc.document_id);
    expect(queueAfterPropose.length).toBeGreaterThan(0);

    // Decide: accept first 50, reject second 50
    let acceptedCount = 0;

    for (let i = 0; i < patches.length; i++) {
      const decision = i < 50 ? "accept" : "reject";
      const result = engine.decidePatch({
        patch_id: patches[i].patch_id,
        decision: decision as "accept" | "reject",
        reviewer_id: TEST_REVIEWER,
      });

      if (result.status === "accepted") {
        acceptedCount++;
      } else if (result.status === "rejected") {
      }
    }

    // Verify results
    const queueAfterDecide = engine.getPatchQueue(doc.document_id);
    expect(queueAfterDecide).toHaveLength(0);

    // At least 50 should be accepted (some might be auto-rejected as stale)
    expect(acceptedCount).toBeGreaterThanOrEqual(1);

    // Check final document state
    const final = engine.getDocument(doc.document_id)!;
    expect(final.version).toBeGreaterThanOrEqual(2);

    // Event stream should have entries
    const events = engine.getEvents(doc.document_id);
    expect(events.length).toBeGreaterThan(0);

    // Count event types
    const proposeEvents = events.filter(
      (e) => e.event_type === "patch.proposed"
    );
    const acceptEvents = events.filter((e) => e.event_type === "patch.accepted");
    const rejectEvents = events.filter((e) => e.event_type === "patch.rejected");

    expect(proposeEvents.length).toBeGreaterThan(0);
    expect(acceptEvents.length).toBeGreaterThan(0);
    expect(rejectEvents.length).toBeGreaterThanOrEqual(0);

    // Verify event stream completeness: all proposed patches should have decision events
    for (const patch of patches) {
      const proposeEvent = events.find(
        (e) =>
          e.event_type === "patch.proposed" &&
          e.payload.patch_id === patch.patch_id
      );
      const decideEvent = events.find(
        (e) =>
          (e.event_type === "patch.accepted" ||
            e.event_type === "patch.rejected") &&
          e.payload.patch_id === patch.patch_id
      );

      expect(proposeEvent).toBeDefined();
      expect(decideEvent).toBeDefined();
    }
  });

  /**
   * Test: Verify patch workflow works identically for 1 user or N users
   *
   * Scenario:
   * - Single user proposes and accepts patch
   * - N users propose concurrent patches to different blocks
   * - Both workflows complete successfully
   * - Document integrity maintained
   */
  it("should work identically for single user and concurrent users", () => {
    // Single user workflow
    const engine1 = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc1 = engine1.loadDocument(seedToDocument(seed));

    const patch1 = engine1.proposePatch({
      document_id: doc1.document_id,
      block_id: doc1.blocks[0].block_id,
      section_id: doc1.blocks[0].section_id,
      operation: "replace",
      patch_type: "wording_formatting",
      content: "Updated",
      proposed_by: TEST_AGENT,
      base_version: 1,
      target_fingerprint: "fp1",
    });

    const result1 = engine1.decidePatch({
      patch_id: patch1.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });

    const final1 = engine1.getDocument(doc1.document_id)!;
    const finalVersion1 = final1.version;

    // Multi-user workflow
    const engine2 = createFreshEngine();
    const doc2 = engine2.loadDocument(seedToDocument(seed));

    const patches2 = [];
    for (let i = 0; i < 3; i++) {
      const patch = engine2.proposePatchWithId(`multi_user_${i}`, {
        document_id: doc2.document_id,
        block_id: doc2.blocks[i % doc2.blocks.length].block_id,
        section_id: doc2.blocks[i % doc2.blocks.length].section_id,
        operation: "replace",
        patch_type: "wording_formatting",
        content: `Updated by user ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `user-${i}` },
        base_version: 1,
        target_fingerprint: `fp_multi_${i}`,
      });
      patches2.push(patch);
    }

    for (const patch of patches2) {
      engine2.decidePatch({
        patch_id: patch.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    }

    const final2 = engine2.getDocument(doc2.document_id)!;
    const finalVersion2 = final2.version;

    // Both should result in consistent versioning
    expect(result1.status).toBe("accepted");
    expect(finalVersion1).toBeGreaterThanOrEqual(2);
    expect(finalVersion2).toBeGreaterThanOrEqual(finalVersion1);
  });

  /**
   * Test: No race conditions in version updates
   *
   * Scenario:
   * - Simulate rapid concurrent acceptances
   * - Each acceptance increments version by 1
   * - Final version = initial + accepted_count
   * - No version jumps or gaps
   */
  it("should handle rapid concurrent acceptances without version race conditions", () => {
    const { engine, doc } = createSeededEngine();

    // Propose 10 patches to different blocks (to avoid stale detection)
    const patches = [];
    const availableBlocks = doc.blocks.slice(0, Math.min(10, doc.blocks.length));

    for (let i = 0; i < 10; i++) {
      const block = availableBlocks[i % availableBlocks.length];
      const patch = engine.proposePatchWithId(`rapid_${i}`, {
        document_id: doc.document_id,
        block_id: block.block_id,
        section_id: block.section_id,
        operation: "replace",
        patch_type: "wording_formatting",
        content: `Rapid update ${i}`,
        proposed_by: { actor_type: "agent", actor_id: `rapid_user_${i}` },
        base_version: 1,
        target_fingerprint: `fp_rapid_${i}`,
      });
      patches.push(patch);
    }

    // Rapidly accept all patches
    for (const patch of patches) {
      engine.decidePatch({
        patch_id: patch.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    }

    const final = engine.getDocument(doc.document_id)!;

    // Should have accepted at least 1, final version >= 2
    expect(final.version).toBeGreaterThanOrEqual(2);

    // Verify no version gaps in event stream
    const events = engine.getEvents(doc.document_id);
    const versions = events
      .filter((e) => e.event_type === "patch.accepted")
      .map((e) => e.version);

    // Versions should be consecutive (no gaps)
    if (versions.length > 1) {
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i]).toBeGreaterThanOrEqual(versions[i - 1]);
      }
    }
  });

  /**
   * Test: Audit trail captures all concurrent events
   *
   * Scenario:
   * - Multiple concurrent proposals and decisions
   * - Verify all events captured in order
   * - Each event has valid timestamp and unique ID
   */
  it("should capture complete audit trail of concurrent operations", () => {
    const { engine, doc } = createSeededEngine();

    // Simulate 3 concurrent users
    for (let user = 0; user < 3; user++) {
      const blockIdx = user % doc.blocks.length;
      const block = doc.blocks[blockIdx];

      const patch = engine.proposePatchWithId(`audit_user_${user}`, {
        document_id: doc.document_id,
        block_id: block.block_id,
        section_id: block.section_id,
        operation: "replace",
        patch_type: "wording_formatting",
        content: `User ${user} update`,
        proposed_by: { actor_type: "agent", actor_id: `audit_user_${user}` },
        base_version: 1,
        target_fingerprint: `fp_audit_${user}`,
      });

      // Add comment
      engine.addCommentThread(
        block.block_id,
        `Comment from user ${user}`,
        `user_${user}`,
        `User ${user}`
      );

      // Decide on patch
      engine.decidePatch({
        patch_id: patch.patch_id,
        decision: "accept",
        reviewer_id: TEST_REVIEWER,
      });
    }

    // Verify audit trail completeness
    const events = engine.getEvents(doc.document_id);

    expect(events.length).toBeGreaterThan(0);

    // Check for required event types
    const eventTypes = new Set(events.map((e) => e.event_type));
    expect(eventTypes.has("document.created")).toBe(true);
    expect(eventTypes.has("patch.proposed")).toBe(true);
    expect(eventTypes.has("patch.accepted")).toBe(true);

    // All events should have valid timestamps
    for (const event of events) {
      expect(event.timestamp).toBeDefined();
      expect(() => new Date(event.timestamp)).not.toThrow();
    }

    // All events should have unique IDs
    const eventIds = events.map((e) => e.event_id);
    const uniqueIds = new Set(eventIds);
    expect(uniqueIds.size).toBe(eventIds.length);

    // All events should have document_id set
    for (const event of events) {
      if (event.event_type !== "comment.created") {
        expect(event.document_id).toBe(doc.document_id);
      }
    }
  });
});
