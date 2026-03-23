/**
 * Core execution brief builder.
 */

export function buildExecutionBrief({
  document,
  exportBundle,
  starterBundle,
  readiness,
  patches,
  comments,
  clarifications = [],
}) {
  const run_ready = readiness.status === "ready";

  const commands = ["bun install", "bun run build", "bun run dev", "bun run test"];

  const deliverables = starterBundle?.files
    ? Object.keys(starterBundle.files)
    : ["src/main.ts", "package.json", "README.md"];

  const blockers = [];
  if (readiness.missing_sections?.length > 0) {
    blockers.push(`Missing spec sections: ${readiness.missing_sections.join(", ")}`);
  }
  if (readiness.open_patch_count > 0) {
    blockers.push(`${readiness.open_patch_count} unresolved patch(es)`);
  }
  if (readiness.open_comment_count > 0) {
    blockers.push(`${readiness.open_comment_count} open comment thread(s)`);
  }

  const context_summary = [
    `Document: ${document.title} (v${document.version})`,
    `Sections: ${document.sections.map((s) => s.heading).join(", ")}`,
    `Patches: ${patches.length} total`,
    `Readiness: ${readiness.status} (score: ${readiness.score})`,
  ].join("\n");

  return {
    run_ready,
    commands,
    deliverables,
    blockers,
    context_summary,
    template_id: starterBundle?.template_id ?? "ts_cli_starter_v1",
    export_timestamp: exportBundle?.export_timestamp ?? new Date().toISOString(),
  };
}
