import { describe, expect, it } from "vitest";

import { exportDocumentBundle } from "./export";
import { makeDocumentRecord } from "./markdown";

describe("Sprint Planning Export", () => {
  describe("buildDesignSystem", () => {
    it("includes DESIGN_SYSTEM.md when design-review stage completed", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("design-review", {
        design_principles: "Keep it simple\nMake it accessible",
        interaction_model: "Click to expand\nKeyboard navigation",
        accessibility: "WCAG 2.1 AA compliance\nScreen reader support",
        design_constraints: "Mobile-first\nDark mode support",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      expect(bundle.files["DESIGN_SYSTEM.md"]).toBeDefined();
      expect(bundle.files["DESIGN_SYSTEM.md"]).toContain("# Design System");
      expect(bundle.files["DESIGN_SYSTEM.md"]).toContain("**Source**: Sprint Planning — Design Review stage");
      expect(bundle.files["DESIGN_SYSTEM.md"]).toContain("Keep it simple");
      expect(bundle.files["DESIGN_SYSTEM.md"]).toContain("WCAG 2.1 AA compliance");
    });

    it("omits DESIGN_SYSTEM.md when design-review stage skipped", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      // Only discovery stage, no design-review
      planningStages.set("discovery", {
        problem_statement: "Users need better tools",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      expect(bundle.files["DESIGN_SYSTEM.md"]).toBeUndefined();
    });

    it("omits DESIGN_SYSTEM.md when no planning stages exist", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const bundle = exportDocumentBundle(document, []);

      expect(bundle.files["DESIGN_SYSTEM.md"]).toBeUndefined();
    });
  });

  describe("buildSecurity", () => {
    it("includes SECURITY.md when security-review stage completed", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("security-review", {
        trust_boundaries: "Client-server boundary\nAPI gateway",
        threat_model: "SQL injection\nXSS attacks",
        auth_model: "JWT tokens\nOAuth 2.0",
        sensitive_data: "User credentials\nPayment info",
        security_requirements: "Encrypt at rest\nHTTPS only",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      expect(bundle.files["SECURITY.md"]).toBeDefined();
      expect(bundle.files["SECURITY.md"]).toContain("# Security");
      expect(bundle.files["SECURITY.md"]).toContain("**Source**: Sprint Planning — Security Review stage");
      expect(bundle.files["SECURITY.md"]).toContain("SQL injection");
      expect(bundle.files["SECURITY.md"]).toContain("JWT tokens");
      expect(bundle.files["SECURITY.md"]).toContain("Encrypt at rest");
    });

    it("omits SECURITY.md when security-review stage skipped", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      // Only discovery stage, no security-review
      planningStages.set("discovery", {
        problem_statement: "Users need better tools",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      expect(bundle.files["SECURITY.md"]).toBeUndefined();
    });

    it("omits SECURITY.md when no planning stages exist", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const bundle = exportDocumentBundle(document, []);

      expect(bundle.files["SECURITY.md"]).toBeUndefined();
    });
  });

  describe("agent_spec.json planning provenance", () => {
    it("includes planningSession field when planning stages exist", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("discovery", {
        problem_statement: "Users need better tools",
      });
      planningStages.set("ceo-review", {
        business_value: "High impact",
      });
      planningStages.set("design-review", {
        design_principles: "Keep it simple",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);
      const agentSpec = JSON.parse(bundle.files["agent_spec.json"]);

      expect(agentSpec.planningSession).toBeDefined();
      expect(agentSpec.planningSession.stages).toHaveLength(5);
      
      // Check discovery stage
      const discoveryStage = agentSpec.planningSession.stages.find((s: any) => s.name === "discovery");
      expect(discoveryStage).toBeDefined();
      expect(discoveryStage.status).toBe("completed");
      expect(discoveryStage.outputs).toEqual({
        problem_statement: "Users need better tools",
      });

      // Check ceo-review stage
      const ceoStage = agentSpec.planningSession.stages.find((s: any) => s.name === "ceo-review");
      expect(ceoStage).toBeDefined();
      expect(ceoStage.status).toBe("completed");
      expect(ceoStage.outputs).toEqual({
        business_value: "High impact",
      });

      // Check design-review stage
      const designStage = agentSpec.planningSession.stages.find((s: any) => s.name === "design-review");
      expect(designStage).toBeDefined();
      expect(designStage.status).toBe("completed");
      expect(designStage.outputs).toEqual({
        design_principles: "Keep it simple",
      });

      // Check skipped stages
      const engStage = agentSpec.planningSession.stages.find((s: any) => s.name === "eng-review");
      expect(engStage).toBeDefined();
      expect(engStage.status).toBe("skipped");
      expect(engStage.outputs).toBeNull();

      const securityStage = agentSpec.planningSession.stages.find((s: any) => s.name === "security-review");
      expect(securityStage).toBeDefined();
      expect(securityStage.status).toBe("skipped");
      expect(securityStage.outputs).toBeNull();
    });

    it("omits planningSession field when no planning stages exist", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const bundle = exportDocumentBundle(document, []);
      const agentSpec = JSON.parse(bundle.files["agent_spec.json"]);

      expect(agentSpec.planningSession).toBeUndefined();
    });

    it("includes all 5 stage names in correct order", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("discovery", { problem: "test" });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);
      const agentSpec = JSON.parse(bundle.files["agent_spec.json"]);

      const stageNames = agentSpec.planningSession.stages.map((s: any) => s.name);
      expect(stageNames).toEqual([
        "discovery",
        "ceo-review",
        "eng-review",
        "design-review",
        "security-review",
      ]);
    });
  });

  describe("combined planning export", () => {
    it("includes both DESIGN_SYSTEM.md and SECURITY.md when both stages completed", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("design-review", {
        design_principles: "Keep it simple",
      });
      planningStages.set("security-review", {
        threat_model: "SQL injection",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      expect(bundle.files["DESIGN_SYSTEM.md"]).toBeDefined();
      expect(bundle.files["SECURITY.md"]).toBeDefined();
      expect(bundle.files["agent_spec.json"]).toBeDefined();

      const agentSpec = JSON.parse(bundle.files["agent_spec.json"]);
      expect(agentSpec.planningSession).toBeDefined();
      expect(agentSpec.planningSession.stages).toHaveLength(5);
    });

    it("maintains standard export files alongside planning files", () => {
      const document = makeDocumentRecord({
        workspace_id: "ws_test",
        title: "Test Project",
        initial_markdown: "# Test Project\n\n## Problem\nTest problem",
        metadata: {},
      });

      const planningStages = new Map<string, Record<string, string>>();
      planningStages.set("design-review", {
        design_principles: "Keep it simple",
      });

      const bundle = exportDocumentBundle(document, [], undefined, planningStages);

      // Standard files should still be present
      expect(bundle.files["README.md"]).toBeDefined();
      expect(bundle.files["EXECUTIVE_SUMMARY.md"]).toBeDefined();
      expect(bundle.files["PRD.md"]).toBeDefined();
      expect(bundle.files["SPEC.md"]).toBeDefined();
      expect(bundle.files["AGENT_HANDOFF.md"]).toBeDefined();
      expect(bundle.files["TASKS.md"]).toBeDefined();
      expect(bundle.files["agent_spec.json"]).toBeDefined();

      // Planning file should be added
      expect(bundle.files["DESIGN_SYSTEM.md"]).toBeDefined();
    });
  });
});
