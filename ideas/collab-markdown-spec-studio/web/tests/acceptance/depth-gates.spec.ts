/**
 * Acceptance Test: Depth Gates
 *
 * Validates that depth checks ensure required sections exist with minimum content.
 *
 * Tests that:
 * - depthCheck() passes when all required sections present with adequate content
 * - depthCheck() fails when a required section is missing
 * - depthCheck() fails when a section's content is below minimum length
 * - Failures are properly reported in the result
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  seedToDocument,
} from "../helpers.js";

describe("Depth Gates", () => {
  it("should pass depth check when all required sections present with minimum content", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Define minimal requirements for existing sections
    const requiredSections = [
      {
        section_id: "sec_goals",
        heading: "Goals",
        min_length: 10,
      },
      {
        section_id: "sec_scope",
        heading: "Scope",
        min_length: 10,
      },
    ];

    const result = engine.depthCheck(doc.document_id, requiredSections);

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.required_sections).toHaveLength(2);

    // Verify each section passed validation
    for (const section of result.required_sections) {
      expect(section.required).toBe(true);
      expect(section.present).toBe(true);
      if (section.present) {
        expect(section.content_length).toBeGreaterThanOrEqual(section.min_length);
      }
    }
  });

  it("should fail depth check when a required section is missing", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Require a section that doesn't exist
    const requiredSections = [
      {
        section_id: "sec_goals",
        heading: "Goals",
        min_length: 10,
      },
      {
        section_id: "sec_nonexistent",
        heading: "Nonexistent Section",
        min_length: 10,
      },
    ];

    const result = engine.depthCheck(doc.document_id, requiredSections);

    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);

    // Find the missing section result
    const missingSection = result.required_sections.find(
      (s) => s.section_id === "sec_nonexistent"
    );
    expect(missingSection?.present).toBe(false);
    expect(missingSection?.content_length).toBe(0);

    // Verify failure message contains reference to the missing section
    const failureMsg = result.failures.find((f) =>
      f.includes("Nonexistent Section")
    );
    expect(failureMsg).toBeDefined();
  });

  it("should fail depth check when section content is below minimum length", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Require very high minimum length (higher than actual content)
    const requiredSections = [
      {
        section_id: "sec_goals",
        heading: "Goals",
        min_length: 10000, // Very high requirement
      },
    ];

    const result = engine.depthCheck(doc.document_id, requiredSections);

    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);

    // Verify the section is present but content is insufficient
    const goalSection = result.required_sections.find(
      (s) => s.heading === "Goals"
    );
    expect(goalSection?.present).toBe(true);
    if (goalSection) {
      expect(goalSection.content_length).toBeLessThan(goalSection.min_length);
    }

    // Verify failure message mentions content length
    const failureMsg = result.failures.find((f) =>
      f.includes("below minimum")
    );
    expect(failureMsg).toBeDefined();
  });

  it("should report all failures together", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // Multiple issues: missing section + insufficient content
    const requiredSections = [
      {
        section_id: "sec_goals",
        heading: "Goals",
        min_length: 10000, // Too high
      },
      {
        section_id: "sec_missing1",
        heading: "Missing Section 1",
        min_length: 10,
      },
      {
        section_id: "sec_missing2",
        heading: "Missing Section 2",
        min_length: 10,
      },
    ];

    const result = engine.depthCheck(doc.document_id, requiredSections);

    expect(result.passed).toBe(false);
    // Should have at least 3 failures (1 insufficient + 2 missing)
    expect(result.failures.length).toBeGreaterThanOrEqual(3);
  });

  it("should correctly calculate content length for each section", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    const requiredSections = [
      {
        section_id: "sec_goals",
        heading: "Goals",
        min_length: 1,
      },
      {
        section_id: "sec_scope",
        heading: "Scope",
        min_length: 1,
      },
    ];

    const result = engine.depthCheck(doc.document_id, requiredSections);

    // All content_lengths should be greater than 0 for sections that exist
    for (const section of result.required_sections) {
      if (section.present) {
        expect(section.content_length).toBeGreaterThan(0);
      } else {
        expect(section.content_length).toBe(0);
      }
    }
  });

  it("should throw error for nonexistent document", () => {
    const engine = createFreshEngine();

    const requiredSections = [
      {
        section_id: "sec_test",
        heading: "Test",
        min_length: 10,
      },
    ];

    expect(() => {
      engine.depthCheck("nonexistent-doc-id", requiredSections);
    }).toThrow("Document not found");
  });

  it("should handle empty required sections list", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    const result = engine.depthCheck(doc.document_id, []);

    // With no requirements, should pass
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.required_sections).toHaveLength(0);
  });
});
