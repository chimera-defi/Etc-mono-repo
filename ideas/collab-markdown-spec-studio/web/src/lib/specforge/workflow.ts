import {
  buildDocumentLaunchContext as buildDocumentLaunchContextImpl,
  buildLaunchPacket as buildLaunchPacketImpl,
} from "../../../../core/src/workflow.js";

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
  return buildDocumentLaunchContextImpl(documentId, {
    workspaceId,
    templateId,
    loadDocument: (id: string, currentWorkspaceId?: string) =>
      getDocument(id, currentWorkspaceId ? { workspaceId: currentWorkspaceId } : undefined),
    loadPatches: (id: string, currentWorkspaceId?: string) =>
      listPatches(id, currentWorkspaceId ? { workspaceId: currentWorkspaceId } : undefined),
    loadComments: (id: string, currentWorkspaceId?: string) =>
      listCommentThreads(id, currentWorkspaceId ? { workspaceId: currentWorkspaceId } : undefined),
    loadClarifications: (id: string, currentWorkspaceId?: string) =>
      listClarifications(
        id,
        currentWorkspaceId ? { workspaceId: currentWorkspaceId } : undefined,
      ),
    loadExportBundle: (id: string, currentWorkspaceId?: string) =>
      exportDocument(id, currentWorkspaceId ? { workspaceId: currentWorkspaceId } : undefined),
    evaluateReadiness,
    buildStarterTemplate,
    buildExecutionBrief,
  }) as Promise<DocumentLaunchContext | null>;
}

export function buildLaunchPacket(context: DocumentLaunchContext) {
  return buildLaunchPacketImpl(context);
}
