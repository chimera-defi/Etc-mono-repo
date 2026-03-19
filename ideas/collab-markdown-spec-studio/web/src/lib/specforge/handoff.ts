import {
  buildStarterTemplate as buildStarterTemplateImpl,
  listTemplates as listTemplatesImpl,
  resolveStarterTemplateId as resolveStarterTemplateIdImpl,
} from "../../../../core/src/handoff.js";
import { generateRepository } from "../../engine/repo-generator";
import type { RepoScaffoldTemplate, SpecBundle } from "../../engine/types";

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
  return buildStarterTemplateImpl(
    document,
    exportBundle,
    readinessReport,
    patches,
    templateId,
    (bundle: SpecBundle, engineTemplate: string) =>
      generateRepository(bundle, engineTemplate as RepoScaffoldTemplate),
  );
}
