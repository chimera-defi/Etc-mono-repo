/**
 * Spec Job Detail Route
 *
 * GET /api/service/spec-jobs/:jobId — Returns job status + artifacts
 */

import { success, error } from "@/lib/specforge/api-response";
import { getSpecJob } from "@/lib/specforge/spec-jobs";

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

    return success({ job });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "SPEC_JOB_GET_FAILED",
      500,
    );
  }
}
