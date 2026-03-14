import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildGuidedSpecMarkdown, buildGuidedSpecMetadata, type GuidedSpecInput } from "./guided";

type ShowcaseExampleDefinition = {
  id: string;
  ideaPath: string;
  sourcePath: string;
};

export type ShowcaseExample = {
  id: string;
  title: string;
  pathLabel: string;
  sourcePath: string;
  summary: string;
  highlight: string;
  nextAction: string;
  draft: {
    title: string;
    markdown: string;
    metadata: Record<string, string>;
  };
};

const showcaseDefinitions: ShowcaseExampleDefinition[] = [
  {
    id: "server-management-agent",
    ideaPath: "server-management-agent",
    sourcePath: "ideas/server-management-agent/README.md",
  },
];

function splitSections(markdown: string) {
  const lines = markdown.split("\n");
  const sections = new Map<string, string[]>();
  let currentHeading: string | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      currentHeading = headingMatch[1]!.trim();
      sections.set(currentHeading, []);
      continue;
    }

    if (currentHeading) {
      sections.get(currentHeading)?.push(line);
    }
  }

  return sections;
}

function firstLine(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? "";
}

function pickList(value: string, fallback: string[]) {
  const items = value
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

async function readShowcaseMarkdown(definition: ShowcaseExampleDefinition) {
  const markdownPath = path.resolve(process.cwd(), "..", "..", definition.ideaPath, "README.md");
  return readFile(markdownPath, "utf8");
}

function buildGuidedInputFromIdea(title: string, markdown: string): GuidedSpecInput {
  const sections = splitSections(markdown);
  const problem = sections.get("Problem")?.join("\n").trim() ?? "";
  const solution = sections.get("Solution")?.join("\n").trim() ?? "";
  const productSurfaces = sections.get("Product Surfaces")?.join("\n").trim() ?? "";
  const keyFeatures = sections.get("Key Features")?.join("\n").trim() ?? "";
  const risks = sections.get("Risks & Constraints")?.join("\n").trim() ?? "";
  const nextActions = sections.get("Next Actions")?.join("\n").trim() ?? "";

  return {
    title,
    problem,
    goals: [firstLine(solution), "Keep approvals and auditability explicit.", "Generate a starter handoff from the approved spec."]
      .filter(Boolean)
      .join("\n"),
    users: [
      "Small teams and solo developers",
      "Operators managing server fleets",
      "Reviewers approving sensitive infrastructure actions",
    ].join("\n"),
    scope: pickList(keyFeatures, [
      "Provision servers from curated templates",
      "Review change proposals before they apply",
      "Track incidents and audit every action",
    ]).join("\n"),
    requirements: [
      ...pickList(productSurfaces, [
        "Web console for fleet state and approvals",
        "CLI for provisioning and patching flows",
        "API/SDK for CI-driven operations",
      ]).slice(0, 4),
      ...pickList(solution, [
        "Security guardrails and explain/approve modes",
      ]).slice(0, 2),
    ].join("\n"),
    constraints: risks,
    successSignals: [
      "Provisioning and patch workflows are explicit.",
      "Guardrails and approval paths are documented.",
      "Starter output is concrete enough for a coding agent to execute.",
    ].join("\n"),
    tasks: nextActions,
    nonGoals: [
      "Broad project management features",
      "Autonomous changes without explicit review",
      "General-purpose hosting marketplace workflows",
    ].join("\n"),
  };
}

export async function listShowcaseExamples(): Promise<ShowcaseExample[]> {
  const examples = await Promise.all(
    showcaseDefinitions.map(async (definition) => {
      const markdown = await readShowcaseMarkdown(definition);
      const title =
        markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? definition.id.replace(/-/g, " ");
      const sections = splitSections(markdown);
      const guided = buildGuidedInputFromIdea(title, markdown);

      return {
        id: definition.id,
        title,
        pathLabel: definition.sourcePath,
        sourcePath: definition.sourcePath,
        summary: firstLine(sections.get("Problem")?.join("\n").trim() ?? ""),
        highlight: firstLine(sections.get("Solution")?.join("\n").trim() ?? ""),
        nextAction:
          pickList(sections.get("Next Actions")?.join("\n").trim() ?? "", [
            "Define the MVP feature set and delivery guardrails.",
          ])[0] ?? "Define the MVP feature set.",
        draft: {
          title,
          markdown: [
            buildGuidedSpecMarkdown(guided),
            "",
            "## Source Idea",
            "",
            `- Imported from \`${definition.sourcePath}\`.`,
            `- Use the original idea pack as background context while refining this build-ready spec.`,
          ].join("\n"),
          metadata: {
            ...buildGuidedSpecMetadata(guided),
            creation_mode: "example_import",
            source_example_id: definition.id,
            source_path: definition.sourcePath,
          },
        },
      };
    }),
  );

  return examples;
}

export async function getShowcaseExample(exampleId: string) {
  const examples = await listShowcaseExamples();
  return examples.find((example) => example.id === exampleId) ?? null;
}
