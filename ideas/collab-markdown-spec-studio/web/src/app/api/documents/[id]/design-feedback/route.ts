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
 * Parse design feedback into structured markdown edits for the UX Pack section.
 *
 * Strategies:
 * 1. "should be X" / "needs to be X" → produce "- [item]: X" style line
 * 2. "add X" → append "- [X]" to the current content
 * 3. "remove X" / "don't X" → annotate the matching line with a strikethrough note
 * 4. Otherwise → append as a design note blockquote
 *
 * Always produces valid markdown that fits into the UX Pack section.
 */
function buildDesignFeedbackPatch(
  feedback: string,
  section: string,
  currentContent: string,
): string {
  const lines = currentContent.split("\n");

  // Pattern: "X should be Y" or "X needs to be Y"
  const shouldBeMatch = feedback.match(/(.+?)\s+(?:should|needs?\s+to)\s+be\s+(.+)/i);
  if (shouldBeMatch) {
    const [, item, value] = shouldBeMatch;
    const trimmedItem = (item ?? "").trim().replace(/^the\s+/i, "");
    const trimmedValue = (value ?? "").trim().replace(/[.!]+$/, "");
    return [
      ...lines,
      "",
      `- **${trimmedItem}**: ${trimmedValue}`,
    ].join("\n");
  }

  // Pattern: "add X" or "include X" or "we need X"
  const addMatch = feedback.match(/^(?:add|include|we\s+need|insert)\s+(.+)/i);
  if (addMatch) {
    const item = (addMatch[1] ?? "").trim().replace(/[.!]+$/, "");
    return [
      ...lines,
      `- ${item}`,
    ].join("\n");
  }

  // Pattern: "remove X" or "don't X" or "drop X"
  const removeMatch = feedback.match(/^(?:remove|don'?t|drop|eliminate|cut)\s+(.+)/i);
  if (removeMatch) {
    const target = (removeMatch[1] ?? "").toLowerCase().trim();
    const targetTerms = target.split(/\s+/).filter((t) => t.length > 2);
    const updated = lines.map((line) => {
      const lineLower = line.toLowerCase();
      const matchCount = targetTerms.filter((t) => lineLower.includes(t)).length;
      if (targetTerms.length > 0 && matchCount >= targetTerms.length * 0.5) {
        return `${line} *(flagged for removal by design review)*`;
      }
      return line;
    });
    return updated.join("\n");
  }

  // Default: append as a structured design note
  return [
    ...lines,
    "",
    `> **Design note** (${section}): ${feedback.trim()}`,
  ].join("\n");
}

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

    const patchContent = buildDesignFeedbackPatch(
      parsed.feedback,
      parsed.section,
      targetBlock.content,
    );

    const patch = await createPatchProposal(
      {
        document_id: id,
        block_id: targetBlock.block_id,
        section_id: uxPackSection?.section_id,
        operation: "replace",
        content: patchContent,
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
