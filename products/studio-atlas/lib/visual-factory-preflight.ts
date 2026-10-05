import type { VisualGenerationPlan } from "./visual-factory";
import { routeVisualModel, type VisualModelRoute } from "./visual-factory-model-router";
import {
  compileProviderNeutralGenerationSpec,
  type ProviderNeutralGenerationSpec,
} from "./visual-factory-prompt-compiler";

export type VisualGenerationPreflightIssueCode =
  | "AUTHORITY_VIOLATION"
  | "PLAN_NOT_READY"
  | "PLAN_HAS_BLOCKERS"
  | "EMPTY_JOBS"
  | "TOO_MANY_JOBS"
  | "DUPLICATE_JOB_ID"
  | "JOB_CONTRACT_INVALID"
  | "EMPTY_PROMPT"
  | "EMPTY_NEGATIVE_CONSTRAINTS"
  | "MODEL_NOT_ALLOWLISTED"
  | "ASPECT_RATIO_NOT_ALLOWLISTED"
  | "VARIANT_BUDGET_INVALID"
  | "REFERENCE_SUBJECT_REQUIRED"
  | "SCENE_METADATA_REQUIRED"
  | "SCENE_REFERENCE_REQUIRED"
  | "REFERENCE_LIMIT_EXCEEDED";

export type VisualGenerationPreflightIssue = {
  code: VisualGenerationPreflightIssueCode;
  jobId?: string;
};

export type CompiledVisualGenerationJob = {
  spec: ProviderNeutralGenerationSpec;
  modelRoute: VisualModelRoute;
};

export type VisualGenerationPreflight = {
  status: "READY" | "BLOCKED";
  issues: VisualGenerationPreflightIssue[];
  compiledJobs: CompiledVisualGenerationJob[];
};

function addIssue(
  issues: VisualGenerationPreflightIssue[],
  code: VisualGenerationPreflightIssueCode,
  jobId?: string,
): void {
  if (!issues.some((issue) => issue.code === code && issue.jobId === jobId)) {
    issues.push({ code, jobId });
  }
}

export function preflightVisualGenerationPlan(
  plan: VisualGenerationPlan,
): VisualGenerationPreflight {
  const issues: VisualGenerationPreflightIssue[] = [];

  if (
    plan.paidComputeAuthorized !== false ||
    plan.allowQualityDowngrade !== false ||
    plan.runtimeAuthorized !== false ||
    plan.publicationAuthorityGranted !== false
  ) {
    addIssue(issues, "AUTHORITY_VIOLATION");
  }

  const expectedDecision = plan.planType === "REFERENCE_GENERATION"
    ? "REFERENCE_GENERATION_READY"
    : "SHOT_GENERATION_READY";
  if (plan.decision !== expectedDecision) addIssue(issues, "PLAN_NOT_READY");
  if (plan.blockers.length > 0) addIssue(issues, "PLAN_HAS_BLOCKERS");
  if (plan.jobs.length === 0) addIssue(issues, "EMPTY_JOBS");
  if (plan.jobs.length > 6) addIssue(issues, "TOO_MANY_JOBS");

  const jobIds = new Set<string>();
  for (const job of plan.jobs) {
    const rawJob = job as unknown as Record<string, unknown>;
    const jobId = typeof rawJob.jobId === "string" ? rawJob.jobId : undefined;
    const commonContractValid =
      typeof rawJob.jobId === "string" &&
      rawJob.jobId.trim().length > 0 &&
      (rawJob.purpose === "CHARACTER_REFERENCE" ||
        rawJob.purpose === "ENVIRONMENT_REFERENCE" ||
        rawJob.purpose === "SCENE_FRAME") &&
      typeof rawJob.workflowFamily === "string" &&
      typeof rawJob.prompt === "string" &&
      Array.isArray(rawJob.negativeConstraints) &&
      rawJob.negativeConstraints.every((item) => typeof item === "string") &&
      Array.isArray(rawJob.referenceInputs) &&
      rawJob.referenceInputs.every((item) => typeof item === "string") &&
      typeof rawJob.aspectRatio === "string" &&
      typeof rawJob.maxVariants === "number" &&
      (rawJob.subjectRef === undefined || typeof rawJob.subjectRef === "string") &&
      (rawJob.shotId === undefined || typeof rawJob.shotId === "string") &&
      (rawJob.sceneRef === undefined || typeof rawJob.sceneRef === "string");

    if (!commonContractValid) {
      addIssue(issues, "JOB_CONTRACT_INVALID", jobId);
      continue;
    }

    if (jobIds.has(job.jobId)) addIssue(issues, "DUPLICATE_JOB_ID", job.jobId);
    jobIds.add(job.jobId);

    if (!job.prompt.trim()) addIssue(issues, "EMPTY_PROMPT", job.jobId);
    if (!job.negativeConstraints.some((item) => item.trim())) {
      addIssue(issues, "EMPTY_NEGATIVE_CONSTRAINTS", job.jobId);
    }
    if (job.workflowFamily !== "flux2-klein-4b/v0.2") {
      addIssue(issues, "MODEL_NOT_ALLOWLISTED", job.jobId);
    }
    if (job.aspectRatio !== "3:4" && job.aspectRatio !== "4:3") {
      addIssue(issues, "ASPECT_RATIO_NOT_ALLOWLISTED", job.jobId);
    }
    if (!Number.isInteger(job.maxVariants) || job.maxVariants < 1 || job.maxVariants > 3) {
      addIssue(issues, "VARIANT_BUDGET_INVALID", job.jobId);
    }
    if (job.referenceInputs.length > 4) {
      addIssue(issues, "REFERENCE_LIMIT_EXCEEDED", job.jobId);
    }

    if (job.purpose === "SCENE_FRAME") {
      if (!job.shotId?.trim() || !job.sceneRef?.trim()) {
        addIssue(issues, "SCENE_METADATA_REQUIRED", job.jobId);
      }
      if (job.referenceInputs.length === 0) {
        addIssue(issues, "SCENE_REFERENCE_REQUIRED", job.jobId);
      }
    } else if (!job.subjectRef?.trim()) {
      addIssue(issues, "REFERENCE_SUBJECT_REQUIRED", job.jobId);
    }
  }

  if (issues.length > 0) {
    return { status: "BLOCKED", issues, compiledJobs: [] };
  }

  return {
    status: "READY",
    issues: [],
    compiledJobs: plan.jobs.map((job) => {
      const spec = compileProviderNeutralGenerationSpec(job);
      return { spec, modelRoute: routeVisualModel(spec) };
    }),
  };
}
