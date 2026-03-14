import { cookies } from "next/headers";

export type WorkspaceActor = {
  actor_id: string;
  actor_type: "human";
  name: string;
  role: string;
  color: string;
  workspace_id: string;
};

const WORKSPACE_ACTOR_COOKIE = "specforge_actor_id";

const workspaceActors: WorkspaceActor[] = [
  {
    actor_id: "workspace_owner",
    actor_type: "human",
    name: "Founder",
    role: "Workspace owner",
    color: "#0f766e",
    workspace_id: "ws_demo",
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

export function listWorkspaceActors() {
  return workspaceActors;
}

export function resolveWorkspaceActor(actorId?: string | null) {
  return (
    workspaceActors.find((actor) => actor.actor_id === actorId) ??
    workspaceActors[0]!
  );
}

export async function getCurrentWorkspaceActor() {
  const cookieStore = await cookies();
  return resolveWorkspaceActor(cookieStore.get(WORKSPACE_ACTOR_COOKIE)?.value);
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
