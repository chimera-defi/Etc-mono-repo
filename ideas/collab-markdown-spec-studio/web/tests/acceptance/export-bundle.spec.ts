/**
 * Acceptance Test: Export Bundle
 *
 * Validates SpecBundle export containing agent_spec.json metadata,
 * document markdown, and complete patch audit trail.
 *
 * Tests that:
 * - exportBundle() returns valid SpecBundle with spec_version "1.0"
 * - agent_spec contains correct document metadata
 * - Patch summary accurately reflects all proposed/accepted/rejected patches
 * - Block inventory reflects current sections with modification tracking
 * - Bundle markdown matches current document state
 */

import { describe, it, expect } from "vitest";
import {
  loadWorkspaceSeed,
  runFullWorkflow,
  createFreshEngine,
  seedToDocument,
  TEST_AGENT,
  TEST_REVIEWER,
} from "../helpers.js";

describe("Export Bundle", () => {
  it("should produce valid SpecBundle with spec_version 1.0", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);

    expect(bundle.spec_version).toBe("1.0");
    expect(bundle).toHaveProperty("agent_spec");
    expect(bundle).toHaveProperty("document_markdown");
    expect(bundle).toHaveProperty("patch_summary");
    expect(bundle).toHaveProperty("export_timestamp");
  });

  it("should contain agent_spec with correct document metadata", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const spec = bundle.agent_spec;

    // Verify basic document info
    expect(spec.document_id).toBe(documentId);
    expect(spec.document_version).toBe(4); // v1 + 3 accepted patches
    expect(spec.document_title).toBe("SpecForge MVP");

    // Verify timestamps are ISO 8601
    expect(spec.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(spec.last_modified).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should include patch statistics in agent_spec", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const spec = bundle.agent_spec;

    // From fixtures: 4 patches proposed, 3 accepted, 1 rejected (stale)
    expect(spec.total_patches_proposed).toBe(4);
    expect(spec.total_patches_accepted).toBe(3);
    expect(spec.total_patches_rejected).toBe(1);
  });

  it("should list all authors who proposed or reviewed patches", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const spec = bundle.agent_spec;

    // Authors include: agents who proposed + reviewers
    expect(spec.authors).toContain(TEST_AGENT.actor_id);
    expect(spec.authors).toContain(TEST_REVIEWER);
    expect(Array.isArray(spec.authors)).toBe(true);
  });

  it("should include block inventory reflecting all sections", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const spec = bundle.agent_spec;

    // From fixture: Goals, Scope, Timeline blocks
    expect(spec.sections.length).toBeGreaterThanOrEqual(2);

    // Check Goals block
    const goalsBlock = spec.sections.find((s) => s.heading === "Goals");
    expect(goalsBlock).toBeDefined();
    expect(goalsBlock?.block_id).toBe("blk_goals_1");
    expect(goalsBlock?.content_length).toBeGreaterThan(0);
    expect(Array.isArray(goalsBlock?.modified_by)).toBe(true);
    expect(goalsBlock?.patch_count).toBeGreaterThanOrEqual(1);

    // Check Scope block
    const scopeBlock = spec.sections.find((s) => s.heading === "Scope");
    expect(scopeBlock).toBeDefined();
    expect(scopeBlock?.block_id).toBe("blk_scope_1");
    expect(scopeBlock?.patch_count).toBeGreaterThanOrEqual(1);
  });

  it("should track modifications for each block", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const spec = bundle.agent_spec;

    for (const block of spec.sections) {
      // Every block should have metadata
      expect(block.block_id).toBeDefined();
      expect(block.heading).toBeDefined();
      expect(typeof block.content_length).toBe("number");
      expect(Array.isArray(block.modified_by)).toBe(true);
      expect(typeof block.patch_count).toBe("number");

      // If patch_count > 0, modified_by should have authors
      if (block.patch_count > 0) {
        expect(block.modified_by.length).toBeGreaterThan(0);
      }
    }
  });

  it("should include document markdown matching current state", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);
    const exported = engine.exportMarkdown(documentId);

    // Bundle markdown should match exported markdown
    expect(bundle.document_markdown).toBe(exported);

    // Should contain all accepted patches
    expect(bundle.document_markdown).toContain("40%");
    expect(bundle.document_markdown).toContain("MVP includes editor");
    expect(bundle.document_markdown).toContain("Timeline");
  });

  it("should not include rejected patch content in markdown", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);

    // patch_3 was rejected, so "50%" should NOT appear
    expect(bundle.document_markdown).not.toContain("50%");
  });

  it("should accurately reflect patch summary with all decisions", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);

    const summary = bundle.patch_summary;

    // Should have entries for all proposed patches
    expect(summary.length).toBe(4);

    // Find each patch in summary
    const patch1 = summary.find((p) => p.patch_id === "patch_1");
    expect(patch1).toBeDefined();
    expect(patch1?.status).toBe("accepted");
    expect(patch1?.operation).toBe("replace");
    expect(patch1?.block_id).toBe("blk_goals_1");
    expect(patch1?.accepted_at).toBeDefined();

    const patch2 = summary.find((p) => p.patch_id === "patch_2");
    expect(patch2).toBeDefined();
    expect(patch2?.status).toBe("accepted");

    const patch3 = summary.find((p) => p.patch_id === "patch_3");
    expect(patch3).toBeDefined();
    expect(patch3?.status).toBe("rejected");
    // Rejected patches may not have accepted_at
    expect(patch3?.accepted_at).toBeUndefined();

    const patch4 = summary.find((p) => p.patch_id === "patch_4");
    expect(patch4).toBeDefined();
    expect(patch4?.status).toBe("accepted");
    expect(patch4?.operation).toBe("insert");
  });

  it("should timestamp export accurately", () => {
    const { engine, documentId } = runFullWorkflow();
    const beforeExport = new Date();
    const bundle = engine.exportBundle(documentId);
    const afterExport = new Date();

    const exportTime = new Date(bundle.export_timestamp);
    expect(exportTime.getTime()).toBeGreaterThanOrEqual(beforeExport.getTime());
    expect(exportTime.getTime()).toBeLessThanOrEqual(afterExport.getTime());
  });

  it("should handle document with no patches", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Export bundle without proposing/deciding any patches
    const bundle = engine.exportBundle(doc.document_id);

    expect(bundle.agent_spec.total_patches_proposed).toBe(0);
    expect(bundle.agent_spec.total_patches_accepted).toBe(0);
    expect(bundle.agent_spec.total_patches_rejected).toBe(0);
    expect(bundle.patch_summary.length).toBe(0);

    // Should still have sections
    expect(bundle.agent_spec.sections.length).toBeGreaterThan(0);
    expect(bundle.document_markdown).toBe(seed.markdown);
  });

  it("should validate SpecBundle structure for all properties", () => {
    const { engine, documentId } = runFullWorkflow();
    const bundle = engine.exportBundle(documentId);

    // Type guard: bundle should be valid SpecBundle shape
    expect(typeof bundle.spec_version).toBe("string");
    expect(typeof bundle.document_markdown).toBe("string");
    expect(typeof bundle.export_timestamp).toBe("string");

    // agent_spec validation
    const spec = bundle.agent_spec;
    expect(typeof spec.document_id).toBe("string");
    expect(typeof spec.document_version).toBe("number");
    expect(typeof spec.document_title).toBe("string");
    expect(typeof spec.created_at).toBe("string");
    expect(typeof spec.last_modified).toBe("string");
    expect(typeof spec.total_patches_proposed).toBe("number");
    expect(typeof spec.total_patches_accepted).toBe("number");
    expect(typeof spec.total_patches_rejected).toBe("number");
    expect(Array.isArray(spec.authors)).toBe(true);
    expect(Array.isArray(spec.sections)).toBe(true);

    // patch_summary validation
    expect(Array.isArray(bundle.patch_summary)).toBe(true);
    for (const item of bundle.patch_summary) {
      expect(typeof item.patch_id).toBe("string");
      expect(typeof item.operation).toBe("string");
      expect(typeof item.block_id).toBe("string");
      expect(typeof item.status).toBe("string");
      if (item.accepted_at) {
        expect(typeof item.accepted_at).toBe("string");
      }
    }
  });
});
