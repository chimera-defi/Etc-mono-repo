import { describe, expect, it } from "vitest";

import { makeDocumentRecord } from "./markdown";
import { buildDesignHandoffData } from "./design-handoff";

describe("buildDesignHandoffData", () => {
  it("extracts ux pack content and builds a review prompt", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "Designable Product",
      initial_markdown: [
        "# Designable Product",
        "",
        "## Problem",
        "- Specs drift from the UI.",
        "",
        "## Goals",
        "- Keep design attached to the spec.",
        "",
        "## Non-Goals",
        "- Full wireframe editor.",
        "",
        "## Requirements",
        "- Collaborative drafting.",
        "",
        "## UX Pack",
        "- Primary surface: shared workspace",
        "- Key screens: landing, workspace start, draft editor, export handoff",
        "- Failure states: auth required, stale room, quota reached",
        "- Responsive expectation: mobile can review, desktop is primary",
        "",
        "## Tasks",
        "- Ship the design handoff",
      ].join("\n"),
    });

    const handoff = buildDesignHandoffData({
      document,
      designSystem: "# Design System\n\n## Design Principles\n\n- Clear hierarchy",
    });

    expect(handoff.uxPack).toContain("Primary surface: shared workspace");
    expect(handoff.keyScreenLines).toEqual(
      expect.arrayContaining([
        "Primary surface: shared workspace",
        "Key screens: landing, workspace start, draft editor, export handoff",
      ]),
    );
    expect(handoff.failureStateLines).toContain(
      "Failure states: auth required, stale room, quota reached",
    );
    expect(handoff.responsiveLines).toContain(
      "Responsive expectation: mobile can review, desktop is primary",
    );
    expect(handoff.prompt).toContain("## UX Pack");
    expect(handoff.prompt).toContain("## Design Review Outputs");
  });
});
