/**
 * Spec Job Review Decision Route
 *
 * POST /api/service/spec-jobs/:jobId/review-decision
 *
 * For assisted-mode governance: apply patch decisions and advance the job.
 */

import { z } from "zod";

import { success, error } from "@/lib/specforge/api-response";
import { getSpecJob, updateSpecJob } from "@/lib/specforge/spec-jobs";
import { decidePatch, listPatches } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ jobId: string }>;
};

const reviewDecisionSchema = z.object({
  decisions: z.array(
    z.object({
      patch_id: z.string().min(1),
      action: z.enum(["accept", "reject", "cherry_pick"]),
      resolved_content: z.string().optional(),
    }),
  ),
});

export async function POST(request: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    await getCurrentWorkspaceAccess();
    const job = await getSpecJob(jobId);

    if (!job) {
      return error("Job not found", "JOB_NOT_FOUND", 404);
    }

    if (!job.document_id) {
      return error(
        "Job has no associated document",
        "NO_DOCUMENT",
        400,
      );
    }

    const body = await request.json();
    const parsed = reviewDecisionSchema.parse(body);
    const storeOptions = { workspaceId: job.workspace_id };

    let applied = 0;
    for (const decision of parsed.decisions) {
      try {
        await decidePatch(
          {
            document_id: job.document_id,
            patch_id: decision.patch_id,
            decision: decision.action,
            resolved_content: decision.resolved_content,
            decided_by: {
              actor_type: "human",
              actor_id: "service_reviewer",
            },
          },
          storeOptions,
        );
        applied++;
      } catch {
        // Skip patches that are already resolved or not found
      }
    }

    // Check remaining pending patches
    const patches = await listPatches(job.document_id, storeOptions);
    const pendingPatches = patches.filter((p) =>
      ["proposed", "stale"].includes(p.status),
    );

    // If no pending patches remain, mark job as completed
    if (pendingPatches.length === 0) {
      await updateSpecJob(jobId, { status: "completed" });
    }

    const updatedJob = await getSpecJob(jobId);

    return success({
      job: updatedJob,
      applied,
      pending_patches: pendingPatches.length,
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
      "REVIEW_DECISION_FAILED",
      500,
    );
  }
}
