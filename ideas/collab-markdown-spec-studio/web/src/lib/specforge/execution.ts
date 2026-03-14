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
  const approvedPatches = input.patches.filter((patch) =>
    ["accepted", "cherry_picked"].includes(patch.status),
  );
  const pendingPatches = input.patches.filter((patch) =>
    ["proposed", "stale"].includes(patch.status),
  );
  const openComments = input.comments.filter((comment) => comment.status === "open");
  const openClarifications = (input.clarifications ?? []).filter(
    (clarification) => clarification.status === "open",
  );
  const runReady =
    input.readiness.status === "ready" &&
    pendingPatches.length === 0 &&
    openComments.length === 0 &&
    openClarifications.length === 0;

  return {
    run_ready: runReady,
    readiness_score: input.readiness.score,
    primary_goal:
      input.document.metadata.goals?.split("\n").map((line) => line.trim()).filter(Boolean)[0] ??
      "Ship the first vertical slice from the approved spec.",
    blockers: [
      ...input.readiness.missing_sections.map((section) => `Missing section: ${section}`),
      ...pendingPatches.map((patch) => `Pending patch: ${patch.patch_id}`),
      ...openComments.map((comment) => `Open comment: ${comment.thread_id}`),
      ...openClarifications.map(
        (clarification) => `Open clarification: ${clarification.clarification_id}`,
      ),
    ],
    provenance: {
      document_id: input.document.document_id,
      version: input.document.version,
      approved_patch_count: approvedPatches.length,
      pending_patch_count: pendingPatches.length,
      open_comment_count: openComments.length,
      open_clarification_count: openClarifications.length,
    },
    commands: ["npm install", "npm run dev", "npm run build"],
    agent_instructions: [
      "Use PRD.md, SPEC.md, TASKS.md, and specforge/agent_spec.json as the authoritative context bundle.",
      "Implement the starter template before expanding scope.",
      "Reflect approved patches in code before introducing new behavior.",
    ],
    deliverables: [
      ...Object.keys(input.exportBundle.files),
      ...Object.keys(input.starterBundle.files),
    ],
  };
}
