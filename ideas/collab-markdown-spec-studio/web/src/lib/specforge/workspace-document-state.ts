import type { StarterTemplateId } from "./handoff";
import { listAuditEvents, type CommentThreadRecord } from "./store";
import { buildDocumentLaunchContext, buildLaunchPacket } from "./workflow";
import type { DocumentRecord, StoredPatch } from "./contracts";

export type BlockSummary = {
  block_id: string;
  heading: string;
  openComments: number;
  pendingPatches: number;
  touchedBy: string[];
};

export type GuidedStep = {
  id: string;
  stage: "start" | "draft" | "review" | "decide" | "export";
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
};

function summarizeBlocks(
  activeDocument: DocumentRecord,
  patches: StoredPatch[],
  commentThreads: CommentThreadRecord[],
) {
  const summaries = activeDocument.blocks.map<BlockSummary>((block) => {
    const blockPatches = patches.filter((patch) => patch.block_id === block.block_id);
    const blockComments = commentThreads.filter((thread) => thread.block_id === block.block_id);
    const touchedBy = Array.from(
      new Set([
        ...blockPatches.map(
          (patch) => `${patch.proposed_by.actor_type}:${patch.proposed_by.actor_id}`,
        ),
        ...blockComments.map(
          (thread) => `${thread.created_by.actor_type}:${thread.created_by.actor_id}`,
        ),
      ]),
    );

    return {
      block_id: block.block_id,
      heading: block.heading,
      openComments: blockComments.filter((thread) => thread.status === "open").length,
      pendingPatches: blockPatches.filter((patch) =>
        ["proposed", "stale"].includes(patch.status),
      ).length,
      touchedBy,
    };
  });

  return summaries.sort((left, right) => {
    const leftWeight = left.openComments + left.pendingPatches;
    const rightWeight = right.openComments + right.pendingPatches;
    return rightWeight - leftWeight;
  });
}

export function buildGuidedSteps(input: {
  hasDocument: boolean;
  hasDraft: boolean;
  hasPatches: boolean;
  hasOpenComments: boolean;
  hasPendingPatches: boolean;
  isReadyToExport: boolean;
}) {
  const baseSteps = [
    {
      id: "create",
      stage: "start" as const,
      title: "Create or open a spec",
      description: "Start from a seeded document or open a fresh draft.",
      completed: input.hasDocument,
    },
    {
      id: "draft",
      stage: "draft" as const,
      title: "Draft on the shared canvas",
      description: "Edit live, collaborate, and save a canonical snapshot.",
      completed: input.hasDraft,
    },
    {
      id: "review",
      stage: "review" as const,
      title: "Queue review work",
      description: "Open comments, activity, and targeted patch proposals.",
      completed: input.hasPatches || input.hasOpenComments,
    },
    {
      id: "decide",
      stage: "decide" as const,
      title: "Resolve the patch queue",
      description: "Accept, cherry-pick, or reject proposed changes.",
      completed: !input.hasOpenComments && !input.hasPendingPatches && input.hasPatches,
    },
    {
      id: "export",
      stage: "export" as const,
      title: "Launch the build handoff",
      description: "Review the export, starter output, and execution brief together.",
      completed: input.isReadyToExport,
    },
  ];

  const currentIndex = baseSteps.findIndex((step) => !step.completed);

  return baseSteps.map<GuidedStep>((step, index) => ({
    id: step.id,
    stage: step.stage,
    title: step.title,
    description: step.description,
    status:
      currentIndex === -1 || index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

export async function loadActiveWorkspaceDocumentState(input: {
  documents: Array<{ document_id: string }>;
  requestedDocumentId?: string;
  workspaceId: string;
  templateId: StarterTemplateId;
}) {
  const activeDocumentId =
    input.documents.find((document) => document.document_id === input.requestedDocumentId)
      ?.document_id ??
    input.documents[0]?.document_id ??
    null;

  const activeContext = activeDocumentId
    ? await buildDocumentLaunchContext(activeDocumentId, input.workspaceId, input.templateId)
    : null;
  const activeDocument = activeContext?.document ?? null;
  const patches = activeContext?.patches ?? [];
  const commentThreads = activeContext?.comments ?? [];
  const clarifications = activeContext?.clarifications ?? [];
  const exportBundle = activeContext?.exportBundle ?? null;
  const readinessReport = activeContext?.readiness ?? null;
  const handoffBundle = activeContext?.starterBundle ?? null;
  const executionBrief = activeContext?.executionBrief ?? null;
  const launchPacket = activeContext ? buildLaunchPacket(activeContext) : null;
  const auditEvents = activeDocument ? await listAuditEvents(activeDocument.document_id) : [];
  const activeBlock = activeDocument?.blocks[0] ?? null;
  const showcaseSourceId = activeDocument?.metadata.source_example_id ?? "";
  const showcaseSourcePath = activeDocument?.metadata.source_path ?? "";
  const blockSummaries = activeDocument
    ? summarizeBlocks(activeDocument, patches, commentThreads)
    : [];
  const agentProposedPatches = patches.filter((patch) => patch.proposed_by.actor_type === "agent");
  const approvedAgentPatches = agentProposedPatches.filter((patch) =>
    ["accepted", "cherry_picked"].includes(patch.status),
  );
  const humanComments = commentThreads.filter((thread) => thread.created_by.actor_type === "human");
  const actionablePatches = patches.filter((patch) => ["proposed", "stale"].includes(patch.status));
  const resolvedPatches = patches.filter((patch) =>
    ["accepted", "rejected", "cherry_picked"].includes(patch.status),
  );

  return {
    activeDocumentId,
    activeContext,
    activeDocument,
    patches,
    commentThreads,
    clarifications,
    exportBundle,
    readinessReport,
    handoffBundle,
    executionBrief,
    launchPacket,
    auditEvents,
    activeBlock,
    showcaseSourceId,
    showcaseSourcePath,
    blockSummaries,
    agentProposedPatches,
    approvedAgentPatches,
    humanComments,
    actionablePatches,
    resolvedPatches,
  };
}
