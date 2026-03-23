/**
 * Spec Job Artifacts Route
 *
 * GET /api/service/spec-jobs/:jobId/artifacts — Returns full artifact bundle
 */

import { success, error } from "@/lib/specforge/api-response";
import { getSpecJob } from "@/lib/specforge/spec-jobs";
import { exportDocument } from "@/lib/specforge/store";
import { buildExecutionBrief } from "@/lib/specforge/execution";
import { buildStarterTemplate } from "@/lib/specforge/handoff";
import { evaluateReadiness } from "@/lib/specforge/readiness";
import {
  getDocument,
  listPatches,
  listCommentThreads,
  listClarifications,
} from "@/lib/specforge/store";

type Params = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    const job = await getSpecJob(jobId);

    if (!job) {
      return error("Job not found", "JOB_NOT_FOUND", 404);
    }

    if (!job.document_id) {
      return error(
        "Job has no associated document yet",
        "NO_DOCUMENT",
        400,
      );
    }

    const storeOptions = { workspaceId: job.workspace_id };
    const document = await getDocument(job.document_id, storeOptions);

    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const [patches, comments, clarifications, exportBundle] =
      await Promise.all([
        listPatches(job.document_id, storeOptions),
        listCommentThreads(job.document_id, storeOptions),
        listClarifications(job.document_id, storeOptions),
        exportDocument(job.document_id, storeOptions),
      ]);

    const readiness = evaluateReadiness({
      document,
      patches,
      comments,
      clarifications,
    });

    const starterBundle = buildStarterTemplate(
      document,
      exportBundle,
      readiness,
      patches,
    );

    const executionBrief = buildExecutionBrief({
      document,
      exportBundle,
      starterBundle,
      readiness,
      patches,
      comments,
      clarifications,
    });

    return success({
      job,
      artifacts: {
        export_bundle: exportBundle,
        starter_bundle: starterBundle,
        execution_brief: executionBrief,
        readiness,
      },
    });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "SPEC_JOB_ARTIFACTS_FAILED",
      500,
    );
  }
}
