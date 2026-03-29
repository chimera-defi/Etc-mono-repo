/**
 * Spec Jobs Service API
 *
 * POST /api/service/spec-jobs — Create a new spec job
 * GET  /api/service/spec-jobs — List jobs for current workspace
 */

import { z } from "zod";

import { success, error } from "@/lib/specforge/api-response";
import { buildHeuristicSuggestion } from "@/lib/specforge/agent-assist";
import {
  buildGuidedSpecMarkdown,
  buildGuidedSpecMetadata,
} from "@/lib/specforge/guided";
import {
  createSpecJob,
  listSpecJobs,
  updateSpecJob,
} from "@/lib/specforge/spec-jobs";
import { createDocument } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

const createJobSchema = z.object({
  brief: z.string().min(1).max(5000),
  constraints: z.record(z.string(), z.unknown()).optional(),
  mode: z.enum(["assisted", "autonomous"]).default("assisted"),
  workspaceId: z.string().min(1).optional(),
});

/**
 * Run the autonomous spec generation pass using the heuristic suggestion
 * engine. Populates the document with generated markdown from the brief.
 */
async function runAutonomousPass(
  documentId: string,
  brief: string,
  workspaceId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const suggestion = buildHeuristicSuggestion(brief);
    const markdown = buildGuidedSpecMarkdown(suggestion.fields);

    // Update the document with generated spec content
    const { updateDocument } = await import("@/lib/specforge/store");
    await updateDocument(documentId, {
      markdown,
      title: suggestion.fields.title,
    }, { workspaceId });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Autonomous pass failed",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createJobSchema.parse(body);

    const { workspaceId: sessionWorkspaceId } =
      await getCurrentWorkspaceAccess();
    const workspaceId = parsed.workspaceId ?? sessionWorkspaceId;

    // Derive title from brief (first 60 chars)
    const title = parsed.brief.length > 60
      ? parsed.brief.slice(0, 60).trim() + "..."
      : parsed.brief;

    // Create document from brief
    const suggestion = buildHeuristicSuggestion(parsed.brief);
    const initialMarkdown = buildGuidedSpecMarkdown(suggestion.fields);
    const metadata = buildGuidedSpecMetadata(suggestion.fields);

    const document = await createDocument({
      workspace_id: workspaceId,
      title: suggestion.fields.title || title,
      initial_markdown: parsed.mode === "autonomous" ? initialMarkdown : `# ${title}\n\n${parsed.brief}`,
      metadata,
    });

    // Create the spec job record
    const job = await createSpecJob({
      workspace_id: workspaceId,
      document_id: document.document_id,
      mode: parsed.mode,
      status: parsed.mode === "autonomous" ? "running" : "queued",
      brief: parsed.brief,
      constraints: (parsed.constraints ?? {}) as Record<string, unknown>,
    });

    if (parsed.mode === "autonomous") {
      const result = await runAutonomousPass(
        document.document_id,
        parsed.brief,
        workspaceId,
      );

      if (result.ok) {
        const updatedJob = await updateSpecJob(job.job_id, {
          status: "completed",
          artifacts: {
            document_id: document.document_id,
            generated_at: new Date().toISOString(),
          },
        });

        return success(
          {
            job: updatedJob,
            document_id: document.document_id,
            status: "completed",
          },
          { status: 201 },
        );
      }

      // Autonomous pass failed — set blocked
      const blockedJob = await updateSpecJob(job.job_id, {
        status: "blocked",
        blocker: result.error ?? "Autonomous spec generation failed",
      });

      return success(
        {
          job: blockedJob,
          document_id: document.document_id,
          status: "blocked",
        },
        { status: 201 },
      );
    }

    // Assisted mode — return the queued job
    return success(
      {
        job,
        document_id: document.document_id,
        status: "queued",
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
      "SPEC_JOB_CREATE_FAILED",
      500,
    );
  }
}

export async function GET() {
  try {
    const { workspaceId } = await getCurrentWorkspaceAccess();
    const jobs = await listSpecJobs(workspaceId);

    return success({ jobs, count: jobs.length });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "SPEC_JOB_LIST_FAILED",
      500,
    );
  }
}
