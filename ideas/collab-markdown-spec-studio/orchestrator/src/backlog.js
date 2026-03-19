export const backlogSections = [
  "Parallel Refactor Lanes",
  "Remaining Post-Parity SaaS Work",
];

export function getDeliveryTarget(heading) {
  if (heading === "Parallel Refactor Lanes") {
    return "platform_refactor";
  }

  return heading ? "scoped_saas_parity" : "clear";
}

export function sectionSlice(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m"));
  return match?.[1] ?? "";
}

export function parseChecklist(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^- \[[ x]\]/.test(line))
    .map((line) => ({
      checked: line.startsWith("- [x]"),
      text: line.replace(/^- \[[ x]\]\s*/, ""),
    }));
}

export function parseBacklogMarkdown(markdown) {
  const sections = backlogSections.map((heading) => ({
    heading,
    items: parseChecklist(sectionSlice(markdown, heading)),
  }));
  const activeSection = sections.find((section) => section.items.some((item) => !item.checked)) ?? null;
  const nextItem = activeSection?.items.find((item) => !item.checked) ?? null;

  return {
    sections,
    activeSection,
    nextItem,
    remainingCount: sections.reduce(
      (total, section) => total + section.items.filter((item) => !item.checked).length,
      0,
    ),
  };
}
