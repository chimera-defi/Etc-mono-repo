import { buildExportBundle } from "../../../../core/src/export.js";

import {
  agentSpecExportSchema,
  type AgentSpecExport,
  type DocumentRecord,
  type StoredPatch,
} from "./contracts";

export function exportDocumentBundle(
  document: DocumentRecord,
  patches: StoredPatch[],
) {
  return buildExportBundle(document, patches, {
    validateAgentSpec(value: unknown) {
      return agentSpecExportSchema.parse(value) as AgentSpecExport;
    },
  });
}
