# SpecForge API Reference

## Authentication

**Local development:** No authentication required. Session defaults to the first workspace.

**Pilot deployment:** Requests must include a valid GitHub OAuth session cookie from `/api/auth/login`. Access is enforced at the workspace level; a request can only access documents and jobs in workspaces the authenticated user is a member of.

**Service mode:** External agents can submit spec jobs using the service API. In local dev, no auth is required. In production, agents use workspace-scoped API keys or OAuth tokens.

## Service API — `/api/service/spec-jobs`

### POST /api/service/spec-jobs

Submit a brief and create a new spec job. Returns immediately with job status and document ID.

**Request:**
```json
{
  "brief": "A real-time collaborative spec editor",
  "mode": "assisted",
  "constraints": {
    "framework": "Next.js",
    "language": "TypeScript"
  },
  "workspaceId": "ws_123"
}
```

**Fields:**
- `brief` (string, required): Rough description of the software to be specified (1–5000 chars)
- `mode` (string, optional, default: `"assisted"`): Either `"assisted"` (job waits for human patch review) or `"autonomous"` (SpecForge runs the full spec loop unattended)
- `constraints` (object, optional): Key-value pairs passed to the spec generation agent
- `workspaceId` (string, optional): Target workspace ID. Defaults to the session's active workspace.

**Response (201 Created):**
```json
{
  "job": {
    "job_id": "sj_abc123",
    "workspace_id": "ws_123",
    "document_id": "doc_def456",
    "mode": "assisted",
    "status": "queued",
    "brief": "A real-time collaborative spec editor",
    "constraints": {},
    "created_at": "2025-02-01T12:34:56Z",
    "retry_count": 0
  },
  "document_id": "doc_def456",
  "status": "queued"
}
```

**Job statuses:**
- `queued` — Job created, awaiting processing (assisted mode) or human review
- `running` — Active spec generation pass underway
- `completed` — Spec generated successfully; artifacts ready
- `blocked` — Generation stalled on an error or governance gate; human review required
- `failed` — Spec generation failed permanently; may be retried

---

### GET /api/service/spec-jobs

List all spec jobs in the current workspace.

**Query parameters:** None

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "job_id": "sj_abc123",
      "workspace_id": "ws_123",
      "document_id": "doc_def456",
      "mode": "assisted",
      "status": "completed",
      "brief": "...",
      "created_at": "2025-02-01T12:34:56Z",
      "retry_count": 0
    }
  ],
  "count": 1
}
```

---

### GET /api/service/spec-jobs/:jobId

Fetch the status and metadata of a specific job.

**Path parameters:**
- `jobId` (string, required): Job ID (e.g., `sj_abc123`)

**Response (200 OK):**
```json
{
  "job": {
    "job_id": "sj_abc123",
    "workspace_id": "ws_123",
    "document_id": "doc_def456",
    "mode": "autonomous",
    "status": "completed",
    "brief": "A real-time collaborative spec editor",
    "constraints": {},
    "blocker": null,
    "artifacts": {
      "document_id": "doc_def456",
      "generated_at": "2025-02-01T12:35:00Z"
    },
    "created_at": "2025-02-01T12:34:56Z",
    "retry_count": 0
  }
}
```

**Error responses:**
- `404 Not Found` — Job does not exist or user lacks workspace access

---

### GET /api/service/spec-jobs/:jobId/artifacts

Fetch the full artifact bundle for a completed or in-progress job.

**Path parameters:**
- `jobId` (string, required): Job ID

**Response (200 OK):**
```json
{
  "job": { /* same as GET /:jobId */ },
  "artifacts": {
    "export_bundle": {
      "title": "A Real-Time Collaborative Spec Editor",
      "description": "...",
      "sections": [
        {
          "section_id": "sec_1",
          "title": "Overview",
          "markdown": "..."
        }
      ]
    },
    "starter_bundle": {
      "template": "typescript-next-app",
      "files": [
        {
          "path": "package.json",
          "content": "..."
        }
      ]
    },
    "execution_brief": {
      "spec_summary": "...",
      "tasks": [
        {
          "task_id": "t_1",
          "title": "Implement editor core",
          "description": "..."
        }
      ]
    },
    "readiness": {
      "score": 0.85,
      "total_sections": 8,
      "complete_sections": 7,
      "missing_sections": ["Testing"],
      "warnings": []
    }
  }
}
```

**Contents:**
- `export_bundle` — Canonical spec document exported as structured sections
- `starter_bundle` — Minimum viable starter template (files, package.json, environment setup)
- `execution_brief` — Spec summary + task list for agent execution
- `readiness` — Depth and completeness scoring

**Error responses:**
- `404 Not Found` — Job or document not found
- `400 Bad Request` — Job has no associated document yet

---

### POST /api/service/spec-jobs/:jobId/review-decision

Apply governance decisions to patches in an assisted-mode job. Accept, reject, or cherry-pick pending patch proposals.

**Path parameters:**
- `jobId` (string, required): Job ID

**Request:**
```json
{
  "decisions": [
    {
      "patch_id": "p_xyz789",
      "action": "accept",
      "resolved_content": null
    },
    {
      "patch_id": "p_xyz790",
      "action": "reject",
      "resolved_content": null
    },
    {
      "patch_id": "p_xyz791",
      "action": "cherry_pick",
      "resolved_content": "Custom edited content"
    }
  ]
}
```

**Fields:**
- `decisions` (array, required): List of patch decisions
  - `patch_id` (string, required): Patch ID to decide on
  - `action` (string, required): One of `"accept"`, `"reject"`, or `"cherry_pick"`
  - `resolved_content` (string, optional): Custom content for cherry-pick; ignored for accept/reject

**Response (200 OK):**
```json
{
  "job": { /* updated job */ },
  "applied": 3,
  "pending_patches": 0
}
```

**Behavior:**
- If all pending patches are resolved, the job status is automatically advanced to `completed`
- Patches with status `proposed` or `stale` can be decided upon

**Error responses:**
- `404 Not Found` — Job not found
- `400 Bad Request` — Job has no associated document
- `400 Validation error` — Invalid decision structure

---

### POST /api/service/spec-jobs/:jobId/retry

Retry a job that is in `blocked` or `failed` status. Reruns the autonomous spec pass.

**Path parameters:**
- `jobId` (string, required): Job ID

**Request (optional):**
```json
{
  "constraints": {
    "focus": "backend-first"
  }
}
```

**Fields:**
- `constraints` (object, optional): Merged with existing job constraints before retry

**Response (200 OK):**
```json
{
  "job": {
    "job_id": "sj_abc123",
    "status": "running",
    "retry_count": 1,
    "blocker": null,
    "artifacts": { /* updated artifacts */ }
  }
}
```

**Behavior:**
- Increments the job's `retry_count`
- Clears the `blocker` field
- Sets status to `running`, then updates to `completed` or `blocked` based on the pass result
- Only jobs with status `blocked` or `failed` can be retried

**Error responses:**
- `404 Not Found` — Job not found
- `400 Invalid Status` — Job is not in a retriable state (e.g., `queued`, `running`, `completed`)

---

## Document API — `/api/documents`

The document API manages spec documents directly. These are the same documents created by spec jobs.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/documents` | Create a new document |
| `GET` | `/api/documents/:docId` | Fetch document metadata and markdown |
| `PATCH` | `/api/documents/:docId` | Update document markdown or metadata |
| `GET` | `/api/documents/:docId/patches` | List patches for a document |
| `GET` | `/api/documents/:docId/export` | Export canonical spec bundle |

