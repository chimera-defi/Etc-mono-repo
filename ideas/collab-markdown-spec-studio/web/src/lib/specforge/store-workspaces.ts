import { randomUUID } from "node:crypto";

import type {
  QuerySession,
  StoreOptions,
  UserRecord,
  WorkspaceActivityMetrics,
  WorkspaceMembershipRecord,
  WorkspaceRecord,
  WorkspaceUsageSummary,
} from "./store";

type WorkspaceRow = {
  workspace_id: string;
  name: string;
  plan: "demo" | "pilot";
  created_at: string;
};

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

type UserRow = {
  user_id: string;
  github_id: string | null;
  github_login: string | null;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceStoreDeps = {
  getDatabase: (options?: StoreOptions) => Promise<QuerySession>;
  resolveOptions: (options?: StoreOptions) => { dbPath: string };
  persistSnapshot: (database: QuerySession, snapshotPath: string) => Promise<void>;
  insertAuditEvent: (
    database: QuerySession,
    input: {
      document_id?: string;
      patch_id?: string;
      event_type: string;
      actor_type: "human" | "agent" | "system";
      actor_id: string;
      payload: unknown;
      created_at?: string;
    },
  ) => Promise<void>;
};

function mapWorkspaceRow(row: WorkspaceRow): WorkspaceRecord {
  return {
    workspace_id: row.workspace_id,
    name: row.name,
    plan: row.plan,
    created_at: row.created_at,
  };
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    user_id: row.user_id,
    github_id: row.github_id ?? undefined,
    github_login: row.github_login ?? undefined,
    email: row.email ?? undefined,
    display_name: row.display_name,
    avatar_url: row.avatar_url ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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

export function createWorkspaceStore(deps: WorkspaceStoreDeps) {
  return {
    async listWorkspaceRecords(options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const result = await database.query<WorkspaceRow>(
        `SELECT workspace_id, name, plan, created_at
        FROM workspaces
        ORDER BY created_at ASC`,
      );
      return result.rows.map(mapWorkspaceRow);
    },

    async updateWorkspacePlan(
      workspaceId: string,
      plan: WorkspaceRecord["plan"],
      options?: StoreOptions,
    ) {
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const result = await database.query<WorkspaceRow>(
        `UPDATE workspaces
        SET plan = $2
        WHERE workspace_id = $1
        RETURNING workspace_id, name, plan, created_at`,
        [workspaceId, plan],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error(`Workspace ${workspaceId} not found`);
      }
      await deps.persistSnapshot(database, dbPath);
      return mapWorkspaceRow(row);
    },

    async listWorkspaceMemberships(workspaceId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
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
    },

    async getWorkspaceMembershipByActorId(
      actorId: string,
      options?: StoreOptions,
    ): Promise<WorkspaceMembershipRecord | null> {
      const database = await deps.getDatabase(options);
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
    },

    async createWorkspaceMembership(
      input: {
        workspace_id: string;
        name: string;
        role: string;
        color: string;
        github_login?: string;
      },
      options?: StoreOptions,
    ): Promise<WorkspaceMembershipRecord> {
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
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
      await deps.persistSnapshot(database, dbPath);

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
    },

    async getWorkspaceActivityMetrics(
      workspaceId: string,
      options?: StoreOptions,
    ): Promise<WorkspaceActivityMetrics> {
      const database = await deps.getDatabase(options);
      const [documents, reviewed, commented, clarified] = await Promise.all([
        database.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count
          FROM documents
          WHERE workspace_id = $1`,
          [workspaceId],
        ),
        database.query<{ count: string }>(
          `SELECT COUNT(DISTINCT p.document_id)::text AS count
          FROM patches p
          INNER JOIN documents d ON d.document_id = p.document_id
          WHERE d.workspace_id = $1`,
          [workspaceId],
        ),
        database.query<{ count: string }>(
          `SELECT COUNT(DISTINCT c.document_id)::text AS count
          FROM comment_threads c
          INNER JOIN documents d ON d.document_id = c.document_id
          WHERE d.workspace_id = $1`,
          [workspaceId],
        ),
        database.query<{ count: string }>(
          `SELECT COUNT(DISTINCT c.document_id)::text AS count
          FROM clarifications c
          INNER JOIN documents d ON d.document_id = c.document_id
          WHERE d.workspace_id = $1`,
          [workspaceId],
        ),
      ]);

      return {
        workspace_id: workspaceId,
        document_count: Number(documents.rows[0]?.count ?? 0),
        reviewed_document_count: Number(reviewed.rows[0]?.count ?? 0),
        commented_document_count: Number(commented.rows[0]?.count ?? 0),
        clarified_document_count: Number(clarified.rows[0]?.count ?? 0),
      };
    },

    async recordWorkspaceEvent(
      input: {
        workspace_id: string;
        event_type: string;
        actor_type: "human" | "agent" | "system";
        actor_id: string;
        payload?: Record<string, unknown>;
      },
      options?: StoreOptions,
    ) {
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      await deps.insertAuditEvent(database, {
        event_type: input.event_type,
        actor_type: input.actor_type,
        actor_id: input.actor_id,
        payload: {
          workspace_id: input.workspace_id,
          ...(input.payload ?? {}),
        },
      });
      await deps.persistSnapshot(database, dbPath);
    },

    async getWorkspaceUsageSummary(
      workspaceId: string,
      options?: StoreOptions,
    ): Promise<WorkspaceUsageSummary> {
      const database = await deps.getDatabase(options);
      const result = await database.query<{
        assist_request_count: string;
        handoff_view_count: string;
        execution_view_count: string;
        launch_packet_view_count: string;
      }>(
        `SELECT
          COUNT(*) FILTER (WHERE event_type = 'usage.assist_requested')::text AS assist_request_count,
          COUNT(*) FILTER (WHERE event_type = 'usage.handoff_viewed')::text AS handoff_view_count,
          COUNT(*) FILTER (WHERE event_type = 'usage.execution_viewed')::text AS execution_view_count,
          COUNT(*) FILTER (WHERE event_type = 'usage.launch_packet_viewed')::text AS launch_packet_view_count
        FROM audit_events
        WHERE payload_json ->> 'workspace_id' = $1`,
        [workspaceId],
      );
      const row = result.rows[0];
      return {
        workspace_id: workspaceId,
        assist_request_count: Number(row?.assist_request_count ?? 0),
        handoff_view_count: Number(row?.handoff_view_count ?? 0),
        execution_view_count: Number(row?.execution_view_count ?? 0),
        launch_packet_view_count: Number(row?.launch_packet_view_count ?? 0),
      };
    },

    async getWorkspaceBehaviorSummary(workspaceId: string, options?: StoreOptions) {
      const database = await deps.getDatabase(options);
      const [workspaceEvents, documentEvents] = await Promise.all([
        database.query<{
          member_added_count: string;
          plan_changed_count: string;
          assist_preference_count: string;
        }>(
          `SELECT
            COUNT(*) FILTER (WHERE event_type = 'workspace.member_added')::text AS member_added_count,
            COUNT(*) FILTER (WHERE event_type = 'workspace.plan_changed')::text AS plan_changed_count,
            COUNT(*) FILTER (WHERE event_type = 'workspace.assist_preference_saved')::text AS assist_preference_count
          FROM audit_events
          WHERE payload_json ->> 'workspace_id' = $1`,
          [workspaceId],
        ),
        database.query<{
          document_created_count: string;
          patch_decided_count: string;
          clarification_answered_count: string;
        }>(
          `SELECT
            COUNT(*) FILTER (WHERE ae.event_type = 'document.created')::text AS document_created_count,
            COUNT(*) FILTER (WHERE ae.event_type = 'patch.decided')::text AS patch_decided_count,
            COUNT(*) FILTER (WHERE ae.event_type = 'clarification.answered')::text AS clarification_answered_count
          FROM audit_events ae
          INNER JOIN documents d ON d.document_id = ae.document_id
          WHERE d.workspace_id = $1`,
          [workspaceId],
        ),
      ]);

      return {
        workspace_id: workspaceId,
        document_created_count: Number(documentEvents.rows[0]?.document_created_count ?? 0),
        member_added_count: Number(workspaceEvents.rows[0]?.member_added_count ?? 0),
        plan_changed_count: Number(workspaceEvents.rows[0]?.plan_changed_count ?? 0),
        assist_preference_count: Number(workspaceEvents.rows[0]?.assist_preference_count ?? 0),
        patch_decided_count: Number(documentEvents.rows[0]?.patch_decided_count ?? 0),
        clarification_answered_count: Number(
          documentEvents.rows[0]?.clarification_answered_count ?? 0,
        ),
      };
    },

    async upsertUserFromGitHub(
      input: {
        github_id: string;
        github_login: string;
        email?: string;
        display_name: string;
        avatar_url?: string;
      },
      options?: StoreOptions,
    ): Promise<UserRecord> {
      const database = await deps.getDatabase(options);
      const { dbPath } = deps.resolveOptions(options);
      const now = new Date().toISOString();

      const existing = await database.query<UserRow>(
        `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
        FROM users
        WHERE github_id = $1
        LIMIT 1`,
        [input.github_id],
      );

      if (existing.rows.length > 0) {
        await database.query(
          `UPDATE users
          SET github_login = $2, email = $3, display_name = $4, avatar_url = $5, updated_at = $6
          WHERE github_id = $1`,
          [
            input.github_id,
            input.github_login,
            input.email ?? null,
            input.display_name,
            input.avatar_url ?? null,
            now,
          ],
        );
        await deps.persistSnapshot(database, dbPath);
        const updated = await database.query<UserRow>(
          `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
          FROM users WHERE github_id = $1 LIMIT 1`,
          [input.github_id],
        );
        return mapUserRow(updated.rows[0]!);
      }

      const userId = `user_${randomUUID()}`;
      await database.query(
        `INSERT INTO users (user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, input.github_id, input.github_login, input.email ?? null, input.display_name, input.avatar_url ?? null, now, now],
      );
      await deps.persistSnapshot(database, dbPath);

      return {
        user_id: userId,
        github_id: input.github_id,
        github_login: input.github_login,
        email: input.email,
        display_name: input.display_name,
        avatar_url: input.avatar_url,
        created_at: now,
        updated_at: now,
      };
    },

    async getUserByGitHubLogin(
      githubLogin: string,
      options?: StoreOptions,
    ): Promise<UserRecord | null> {
      const database = await deps.getDatabase(options);
      const result = await database.query<UserRow>(
        `SELECT user_id, github_id, github_login, email, display_name, avatar_url, created_at, updated_at
        FROM users WHERE github_login = $1 LIMIT 1`,
        [githubLogin],
      );
      return result.rows[0] ? mapUserRow(result.rows[0]) : null;
    },

    async getWorkspaceMembershipForUser(
      githubLogin: string,
      workspaceId: string,
      options?: StoreOptions,
    ): Promise<WorkspaceMembershipRecord | null> {
      const database = await deps.getDatabase(options);
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
    },

    async listUserWorkspaces(
      githubLogin: string,
      options?: StoreOptions,
    ): Promise<WorkspaceRecord[]> {
      const database = await deps.getDatabase(options);
      const result = await database.query<WorkspaceRow>(
        `SELECT DISTINCT w.workspace_id, w.name, w.plan, w.created_at
        FROM workspaces w
        INNER JOIN workspace_members wm ON w.workspace_id = wm.workspace_id
        WHERE wm.github_login = $1
        ORDER BY w.created_at ASC`,
        [githubLogin],
      );
      return result.rows.map(mapWorkspaceRow);
    },
  };
}
