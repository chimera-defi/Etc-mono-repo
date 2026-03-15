/**
 * Acceptance Test: Comment Thread System
 *
 * Validates that the comment system can:
 * - Create comment threads on blocks
 * - Add replies to threads
 * - Retrieve threads by ID and block
 * - Resolve threads
 * - Emit proper events
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  seedToDocument,
} from "../helpers.js";

describe("Comment thread system", () => {
  it("should create a comment thread on a block", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    const thread = engine.addCommentThread(
      blockId,
      "This section needs clarification",
      "user_001",
      "Alice"
    );

    expect(thread).toBeDefined();
    expect(thread.thread_id).toMatch(/^thread_/);
    expect(thread.block_id).toBe(blockId);
    expect(thread.status).toBe("open");
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0].body).toBe("This section needs clarification");
    expect(thread.comments[0].author_name).toBe("Alice");
  });

  it("should add a reply to an existing thread", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    const thread = engine.addCommentThread(
      blockId,
      "This section needs clarification",
      "user_001",
      "Alice"
    );

    engine.addCommentToThread(
      thread.thread_id,
      "I agree, let's update this",
      "user_002",
      "Bob"
    );

    const retrieved = engine.getCommentThread(thread.thread_id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.comments).toHaveLength(2);
    expect(retrieved!.comments[1].body).toBe("I agree, let's update this");
    expect(retrieved!.comments[1].author_name).toBe("Bob");
  });

  it("should retrieve a comment thread by ID", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    const thread = engine.addCommentThread(
      blockId,
      "Initial comment",
      "user_001",
      "Alice"
    );

    const retrieved = engine.getCommentThread(thread.thread_id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.thread_id).toBe(thread.thread_id);
    expect(retrieved!.block_id).toBe(blockId);
  });

  it("should retrieve all threads for a specific block", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    engine.addCommentThread(blockId, "First comment", "user_001", "Alice");
    engine.addCommentThread(blockId, "Second comment", "user_002", "Bob");
    engine.addCommentThread(
      doc.blocks[1].block_id,
      "Different block",
      "user_003",
      "Charlie"
    );

    const threads = engine.getCommentsForBlock(blockId);
    expect(threads).toHaveLength(2);
    expect(threads.every((t) => t.block_id === blockId)).toBe(true);
  });

  it("should resolve a comment thread", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    const thread = engine.addCommentThread(
      blockId,
      "This needs fixing",
      "user_001",
      "Alice"
    );

    expect(thread.status).toBe("open");
    expect(thread.resolved_at).toBeUndefined();

    engine.resolveCommentThread(thread.thread_id);

    const resolved = engine.getCommentThread(thread.thread_id);
    expect(resolved!.status).toBe("resolved");
    expect(resolved!.resolved_at).toBeDefined();
  });

  it("should prevent replies to resolved threads", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    const thread = engine.addCommentThread(
      blockId,
      "Original comment",
      "user_001",
      "Alice"
    );

    engine.resolveCommentThread(thread.thread_id);

    expect(() => {
      engine.addCommentToThread(
        thread.thread_id,
        "This should fail",
        "user_002",
        "Bob"
      );
    }).toThrow("Cannot reply to resolved thread");
  });

  it("should emit comment.created event when creating thread", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    engine.loadDocument(seedToDocument(seed));
    const blockId = seed.blocks[0].block_id;

    engine.addCommentThread(blockId, "Test comment", "user_001", "Alice");

    const events = engine.getEvents();
    const commentCreatedEvent = events.find((e) => e.event_type === "comment.created");
    expect(commentCreatedEvent).toBeDefined();
    expect(commentCreatedEvent!.payload.block_id).toBe(blockId);
    expect(commentCreatedEvent!.payload.author_name).toBe("Alice");
  });

  it("should emit comment.replied event when adding reply", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    engine.loadDocument(seedToDocument(seed));
    const blockId = seed.blocks[0].block_id;

    const thread = engine.addCommentThread(blockId, "Test", "user_001", "Alice");
    engine.addCommentToThread(thread.thread_id, "Reply", "user_002", "Bob");

    const events = engine.getEvents();
    const replyEvent = events.find((e) => e.event_type === "comment.replied");
    expect(replyEvent).toBeDefined();
    expect(replyEvent!.payload.thread_id).toBe(thread.thread_id);
    expect(replyEvent!.payload.author_name).toBe("Bob");
  });

  it("should emit comment.resolved event when resolving thread", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    engine.loadDocument(seedToDocument(seed));
    const blockId = seed.blocks[0].block_id;

    const thread = engine.addCommentThread(blockId, "Test", "user_001", "Alice");
    engine.resolveCommentThread(thread.thread_id);

    const events = engine.getEvents();
    const resolvedEvent = events.find((e) => e.event_type === "comment.resolved");
    expect(resolvedEvent).toBeDefined();
    expect(resolvedEvent!.payload.thread_id).toBe(thread.thread_id);
    expect(resolvedEvent!.payload.resolved_at).toBeDefined();
  });

  it("should work alongside patch workflow", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0].block_id;

    // Create a patch
    const patch = engine.proposePatch({
      document_id: doc.document_id,
      block_id: blockId,
      operation: "replace",
      patch_type: "wording_formatting",
      content: "## Goals\nUpdated goals content",
      proposed_by: { actor_type: "agent", actor_id: "agent_001" },
      base_version: 1,
      target_fingerprint: "abc123",
    });

    // Add comment on the patch block
    const thread = engine.addCommentThread(
      blockId,
      "Please review this patch",
      "user_001",
      "Alice"
    );

    expect(patch.patch_id).toBeDefined();
    expect(thread.thread_id).toBeDefined();
    expect(engine.getCommentThread(thread.thread_id)).toBeDefined();
    expect(engine.getPatch(patch.patch_id)).toBeDefined();
  });
});
