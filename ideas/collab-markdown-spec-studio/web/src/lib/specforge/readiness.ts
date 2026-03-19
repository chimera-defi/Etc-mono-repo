import { evaluateReadiness as evaluateReadinessImpl } from "../../../../core/src/readiness.js";

import type { DocumentRecord, StoredPatch } from "./contracts";
import type { ClarificationRecord, CommentThreadRecord } from "./store";

type ReadinessStatus = "blocked" | "needs_review" | "ready";

export type ReadinessReport = {
  score: number;
  status: ReadinessStatus;
  missing_sections: string[];
  open_patch_count: number;
  open_comment_count: number;
  open_clarification_count: number;
  recap: string[];
};

type ReadinessInput = {
  document: DocumentRecord;
  patches: StoredPatch[];
  comments: CommentThreadRecord[];
  clarifications?: ClarificationRecord[];
};

export function evaluateReadiness(input: ReadinessInput): ReadinessReport {
  return evaluateReadinessImpl(input) as ReadinessReport;
}
