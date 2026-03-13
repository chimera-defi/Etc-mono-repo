import { describe, expect, it } from "vitest";

import { evaluateReadiness } from "./readiness";
import { makeDocumentRecord } from "./markdown";

describe("specforge readiness", () => {
  it("marks incomplete specs as blocked", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "Draft",
      initial_markdown: "# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n",
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
});
