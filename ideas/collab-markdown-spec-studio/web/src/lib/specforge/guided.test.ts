import { describe, expect, it } from "vitest";

import { buildGuidedSpecMarkdown } from "./guided";

describe("buildGuidedSpecMarkdown", () => {
  it("creates a canonical spec draft from structured wizard inputs", () => {
    const markdown = buildGuidedSpecMarkdown({
      title: "SpecForge",
      problem: "Specs are fragmented",
      goals: "Unify authoring\nEnable handoff",
      users: "Founder\nEngineer",
      scope: "Guided creation\nPatch review",
      requirements: "Shared canvas\nApproved patch decisions",
      constraints: "Use CRDT\nHuman approval required",
      uxPack: "Primary surface: browser\nKey screens: draft and review",
      successSignals: "Runnable handoff",
      tasks: "Draft spec\nReview patches",
      nonGoals: "General PM suite",
    });

    expect(markdown).toContain("# SpecForge");
    expect(markdown).toContain("## Problem");
    expect(markdown).toContain("- Specs are fragmented");
    expect(markdown).toContain("## Requirements");
    expect(markdown).toContain("- Shared canvas");
    expect(markdown).toContain("## UX Pack");
    expect(markdown).toContain("- Primary surface: browser");
    expect(markdown).toContain("## Tasks");
    expect(markdown).toContain("- Draft spec");
  });
});
