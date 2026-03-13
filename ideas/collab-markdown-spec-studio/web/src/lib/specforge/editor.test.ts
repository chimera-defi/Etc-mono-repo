import { describe, expect, it } from "vitest";

import { markdownToEditorHtml, tiptapJsonToMarkdown } from "./editor";

describe("specforge editor helpers", () => {
  it("converts markdown into simple editor HTML", () => {
    const html = markdownToEditorHtml("# PRD\n\n## Goals\n- Ship\n- Learn\n");

    expect(html).toContain("<h1>PRD</h1>");
    expect(html).toContain("<h2>Goals</h2>");
    expect(html).toContain("<li>Ship</li>");
  });

  it("serializes tiptap json back into markdown", () => {
    const markdown = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "PRD" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Goals" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Ship" }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Learn" }] }],
            },
          ],
        },
      ],
    });

    expect(markdown).toBe("# PRD\n\n## Goals\n\n- Ship\n- Learn");
  });
});
