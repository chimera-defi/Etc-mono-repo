import { randomUUID } from "node:crypto";

import {
  PLAN_STAGE_NAMES,
  type PlanSession,
  type PlanStage,
  type PlanStageName,
  type PlanStageAdvanceInput,
  type PlanStageSkipInput,
} from "./contracts";
import { getDatabase } from "./db";
import { createPatchProposal, getDocument } from "./store";
import { deriveDocumentShape } from "./markdown";

// ---------------------------------------------------------------------------
// Stage definitions — structured questions + output mapping per stage
// ---------------------------------------------------------------------------

type StageDefinition = {
  name: PlanStageName;
  label: string;
  description: string;
  questions: Array<{ key: string; prompt: string }>;
  /** Returns the patch content (markdown) to propose when the stage completes */
  buildPatchContent: (answers: Record<string, string>) => string;
  /** Block/section hints for where the patch should land */
  targetHint: string;
};

const STAGE_DEFINITIONS: Record<PlanStageName, StageDefinition> = {
  discovery: {
    name: "discovery",
    label: "Discovery",
    description: "Problem framing, user segments, and success signals",
    questions: [
      { key: "problem", prompt: "What specific problem does this product solve? Be concrete about the pain." },
      { key: "users", prompt: "Who are the 1-3 primary user segments? What is their job-to-be-done?" },
      { key: "success_signals", prompt: "How will you know the product succeeded in 6 months? List 2-3 measurable signals." },
      { key: "anti_problems", prompt: "What adjacent problems are explicitly NOT in scope?" },
    ],
    buildPatchContent: (answers) => [
      "## Problem",
      "",
      answers.problem ?? "",
      "",
      "### User Segments",
      "",
      answers.users ?? "",
      "",
      "### Success Signals",
      "",
      answers.success_signals ?? "",
      "",
      "### Out of Scope",
      "",
      answers.anti_problems ?? "",
    ].join("\n"),
    targetHint: "problem",
  },
  "ceo-review": {
    name: "ceo-review",
    label: "CEO Review",
    description: "10-star product vision, scope hardening, and anti-goals",
    questions: [
      { key: "vision", prompt: "If this product were a 10/10 experience — what would users say about it? Write the 10-star review." },
      { key: "scope_hardening", prompt: "What must be true for v1 to ship? List the 3 non-negotiable scope items." },
      { key: "anti_goals", prompt: "What are we explicitly NOT building? List 3-5 anti-goals to guard the team." },
      { key: "competitive_insight", prompt: "What does this product do that no existing solution does well?" },
    ],
    buildPatchContent: (answers) => [
      "## Vision",
      "",
      answers.vision ?? "",
      "",
      "### Scope (v1 Non-Negotiables)",
      "",
      answers.scope_hardening ?? "",
      "",
      "### Non-Goals",
      "",
      answers.anti_goals ?? "",
      "",
      "### Competitive Differentiation",
      "",
      answers.competitive_insight ?? "",
    ].join("\n"),
    targetHint: "vision",
  },
  "eng-review": {
    name: "eng-review",
    label: "Engineering Review",
    description: "Architecture decisions, data flow, tech stack, and failure modes",
    questions: [
      { key: "architecture", prompt: "Describe the high-level architecture in 3-5 sentences. What are the main components?" },
      { key: "data_flow", prompt: "Walk through the critical data flow for the primary user action." },
      { key: "tech_stack", prompt: "What is the proposed tech stack and why? Call out any non-obvious choices." },
      { key: "failure_modes", prompt: "What are the top 3 failure modes and how will the system handle each?" },
      { key: "test_matrix", prompt: "What are the must-have test scenarios? List 3-5 acceptance criteria." },
    ],
    buildPatchContent: (answers) => [
      "## Architecture",
      "",
      answers.architecture ?? "",
      "",
      "### Data Flow",
      "",
      answers.data_flow ?? "",
      "",
      "### Tech Stack",
      "",
      answers.tech_stack ?? "",
      "",
      "### Failure Modes",
      "",
      answers.failure_modes ?? "",
      "",
      "### Test Matrix",
      "",
      answers.test_matrix ?? "",
    ].join("\n"),
    targetHint: "architecture",
  },
  "design-review": {
    name: "design-review",
    label: "Design Review",
    description: "Design system constraints, interaction model, and accessibility decisions",
    questions: [
      { key: "design_principles", prompt: "What are the 2-3 core design principles for this product?" },
      { key: "interaction_model", prompt: "Describe the primary interaction pattern. How does the user move through the core flow?" },
      { key: "accessibility", prompt: "What accessibility requirements apply? (WCAG level, keyboard nav, screen reader support)" },
      { key: "design_constraints", prompt: "What existing design system, brand, or platform constraints must be respected?" },
    ],
    buildPatchContent: (answers) => [
      "## Design System",
      "",
      "### Principles",
      "",
      answers.design_principles ?? "",
      "",
      "### Interaction Model",
      "",
      answers.interaction_model ?? "",
      "",
      "### Accessibility",
      "",
      answers.accessibility ?? "",
      "",
      "### Constraints",
      "",
      answers.design_constraints ?? "",
    ].join("\n"),
    targetHint: "design",
  },
  "security-review": {
    name: "security-review",
    label: "Security Review",
    description: "OWASP threat model, trust boundaries, and security requirements",
    questions: [
      { key: "trust_boundaries", prompt: "Where are the trust boundaries? What data crosses them?" },
      { key: "threat_model", prompt: "List the top 3 threats (OWASP-aligned) relevant to this product." },
      { key: "auth_model", prompt: "Describe the authentication and authorization model." },
      { key: "sensitive_data", prompt: "What sensitive data is stored or processed? How is it protected?" },
      { key: "security_requirements", prompt: "List 3-5 non-functional security requirements (e.g., rate limiting, audit logging)." },
    ],
    buildPatchContent: (answers) => [
      "## Security",
      "",
      "### Trust Boundaries",
      "",
      answers.trust_boundaries ?? "",
      "",
      "### Threat Model",
      "",
      answers.threat_model ?? "",
      "",
      "### Auth Model",
      "",
      answers.auth_model ?? "",
      "",
      "### Sensitive Data",
      "",
      answers.sensitive_data ?? "",
      "",
      "### Security Requirements",
      "",
      answers.security_requirements ?? "",
    ].join("\n"),
    targetHint: "security",
  },
};

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

