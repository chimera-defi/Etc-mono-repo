import { createHash, randomUUID } from "node:crypto";

import type { DocumentRecord } from "./contracts";

type ParsedSection = {
  section_id: string;
  heading: string;
  markdownLines: string[];
};

type ParsedDocument = {
  preambleLines: string[];
  sections: ParsedSection[];
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

function parseMarkdownStructure(markdown: string): ParsedDocument {
  const lines = markdown.split("\n");
  const preambleLines: string[] = [];
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
      preambleLines.push(line);
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
      markdownLines: ["## Overview", ...preambleLines.filter((line) => line.length > 0)],
    });
    return {
      preambleLines: [],
      sections,
    };
  }

  return {
    preambleLines,
    sections,
  };
}

function rebuildMarkdown(parsed: ParsedDocument) {
  const parts: string[] = [];
  const preamble = parsed.preambleLines.join("\n").trim();

  if (preamble.length > 0) {
    parts.push(preamble);
  }

  parts.push(
    ...parsed.sections
      .map((section) => section.markdownLines.join("\n").trim())
      .filter((section) => section.length > 0),
  );

  return parts.join("\n\n").trim();
}

export function upsertSectionBullet(markdown: string, sectionHeading: string, bullet: string) {
  const parsed = parseMarkdownStructure(markdown);
  const normalizedHeading = slugify(sectionHeading);
  const target = parsed.sections.find((section) => slugify(section.heading) === normalizedHeading);
  const nextLine = `- ${bullet.trim().replace(/^-+\s*/, "")}`;

  if (target) {
    target.markdownLines.push(nextLine);
    return rebuildMarkdown(parsed);
  }

  parsed.sections.push({
    section_id: `sec_${normalizedHeading}`,
    heading: sectionHeading,
    markdownLines: [`## ${sectionHeading}`, "", nextLine],
  });
  return rebuildMarkdown(parsed);
}

export function deriveDocumentShape(markdown: string) {
  const sections = parseMarkdownStructure(markdown).sections.map((section, index) => {
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

export function applyPatchToMarkdown(input: {
  markdown: string;
  block_id: string;
  operation: "insert" | "replace" | "delete";
  content?: string;
}) {
  const parsed = parseMarkdownStructure(input.markdown);
  const locatedSections = parsed.sections.map((section, index) => ({
    index,
    section,
    block_id: `blk_${slugify(section.heading)}_${index + 1}`,
  }));
  const target = locatedSections.find((candidate) => candidate.block_id === input.block_id);

  if (!target) {
    throw new Error(`Block ${input.block_id} not found for patch application`);
  }

  const incomingSections =
    input.content && input.content.trim().length > 0
      ? parseMarkdownStructure(input.content).sections
      : [];

  if (input.operation !== "delete" && incomingSections.length === 0) {
    throw new Error(`Patch ${input.operation} requires replacement content`);
  }

  switch (input.operation) {
    case "replace":
      parsed.sections.splice(target.index, 1, ...incomingSections);
      break;
    case "insert":
      parsed.sections.splice(target.index + 1, 0, ...incomingSections);
      break;
    case "delete":
      parsed.sections.splice(target.index, 1);
      break;
  }

  return rebuildMarkdown(parsed);
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
