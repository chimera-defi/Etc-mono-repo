export type WorkspaceMemberSeed = {
  membership_id: string;
  actor_id: string;
  actor_type: "human";
  name: string;
  role: string;
  color: string;
  github_login?: string | null;
};

export const DEFAULT_WORKSPACE_RECORD = {
  workspace_id: "ws_demo",
  name: "SpecForge Demo Workspace",
  plan: "demo" as const,
};

export const WORKSPACE_MEMBERS_SEED: WorkspaceMemberSeed[] = [
  {
    membership_id: "membership_owner",
    actor_id: "workspace_owner",
    actor_type: "human",
    name: "Founder",
    role: "Workspace owner",
    color: "#0f766e",
    github_login: "chimera-defi",
  },
  {
    membership_id: "membership_reviewer",
    actor_id: "specforge_reviewer",
    actor_type: "human",
    name: "Reviewer",
    role: "Product reviewer",
    color: "#1d4ed8",
    github_login: null,
  },
  {
    membership_id: "membership_operator",
    actor_id: "specforge_operator",
    actor_type: "human",
    name: "Agent operator",
    role: "Build operator",
    color: "#c2410c",
    github_login: null,
  },
];
