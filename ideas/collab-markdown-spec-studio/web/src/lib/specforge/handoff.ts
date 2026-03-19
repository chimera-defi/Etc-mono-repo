import {
  buildCuratedTsStarter,
  listTemplates as listTemplatesImpl,
  resolveStarterTemplateId as resolveStarterTemplateIdImpl,
} from "../../../../core/src/handoff.js";
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

const templateMap: Record<StarterTemplateId, RepoScaffoldTemplate | "ts_cli_starter_v1"> = {
  ts_cli_starter_v1: "ts_cli_starter_v1",
  docs_only_v1: "docs-only",
  nextjs_typescript_v1: "nextjs-typescript",
  nextjs_python_v1: "nextjs-python",
};

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

export function listTemplates(): StarterTemplateDefinition[] {
  return listTemplatesImpl() as StarterTemplateDefinition[];
}

export function resolveStarterTemplateId(templateId?: string): StarterTemplateId {
  return resolveStarterTemplateIdImpl(templateId) as StarterTemplateId;
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
