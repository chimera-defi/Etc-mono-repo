import { describe, expect, it } from "vitest";

import { evaluateReadiness } from "./readiness";
import { makeDocumentRecord } from "./markdown";

describe("specforge readiness", () => {
  it("marks incomplete specs as blocked", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "Draft",
      initial_markdown:
        "# PRD\n\n## Problem\nClarify the blocking workflow.\n\n## Goals\n- Capture the first buildable path.\n",
    });

    const report = evaluateReadiness({
      document,
      patches: [],
      comments: [],
    });

    expect(report.status).toBe("blocked");
    expect(report.missing_sections).toContain("Requirements");
  });

  it("marks fuller specs with no open issues as ready", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "Ready Draft",
      initial_markdown:
        "# PRD\n\n## Problem\nClear problem.\n\n## Goals\nClear goals.\n\n## Non-Goals\nClear scope.\n\n## Requirements\nDocumented.\n\n## Tasks\nShippable.\n",
    });

    const report = evaluateReadiness({
      document,
      patches: [],
      comments: [],
    });

    expect(report.status).toBe("ready");
    expect(report.score).toBeGreaterThanOrEqual(80);
  });

  it("treats unanswered clarifications as review blockers", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "Clarification Draft",
      initial_markdown:
        "# PRD\n\n## Problem\nClear problem.\n\n## Goals\nClear goals.\n\n## Non-Goals\nClear scope.\n\n## Requirements\nDocumented.\n\n## Tasks\nShippable.\n",
    });

    const report = evaluateReadiness({
      document,
      patches: [],
      comments: [],
      clarifications: [
        {
          clarification_id: "clar_1",
          document_id: document.document_id,
          section_heading: "Requirements",
          question: "What blocks launch?",
          status: "open",
          created_by: { actor_type: "human", actor_id: "reviewer" },
          created_at: new Date().toISOString(),
        },
      ],
    });

    expect(report.open_clarification_count).toBe(1);
    expect(report.score).toBeLessThan(100);
  });
});
