import { createHash, randomUUID } from "node:crypto";

import type { DocumentRecord } from "./contracts";

type ParsedSection = {
  section_id: string;
  heading: string;
  markdownLines: string[];
};

export function fingerprintFor(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "section";
}

function parseSections(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  let sawExplicitSection = false;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      if (current) {
        sections.push(current);
      }

      const heading = headingMatch[1].trim();
      sawExplicitSection = true;
      current = {
        section_id: `sec_${slugify(heading)}`,
        heading,
        markdownLines: [line],
      };
      continue;
    }

    if (!current && !sawExplicitSection) {
      continue;
    }

    if (!current) {
      current = {
        section_id: "sec_overview",
        heading: "Overview",
        markdownLines: ["## Overview"],
      };
    }

    current.markdownLines.push(line);
  }

  if (current) {
    sections.push(current);
  }

  if (sections.length === 0) {
    sections.push({
      section_id: "sec_overview",
      heading: "Overview",
      markdownLines: ["## Overview", markdown],
    });
  }

  return sections;
}

export function deriveDocumentShape(markdown: string) {
  const sections = parseSections(markdown).map((section, index) => {
    const content = section.markdownLines.join("\n").trim();
    const blockContent = content.length > 0 ? content : `## ${section.heading}`;
    const block_id = `blk_${slugify(section.heading)}_${index + 1}`;

    return {
      section_id: section.section_id,
      heading: section.heading,
      block: {
        block_id,
        section_id: section.section_id,
        heading: section.heading,
        content: blockContent,
        target_fingerprint: fingerprintFor(blockContent),
      },
    };
  });

  return {
    sections: sections.map(({ block, ...section }) => {
      void block;
      return section;
    }),
    blocks: sections.map((section) => section.block),
  };
}

export function makeDocumentRecord(input: {
  workspace_id: string;
  title: string;
  initial_markdown: string;
  metadata?: Record<string, string>;
}): DocumentRecord {
  const now = new Date().toISOString();
  const { sections, blocks } = deriveDocumentShape(input.initial_markdown);

  return {
    document_id: `doc_${randomUUID()}`,
    workspace_id: input.workspace_id,
    title: input.title,
    version: 1,
    markdown: input.initial_markdown,
    sections,
    blocks,
    metadata: input.metadata ?? {},
    created_at: now,
    updated_at: now,
  };
}
