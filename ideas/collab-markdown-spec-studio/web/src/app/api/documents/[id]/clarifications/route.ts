/**
 * Clarification API Routes
 *
 * GET  /documents/:id/clarifications — List all clarifications (answered + unanswered)
 * POST /documents/:id/clarifications — Create a new clarification question
 */

import { z } from "zod";

import { success, error } from "@/lib/specforge/api-response";
import {
  listClarifications,
  createClarification,
  answerClarification,
} from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

const createClarificationBodySchema = z.object({
  question: z.string().min(1).max(500),
  section_ref: z.string().min(1),
  priority: z.enum(["critical", "normal", "optional"]).default("normal"),
});

const answerClarificationBodySchema = z.object({
  answer: z.string().min(1).max(2000),
});

/**
 * GET /documents/:id/clarifications
 * Returns all clarifications for a document, both answered and unanswered.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { workspaceId } = await getCurrentWorkspaceAccess();
    const clarifications = await listClarifications(id, { workspaceId });

    return success({ clarifications, count: clarifications.length });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CLARIFICATION_LIST_FAILED",
      500,
    );
  }
}

/**
 * POST /documents/:id/clarifications
 * Create a new clarification question.
 *
 * Body: { question, section_ref, priority? }
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { actor } = await getCurrentWorkspaceAccess();
    const body = await request.json();
    const parsed = createClarificationBodySchema.parse(body);

    const clarification = await createClarification({
      document_id: id,
      section_heading: parsed.section_ref,
      question: parsed.question,
      priority: parsed.priority,
      created_by: {
        actor_type: actor.actor_type,
        actor_id: actor.actor_id,
      },
    });

    return success({ clarification }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(
        `Validation failed: ${err.issues.map((e) => e.message).join(", ")}`,
        "VALIDATION_FAILED",
      );
    }
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CLARIFICATION_CREATE_FAILED",
      500,
    );
  }
}

/**
 * PATCH /documents/:id/clarifications
 * Answer a clarification.
 *
 * Body: { answer }
 * Query: ?clarification_id=...
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { actor } = await getCurrentWorkspaceAccess();
    const url = new URL(request.url);
    const clarificationId = url.searchParams.get("clarification_id");

    if (!clarificationId) {
      return error(
        "clarification_id query parameter is required",
        "MISSING_CLARIFICATION_ID",
      );
    }

    const body = await request.json();
    const parsed = answerClarificationBodySchema.parse(body);

    const result = await answerClarification({
      document_id: id,
      clarification_id: clarificationId,
      answer: parsed.answer,
      answered_by: {
        actor_type: actor.actor_type,
        actor_id: actor.actor_id,
      },
    });

    return success({
      clarification: result.clarification,
      document: {
        document_id: result.document.document_id,
        version: result.document.version,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(
        `Validation failed: ${err.issues.map((e) => e.message).join(", ")}`,
        "VALIDATION_FAILED",
      );
    }
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "CLARIFICATION_ANSWER_FAILED",
      500,
    );
  }
}
