/**
 * Acceptance Test: Final Output
 *
 * Matrix row: Final merge output | fixtures/expected.final.md | Byte-equal output to fixture
 *
 * Validates that after executing the full seed + patches workflow,
 * the exported markdown matches the golden fixture byte-for-byte.
 */

import { describe, it, expect } from "vitest";
import {
  loadExpectedFinalMarkdown,
  runFullWorkflow,
} from "../helpers.js";

describe("Final merge output", () => {
  it("should produce markdown that matches expected.final.md byte-for-byte", () => {
    const { engine, documentId } = runFullWorkflow();
    const expected = loadExpectedFinalMarkdown();

    const exported = engine.exportMarkdown(documentId);

    expect(exported).toBe(expected);
  });

  it("should contain all patched section content", () => {
    const { engine, documentId } = runFullWorkflow();
    const exported = engine.exportMarkdown(documentId);

    // From patch_1: Goals section updated
    expect(exported).toContain("1. Reduce spec-to-first-commit by 40%.");

    // From patch_2: Scope section updated
    expect(exported).toContain(
      "MVP includes editor, patch queue, export."
    );
  });

  it("should preserve the top-level heading from seed", () => {
    const { engine, documentId } = runFullWorkflow();
    const exported = engine.exportMarkdown(documentId);

    expect(exported).toMatch(/^# PRD\n/);
  });

  it("should have document at version 4 after applying patches 1, 2, and 4", () => {
    const { engine, documentId } = runFullWorkflow();
    const doc = engine.getDocument(documentId)!;

    // version 1 (seed) + 3 accepted patches (1, 2, 4) = version 4
    expect(doc.version).toBe(4);
  });
});
