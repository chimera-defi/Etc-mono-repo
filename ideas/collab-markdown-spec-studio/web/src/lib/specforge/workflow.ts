import { buildLaunchPacket as buildLaunchPacketImpl } from "../../../../core/src/workflow.js";

import { buildExecutionBrief } from "./execution";
import { buildStarterTemplate, type StarterTemplateId } from "./handoff";
import { evaluateReadiness } from "./readiness";
import {
  exportDocument,
  getDocument,
  listClarifications,
  listCommentThreads,
  listPatches,
  type ClarificationRecord,
  type CommentThreadRecord,
} from "./store";
import type { DocumentRecord, StoredPatch } from "./contracts";

export type DocumentExportBundle = Awaited<ReturnType<typeof exportDocument>>;
export type DocumentReadiness = ReturnType<typeof evaluateReadiness>;
export type DocumentStarterBundle = ReturnType<typeof buildStarterTemplate>;
export type DocumentExecutionBrief = ReturnType<typeof buildExecutionBrief>;

export type DocumentLaunchContext = {
  document: DocumentRecord;
  patches: StoredPatch[];
  comments: CommentThreadRecord[];
  clarifications: ClarificationRecord[];
  exportBundle: DocumentExportBundle;
  readiness: DocumentReadiness;
  starterBundle: DocumentStarterBundle;
  executionBrief: DocumentExecutionBrief;
};

export async function buildDocumentLaunchContext(
  documentId: string,
  workspaceId?: string,
  templateId?: StarterTemplateId,
): Promise<DocumentLaunchContext | null> {
  const storeOptions = workspaceId ? { workspaceId } : undefined;
  const document = await getDocument(documentId, storeOptions);

  if (!document) {
    return null;
  }

  const [patches, comments, clarifications, exportBundle] = await Promise.all([
    listPatches(documentId, storeOptions),
    listCommentThreads(documentId, storeOptions),
    listClarifications(documentId, storeOptions),
    exportDocument(documentId, storeOptions),
  ]);
  const readiness = evaluateReadiness({
    document,
    patches,
    comments,
    clarifications,
  });
  const starterBundle = buildStarterTemplate(
    document,
    exportBundle,
    readiness,
    patches,
    templateId,
  );
  const executionBrief = buildExecutionBrief({
    document,
    exportBundle,
    starterBundle,
    readiness,
    patches,
    comments,
    clarifications,
  });

  return {
    document,
    patches,
    comments,
    clarifications,
    exportBundle,
    readiness,
    starterBundle,
    executionBrief,
  };
}

export function buildLaunchPacket(context: DocumentLaunchContext) {
  return buildLaunchPacketImpl(context);
}
