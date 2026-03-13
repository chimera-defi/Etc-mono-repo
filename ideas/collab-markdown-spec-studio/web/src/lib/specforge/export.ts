import type { DocumentRecord, StoredPatch } from "./contracts";

export function exportDocumentBundle(
  document: DocumentRecord,
  patches: StoredPatch[],
) {
  const proposed = patches.filter((patch) => patch.status === "proposed");
  const sections = document.sections.map((section) => `- ${section.heading}`).join("\n");

  const tasks = [
    "# TASKS",
    "",
    `Source document: ${document.title}`,
    "",
    ...document.sections.map((section, index) => `${index + 1}. Review ${section.heading}`),
  ].join("\n");

  const spec = [
    "# SPEC",
    "",
    `Document: ${document.title}`,
    `Version: ${document.version}`,
    "",
    "## Sections",
    sections,
    "",
    "## Patch Queue",
    proposed.length > 0
      ? proposed
          .map((patch) => `- ${patch.patch_id} :: ${patch.patch_type} :: ${patch.block_id}`)
          .join("\n")
      : "- none",
  ].join("\n");

  return {
    document_id: document.document_id,
    version: document.version,
    files: {
      "PRD.md": document.markdown,
      "SPEC.md": spec,
      "TASKS.md": tasks,
      "agent_spec.json": JSON.stringify(
        {
          document_id: document.document_id,
          title: document.title,
          version: document.version,
          sections: document.sections,
          patch_queue: proposed.map((patch) => ({
            patch_id: patch.patch_id,
            block_id: patch.block_id,
            patch_type: patch.patch_type,
            status: patch.status,
          })),
        },
        null,
        2,
      ),
    },
  };
}
