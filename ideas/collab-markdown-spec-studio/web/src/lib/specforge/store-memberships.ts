import { randomUUID } from "node:crypto";

import type {
  StoreOptions,
  WorkspaceMembershipRecord,
  WorkspaceRecord,
} from "./store";
import {
  getDatabase,
  _resolveOptions as resolveOptions,
  _persistSnapshot as persistSnapshot,
} from "./store";

type WorkspaceMemberRow = {
  membership_id: string;
  workspace_id: string;
  actor_id: string;
  actor_type: "human" | "agent";
  name: string;
  role: string;
  color: string;
  github_login: string | null;
  created_at: string;
};

function mapWorkspaceMembershipRow(row: WorkspaceMemberRow): WorkspaceMembershipRecord {
  return {
    membership_id: row.membership_id,
    workspace_id: row.workspace_id,
    actor_id: row.actor_id,
    actor_type: row.actor_type,
    name: row.name,
    role: row.role,
    color: row.color,
    github_login: row.github_login ?? undefined,
    created_at: row.created_at,
  };
}

export async function listWorkspaceMemberships(
  workspaceId: string,
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    FROM workspace_members
    WHERE workspace_id = $1
    ORDER BY created_at ASC`,
    [workspaceId],
  );

  return result.rows.map(mapWorkspaceMembershipRow);
}

export async function getWorkspaceMembershipByActorId(
  actorId: string,
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord | null> {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    FROM workspace_members
    WHERE actor_id = $1
    LIMIT 1`,
    [actorId],
  );

  const row = result.rows[0];
  return row ? mapWorkspaceMembershipRow(row) : null;
}

export async function createWorkspaceMembership(
  input: {
    workspace_id: string;
    name: string;
    role: string;
    color: string;
    github_login?: string;
  },
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord> {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const now = new Date().toISOString();
  const actorIdBase =
    input.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "workspace_member";
  const actorId = `${actorIdBase}_${randomUUID().slice(0, 6)}`;
  const membershipId = `membership_${randomUUID()}`;

  await database.query(
    `INSERT INTO workspace_members (
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at
    ) VALUES ($1, $2, $3, 'human', $4, $5, $6, $7, $8)`,
    [
      membershipId,
      input.workspace_id,
      actorId,
      input.name.trim(),
      input.role.trim(),
      input.color.trim(),
      input.github_login?.trim() || null,
      now,
    ],
  );
  await persistSnapshot(database, dbPath);

  return {
    membership_id: membershipId,
    workspace_id: input.workspace_id,
    actor_id: actorId,
    actor_type: "human",
    name: input.name.trim(),
    role: input.role.trim(),
    color: input.color.trim(),
    github_login: input.github_login?.trim() || undefined,
    created_at: now,
  };
}

export async function getWorkspaceMembershipForUser(
  githubLogin: string,
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceMembershipRecord | null> {
  const database = await getDatabase(options);
  const result = await database.query<WorkspaceMemberRow>(
    `SELECT
      membership_id, workspace_id, actor_id, actor_type, name, role, color, github_login, created_at
    FROM workspace_members
    WHERE workspace_id = $1 AND github_login = $2
    LIMIT 1`,
    [workspaceId, githubLogin],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapWorkspaceMembershipRow(result.rows[0]!);
}

export async function listUserWorkspaces(
  githubLogin: string,
  options?: StoreOptions,
): Promise<WorkspaceRecord[]> {
  const database = await getDatabase(options);
  type WorkspaceRow = {
    workspace_id: string;
    name: string;
    plan: "demo" | "pilot";
    created_at: string;
  };
  const result = await database.query<WorkspaceRow>(
    `SELECT DISTINCT w.workspace_id, w.name, w.plan, w.created_at
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.workspace_id = wm.workspace_id
    WHERE wm.github_login = $1
    ORDER BY w.created_at ASC`,
    [githubLogin],
  );

  return result.rows.map((row) => ({
    workspace_id: row.workspace_id,
    name: row.name,
    plan: row.plan,
    created_at: row.created_at,
  }));
}

export async function deleteWorkspaceMembership(
  membershipId: string,
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const result = await database.query<WorkspaceMemberRow>(
    `DELETE FROM workspace_members
    WHERE membership_id = $1
    RETURNING
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at`,
    [membershipId],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  await persistSnapshot(database, dbPath);
  return mapWorkspaceMembershipRow(row);
}

export async function updateWorkspaceMembershipRole(
  membershipId: string,
  role: string,
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  const result = await database.query<WorkspaceMemberRow>(
    `UPDATE workspace_members
    SET role = $2
    WHERE membership_id = $1
    RETURNING
      membership_id,
      workspace_id,
      actor_id,
      actor_type,
      name,
      role,
      color,
      github_login,
      created_at`,
    [membershipId, role.trim()],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  await persistSnapshot(database, dbPath);
  return mapWorkspaceMembershipRow(row);
}
