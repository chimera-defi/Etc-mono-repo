/**
 * Core handoff / starter template builder.
 */

const TEMPLATES = [
  {
    id: "ts_cli_starter_v1",
    label: "TypeScript CLI",
    stack: "TypeScript + Bun",
    description: "Runnable TypeScript CLI starter with spec embedded.",
  },
  {
    id: "docs_only_v1",
    label: "Docs Only",
    stack: "Markdown",
    description: "Documentation-only repo with SPEC.md and README.",
  },
  {
    id: "nextjs_typescript_v1",
    label: "Next.js (TypeScript)",
    stack: "Next.js + TypeScript",
    description: "Full-stack Next.js scaffold with TypeScript.",
  },
  {
    id: "nextjs_python_v1",
    label: "Next.js + Python",
    stack: "Next.js + FastAPI",
    description: "Next.js frontend with Python/FastAPI backend.",
  },
];

export function listTemplates() {
  return TEMPLATES;
}

export function resolveStarterTemplateId(templateId) {
  const found = TEMPLATES.find((t) => t.id === templateId);
  return found ? found.id : "ts_cli_starter_v1";
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildTsCliFiles(document, exportBundle) {
  const name = slugify(document.title);
  const markdown = document.markdown ?? "";

  return {
    "package.json": JSON.stringify(
      {
        name,
        version: "0.1.0",
        description: `Generated from spec: ${document.title}`,
        scripts: { build: "tsc", dev: "ts-node src/main.ts", test: "vitest" },
        devDependencies: { typescript: "^5.0.0" },
      },
      null,
      2
    ),
    "src/main.ts": [
      `// Building from: ${document.title}`,
      `// Spec version: ${document.version}`,
      ``,
      `console.log("Starting ${document.title}...");`,
      ``,
      `// Spec summary:`,
      ...document.sections.map((s) => `// - ${s.heading}`),
    ].join("\n"),
    "README.md": `# ${document.title}\n\nGenerated from SpecForge spec v${document.version}.\n\n## Run\n\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`\n`,
    "docs/SPEC.md": markdown,
  };
}

function buildDocsOnlyFiles(document) {
  return {
    "README.md": `# ${document.title}\n\nDocumentation repository generated from SpecForge.\n\nSee [docs/SPEC.md](docs/SPEC.md) for the full specification.\n`,
    "docs/SPEC.md": document.markdown ?? "",
  };
}

function buildNextJsFiles(document, exportBundle, generateRepo) {
  if (!generateRepo) return buildTsCliFiles(document, exportBundle);
  const repo = generateRepo(exportBundle, "nextjs-typescript");
  const files = {};
  for (const f of repo.generated_files ?? []) {
    files[f.path] = f.content;
  }
  return files;
}

function buildNextJsPythonFiles(document, exportBundle, generateRepo) {
  if (!generateRepo) return buildTsCliFiles(document, exportBundle);
  const repo = generateRepo(exportBundle, "nextjs-python");
  const files = {};
  for (const f of repo.generated_files ?? []) {
    files[f.path] = f.content;
  }
  return files;
}

export function buildStarterTemplate(
  document,
  exportBundle,
  readinessReport,
  patches,
  templateId = "ts_cli_starter_v1",
  generateRepo = null
) {
  const resolved = resolveStarterTemplateId(templateId);
  let files;

  if (resolved === "ts_cli_starter_v1") {
    files = buildTsCliFiles(document, exportBundle);
  } else if (resolved === "docs_only_v1") {
    files = buildDocsOnlyFiles(document);
  } else if (resolved === "nextjs_typescript_v1") {
    files = buildNextJsFiles(document, exportBundle, generateRepo);
  } else if (resolved === "nextjs_python_v1") {
    files = buildNextJsPythonFiles(document, exportBundle, generateRepo);
  } else {
    files = buildTsCliFiles(document, exportBundle);
  }

  return {
    template_id: resolved,
    files,
    document_title: document.title,
    document_version: document.version,
    readiness_score: readinessReport?.score ?? null,
    patch_count: patches.length,
    generated_at: new Date().toISOString(),
  };
}
