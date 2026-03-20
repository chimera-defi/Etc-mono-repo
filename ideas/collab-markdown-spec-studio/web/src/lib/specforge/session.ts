import crypto from "node:crypto";

import { cookies } from "next/headers";

import { logger } from "../logger";
import { WORKSPACE_MEMBERS_SEED } from "../../tests/fixtures/workspace-seed-data";
import {
  getWorkspaceMembershipByActorId,
  getWorkspaceMembershipForUser,
  listWorkspaceMemberships,
} from "./store";

export type WorkspaceActor = {
  actor_id: string;
  actor_type: "human" | "agent";
  name: string;
  role: string;
  color: string;
  workspace_id: string;
};

export type WorkspaceSession = {
  authMode: "local" | "github" | "unauthenticated";
  actor: WorkspaceActor;
  githubLogin?: string;
  githubUrl?: string;
};

export type WorkspaceRecord = {
  workspace_id: string;
  name: string;
  plan: "demo" | "pilot";
};

const WORKSPACE_ACTOR_COOKIE = "specforge_actor_id";
const WORKSPACE_SESSION_COOKIE = "specforge_session";
const GITHUB_OAUTH_STATE_COOKIE = "specforge_github_oauth_state";
const DEFAULT_SESSION_SECRET = "specforge-local-session-secret";

const workspaces: WorkspaceRecord[] = [
  {
    workspace_id: "ws_demo",
    name: "SpecForge Demo Workspace",
    plan: "demo",
  },
];

// Workspace members are imported from shared seed data to ensure consistency
// with database seeding in store.ts
const workspaceMembers = WORKSPACE_MEMBERS_SEED.map((member) => ({
  ...member,
  workspace_id: "ws_demo",
  githubLogin: member.github_login,
}));

type StoredWorkspaceSession = {
  actor_id: string;
  workspace_id: string;
  role: string;
  githubLogin: string;
  githubUrl?: string;
  issuedAt: number;
};

function getSessionSecret() {
  const configuredSecret = process.env.SPECFORGE_SESSION_SECRET?.trim();

  if (process.env.SPECFORGE_REQUIRE_SECURE_SECRETS === "true" && !configuredSecret) {
    throw new Error("SPECFORGE_SESSION_SECRET must be configured outside local demo mode");
  }

  return configuredSecret || DEFAULT_SESSION_SECRET;
}

function isSecureCookie() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.SPECFORGE_SECURE_COOKIES === "true"
  );
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function signPayload(payload: string) {
  return base64UrlEncode(
    crypto.createHmac("sha256", getSessionSecret()).update(payload).digest(),
  );
}

export function isGitHubAuthConfigured() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim() &&
      process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim(),
  );
}

export async function listWorkspaceActors() {
  try {
    return await listWorkspaceMemberships("ws_demo");
  } catch {
    return workspaceMembers;
  }
}

export function listWorkspaces() {
  return workspaces;
}

export function getWorkspaceRecord(workspaceId: string) {
  return workspaces.find((workspace) => workspace.workspace_id === workspaceId) ?? workspaces[0]!;
}

export function listWorkspaceMembers(workspaceId: string) {
  return workspaceMembers.filter((member) => member.workspace_id === workspaceId);
}

export async function resolveWorkspaceActor(actorId?: string | null) {
  try {
    if (actorId) {
      const membership = await getWorkspaceMembershipByActorId(actorId);
      if (membership) {
        return membership;
      }
    }
  } catch {
    // Fall through to seeded local actors if the local store is unavailable.
  }

  const actors = await listWorkspaceActors();
  return actors[0] ?? workspaceMembers[0]!;
}

export async function resolveWorkspaceMemberForGitHubLogin(
  login?: string | null,
  workspaceId: string = "ws_demo",
) {
  if (!login) {
    return null;
  }

  try {
    return (
      (await getWorkspaceMembershipForUser(login, workspaceId)) ??
      workspaceMembers.find((actor) => actor.githubLogin === login) ??
      null
    );
  } catch {
    return workspaceMembers.find((actor) => actor.githubLogin === login) ?? null;
  }
}

