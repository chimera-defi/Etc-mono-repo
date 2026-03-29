import { generateRepository } from "../../engine/repo-generator";
import type {
  GeneratedRepo,
  RepoScaffoldTemplate,
  SpecBundle,
} from "../../engine/types";

import type { DocumentRecord, StoredPatch } from "./contracts";
import type { exportDocumentBundle } from "./export";
import type { evaluateReadiness } from "./readiness";

type ExportBundle = ReturnType<typeof exportDocumentBundle>;
type ReadinessReport = ReturnType<typeof evaluateReadiness>;

export type StarterTemplateId =
  | "ts_cli_starter_v1"
  | "docs_only_v1"
  | "nextjs_typescript_v1"
  | "nextjs_python_v1";

export type StarterTemplateDefinition = {
  id: StarterTemplateId;
  label: string;
  stack: string;
  description: string;
};

const starterTemplates: StarterTemplateDefinition[] = [
  {
    id: "ts_cli_starter_v1",
    label: "TypeScript CLI Starter",
    stack: "TypeScript",
    description: "Minimum extensible product for quick local iteration from the approved spec.",
  },
  {
    id: "docs_only_v1",
    label: "Docs-Only Repo",
    stack: "Documentation",
    description: "Structured handoff repo with specs, tasks, and traceability but no app code.",
  },
  {
    id: "nextjs_typescript_v1",
    label: "Next.js TypeScript",
    stack: "Next.js + TypeScript",
    description: "Frontend-oriented starter scaffold with docs and test files.",
  },
  {
    id: "nextjs_python_v1",
    label: "Next.js + Python",
    stack: "Next.js + Python",
    description: "Split frontend/backend starter scaffold for full-stack app buildouts.",
  },
];

const templateMap: Record<StarterTemplateId, RepoScaffoldTemplate | "ts_cli_starter_v1"> = {
  ts_cli_starter_v1: "ts_cli_starter_v1",
  docs_only_v1: "docs-only",
  nextjs_typescript_v1: "nextjs-typescript",
  nextjs_python_v1: "nextjs-python",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "specforge-starter";
}

function toList(value: string | undefined) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function mapPatchStatus(status: StoredPatch["status"]): "proposed" | "accepted" | "rejected" {
  switch (status) {
    case "accepted":
    case "cherry_picked":
      return "accepted";
    case "rejected":
      return "rejected";
    default:
      return "proposed";
  }
}

function buildSpecBundle(document: DocumentRecord, patches: StoredPatch[]): SpecBundle {
  const acceptedPatches = patches.filter((patch) =>
    ["accepted", "cherry_picked"].includes(patch.status),
  );
  const rejectedPatches = patches.filter((patch) => patch.status === "rejected");
  const authors = Array.from(new Set(patches.map((patch) => patch.proposed_by.actor_id)));

  return {
    spec_version: "1.0",
    document_markdown: document.markdown,
    export_timestamp: new Date().toISOString(),
    agent_spec: {
      document_id: document.document_id,
      document_version: document.version,
      document_title: document.title,
      created_at: document.created_at,
      last_modified: document.updated_at,
      total_patches_proposed: patches.length,
      total_patches_accepted: acceptedPatches.length,
      total_patches_rejected: rejectedPatches.length,
      authors,
      sections: document.blocks.map((block) => ({
        block_id: block.block_id,
        heading: block.heading,
        content_length: block.content.length,
        modified_by: Array.from(
          new Set(
            patches
              .filter((patch) => patch.block_id === block.block_id)
              .map((patch) => patch.proposed_by.actor_id),
          ),
        ),
        patch_count: patches.filter((patch) => patch.block_id === block.block_id).length,
      })),
    },
    patch_summary: patches.map((patch) => ({
      patch_id: patch.patch_id,
      operation: patch.operation,
      block_id: patch.block_id,
      status: mapPatchStatus(patch.status),
      accepted_at:
        patch.status === "accepted" || patch.status === "cherry_picked"
          ? patch.created_at
          : undefined,
    })),
  };
}

