import crypto from "node:crypto";

import { cookies } from "next/headers";

export type WorkspaceActor = {
  actor_id: string;
  actor_type: "human";
  name: string;
  role: string;
  color: string;
  workspace_id: string;
};

export type WorkspaceSession = {
  authMode: "local" | "github";
  actor: WorkspaceActor;
  githubLogin?: string;
  githubUrl?: string;
};

type WorkspaceMemberSeed = WorkspaceActor & {
  githubLogin?: string;
};

const WORKSPACE_ACTOR_COOKIE = "specforge_actor_id";
const WORKSPACE_SESSION_COOKIE = "specforge_session";
const DEFAULT_SESSION_SECRET = "specforge-local-session-secret";

const workspaceMembers: WorkspaceMemberSeed[] = [
  {
    actor_id: "workspace_owner",
    actor_type: "human",
    name: "Founder",
    role: "Workspace owner",
    color: "#0f766e",
    workspace_id: "ws_demo",
    githubLogin: "chimera-defi",
  },
  {
    actor_id: "specforge_reviewer",
    actor_type: "human",
    name: "Reviewer",
    role: "Product reviewer",
    color: "#1d4ed8",
    workspace_id: "ws_demo",
  },
  {
    actor_id: "specforge_operator",
    actor_type: "human",
    name: "Agent operator",
    role: "Build operator",
    color: "#c2410c",
    workspace_id: "ws_demo",
  },
];

type StoredWorkspaceSession = {
  actor_id: string;
  githubLogin: string;
  githubUrl?: string;
  issuedAt: number;
};

function getSessionSecret() {
  return process.env.SPECFORGE_SESSION_SECRET?.trim() || DEFAULT_SESSION_SECRET;
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

export function listWorkspaceActors() {
  return workspaceMembers;
}

export function resolveWorkspaceActor(actorId?: string | null) {
  return workspaceMembers.find((actor) => actor.actor_id === actorId) ?? workspaceMembers[0]!;
}

export function resolveWorkspaceMemberForGitHubLogin(login?: string | null) {
  if (!login) {
    return null;
  }

  return workspaceMembers.find((actor) => actor.githubLogin === login) ?? null;
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

function actorToSession(actor: WorkspaceActor, authMode: "local" | "github", details?: {
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

export async function getCurrentWorkspaceSession() {
  const cookieStore = await cookies();

  if (isGitHubAuthConfigured()) {
    const rawSession = cookieStore.get(WORKSPACE_SESSION_COOKIE)?.value;

    if (rawSession) {
      try {
        const verified = verifyWorkspaceSessionToken(rawSession);
        const actor =
          resolveWorkspaceActor(verified.actor_id) ??
          resolveWorkspaceMemberForGitHubLogin(verified.githubLogin);

        if (actor) {
          return actorToSession(actor, "github", {
            githubLogin: verified.githubLogin,
            githubUrl: verified.githubUrl,
          });
        }
      } catch {
        cookieStore.delete(WORKSPACE_SESSION_COOKIE);
      }
    }
  }

  const localActor = resolveWorkspaceActor(cookieStore.get(WORKSPACE_ACTOR_COOKIE)?.value);
  return actorToSession(localActor, "local");
}

export async function getCurrentWorkspaceActor() {
  const session = await getCurrentWorkspaceSession();
  return session.actor;
}

export async function setCurrentWorkspaceActor(actorId: string) {
  const actor = resolveWorkspaceActor(actorId);
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_ACTOR_COOKIE, actor.actor_id, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return actor;
}

export async function setGitHubWorkspaceSession(input: {
  githubLogin: string;
  githubUrl?: string;
}) {
  const actor = resolveWorkspaceMemberForGitHubLogin(input.githubLogin) ?? workspaceMembers[0]!;
  const cookieStore = await cookies();
  cookieStore.set(
    WORKSPACE_SESSION_COOKIE,
    createWorkspaceSessionToken({
      actor_id: actor.actor_id,
      githubLogin: input.githubLogin,
      githubUrl: input.githubUrl,
      issuedAt: Date.now(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
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

export function getGitHubAuthorizationUrl() {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const redirectUri = process.env.SPECFORGE_GITHUB_REDIRECT_URI?.trim();

  if (!clientId || !redirectUri) {
    throw new Error("GitHub OAuth is not configured");
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  return url.toString();
}
