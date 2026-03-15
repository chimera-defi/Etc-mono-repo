/**
 * Acceptance Test: Clarifications
 *
 * Validates the clarification question system for blocks and readiness validation.
 *
 * Tests that:
 * - Create clarification questions on blocks
 * - Retrieve open clarifications
 * - Answer clarification questions
 * - Closed clarifications cannot be re-answered
 * - Export is blocked if unanswered clarifications exist
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  seedToDocument,
} from "../helpers.js";

describe("Clarifications", () => {
  it("should create a clarification question on a block", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    const clarif = engine.addClarification(
      blockId,
      "What does this section mean?",
      "user-001"
    );

    expect(clarif.clarification_id).toBeDefined();
    expect(clarif.block_id).toBe(blockId);
    expect(clarif.question).toBe("What does this section mean?");
    expect(clarif.status).toBe("open");
    expect(clarif.asked_by_actor_id).toBe("user-001");
    expect(clarif.asked_at).toBeDefined();
    expect(clarif.answer).toBeUndefined();
    expect(clarif.answered_at).toBeUndefined();
  });

  it("should retrieve clarifications for a specific block", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    // Add multiple clarifications to the same block
    engine.addClarification(blockId, "Question 1?", "user-001");
    engine.addClarification(blockId, "Question 2?", "user-002");

    const clarifications = engine.getClarificationsForBlock(blockId);

    expect(clarifications).toHaveLength(2);
    expect(clarifications.every((c) => c.block_id === blockId)).toBe(true);
  });

  it("should answer a clarification question", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    const clarif = engine.addClarification(blockId, "What is this?", "user-001");

    engine.answerClarification(clarif.clarification_id, "This is the answer.");

    const updated = engine.getClarification(clarif.clarification_id);
    expect(updated?.status).toBe("answered");
    expect(updated?.answer).toBe("This is the answer.");
    expect(updated?.answered_at).toBeDefined();
  });

  it("should prevent re-answering a clarification", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    const clarif = engine.addClarification(blockId, "What is this?", "user-001");
    engine.answerClarification(clarif.clarification_id, "First answer");

    expect(() => {
      engine.answerClarification(clarif.clarification_id, "Second answer");
    }).toThrow("already answered");
  });

  it("should retrieve open clarifications for a document", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    // Create some clarifications
    const clarif1 = engine.addClarification(blockId, "Q1?", "user-001");
    const clarif2 = engine.addClarification(blockId, "Q2?", "user-002");

    // Answer one of them
    engine.answerClarification(clarif1.clarification_id, "A1");

    // Get open clarifications
    const openClarifications = engine.getOpenClarifications(doc.document_id);

    // Should have 1 open (clarif2)
    expect(openClarifications).toHaveLength(1);
    expect(openClarifications[0]?.clarification_id).toBe(clarif2.clarification_id);
  });

  it("should block export if unanswered clarifications exist", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    // Add unanswered clarification
    engine.addClarification(blockId, "Unanswered question?", "user-001");

    const readiness = engine.validateExportReadiness(doc.document_id);

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.length).toBeGreaterThan(0);

    // Verify the blocker message mentions clarifications
    const clarificationBlocker = readiness.blockers.find((b) =>
      b.includes("clarification")
    );
    expect(clarificationBlocker).toBeDefined();
  });

  it("should allow export once all clarifications are answered", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    // Add clarifications and answer them
    const clarif1 = engine.addClarification(blockId, "Q1?", "user-001");
    const clarif2 = engine.addClarification(blockId, "Q2?", "user-002");

    engine.answerClarification(clarif1.clarification_id, "A1");
    engine.answerClarification(clarif2.clarification_id, "A2");

    const readiness = engine.validateExportReadiness(doc.document_id);

    // Should not be blocked by clarifications anymore
    const clarificationBlocker = readiness.blockers.find((b) =>
      b.includes("clarification")
    );
    expect(clarificationBlocker).toBeUndefined();
  });

  it("should throw error for nonexistent clarification", () => {
    const engine = createFreshEngine();

    expect(() => {
      engine.answerClarification("nonexistent-id", "answer");
    }).toThrow("Clarification not found");
  });

  it("should throw error for open clarifications on nonexistent document", () => {
    const engine = createFreshEngine();

    expect(() => {
      engine.getOpenClarifications("nonexistent-doc-id");
    }).toThrow("Document not found");
  });

  it("should handle multiple documents with separate clarifications", () => {
    const engine = createFreshEngine();
    const seed1 = loadWorkspaceSeed();
    const doc1 = engine.loadDocument(seedToDocument(seed1));

    // Create second document with different blocks
    const seed2 = loadWorkspaceSeed();
    seed2.document_id = "doc-2";
    seed2.blocks = seed2.blocks.map((b) => ({
      ...b,
      block_id: b.block_id + "_2",
    }));
    const doc2 = engine.loadDocument(seedToDocument(seed2));

    // Add clarifications to both documents
    const blockId1 = doc1.blocks[0]!.block_id;
    const blockId2 = doc2.blocks[0]!.block_id;

    engine.addClarification(blockId1, "Q1 for doc1?", "user-001");
    engine.addClarification(blockId2, "Q1 for doc2?", "user-002");

    // Check open clarifications per document
    const open1 = engine.getOpenClarifications(doc1.document_id);
    const open2 = engine.getOpenClarifications(doc2.document_id);

    expect(open1).toHaveLength(1);
    expect(open2).toHaveLength(1);
    expect(open1[0]?.asked_by_actor_id).toBe("user-001");
    expect(open2[0]?.asked_by_actor_id).toBe("user-002");
  });

  it("should return empty array when no clarifications exist", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    const openClarifications = engine.getOpenClarifications(doc.document_id);

    expect(openClarifications).toHaveLength(0);
  });

  it("should support multiple clarifications per block", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));
    const blockId = doc.blocks[0]!.block_id;

    // Add 5 clarifications
    const clarifications = [];
    for (let i = 0; i < 5; i++) {
      clarifications.push(
        engine.addClarification(blockId, `Question ${i}?`, `user-${i}`)
      );
    }

    const retrieved = engine.getClarificationsForBlock(blockId);
    expect(retrieved).toHaveLength(5);
  });
});
