import type { VisualGenerationPlan } from "./visual-factory";

export function selectReferencePlanSubject(
  plan: VisualGenerationPlan,
  subjectRef: string,
): VisualGenerationPlan {
  if (plan.planType !== "REFERENCE_GENERATION") {
    throw new Error("VF_REFERENCE_SUBJECT_REQUIRES_REFERENCE_PLAN");
  }
  if (subjectRef === "all") return plan;

  const matches = plan.jobs.filter((job) => job.subjectRef === subjectRef);
  if (matches.length !== 1) {
    throw new Error("VF_REFERENCE_SUBJECT_UNKNOWN");
  }

  return {
    ...plan,
    jobs: [matches[0]],
  };
}
