import { buildExecutionBrief as buildExecutionBriefImpl } from "../../../../core/src/execution.js";

import type { DocumentRecord, StoredPatch } from "./contracts";
import type { exportDocumentBundle } from "./export";
import type { buildStarterTemplate } from "./handoff";
import type { ReadinessReport } from "./readiness";
import type { ClarificationRecord, CommentThreadRecord } from "./store";

type ExportBundle = ReturnType<typeof exportDocumentBundle>;
type StarterBundle = ReturnType<typeof buildStarterTemplate>;

export function buildExecutionBrief(input: {
  document: DocumentRecord;
  exportBundle: ExportBundle;
  starterBundle: StarterBundle;
  readiness: ReadinessReport;
  patches: StoredPatch[];
  comments: CommentThreadRecord[];
  clarifications?: ClarificationRecord[];
}) {
  return buildExecutionBriefImpl(input);
}
