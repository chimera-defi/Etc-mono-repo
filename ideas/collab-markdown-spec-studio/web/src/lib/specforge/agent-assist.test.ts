import { describe, expect, it } from "vitest";

import { buildHeuristicSuggestion } from "./agent-assist";

describe("buildHeuristicSuggestion", () => {
  it("turns a rough brief into non-empty guided fields", () => {
    const suggestion = buildHeuristicSuggestion(
      "A collaborative spec workspace for founders and engineers that keeps AI patches reviewable and exports a clean build handoff.",
    );

    expect(suggestion.tool).toBe("heuristic");
    expect(suggestion.fields.title).toContain("Collaborative Spec Workspace");
    expect(suggestion.fields.problem.length).toBeGreaterThan(10);
    expect(suggestion.fields.requirements).toContain("reviewable");
    expect(suggestion.fields.users).toContain("Engineer");
    expect(suggestion.notes.length).toBeGreaterThan(0);
  });
});
