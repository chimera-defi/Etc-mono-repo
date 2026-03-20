/**
 * Repository generation from SpecBundle.
 *
 * Generates scaffold repositories in various templates:
 * - nextjs-typescript: Full-stack TypeScript/Next.js scaffold
 * - nextjs-python: Next.js frontend + Python backend scaffold
 * - docs-only: Documentation-only repository
 *
 * Tracks traceability: which files originated from which spec blocks/sections.
 * Embeds spec metadata in generated files (package.json, README, etc).
 */

import type { GeneratedRepo, RepoScaffoldTemplate, SpecBundle } from "./types.js";

let repoCounter = 0;
function nextRepoId(): string {
  repoCounter += 1;
  return `repo_${repoCounter}`;
}

/** Reset repo counter (for test isolation). */
export function resetRepoCounter(): void {
  repoCounter = 0;
}

/**
 * Generate a repository scaffold from a SpecBundle.
 *
 * @param bundle - The SpecBundle to generate from
 * @param template - The repository template to use
 * @param specBundleId - Optional bundle ID for traceability
 * @returns A GeneratedRepo with all files and traceability metadata
 */
export function generateRepository(
  bundle: SpecBundle,
  template: RepoScaffoldTemplate,
  specBundleId: string = "bundle_default"
): GeneratedRepo {
  const repoId = nextRepoId();
  const generatedAt = new Date().toISOString();
  const docTitle = bundle.agent_spec.document_title;
  const docMarkdown = bundle.document_markdown;

  const generated_files: GeneratedRepo["generated_files"] = [];
  const traceability: GeneratedRepo["traceability"] = {};

  if (template === "nextjs-typescript") {
    // Generate Next.js + TypeScript scaffold
    generateNextJsTypeScript(
      generated_files,
      traceability,
      docTitle,
      docMarkdown,
      bundle
    );
  } else if (template === "nextjs-python") {
    // Generate Next.js + Python scaffold
    generateNextJsPython(
      generated_files,
      traceability,
      docTitle,
      docMarkdown,
      bundle
    );
  } else if (template === "docs-only") {
    // Generate docs-only repository
    generateDocsOnly(
      generated_files,
      traceability,
      docTitle,
      docMarkdown,
      bundle
    );
  }

  return {
    repo_id: repoId,
    spec_bundle_id: specBundleId,
    template_name: template,
    generated_files,
    generated_at: generatedAt,
    spec_version: parseInt(bundle.spec_version.split(".")[0], 10),
    traceability,
  };
}

/**
 * Generate Next.js + TypeScript scaffold files.
 */