export function createWorkspaceSessionToken(session: StoredWorkspaceSession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyWorkspaceSessionToken(token: string) {
  const [payload, signature] = String(token ?? "").split(".");

  if (!payload || !signature) {
    throw new Error("Malformed workspace session");
  }

  const expectedSignature = signPayload(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid workspace session signature");
  }

  return JSON.parse(base64UrlDecode(payload)) as StoredWorkspaceSession;
}

function actorToSession(actor: WorkspaceActor, authMode: "local" | "github" | "unauthenticated", details?: {
  githubLogin?: string;
  githubUrl?: string;
}): WorkspaceSession {
  return {
    authMode,
    actor,
    githubLogin: details?.githubLogin,
    githubUrl: details?.githubUrl,
  };
}

export function isAuthSkipEnabled() {
  return process.env.NEXT_PUBLIC_SKIP_AUTH_OVERRIDE === "true";
}

export async function getCurrentWorkspaceSession() {
  const cookieStore = await cookies();

  if (isGitHubAuthConfigured() && !isAuthSkipEnabled()) {
    const rawSession = cookieStore.get(WORKSPACE_SESSION_COOKIE)?.value;

    if (rawSession) {
      try {
        const verified = verifyWorkspaceSessionToken(rawSession);
        const actor =
          (await resolveWorkspaceActor(verified.actor_id)) ??
          (await resolveWorkspaceMemberForGitHubLogin(
            verified.githubLogin,
            verified.workspace_id ?? "ws_demo",
          ));

        if (actor) {
          const resolvedActor = verified.workspace_id
            ? { ...actor, workspace_id: verified.workspace_id, role: verified.role ?? actor.role }
            : actor;
          return actorToSession(resolvedActor, "github", {
            githubLogin: verified.githubLogin,
            githubUrl: verified.githubUrl,
          });
        }
      } catch (error) {
        // Session verification failed - likely due to signature mismatch or malformed token
        // Delete the invalid session cookie to force re-authentication
        logger.error(
          "Failed to verify workspace session token",
          error instanceof Error ? error : new Error(String(error)),
          { reason: "Possible: signature mismatch, malformed token, or expired session" }
        );
        cookieStore.delete(WORKSPACE_SESSION_COOKIE);
      }
    }

    const actors = await listWorkspaceActors();
    return actorToSession(actors[0] ?? workspaceMembers[0]!, "unauthenticated");
  }

  const localActor = await resolveWorkspaceActor(cookieStore.get(WORKSPACE_ACTOR_COOKIE)?.value);
  return actorToSession(localActor, "local");
}

export async function getCurrentWorkspaceActor() {
  const session = await getCurrentWorkspaceSession();
  return session.actor;
}

export async function setCurrentWorkspaceActor(actorId: string) {
  const actor = await resolveWorkspaceActor(actorId);
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_ACTOR_COOKIE, actor.actor_id, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return actor;
}

export async function setGitHubWorkspaceSession(input: {
  githubLogin: string;
  githubUrl?: string;
  workspace_id?: string;
  role?: string;
}) {
  const actor =
    (await resolveWorkspaceMemberForGitHubLogin(input.githubLogin, input.workspace_id ?? "ws_demo")) ??
    (await listWorkspaceActors())[0] ??
    workspaceMembers[0]!;
  const workspaceId = input.workspace_id ?? actor.workspace_id;
  const role = input.role ?? actor.role;
  const cookieStore = await cookies();
  cookieStore.set(
    WORKSPACE_SESSION_COOKIE,
    createWorkspaceSessionToken({
      actor_id: actor.actor_id,
      workspace_id: workspaceId,
      role,
      githubLogin: input.githubLogin,
      githubUrl: input.githubUrl,
      issuedAt: Date.now(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );
  return actorToSession(actor, "github", input);
}

export async function clearGitHubWorkspaceSession() {
  const cookieStore = await cookies();
  cookieStore.delete(WORKSPACE_SESSION_COOKIE);
}

export async function createGitHubOAuthState() {
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(GITHUB_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 60 * 10,
  });
  return state;
}

export async function verifyGitHubOAuthState(state: string | null) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GITHUB_OAUTH_STATE_COOKIE)?.value ?? null;
  cookieStore.delete(GITHUB_OAUTH_STATE_COOKIE);

  if (!state || !expectedState || state !== expectedState) {
    throw new Error("Invalid GitHub OAuth state");
  }
}

export function getGitHubAuthorizationUrl(state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const redirectUri = process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim();

  if (!clientId || !redirectUri) {
    throw new Error("GitHub OAuth is not configured");
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}
