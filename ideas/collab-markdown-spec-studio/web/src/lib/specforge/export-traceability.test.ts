import { describe, expect, it } from "vitest";

import { exportDocumentBundle } from "./export";
import { makeDocumentRecord } from "./markdown";

describe("export traceability matrix", () => {
  it("generates requirement and task IDs with explicit requirement links", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_trace",
      title: "Traceability Demo",
      initial_markdown:
        "# Traceability Demo\n\n## Problem\n- Missing links between requirements and tasks\n\n## Requirements\n- Capture user intent\n\n## Tasks\n- Build workflow\n",
      metadata: {
        requirements: "Capture user intent\nExport deterministic spec bundle",
        tasks:
          "Implement guided input capture\nImplement export endpoint for R-002\nAdd regression tests for exports",
      },
    });

    const bundle = exportDocumentBundle(document, []);
    const matrix = bundle.files["TRACEABILITY_MATRIX.md"];

    expect(matrix).toBeDefined();
    expect(matrix).toContain("| Requirement ID | Requirement | Linked Tasks | Status |");
    expect(matrix).toContain("| R-001 | Capture user intent");
    expect(matrix).toContain("| R-002 | Export deterministic spec bundle");
    expect(matrix).toContain("| T-001 | Implement guided input capture");
    expect(matrix).toContain("| T-002 | Implement export endpoint for R-002 | R-002 |");
    expect(matrix).toContain("Requirement coverage:");
  });

  it("falls back to section-derived rows when metadata is sparse", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_trace",
      title: "Traceability Fallback",
      initial_markdown:
        "# Traceability Fallback\n\n## Problem\nNeed clear scope.\n\n## Scope\nShip the first slice.\n",
      metadata: {},
    });

    const bundle = exportDocumentBundle(document, []);
    const matrix = bundle.files["TRACEABILITY_MATRIX.md"];

    expect(matrix).toBeDefined();
    expect(matrix).toContain("Task -> Requirement Mapping");
    expect(matrix).toContain("| R-001 | Define requirement for section: Problem |");
    expect(matrix).toContain("| T-001 | Review and implement section: Problem |");
  });
});