function generateNextJsTypeScript(
  files: GeneratedRepo["generated_files"],
  traceability: GeneratedRepo["traceability"],
  docTitle: string,
  docMarkdown: string,
  bundle: SpecBundle
): void {
  // package.json with spec metadata
  const packageJson = {
    name: docTitle.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    description: `Generated from spec: ${docTitle}`,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "vitest",
    },
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      next: "^15.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0",
      vitest: "^1.0.0",
    },
    metadata: {
      spec_version: bundle.spec_version,
      spec_title: docTitle,
      spec_bundle_id: bundle.agent_spec.document_id,
      generated_at: new Date().toISOString(),
      authors: bundle.agent_spec.authors,
    },
  };

  files.push({
    path: "package.json",
    content: JSON.stringify(packageJson, null, 2),
    file_type: "config",
  });
  traceability["package.json"] = {
    source_block_ids: [],
    source_sections: ["metadata"],
  };

  // tsconfig.json
  const tsconfigJson = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      paths: {
        "@/*": ["./src/*"],
      },
    },
    include: ["src"],
    exclude: ["node_modules", "dist"],
  };

  files.push({
    path: "tsconfig.json",
    content: JSON.stringify(tsconfigJson, null, 2),
    file_type: "config",
  });
  traceability["tsconfig.json"] = {
    source_block_ids: [],
    source_sections: [],
  };

  // src/pages/index.tsx - basic scaffold
  const indexTsx = `/**
 * Home page scaffold
 * Generated from: ${docTitle}
 * Spec Version: ${bundle.spec_version}
 */

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">${docTitle}</h1>
      <p className="text-lg text-gray-600 mb-8">
        This is a generated scaffold from your spec.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Review the spec in docs/SPEC.md</li>
          <li>Check the architecture in docs/ARCHITECTURE.md</li>
          <li>See implementation tasks in docs/TASKS.md</li>
        </ul>
      </section>

      <section className="mt-12 pt-8 border-t">
        <p className="text-sm text-gray-500">
          <strong>Generated at:</strong> ${new Date().toISOString()} <br />
          <strong>Document Version:</strong> ${bundle.agent_spec.document_version} <br />
          <strong>Total Patches:</strong> ${bundle.agent_spec.total_patches_accepted} accepted, ${bundle.agent_spec.total_patches_rejected} rejected
        </p>
      </section>
    </main>
  );
}
`;

  files.push({
    path: "src/pages/index.tsx",
    content: indexTsx,
    file_type: "code",
  });
  traceability["src/pages/index.tsx"] = {
    source_block_ids: [],
    source_sections: ["overview"],
  };

  // README.md - from spec
  const readmeMd = `# ${docTitle}

> Generated from SpecForge spec bundle.
> Document Version: ${bundle.agent_spec.document_version}

## Overview

This is a scaffold Next.js project generated from your spec. Start implementing based on the specification.

## Getting Started

\`\`\`bash
bun install
bun run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- **Spec**: See \`docs/SPEC.md\` for the full specification
- **Architecture**: See \`docs/ARCHITECTURE.md\` for system design
- **Tasks**: See \`docs/TASKS.md\` for implementation tasks

## Build & Test

\`\`\`bash
bun run build    # Production build
bun run test     # Run tests
bun run lint     # Run linter
\`\`\`

## Project Info

- **Authors**: ${bundle.agent_spec.authors.join(", ")}
- **Created**: ${bundle.agent_spec.created_at}
- **Last Modified**: ${bundle.agent_spec.last_modified}
- **Patches Accepted**: ${bundle.agent_spec.total_patches_accepted}
- **Patches Rejected**: ${bundle.agent_spec.total_patches_rejected}

Generated with SpecForge
`;

  files.push({
    path: "README.md",
    content: readmeMd,
    file_type: "docs",
  });
  traceability["README.md"] = {
    source_block_ids: [],
    source_sections: ["overview", "getting_started"],
  };

  // docs/SPEC.md - full spec
  files.push({
    path: "docs/SPEC.md",
    content: docMarkdown,
    file_type: "docs",
  });
  traceability["docs/SPEC.md"] = {
    source_block_ids: bundle.agent_spec.sections.map((s) => s.block_id),
    source_sections: bundle.agent_spec.sections.map((s) => s.heading),
  };

  // docs/ARCHITECTURE.md - system design scaffold
  const architectureMd = `# Architecture

Generated from: ${docTitle}

## System Overview

This document outlines the architecture of this system based on the specification.

See \`SPEC.md\` for detailed requirements.

## Components

\`\`\`
${docTitle}
├── Frontend (Next.js + React)
├── Backend (Node.js)
└── Database (select persistence based on runtime needs)
\`\`\`

## Design Principles

1. Scalability
2. Maintainability
3. Testability
4. User Experience

## Next Steps

- Define component hierarchy
- Plan state management
- Design API contracts
- Set up testing strategy
`;

  files.push({
    path: "docs/ARCHITECTURE.md",
    content: architectureMd,
    file_type: "docs",
  });
  traceability["docs/ARCHITECTURE.md"] = {
    source_block_ids: [],
    source_sections: ["architecture"],
  };

  // tests/example.test.ts - test scaffold
  const exampleTest = `/**
 * Example test suite
 * Generated from: ${docTitle}
 */

import { describe, it, expect } from "vitest";

describe("Example Tests", () => {
  it("should pass a basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should verify document title", () => {
    const title = "${docTitle}";
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
  });

  it("should have correct spec version", () => {
    const specVersion = "${bundle.spec_version}";
    expect(specVersion).toMatch(/\\d+\\.\\d+/);
  });

  it("should track patch statistics", () => {
    const stats = {
      accepted: ${bundle.agent_spec.total_patches_accepted},
      rejected: ${bundle.agent_spec.total_patches_rejected},
    };
    expect(stats.accepted).toBeGreaterThanOrEqual(0);
    expect(stats.rejected).toBeGreaterThanOrEqual(0);
  });
});
`;

  files.push({
    path: "tests/example.test.ts",
    content: exampleTest,
    file_type: "test",
  });
  traceability["tests/example.test.ts"] = {
    source_block_ids: [],
    source_sections: [],
  };
}

/**
 * Generate Next.js + Python scaffold files.
 */
function generateNextJsPython(
  files: GeneratedRepo["generated_files"],
  traceability: GeneratedRepo["traceability"],
  docTitle: string,
  docMarkdown: string,
  bundle: SpecBundle
): void {
  // frontend/package.json
  const frontendPackageJson = {
    name: `${docTitle.toLowerCase().replace(/\s+/g, "-")}-frontend`,
    version: "0.1.0",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      next: "^15.0.0",
    },
  };

  files.push({
    path: "frontend/package.json",
    content: JSON.stringify(frontendPackageJson, null, 2),
    file_type: "config",
  });
  traceability["frontend/package.json"] = {
    source_block_ids: [],
    source_sections: [],
  };

  // backend/requirements.txt
  const requirementsFile = `# Python backend dependencies
# Generated from: ${docTitle}

fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
pytest==7.4.0
`;

  files.push({
    path: "backend/requirements.txt",
    content: requirementsFile,
    file_type: "config",
  });
  traceability["backend/requirements.txt"] = {
    source_block_ids: [],
    source_sections: [],
  };

  // backend/main.py - FastAPI scaffold
  const mainPy = `"""
FastAPI server scaffold
Generated from: ${docTitle}
Spec Version: ${bundle.spec_version}
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="${docTitle}",
    description="Generated from SpecForge spec",
    version="0.1.0",
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to ${docTitle}",
        "status": "ok",
        "spec_version": "${bundle.spec_version}",
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "0.1.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  files.push({
    path: "backend/main.py",
    content: mainPy,
    file_type: "code",
  });
  traceability["backend/main.py"] = {
    source_block_ids: [],
    source_sections: [],
  };

  // README.md
  const readmeMd = `# ${docTitle}