type PlanSessionRow = {
  session_id: string;
  document_id: string;
  workspace_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type PlanStageRow = {
  stage_id: string;
  session_id: string;
  document_id: string;
  name: string;
  status: string;
  patch_id: string | null;
  outputs_json: Record<string, unknown> | null;
  answers_json: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createPlanSession(
  documentId: string,
  workspaceId: string,
): Promise<PlanSession> {
  const db = await getDatabase({ workspaceId });
  const now = new Date().toISOString();
  const sessionId = `psession_${randomUUID()}`;

  await db.query(
    `INSERT INTO plan_sessions (session_id, document_id, workspace_id, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, documentId, workspaceId, "active", now, now],
  );

  // Pre-create all stage rows as 'pending'
  for (const name of PLAN_STAGE_NAMES) {
    const stageId = `pstage_${randomUUID()}`;
    await db.query(
      `INSERT INTO plan_stages (stage_id, session_id, document_id, name, status, patch_id, outputs_json, answers_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, $6, $7)`,
      [stageId, sessionId, documentId, name, "pending", now, now],
    );
  }

  return getPlanSession(sessionId, workspaceId);
}

export async function getPlanSession(
  sessionId: string,
  workspaceId: string,
): Promise<PlanSession> {
  const db = await getDatabase({ workspaceId });

  const { rows: sessionRows } = await db.query<PlanSessionRow>(
    `SELECT * FROM plan_sessions WHERE session_id = $1`,
    [sessionId],
  );
  const session = sessionRows[0];
  if (!session) throw new Error(`Plan session not found: ${sessionId}`);

  const { rows: stageRows } = await db.query<PlanStageRow>(
    `SELECT * FROM plan_stages WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId],
  );

  return assembleSession(session, stageRows);
}

export async function listPlanSessions(
  documentId: string,
  workspaceId: string,
): Promise<PlanSession[]> {
  const db = await getDatabase({ workspaceId });

  const { rows: sessionRows } = await db.query<PlanSessionRow>(
    `SELECT * FROM plan_sessions WHERE document_id = $1 ORDER BY created_at DESC`,
    [documentId],
  );

  const sessions: PlanSession[] = [];
  for (const row of sessionRows) {
    const { rows: stageRows } = await db.query<PlanStageRow>(
      `SELECT * FROM plan_stages WHERE session_id = $1 ORDER BY created_at ASC`,
      [row.session_id],
    );
    sessions.push(assembleSession(row, stageRows));
  }

  return sessions;
}

export async function advancePlanSession(
  sessionId: string,
  input: PlanStageAdvanceInput,
  workspaceId: string,
): Promise<{ session: PlanSession; patchId: string | null }> {
  const db = await getDatabase({ workspaceId });
  const session = await getPlanSession(sessionId, workspaceId);
  const now = new Date().toISOString();

  const stageRow = await db.query<PlanStageRow>(
    `SELECT * FROM plan_stages WHERE session_id = $1 AND name = $2`,
    [sessionId, input.stage_name],
  );
  const stage = stageRow.rows[0];
  if (!stage) throw new Error(`Stage not found: ${input.stage_name}`);
  if (stage.status === "completed") throw new Error(`Stage already completed: ${input.stage_name}`);

  const def = STAGE_DEFINITIONS[input.stage_name];
  const patchContent = def.buildPatchContent(input.answers);

  // Find a suitable block_id and fingerprint in the document to target
  const document = await getDocument(session.document_id, { workspaceId });
  if (!document) throw new Error(`Document not found: ${session.document_id}`);
  const { blocks } = deriveDocumentShape(document.markdown);

  // Find a block whose heading loosely matches the target hint, or fall back to the first block
  const targetBlock =
    blocks.find((b) => b.heading.toLowerCase().includes(def.targetHint)) ?? blocks[0];

  let patchId: string | null = null;

  if (targetBlock) {
    const patch = await createPatchProposal(
      {
        document_id: session.document_id,
        block_id: targetBlock.block_id,
        section_id: targetBlock.section_id,
        operation: "replace",
        content: patchContent,
        patch_type: "structural_edit",
        rationale: `Planning stage: ${def.label}`,
        proposed_by: {
          actor_type: input.actor_type,
          actor_id: input.actor_id,
        },
        base_version: document.version,
        target_fingerprint: targetBlock.target_fingerprint,
        confidence: 0.85,
      },
      { workspaceId },
    );
    patchId = patch.patch_id;
  }

  const outputs = def.questions.reduce<Record<string, string>>((acc, q) => {
    acc[q.key] = input.answers[q.key] ?? "";
    return acc;
  }, {});

  await db.query(
    `UPDATE plan_stages
     SET status = 'completed', patch_id = $1, outputs_json = $2::jsonb, answers_json = $3::jsonb, updated_at = $4
     WHERE session_id = $5 AND name = $6`,
    [
      patchId,
      JSON.stringify(outputs),
      JSON.stringify(input.answers),
      now,
      sessionId,
      input.stage_name,
    ],
  );

  await db.query(
    `UPDATE plan_sessions SET updated_at = $1 WHERE session_id = $2`,
    [now, sessionId],
  );

  const updated = await getPlanSession(sessionId, workspaceId);
  return { session: updated, patchId };
}

export async function skipPlanStage(
  sessionId: string,
  input: PlanStageSkipInput,
  workspaceId: string,
): Promise<PlanSession> {
  const db = await getDatabase({ workspaceId });
  const now = new Date().toISOString();

  await db.query(
    `UPDATE plan_stages SET status = 'skipped', updated_at = $1
     WHERE session_id = $2 AND name = $3`,
    [now, sessionId, input.stage_name],
  );

  await db.query(
    `UPDATE plan_sessions SET updated_at = $1 WHERE session_id = $2`,
    [now, sessionId],
  );

  return getPlanSession(sessionId, workspaceId);
}

export function getStageDefinition(name: PlanStageName): StageDefinition {
  return STAGE_DEFINITIONS[name];
}

export function getAllStageDefinitions(): StageDefinition[] {
  return PLAN_STAGE_NAMES.map((n) => STAGE_DEFINITIONS[n]);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function assembleSession(
  session: PlanSessionRow,
  stageRows: PlanStageRow[],
): PlanSession {
  const stages: PlanStage[] = PLAN_STAGE_NAMES.map((name) => {
    const row = stageRows.find((r) => r.name === name);
    if (row) {
      return {
        stage_id: row.stage_id,
        session_id: row.session_id,
        document_id: row.document_id,
        name: name as PlanStageName,
        status: row.status as PlanStage["status"],
        patch_id: row.patch_id,
        outputs: row.outputs_json ?? null,
        answers: row.answers_json ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    // Should not happen (stages are pre-created), but provide a safe fallback
    const now = new Date().toISOString();
    return {
      stage_id: "",
      session_id: session.session_id,
      document_id: session.document_id,
      name: name as PlanStageName,
      status: "pending" as const,
      patch_id: null,
      outputs: null,
      answers: null,
      created_at: now,
      updated_at: now,
    };
  });

  return {
    session_id: session.session_id,
    document_id: session.document_id,
    workspace_id: session.workspace_id,
    status: session.status as PlanSession["status"],
    stages,
    created_at: session.created_at,
    updated_at: session.updated_at,
  };
}
