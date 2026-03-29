import type {
  AuditEventRecord,
  StoreOptions,
  WorkspaceActivityMetrics,
  WorkspaceUsageSummary,
} from "./store";
import {
  getDatabase,
  _resolveOptions as resolveOptions,
  _insertAuditEvent as insertAuditEvent,
  _persistSnapshot as persistSnapshot,
} from "./store";

type AuditEventRow = {
  event_id: string;
  document_id: string | null;
  patch_id: string | null;
  event_type: string;
  actor_type: "human" | "agent" | "system";
  actor_id: string;
  payload_json: Record<string, unknown> | string | null;
  created_at: string;
};

function mapAuditEventRow(row: AuditEventRow): AuditEventRecord {
  const rawPayload = row.payload_json;
  let payload: Record<string, unknown> = {};
  if (typeof rawPayload === "string") {
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      payload = {};
    }
  } else if (rawPayload && typeof rawPayload === "object") {
    payload = rawPayload;
  }

  return {
    event_id: row.event_id,
    document_id: row.document_id ?? undefined,
    patch_id: row.patch_id ?? undefined,
    event_type: row.event_type,
    actor_type: row.actor_type,
    actor_id: row.actor_id,
    payload,
    created_at: row.created_at,
  };
}

export async function getWorkspaceActivityMetrics(
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceActivityMetrics> {
  const database = await getDatabase(options);
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
}

export async function recordWorkspaceEvent(
  input: {
    workspace_id: string;
    event_type: string;
    actor_type: "human" | "agent" | "system";
    actor_id: string;
    payload?: Record<string, unknown>;
  },
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const { dbPath } = resolveOptions(options);
  await insertAuditEvent(database, {
    event_type: input.event_type,
    actor_type: input.actor_type,
    actor_id: input.actor_id,
    payload: {
      workspace_id: input.workspace_id,
      ...(input.payload ?? {}),
    },
  });
  await persistSnapshot(database, dbPath);
}

export async function getWorkspaceUsageSummary(
  workspaceId: string,
  options?: StoreOptions,
): Promise<WorkspaceUsageSummary> {
  const database = await getDatabase(options);
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
    WHERE document_id IS NULL
      AND payload_json->>'workspace_id' = $1`,
    [workspaceId],
  );

  return {
    workspace_id: workspaceId,
    assist_request_count: Number(result.rows[0]?.assist_request_count ?? 0),
    handoff_view_count: Number(result.rows[0]?.handoff_view_count ?? 0),
    execution_view_count: Number(result.rows[0]?.execution_view_count ?? 0),
    launch_packet_view_count: Number(result.rows[0]?.launch_packet_view_count ?? 0),
  };
}

export async function listAuditEvents(documentId: string, options?: StoreOptions) {
  const database = await getDatabase(options);
  const result = await database.query<AuditEventRow>(
    `SELECT
      event_id,
      document_id,
      patch_id,
      event_type,
      actor_type,
      actor_id,
      payload_json,
      created_at
    FROM audit_events
    WHERE document_id = $1
    ORDER BY created_at DESC
    LIMIT 20`,
    [documentId],
  );

  return result.rows.map(mapAuditEventRow);
}

export async function getWorkspaceBehaviorSummary(
  workspaceId: string,
  options?: StoreOptions,
) {
  const database = await getDatabase(options);
  const [workspaceEvents, documentEvents] = await Promise.all([
    database.query<{
      member_added_count: string;
      member_role_changed_count: string;
      plan_changed_count: string;
      assist_preference_count: string;
    }>(
      `SELECT
        COUNT(*) FILTER (WHERE event_type = 'workspace.member_added')::text AS member_added_count,
        COUNT(*) FILTER (WHERE event_type = 'workspace.member_role_changed')::text AS member_role_changed_count,
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
    member_role_changed_count: Number(
      workspaceEvents.rows[0]?.member_role_changed_count ?? 0,
    ),
    plan_changed_count: Number(workspaceEvents.rows[0]?.plan_changed_count ?? 0),
    assist_preference_count: Number(workspaceEvents.rows[0]?.assist_preference_count ?? 0),
    patch_decided_count: Number(documentEvents.rows[0]?.patch_decided_count ?? 0),
    clarification_answered_count: Number(
      documentEvents.rows[0]?.clarification_answered_count ?? 0,
    ),
  };
}