Full-stack application with Next.js frontend and Python backend.

Generated from SpecForge spec bundle (v${bundle.spec_version}).

## Setup

### Frontend
\`\`\`bash
cd frontend
bun install
bun run dev
\`\`\`

### Backend
\`\`\`bash
cd backend
pip install -r requirements.txt
python main.py
\`\`\`

## Documentation

- **Spec**: See \`docs/SPEC.md\`
- **Architecture**: See \`docs/ARCHITECTURE.md\`
`;

  files.push({
    path: "README.md",
    content: readmeMd,
    file_type: "docs",
  });
  traceability["README.md"] = {
    source_block_ids: [],
    source_sections: [],
  };

  // docs/SPEC.md
  files.push({
    path: "docs/SPEC.md",
    content: docMarkdown,
    file_type: "docs",
  });
  traceability["docs/SPEC.md"] = {
    source_block_ids: bundle.agent_spec.sections.map((s) => s.block_id),
    source_sections: bundle.agent_spec.sections.map((s) => s.heading),
  };
}

/**
 * Generate docs-only repository.
 */
function generateDocsOnly(
  files: GeneratedRepo["generated_files"],
  traceability: GeneratedRepo["traceability"],
  docTitle: string,
  docMarkdown: string,
  bundle: SpecBundle
): void {
  // README.md
  const readmeMd = `# ${docTitle}

Documentation repository generated from SpecForge.

## Contents

- **SPEC.md**: Full specification
- **ARCHITECTURE.md**: System architecture and design
- **TASKS.md**: Implementation tasks extracted from patch history

## Document Info

- Version: ${bundle.agent_spec.document_version}
- Authors: ${bundle.agent_spec.authors.join(", ")}
- Created: ${bundle.agent_spec.created_at}
- Last Modified: ${bundle.agent_spec.last_modified}

## Patch History

- Proposed: ${bundle.agent_spec.total_patches_proposed}
- Accepted: ${bundle.agent_spec.total_patches_accepted}
- Rejected: ${bundle.agent_spec.total_patches_rejected}
`;

  files.push({
    path: "README.md",
    content: readmeMd,
    file_type: "docs",
  });
  traceability["README.md"] = {
    source_block_ids: [],
    source_sections: ["overview"],
  };

  // docs/SPEC.md - full spec
  files.push({
    path: "docs/SPEC.md",
    content: docMarkdown,
    file_type: "docs",
  });
  traceability["docs/SPEC.md"] = {
    source_block_ids: bundle.agent_spec.sections.map((s) => s.block_id),
    source_sections: bundle.agent_spec.sections.map((s) => s.heading),
  };

  // docs/ARCHITECTURE.md
  const architectureMd = `# Architecture

\`${docTitle}\` architecture overview.

## System Components

Based on specification sections:

${bundle.agent_spec.sections.map((s) => `- ${s.heading}`).join("\n")}

## Design

See SPEC.md for detailed design documentation.
`;

  files.push({
    path: "docs/ARCHITECTURE.md",
    content: architectureMd,
    file_type: "docs",
  });
  traceability["docs/ARCHITECTURE.md"] = {
    source_block_ids: [],
    source_sections: ["architecture"],
  };

  // docs/TASKS.md - from patch history
  const tasksMd = `# Implementation Tasks

Extracted from specification and patch history.

## Document Evolution

Total patches proposed: ${bundle.agent_spec.total_patches_proposed}
Total patches accepted: ${bundle.agent_spec.total_patches_accepted}
Total patches rejected: ${bundle.agent_spec.total_patches_rejected}

## Patch Audit Trail

${bundle.patch_summary
  .map(
    (p) =>
      `- **${p.patch_id}**: \`${p.operation}\` → \`${p.status}\` (Block: ${p.block_id})`
  )
  .join("\n")}

## Next Steps

1. Review specification in SPEC.md
2. Understand architecture from ARCHITECTURE.md
3. Implement based on task breakdown
4. Submit patches for review
`;

  files.push({
    path: "docs/TASKS.md",
    content: tasksMd,
    file_type: "docs",
  });
  traceability["docs/TASKS.md"] = {
    source_block_ids: [],
    source_sections: bundle.patch_summary.map((p) => p.block_id),
  };
}
