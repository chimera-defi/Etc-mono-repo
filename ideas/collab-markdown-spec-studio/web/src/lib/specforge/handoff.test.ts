import { describe, expect, it } from "vitest";

import { buildStarterTemplate, listTemplates } from "./handoff";
import { exportDocumentBundle } from "./export";
import { makeDocumentRecord } from "./markdown";

describe("buildStarterTemplate", () => {
  it("creates a concrete TypeScript starter output from the spec bundle", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "SpecForge Demo",
      initial_markdown: "# SpecForge Demo\n\n## Problem\n- Specs drift\n",
      metadata: {
        goals: "Ship a starter\nKeep context intact",
        tasks: "Create app\nRun first slice",
        constraints: "TypeScript only",
        success_signals: "Runnable entrypoint",
      },
    });
    const exportBundle = exportDocumentBundle(document, []);
    const handoff = buildStarterTemplate(
      document,
      exportBundle,
      {
        score: 82,
        status: "ready",
        recap: ["Looks good"],
      },
      [],
    );

    expect(handoff.template_id).toBe("ts_cli_starter_v1");
    expect(handoff.files["package.json"]).toContain('"name": "specforge-demo"');
    expect(handoff.files["src/main.ts"]).toContain('const command = args[0] ?? "status"');
    expect(handoff.files["README.md"]).toContain("bun run verify");
  });

  it("exposes multiple starter templates and can build a docs-only handoff", () => {
    const document = makeDocumentRecord({
      workspace_id: "ws_demo",
      title: "SpecForge Docs Repo",
      initial_markdown: "# SpecForge Docs Repo\n\n## Problem\n- Specs drift\n",
      metadata: {
        goals: "Ship a repo",
      },
    });
    const exportBundle = exportDocumentBundle(document, []);
    const templates = listTemplates();
    const handoff = buildStarterTemplate(
      document,
      exportBundle,
      {
        score: 75,
        status: "ready",
        recap: ["Looks good"],
      },
      [],
      "docs_only_v1",
    );

    expect(templates).toHaveLength(4);
    expect(handoff.template_id).toBe("docs_only_v1");
    expect(handoff.files["docs/SPEC.md"]).toContain("SpecForge Docs Repo");
    expect(handoff.files["README.md"]).toContain("SpecForge Docs Repo");
  });
});
