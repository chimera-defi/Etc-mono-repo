/**
 * Design Feedback API Route
 *
 * POST /documents/:id/design-feedback — Convert design reviewer feedback
 * into a governed patch proposal targeting the UX Pack section.
 */

import { z } from "zod";

import { success, error } from "@/lib/specforge/api-response";
import {
  getDocument,
  createPatchProposal,
  createClarification,
} from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

const designFeedbackBodySchema = z.object({
  feedback: z.string().min(1).max(2000),
  section: z
    .enum(["ux-pack", "design-system", "general"])
    .default("ux-pack"),
});

/**
 * POST /documents/:id/design-feedback
 * Accepts design reviewer feedback and converts it into a governed patch
 * proposal targeting the UX Pack block (or the first block as fallback).
 * When section is 'general', also creates a clarification record.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { actor, workspaceId } = await getCurrentWorkspaceAccess();
    const body = await request.json();
    const parsed = designFeedbackBodySchema.parse(body);

    const document = await getDocument(id, { workspaceId });

    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    // Find the UX Pack section and its first block
    const uxPackSection = document.sections.find((section) =>
      section.heading.toLowerCase().includes("ux pack"),
    );

    const targetBlock = uxPackSection
      ? document.blocks.find(
          (block) => block.section_id === uxPackSection.section_id,
        )
      : document.blocks[0];

    if (!targetBlock) {
      return error(
        "No blocks found in document to attach feedback to",
        "NO_BLOCKS_FOUND",
        422,
      );
    }

    const patch = await createPatchProposal(
      {
        document_id: id,
        block_id: targetBlock.block_id,
        section_id: uxPackSection?.section_id,
        operation: "replace",
        content: `Design feedback (${parsed.section}): ${parsed.feedback}`,
        patch_type: "design_review",
        rationale: `Design reviewer feedback targeting ${parsed.section} section`,
        proposed_by: {
          actor_type: actor.actor_type,
          actor_id: actor.actor_id,
        },
        base_version: document.version,
        target_fingerprint: targetBlock.target_fingerprint,
        confidence: 0.8,
      },
      { workspaceId },
    );

    // For general feedback, also create a clarification record
    if (parsed.section === "general") {
      await createClarification({
        document_id: id,
        section_heading: "design",
        question: parsed.feedback,
        priority: "normal",
        created_by: {
          actor_type: actor.actor_type,
          actor_id: actor.actor_id,
        },
      });
    }

    return success(
      {
        patch_id: patch.patch_id,
        message: "Design feedback queued for review",
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(
        `Validation failed: ${err.issues.map((e) => e.message).join(", ")}`,
        "VALIDATION_FAILED",
      );
    }
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "DESIGN_FEEDBACK_FAILED",
      500,
    );
  }
}
