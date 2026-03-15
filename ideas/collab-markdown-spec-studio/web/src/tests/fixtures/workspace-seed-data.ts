/**
 * Workspace seed data shared between session.ts and store.ts
 * Single source of truth for workspace member definitions
 */

export type WorkspaceMemberSeed = {
  actor_id: string;
  actor_type: "human";
  name: string;
  role: string;
  color: string;
  github_login?: string | null;
};

/**
 * Default workspace members for demo/pilot workspaces
 * Used in both:
 * - web/src/lib/specforge/session.ts (for session resolution)
 * - web/src/lib/specforge/store.ts (for database seeding)
 */
export const WORKSPACE_MEMBERS_SEED: WorkspaceMemberSeed[] = [
  {
    actor_id: "workspace_owner",
    actor_type: "human",
    name: "Founder",
    role: "Workspace owner",
    color: "#0f766e",
    github_login: "chimera-defi",
  },
  {
    actor_id: "specforge_reviewer",
    actor_type: "human",
    name: "Reviewer",
    role: "Product reviewer",
    color: "#1d4ed8",
    github_login: null,
  },
  {
    actor_id: "specforge_operator",
    actor_type: "human",
    name: "Agent operator",
    role: "Build operator",
    color: "#c2410c",
    github_login: null,
  },
];