Full document API reference is documented in the spec store (`lib/specforge/store.ts`).

---

## Clarification API

Clarifications are structured Q&A pairs anchored to specific sections of the spec. They are part of the depth-gate mechanism.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/documents/:docId/clarifications` | List all clarifications for a document |
| `POST` | `/api/documents/:docId/clarifications` | Create a new clarification |
| `PATCH` | `/api/documents/:docId/clarifications/:clarId` | Answer or resolve a clarification |

---

## Job Status Values

| Status | Meaning | Next action |
|--------|---------|-------------|
| `queued` | Job created, waiting to be processed (assisted mode) or for human review | Submit patch decisions via `/review-decision` |
| `running` | Spec generation is active | Wait for completion or check status |
| `completed` | Spec generated successfully; artifacts are ready | Fetch artifacts via `/artifacts` |
| `blocked` | Generation hit an error or governance gate | Review blocker message; fix and retry via `/retry` |
| `failed` | Generation failed permanently | Retry via `/retry` with updated constraints |

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "message": "Validation failed: brief must be at least 1 character",
    "code": "VALIDATION_FAILED"
  }
}
```

**Common error codes:**
- `VALIDATION_FAILED` — Request body did not pass schema validation
- `JOB_NOT_FOUND` — Job ID does not exist
- `DOCUMENT_NOT_FOUND` — Document does not exist
- `NO_DOCUMENT` — Job was not yet assigned a document
- `SPEC_JOB_CREATE_FAILED` — Failed to create job
- `SPEC_JOB_GET_FAILED` — Failed to fetch job
- `SPEC_JOB_ARTIFACTS_FAILED` — Failed to build artifacts
- `REVIEW_DECISION_FAILED` — Failed to apply patch decisions
- `SPEC_JOB_RETRY_FAILED` — Failed to retry job

---

## Rate Limiting

Local development: No rate limiting.

Pilot deployment: Subject to workspace plan limits (e.g., assist quota, job concurrency).

---

## Collaboration Session Handshake

Documents edited in real-time use signed Hocuspocus room tokens. To join a collaborative session:

1. Call `POST /api/collab/session` to obtain a signed room token
2. Use the token to connect a WebSocket to `ws://localhost:4321/api/collab` with room name and token in the query

Example:
```bash
curl -X POST http://localhost:3000/api/collab/session \
  -H "Content-Type: application/json" \
  -d '{"document_id": "doc_abc", "user_id": "user_123"}'

# Response
{
  "token": "eyJ...",
  "room": "collab_doc_abc",
  "expires_at": "2025-02-01T13:34:56Z"
}
```

See `LOCAL_RUNBOOK.md` for collaboration debugging and reconnection handling.
