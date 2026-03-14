import { readFile } from "node:fs/promises";
import path from "node:path";

const tasksPath = path.resolve(process.cwd(), "..", "TASKS.md");
const specPath = path.resolve(process.cwd(), "..", "SPEC.md");
const architecturePath = path.resolve(process.cwd(), "..", "ARCHITECTURE_DECISIONS.md");
const techStackPath = path.resolve(process.cwd(), "..", "TECH_STACK.md");

const backlogSections = [
  "Remaining MVP Build Backlog",
  "Next SaaS Build Backlog",
] as const;

type BacklogItem = {
  checked: boolean;
  text: string;
};

function sectionSlice(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m"));
  return match?.[1] ?? "";
}

function parseChecklist(section: string): BacklogItem[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^- \[[ x]\]/.test(line))
    .map((line) => ({
      checked: line.startsWith("- [x]"),
      text: line.replace(/^- \[[ x]\]\s*/, ""),
    }));
}

export async function readBacklogState() {
  const markdown = await readFile(tasksPath, "utf8");
  const sections = backlogSections.map((heading) => ({
    heading,
    items: parseChecklist(sectionSlice(markdown, heading)),
  }));
  const activeSection = sections.find((section) => section.items.some((item) => !item.checked)) ?? null;
  const nextItem = activeSection?.items.find((item) => !item.checked) ?? null;

  return {
    sections,
    activeSection: activeSection?.heading ?? null,
    nextItem: nextItem?.text ?? null,
    remainingCount: sections.reduce(
      (total, section) => total + section.items.filter((item) => !item.checked).length,
      0,
    ),
  };
}

export async function buildBacklogBrief() {
  const backlog = await readBacklogState();

  if (!backlog.activeSection || !backlog.nextItem) {
    return "SpecForge parity backlog is clear.";
  }

  return [
    "Drive the next SpecForge parity pass.",
    "",
    `Active backlog phase: ${backlog.activeSection}`,
    `Highest-priority unchecked item: ${backlog.nextItem}`,
    "",
    "Required behavior:",
    "- work in the SpecForge MVP worktree",
    "- implement the smallest integrated change that closes this backlog item",
    "- update TASKS.md and any affected spec/architecture docs if the shipped surface changes",
    "- run verification before finishing: npm run lint, npm run test, npm run build, npm run test:e2e",
    "- commit with [Agent: GPT-5] and the Chimera co-author trailer if the branch is green",
    "",
    "Source-of-truth docs:",
    `- ${specPath}`,
    `- ${architecturePath}`,
    `- ${techStackPath}`,
    `- ${tasksPath}`,
  ].join("\n");
}
