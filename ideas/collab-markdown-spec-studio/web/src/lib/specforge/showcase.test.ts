import { describe, expect, it } from "vitest";

import { getShowcaseExample, listShowcaseExamples } from "./showcase";

describe("specforge showcase examples", () => {
  it("loads the canonical ideas showcase and builds an importable draft", async () => {
    const examples = await listShowcaseExamples();
    const example = await getShowcaseExample("server-management-agent");

    expect(examples.length).toBeGreaterThan(0);
    expect(example?.title).toContain("Server Management Agent");
    expect(example?.draft.markdown).toContain("## Requirements");
    expect(example?.draft.markdown).toContain("## Source Idea");
    expect(example?.draft.metadata.source_example_id).toBe("server-management-agent");
  });
});
