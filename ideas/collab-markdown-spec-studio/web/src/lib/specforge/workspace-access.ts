import { resolveStarterTemplateId, type StarterTemplateId } from "./handoff";
import {
  getCurrentWorkspaceActor,
  getCurrentWorkspaceSession,
  isAuthSkipEnabled,
  isGitHubAuthConfigured,
} from "./session";
import {
  getDocument,
  recordWorkspaceEvent,
  getWorkspaceMembershipForUser,
  listDocuments,
} from "./store";
import { buildDocumentLaunchContext } from "./workflow";

export class WorkspaceAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceAccessDeniedError";
  }
}

export async function getCurrentWorkspaceAccess() {
  const actor = await getCurrentWorkspaceActor();
  return {
    actor,
    workspaceId: actor.workspace_id,
  };
}

/**
 * Validates that the current session has membership in the given workspace.
 * In local dev mode (no GitHub auth or NEXT_PUBLIC_SKIP_AUTH_OVERRIDE=true),
 * this always succeeds. In GitHub auth mode, it checks workspace_members
 * for a matching github_login.
 */
export async function validateWorkspaceMembership(workspaceId: string) {
  if (!isGitHubAuthConfigured() || isAuthSkipEnabled()) {
    const actor = await getCurrentWorkspaceActor();
    return { actor, workspaceId };
  }

  const session = await getCurrentWorkspaceSession();

  if (session.authMode === "unauthenticated") {
    throw new WorkspaceAccessDeniedError("Authentication required");
  }

  if (!session.githubLogin) {
    throw new WorkspaceAccessDeniedError("GitHub login required for workspace access");
  }

  const membership = await getWorkspaceMembershipForUser(
    session.githubLogin,
    workspaceId,
  );

  if (!membership) {
    throw new WorkspaceAccessDeniedError(
      `User @${session.githubLogin} is not a member of workspace ${workspaceId}`,
    );
  }

  return {
    actor: session.actor,
    workspaceId,
    membership,
  };
}

export async function listCurrentWorkspaceDocuments() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  return listDocuments({ workspaceId });
}

export async function getCurrentWorkspaceDocument(documentId: string) {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const document = await getDocument(documentId, { workspaceId });

  if (document) {
    await validateWorkspaceMembership(workspaceId);
  }

  return {
    workspaceId,
    document,
  };
}

export async function getCurrentWorkspaceLaunchContext(
  documentId: string,
  templateId?: StarterTemplateId,
) {
  const { actor, workspaceId } = await getCurrentWorkspaceAccess();
  await validateWorkspaceMembership(workspaceId);
  const context = await buildDocumentLaunchContext(documentId, workspaceId, templateId);
  return {
    workspaceId,
    actor,
    context,
  };
}

export function resolveLaunchTemplateFromRequest(request: Request) {
  return resolveStarterTemplateId(
    new URL(request.url).searchParams.get("template") ?? undefined,
  );
}

export async function recordCurrentWorkspaceUsage(input: {
  actor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>>;
  eventType: string;
  documentId: string;
  templateId?: StarterTemplateId;
}) {
  await recordWorkspaceEvent({
    workspace_id: input.actor.workspace_id,
    event_type: input.eventType,
    actor_type: input.actor.actor_type,
    actor_id: input.actor.actor_id,
    payload: {
      document_id: input.documentId,
      template_id: input.templateId,
    },
  });
}
