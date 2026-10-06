import {
  getMuseoZeroReferenceIntent,
  getMuseoZeroShotIntent,
} from "./canonical/museo-zero-visual-intents";
import type { VisualGenerationJob, VisualGenerationPlan } from "./visual-factory";
import { createVisualPreflightReceipt, type VisualIntentSpec } from "./visual-preflight";

const HEX_64 = /^[0-9a-f]{64}$/;
const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function bindPackageDigest(spec: VisualIntentSpec, packageDigest: string): VisualIntentSpec {
  return { ...spec, packageDigest };
}

function expectedSpec(plan: VisualGenerationPlan, job: VisualGenerationJob): VisualIntentSpec {
  if (plan.pathwayId !== MUSEO_ZERO_PROJECT_ID) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }
  if (plan.planType === "REFERENCE_GENERATION") {
    if (!job.subjectRef || job.shotId || job.purpose === "SCENE_FRAME") {
      throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
    }
    return bindPackageDigest(getMuseoZeroReferenceIntent(job.subjectRef), plan.packageDigest);
  }
  if (plan.planType === "SHOT_GENERATION") {
    if (!job.shotId || job.subjectRef !== job.shotId || job.purpose !== "SCENE_FRAME") {
      throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
    }
    return bindPackageDigest(getMuseoZeroShotIntent(job.shotId), plan.packageDigest);
  }
  throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
}

function assertExactJobBinding(plan: VisualGenerationPlan, job: VisualGenerationJob): void {
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

  let spec: VisualIntentSpec;
  try {
    spec = expectedSpec(plan, job);
  } catch {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }

  const expectedReceipt = createVisualPreflightReceipt({
    spec,
    providerFamily: "FLUX2_KLEIN_4B",
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "PASS",
    referenceInputs: job.referenceInputs,
    createdAt: "1970-01-01T00:00:00.000Z",
  });
  const expectedPrompt = expectedReceipt.compiledPrompts[0];
  const expectedNegativeConstraints = expectedPrompt?.negativePrompt
    ? [expectedPrompt.negativePrompt]
    : [];
  const expectedJobId = plan.planType === "REFERENCE_GENERATION"
    ? `reference-${job.subjectRef}`
    : `shot-${job.shotId}`;

  if (
    expectedReceipt.finalState !== "PREFLIGHT_PASS" ||
    !expectedPrompt ||
    job.jobId !== expectedJobId ||
    job.purpose !== spec.purpose ||
    job.preflightReceiptId !== expectedReceipt.receiptId ||
    job.preflightSpecDigest !== expectedReceipt.specDigest ||
    job.compiledPromptDigest !== expectedPrompt.promptDigest ||
    job.workflowFamily !== expectedPrompt.workflowFamily ||
    job.prompt !== expectedPrompt.positivePrompt ||
    !sameStrings(job.negativeConstraints, expectedNegativeConstraints) ||
    !sameStrings(job.referenceInputs, expectedPrompt.referenceInputs) ||
    job.aspectRatio !== expectedPrompt.aspectRatio ||
    expectedPrompt.maxVariants !== 1
  ) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }
}

export function assertVisualPreflightBoundPlan(plan: VisualGenerationPlan): void {
  if (
    plan.pathwayId !== MUSEO_ZERO_PROJECT_ID ||
    !HEX_64.test(plan.packageDigest) ||
    !Array.isArray(plan.jobs) ||
    plan.jobs.length < 1 ||
    plan.jobs.length > 6 ||
    plan.paidComputeAuthorized !== false ||
    plan.allowQualityDowngrade !== false ||
    plan.runtimeAuthorized !== false ||
    plan.publicationAuthorityGranted !== false
  ) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }

  for (const job of plan.jobs) {
    assertExactJobBinding(plan, job);
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
