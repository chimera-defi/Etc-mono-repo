/**
 * Spec Job Retry Route
 *
 * POST /api/service/spec-jobs/:jobId/retry — Retry a blocked/failed job
 */

import { z } from "zod";

import { success, error } from "@/lib/specforge/api-response";
import { buildHeuristicSuggestion } from "@/lib/specforge/agent-assist";
import { buildGuidedSpecMarkdown } from "@/lib/specforge/guided";
import { getSpecJob, updateSpecJob } from "@/lib/specforge/spec-jobs";
import { updateDocument } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ jobId: string }>;
};

const retrySchema = z
  .object({
    constraints: z.record(z.string(), z.unknown()).optional(),
  })
  .optional();

export async function POST(request: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    const job = await getSpecJob(jobId);

    if (!job) {
      return error("Job not found", "JOB_NOT_FOUND", 404);
    }

    if (!["blocked", "failed"].includes(job.status)) {
      return error(
        `Job is in '${job.status}' status; only blocked or failed jobs can be retried`,
        "INVALID_STATUS",
        400,
      );
    }

    let newConstraints = job.constraints;

    // Parse optional body
    try {
      const body = await request.json();
      const parsed = retrySchema.parse(body);
      if (parsed?.constraints) {
        newConstraints = {
          ...job.constraints,
          ...parsed.constraints,
        };
      }
    } catch {
      // No body or invalid JSON is acceptable for retry
    }

    // Increment retry count, clear blocker, set running
    await updateSpecJob(jobId, {
      status: "running",
      blocker: null,
      retry_count: job.retry_count + 1,
      constraints: newConstraints,
    });

    // Re-run the autonomous pass if document exists
    if (job.document_id) {
      try {
        const suggestion = buildHeuristicSuggestion(job.brief);
        const markdown = buildGuidedSpecMarkdown(suggestion.fields);

        await updateDocument(
          job.document_id,
          {
            markdown,
            title: suggestion.fields.title,
          },
          { workspaceId: job.workspace_id },
        );

        await updateSpecJob(jobId, {
          status: "completed",
          artifacts: {
            document_id: job.document_id,
            generated_at: new Date().toISOString(),
            retry_count: job.retry_count + 1,
          },
        });
      } catch (err) {
        await updateSpecJob(jobId, {
          status: "blocked",
          blocker:
            err instanceof Error ? err.message : "Retry autonomous pass failed",
        });
      }
    }

    const updatedJob = await getSpecJob(jobId);

    return success({ job: updatedJob });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(
        `Validation failed: ${err.issues.map((e) => e.message).join(", ")}`,
        "VALIDATION_FAILED",
      );
    }
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "SPEC_JOB_RETRY_FAILED",
      500,
    );
  }
}
