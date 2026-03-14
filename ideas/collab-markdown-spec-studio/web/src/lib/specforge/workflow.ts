import { buildExecutionBrief } from "./execution";
import { buildStarterTemplate } from "./handoff";
import { evaluateReadiness } from "./readiness";
import {
  exportDocument,
  getDocument,
  listCommentThreads,
  listPatches,
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
  exportBundle: DocumentExportBundle;
  readiness: DocumentReadiness;
  starterBundle: DocumentStarterBundle;
  executionBrief: DocumentExecutionBrief;
};

export async function buildDocumentLaunchContext(
  documentId: string,
  workspaceId?: string,
): Promise<DocumentLaunchContext | null> {
  const storeOptions = workspaceId ? { workspaceId } : undefined;
  const document = await getDocument(documentId, storeOptions);

  if (!document) {
    return null;
  }

  const [patches, comments, exportBundle] = await Promise.all([
    listPatches(documentId, storeOptions),
    listCommentThreads(documentId, storeOptions),
    exportDocument(documentId, storeOptions),
  ]);
  const readiness = evaluateReadiness({
    document,
    patches,
    comments,
  });
  const starterBundle = buildStarterTemplate(document, exportBundle, readiness);
  const executionBrief = buildExecutionBrief({
    document,
    exportBundle,
    starterBundle,
    readiness,
    patches,
    comments,
  });

  return {
    document,
    patches,
    comments,
    exportBundle,
    readiness,
    starterBundle,
    executionBrief,
  };
}

export function buildLaunchPacket(context: DocumentLaunchContext) {
  return {
    packet_id: `launch_${context.document.document_id}_v${context.document.version}`,
    document: {
      document_id: context.document.document_id,
      title: context.document.title,
      version: context.document.version,
    },
    readiness: context.readiness,
    export_bundle: context.exportBundle,
    starter_bundle: context.starterBundle,
    execution_brief: context.executionBrief,
  };
}
