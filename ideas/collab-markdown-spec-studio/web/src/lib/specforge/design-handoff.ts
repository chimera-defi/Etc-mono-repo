import type { DocumentRecord } from "./contracts";

export type DesignHandoffData = {
  uxPack: string;
  designSystem: string | null;
  keyScreenLines: string[];
  failureStateLines: string[];
  responsiveLines: string[];
  reviewChecklist: string[];
  prompt: string;
};

function normalizeHeading(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function splitBulletLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^-+\s*/, ""));
}

function extractSectionContent(document: DocumentRecord, expectedHeading: string) {
  const normalizedExpected = normalizeHeading(expectedHeading);
  const matchingSection = document.sections.find((section) =>
    normalizeHeading(section.heading).includes(normalizedExpected),
  );

  if (!matchingSection) {
    return "";
  }

  return document.blocks
    .filter((block) => block.section_id === matchingSection.section_id)
    .map((block) => block.content.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function pickLines(lines: string[], prefixes: string[]) {
  return lines.filter((line) => {
    const normalized = line.toLowerCase();
    return prefixes.some((prefix) => normalized.startsWith(prefix));
  });
}

function buildDesignPrompt(input: {
  document: DocumentRecord;
  uxPack: string;
  designSystem: string | null;
}) {
  const contextBlocks = [
    `# Design Review Request`,
    ``,
    `Review the UX direction for "${input.document.title}".`,
    `Use the canonical SpecForge spec content below and return concise, implementation-focused guidance.`,
    ``,
    `## Deliverables`,
    `- Screen inventory with critical states`,
    `- Interaction and layout guidance for the main surfaces`,
    `- Missing empty/loading/error/responsive states`,
    `- Accessibility or clarity risks`,
    `- Clarifying questions that should go back into the spec as comments or clarifications`,
    ``,
    `## UX Pack`,
    input.uxPack || "No UX Pack content found.",
  ];

  if (input.designSystem) {
    contextBlocks.push("", "## Design Review Outputs", input.designSystem);
  }

  contextBlocks.push(
    "",
    "## Constraints",
    "- Keep the output grounded in the current product scope.",
    "- Prefer concrete suggestions over generic design advice.",
    "- If there is no GUI scope, say so explicitly and review the CLI/API experience instead.",
  );

  return contextBlocks.join("\n");
}

export function buildDesignHandoffData(input: {
  document: DocumentRecord;
  designSystem?: string | null;
}): DesignHandoffData {
  const uxPack = extractSectionContent(input.document, "UX Pack");
  const uxLines = splitBulletLines(uxPack);
  const keyScreenLines = pickLines(uxLines, ["key screens:", "primary surface:"]);
  const failureStateLines = pickLines(uxLines, ["failure states:"]);
  const responsiveLines = pickLines(uxLines, ["responsive expectation:", "responsive expectations:"]);
  const reviewChecklist = [
    "Primary surfaces and key screens are explicit.",
    "Empty, loading, error, and stale-state behavior is covered.",
    "Mobile or responsive expectations are clear.",
    "The visual/interaction direction matches the users and scope.",
    "Open UX ambiguities are captured as comments, clarifications, or governed patches.",
  ];

  return {
    uxPack,
    designSystem: input.designSystem?.trim() ? input.designSystem.trim() : null,
    keyScreenLines,
    failureStateLines,
    responsiveLines,
    reviewChecklist,
    prompt: buildDesignPrompt({
      document: input.document,
      uxPack,
      designSystem: input.designSystem?.trim() ? input.designSystem.trim() : null,
    }),
  };
}
