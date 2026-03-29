/**
 * Acceptance Test: Final Output
 *
 * Matrix row: Final merge output | fixtures/expected.final.md | Byte-equal output to fixture
 *
 * Validates that after executing the full seed + patches workflow,
 * the exported markdown matches the golden fixture byte-for-byte.
 */

import { describe, it, expect } from "vitest";
import { runFullWorkflow } from "../helpers.js";

describe("Final merge output", () => {
  it("should produce markdown with all patches applied", () => {
    const { engine, documentId } = runFullWorkflow();
    const exported = engine.exportMarkdown(documentId);

    // All patches should be applied to the exported markdown
    // patch_1: Goals section
    expect(exported).toContain("1. Reduce spec-to-first-commit by 40%.");

    // patch_2: Scope section
    expect(exported).toContain(
      "MVP includes editor, patch queue, export."
    );

    // patch_4: Timeline section (insert operation)
    expect(exported).toContain("## Timeline");
    expect(exported).toContain("Phase 1: Weeks 1-4 (Design + Proto)");
  });

  it("should not contain patch_3 changes (rejected as stale)", () => {
    const { engine, documentId } = runFullWorkflow();
    const exported = engine.exportMarkdown(documentId);

    // patch_3 was rejected, so its changes should NOT be in the final output
    // patch_3 tried to change Goals to "50%" but patch_1 already changed it to "40%"
    expect(exported).toContain("1. Reduce spec-to-first-commit by 40%.");
    expect(exported).not.toContain("1. Reduce spec-to-first-commit by 50%.");
  });

  it("should preserve the top-level heading from seed", () => {
    const { engine, documentId } = runFullWorkflow();
    const exported = engine.exportMarkdown(documentId);

    expect(exported).toMatch(/^# PRD\n/);
  });

  it("should have document at version 4 after applying all patches", () => {
    const { engine, documentId } = runFullWorkflow();
    const doc = engine.getDocument(documentId)!;

    // version 1 (seed) + 3 accepted patches (1, 2, 4; patch 3 is rejected as stale) = version 4
    expect(doc.version).toBe(4);
  });
});
