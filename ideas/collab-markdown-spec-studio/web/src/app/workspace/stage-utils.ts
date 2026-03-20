import type { StarterTemplateId } from "@/lib/specforge/handoff";

export type Stage = "start" | "draft" | "review" | "decide" | "export";

export const stageOrder: Stage[] = ["start", "draft", "review", "decide", "export"];

export function getPatchRiskLabel(patchType: string) {
  switch (patchType) {
    case "requirement_change":
      return "high impact";
    case "task_export_change":
      return "handoff risk";
    case "structural_edit":
      return "medium impact";
    default:
      return "low impact";
  }
}

export function getPatchStatusTone(status: string) {
  switch (status) {
    case "accepted":
    case "cherry_picked":
      return "success";
    case "rejected":
      return "danger";
    case "stale":
      return "warning";
    default:
      return "neutral";
  }
}

export function renderDiffLines(before: string, after: string) {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const maxLength = Math.max(beforeLines.length, afterLines.length);

  return Array.from({ length: maxLength }, (_, index) => {
    const previous = beforeLines[index] ?? "";
    const next = afterLines[index] ?? "";

    if (previous === next) {
      return { key: `same-${index}`, before: previous, after: next, tone: "same" as const };
    }

    return {
      key: `change-${index}`,
      before: previous,
      after: next,
      tone: "changed" as const,
    };
  });
}

export function buildStageHref(documentId: string | null, stage: Stage) {
  const params = new URLSearchParams();
  if (documentId) {
    params.set("document", documentId);
  }
  params.set("stage", stage);
  return `/workspace?${params.toString()}`;
}

export function buildTemplateHref(documentId: string | null, stage: Stage, templateId: StarterTemplateId) {
  const params = new URLSearchParams();
  if (documentId) {
    params.set("document", documentId);
  }
  params.set("stage", stage);
  params.set("template", templateId);
  return `/workspace?${params.toString()}`;
}

export function getStageMeta(stage: Stage) {
  switch (stage) {
    case "start":
      return {
        title: "Start the spec",
        description: "Choose an existing draft or create a fresh document to work on.",
      };
    case "draft":
      return {
        title: "Draft on the canvas",
        description: "Use the shared editor as the canonical source of truth.",
      };
    case "review":
      return {
        title: "Prepare review work",
        description: "Open comments, inspect activity, and queue targeted patch proposals.",
      };
    case "decide":
      return {
        title: "Resolve proposed changes",
        description: "Make human decisions on the patch queue and keep an audit trail.",
      };
    case "export":
      return {
        title: "Launch the build handoff",
        description:
          "Check readiness, inspect the starter output, and package one-shot build context.",
      };
  }
}
