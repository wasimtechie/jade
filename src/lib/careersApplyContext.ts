/**
 * Careers apply indexing contract (client → API → Postgres).
 *
 * Stored on `career_applications` for admin/reporting:
 * - job_id + job_title — filter by role (e.g. sales, content-creator)
 * - source_page — site section (default /careers)
 * - apply_context — stable machine key: careers:role:{id} | careers:open-application
 * - client_path — pathname when overlay opened (e.g. /careers, future /about#careers)
 *
 * Example admin queries:
 *   SELECT * FROM career_applications WHERE job_id = 'sales' ORDER BY created_at DESC;
 *   SELECT * FROM career_applications WHERE apply_context LIKE 'careers:role:%';
 *
 * Success OKAY uses the same hub as Enquire: `/experiences` (`resolveEnquiryOkayReturnPath`).
 */
import {
  OPEN_APPLICATION_JOB_ID,
  resolveCareerJobTitle,
} from "@/data/careersJobs";

export const CAREERS_SOURCE_PAGE = "/careers";

export type CareersApplyEntryPoint = "job-card" | "send-cv";

export type CareersApplyContextPayload = {
  jobId: string;
  jobTitle: string;
  sourcePage: string;
  applyContext: string;
  clientPath: string;
};

export function buildCareersApplyContext(input: {
  jobId: string;
  clientPath: string;
  entryPoint: CareersApplyEntryPoint;
}): CareersApplyContextPayload {
  const jobId =
    input.entryPoint === "send-cv" ? OPEN_APPLICATION_JOB_ID : input.jobId;
  const jobTitle = resolveCareerJobTitle(jobId);
  const applyContext =
    input.entryPoint === "send-cv"
      ? "careers:open-application"
      : `careers:role:${jobId}`;

  return {
    jobId,
    jobTitle,
    sourcePage: CAREERS_SOURCE_PAGE,
    applyContext,
    clientPath: input.clientPath.slice(0, 500),
  };
}
