import { getCurrentWorkspaceActor } from "./session";
import { getDocument, listDocuments } from "./store";
import { buildDocumentLaunchContext } from "./workflow";

export async function getCurrentWorkspaceAccess() {
  const actor = await getCurrentWorkspaceActor();
  return {
    actor,
    workspaceId: actor.workspace_id,
  };
}

export async function listCurrentWorkspaceDocuments() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  return listDocuments({ workspaceId });
}

export async function getCurrentWorkspaceDocument(documentId: string) {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const document = await getDocument(documentId, { workspaceId });
  return {
    workspaceId,
    document,
  };
}

export async function getCurrentWorkspaceLaunchContext(documentId: string) {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const context = await buildDocumentLaunchContext(documentId, workspaceId);
  return {
    workspaceId,
    context,
  };
}