function buildCuratedTsStarter(
  document: DocumentRecord,
  exportBundle: ExportBundle,
  readinessReport: ReadinessReport | null,
) {
  const packageName = slugify(document.title);
  const goals = toList(document.metadata.goals);
  const tasks = toList(document.metadata.tasks);
  const constraints = toList(document.metadata.constraints);
  const successSignals = toList(document.metadata.success_signals);
  const status = readinessReport?.status ?? "drafting";
  const confidence = Math.max(0.35, Math.min(0.98, (readinessReport?.score ?? 35) / 100));

  const packageJson = {
    name: packageName,
    version: "0.1.0",
    private: true,
    packageManager: "bun",
    type: "module",
    scripts: {
      dev: "bun run src/main.ts",
      verify: "bun run src/main.ts verify",
      tasks: "bun run src/main.ts tasks",
      build: "bun build ./src/main.ts --outdir ./dist --target bun",
      start: "node dist/main.js",
    },
  };

  const specModule = [
    "export const spec = {",
    `  documentId: ${JSON.stringify(document.document_id)},`,
    `  title: ${JSON.stringify(document.title)},`,
    `  version: ${document.version},`,
    `  readiness: ${JSON.stringify(status)},`,
    `  goals: ${JSON.stringify(goals)},`,
    `  tasks: ${JSON.stringify(tasks)},`,
    `  constraints: ${JSON.stringify(constraints)},`,
    `  successSignals: ${JSON.stringify(successSignals)},`,
    "};",
    "",
    "export type Spec = typeof spec;",
  ].join("\n");

  const mainModule = [
    'import { spec } from "./spec.js";',
    "",
    "/**",
    ` * ${document.title} — CLI entrypoint`,
    " * Generated by SpecForge from the approved handoff bundle.",
    " *",
    " * This starter validates spec readiness and provides a foundation",
    " * for implementing the first vertical slice.",
    " */",
    "",
    "function main(): void {",
    "  const args = process.argv.slice(2);",
    "  const command = args[0] ?? \"status\";",
    "",
    '  if (command === "--help" || command === "-h") {',
    `    console.log("Usage: ${packageName} [command]");`,
    '    console.log("");',
    '    console.log("Commands:");',
    '    console.log("  status   Show spec readiness and goals (default)");',
    '    console.log("  tasks    List implementation tasks");',
    '    console.log("  verify   Check readiness gates before proceeding");',
    "    process.exit(0);",
    "  }",
    "",
    '  if (command === "status") {',
    "    console.log(`${spec.title} (v${spec.version})`);",
    "    console.log(`Readiness: ${spec.readiness}`);",
    '    console.log("");',
    '    console.log("Goals:");',
    '    for (const goal of spec.goals) {',
    "      console.log(`  - ${goal}`);",
    "    }",
    "    process.exit(0);",
    "  }",
    "",
    '  if (command === "tasks") {',
    '    console.log("Implementation Tasks:");',
    "    for (const [i, task] of spec.tasks.entries()) {",
    "      console.log(`  ${i + 1}. ${task}`);",
    "    }",
    "    process.exit(0);",
    "  }",
    "",
    '  if (command === "verify") {',
    '    const blockers: string[] = [];',
    '    if (spec.readiness === "blocked") blockers.push("Spec readiness is blocked");',
    "    if (spec.goals.length === 0) blockers.push(\"No goals defined\");",
    "    if (spec.tasks.length === 0) blockers.push(\"No tasks defined\");",
    "",
    "    if (blockers.length > 0) {",
    '      console.error("Readiness check FAILED:");',
    '      for (const b of blockers) console.error(`  - ${b}`);',
    "      process.exit(1);",
    "    }",
    "",
    '    console.log("Readiness check passed. Ready to implement.");',
    "    process.exit(0);",
    "  }",
    "",
    `  console.error(\`Unknown command: \${command}. Run "${packageName} --help" for usage.\`);`,
    "  process.exit(1);",
    "}",
    "",
    "main();",
  ].join("\n");

  const readme = [
    `# ${document.title}`,
    "",
    "Generated by SpecForge from the approved handoff bundle.",
    "",
    "## Problem",
    "",
    document.metadata.problem || "See the spec document for the full problem statement.",
    "",
    "## Goals",
    "",
    ...(goals.length > 0 ? goals.map((g) => `- ${g}`) : ["- See spec for goals"]),
    "",
    "## Getting Started",
    "",
    "```bash",
    "bun install",
    "bun run dev          # Show spec status",
    "bun run tasks        # List implementation tasks",
    "bun run verify       # Check readiness gates",
    "```",
    "",
    "## Project Structure",
    "",
    "| File | Purpose |",
    "|------|---------|",
    "| `src/main.ts` | CLI entrypoint with status, tasks, and verify commands |",
    "| `src/spec.ts` | Typed spec data extracted from the handoff bundle |",
    "| `specforge/agent_spec.json` | Full agent spec with patch history and section details |",
    "",
    "## Next Steps",
    "",
    "1. Run `bun run verify` to confirm readiness gates pass",
    "2. Start implementing the first task from `bun run tasks`",
    "3. Refer to `specforge/agent_spec.json` for section details and patch history",
    "4. Keep the spec bundle as the authoritative source of truth during implementation",
  ].join("\n");

  return {
    template_id: "ts_cli_starter_v1" as const,
    readiness_status: status,
    confidence,
    next_steps: [
      "Install dependencies and run the starter entrypoint.",
      "Implement the first task group from TASKS.md.",
      "Use PRD.md and SPEC.md as the authoritative build context.",
    ],
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "README.md": readme,
      "src/spec.ts": specModule,
      "src/main.ts": mainModule,
      "specforge/agent_spec.json": exportBundle.files["agent_spec.json"],
    },
  };
}

function mapGeneratedRepoToStarter(
  repo: GeneratedRepo,
  readinessReport: ReadinessReport | null,
  templateId: StarterTemplateId,
) {
  const status = readinessReport?.status ?? "drafting";
  const confidence = Math.max(0.35, Math.min(0.98, (readinessReport?.score ?? 35) / 100));

  return {
    template_id: templateId,
    readiness_status: status,
    confidence,
    next_steps: [
      "Review the generated repo structure and traceability mapping.",
      "Install dependencies for the selected template and run the project scaffold.",
      "Continue implementation from TASKS.md using the launch packet as the source of truth.",
    ],
    files: Object.fromEntries(
      repo.generated_files.map((file) => [file.path, file.content]),
    ),
  };
}

export function listTemplates() {
  return starterTemplates;
}

export function resolveStarterTemplateId(templateId?: string): StarterTemplateId {
  return starterTemplates.some((template) => template.id === templateId)
    ? (templateId as StarterTemplateId)
    : "ts_cli_starter_v1";
}

export function buildStarterTemplate(
  document: DocumentRecord,
  exportBundle: ExportBundle,
  readinessReport: ReadinessReport | null,
  patches: StoredPatch[],
  templateId: StarterTemplateId = "ts_cli_starter_v1",
) {
  if (templateMap[templateId] === "ts_cli_starter_v1") {
    return buildCuratedTsStarter(document, exportBundle, readinessReport);
  }

  const bundle = buildSpecBundle(document, patches);
  const repo = generateRepository(bundle, templateMap[templateId] as RepoScaffoldTemplate);
  return mapGeneratedRepoToStarter(repo, readinessReport, templateId);
}
