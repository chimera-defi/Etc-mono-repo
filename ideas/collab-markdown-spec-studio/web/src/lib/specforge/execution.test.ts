import { describe, expect, it } from "vitest";

import { buildExecutionBrief } from "./execution";
import { exportDocumentBundle } from "./export";
import { buildStarterTemplate } from "./handoff";
import { makeDocumentRecord } from "./markdown";

describe("buildExecutionBrief", () => {
  it("summarizes build context, blockers, and run commands", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "SpecForge Execution",
      initial_markdown:
        "# SpecForge Execution\n\n## Problem\n- Specs drift\n\n## Goals\n- Ship\n\n## Non-Goals\n- PM suite\n\n## Requirements\n- Shared docs\n\n## Tasks\n- Build handoff\n",
      metadata: {
        goals: "Ship the first slice",
      },
    });
    const exportBundle = exportDocumentBundle(document, []);
    const starterBundle = buildStarterTemplate(
      document,
      exportBundle,
      {
        score: 88,
        status: "ready",
        missing_sections: [],
        open_patch_count: 0,
        open_comment_count: 0,
        recap: [],
      },
      [],
    );

    const brief = buildExecutionBrief({
      document,
      exportBundle,
      starterBundle,
      readiness: {
        score: 88,
        status: "ready",
        missing_sections: [],
        open_patch_count: 0,
        open_comment_count: 0,
        recap: [],
      },
      patches: [],
      comments: [],
    });

    expect(brief.run_ready).toBe(true);
    expect(brief.commands).toContain("npm run build");
    expect(brief.deliverables).toContain("src/main.ts");
  });
});
