import type { VisualGenerationPlan } from "./visual-factory";

const HEX_64 = /^[0-9a-f]{64}$/;

export function assertVisualPreflightBoundPlan(plan: VisualGenerationPlan): void {
  if (!Array.isArray(plan.jobs) || plan.jobs.length < 1 || plan.jobs.length > 6) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }

  for (const job of plan.jobs) {
    if (
      job.maxVariants !== 1 ||
      job.preflightState !== "PREFLIGHT_PASS" ||
      typeof job.preflightReceiptId !== "string" ||
      job.preflightReceiptId.length === 0 ||
      typeof job.preflightSpecDigest !== "string" ||
      !HEX_64.test(job.preflightSpecDigest) ||
      typeof job.compiledPromptDigest !== "string" ||
      !HEX_64.test(job.compiledPromptDigest)
    ) {
      throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
    }
  }
}

export function isVisualPreflightBoundPlan(plan: VisualGenerationPlan): boolean {
  try {
    assertVisualPreflightBoundPlan(plan);
    return true;
  } catch {
    return false;
  }
}
