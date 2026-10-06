import {
  getMuseoZeroReferenceIntent,
  getMuseoZeroShotIntent,
} from "./canonical/museo-zero-visual-intents";
import type { VisualGenerationJob, VisualGenerationPlan } from "./visual-factory";
import {
  canonicalDigest,
  compileVisualPrompt,
  resolvePreflightState,
  type VisualIntentSpec,
  type VisualPreflightReceipt,
} from "./visual-preflight";

const HEX_64 = /^[0-9a-f]{64}$/;
const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function bindPackageDigest(spec: VisualIntentSpec, packageDigest: string): VisualIntentSpec {
  return { ...spec, packageDigest };
}

function assertStructuralJobBinding(job: VisualGenerationJob): void {
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

export function assertVisualPreflightBoundPlan(plan: VisualGenerationPlan): void {
  if (
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
  for (const job of plan.jobs) assertStructuralJobBinding(job);
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

function assertReceiptIntegrity(receipt: VisualPreflightReceipt): void {
  const expectedHumanRequired =
    receipt.semanticCritic.mode === "NOT_AVAILABLE" && receipt.semanticCritic.result === "NOT_RUN";
  const resolvedState = resolvePreflightState({
    deterministicFindings: receipt.deterministicChecks,
    semanticCritic: receipt.semanticCritic,
    humanPreflightDecision: receipt.humanPreflightDecision,
  });
  const bindingDigest = canonicalDigest({
    specDigest: receipt.specDigest,
    packageDigest: receipt.packageDigest,
    compilerVersion: receipt.compilerVersion,
    artDirectionVersion: receipt.artDirectionVersion,
    finalState: receipt.finalState,
    promptDigests: receipt.compiledPrompts.map((prompt) => prompt.promptDigest),
    semanticCritic: {
      mode: receipt.semanticCritic.mode,
      modelRef: receipt.semanticCritic.modelRef ?? null,
      modelDigest: receipt.semanticCritic.modelDigest ?? null,
      result: receipt.semanticCritic.result,
    },
    humanPreflightDecision: receipt.humanPreflightDecision ?? null,
  });

  if (
    receipt.schemaVersion !== "atlas.visual-preflight-receipt/v0.1" ||
    receipt.finalState !== "PREFLIGHT_PASS" ||
    resolvedState !== receipt.finalState ||
    receipt.humanPreflightRequired !== expectedHumanRequired ||
    (receipt.humanPreflightRequired && receipt.humanPreflightDecision !== "PASS") ||
    receipt.deterministicChecks.some((finding) => finding.severity === "ERROR") ||
    receipt.compiledPrompts.length !== 1 ||
    receipt.receiptId !== `vpc-${bindingDigest.slice(0, 32)}` ||
    receipt.paidComputeAuthorized !== false ||
    receipt.allowQualityDowngrade !== false ||
    receipt.runtimeAuthorized !== false ||
    receipt.publicationAuthorityGranted !== false
  ) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }
}

function assertExactJobBinding(
  plan: VisualGenerationPlan,
  job: VisualGenerationJob,
  receipts: readonly VisualPreflightReceipt[],
): void {
  assertStructuralJobBinding(job);

  const receipt = receipts.find((item) => item.receiptId === job.preflightReceiptId);
  if (!receipt) {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_REQUIRED");
  }
  assertReceiptIntegrity(receipt);

  let spec: VisualIntentSpec;
  try {
    spec = expectedSpec(plan, job);
  } catch {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }

  const expectedSpecDigest = canonicalDigest(spec);
  const actualPrompt = receipt.compiledPrompts.find((prompt) => prompt.promptDigest === job.compiledPromptDigest);
  if (!actualPrompt) throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  const expectedPrompt = compileVisualPrompt(spec, "FLUX2_KLEIN_4B", {
    compilerVersion: receipt.compilerVersion,
    referenceInputs: job.referenceInputs,
  });
  const expectedNegativeConstraints = actualPrompt.negativePrompt
    ? [actualPrompt.negativePrompt]
    : [];
  const expectedJobId = plan.planType === "REFERENCE_GENERATION"
    ? `reference-${job.subjectRef}`
    : `shot-${job.shotId}`;

  if (
    receipt.specId !== spec.specId ||
    receipt.packageDigest !== plan.packageDigest ||
    receipt.specDigest !== expectedSpecDigest ||
    receipt.artDirectionVersion !== spec.artDirectionVersion ||
    actualPrompt.sourceSpecDigest !== expectedSpecDigest ||
    actualPrompt.promptDigest !== expectedPrompt.promptDigest ||
    actualPrompt.positivePrompt !== expectedPrompt.positivePrompt ||
    actualPrompt.negativePrompt !== expectedPrompt.negativePrompt ||
    actualPrompt.workflowFamily !== expectedPrompt.workflowFamily ||
    actualPrompt.aspectRatio !== expectedPrompt.aspectRatio ||
    actualPrompt.maxVariants !== 1 ||
    !sameStrings(actualPrompt.referenceInputs, expectedPrompt.referenceInputs) ||
    job.jobId !== expectedJobId ||
    job.purpose !== spec.purpose ||
    job.preflightReceiptId !== receipt.receiptId ||
    job.preflightSpecDigest !== receipt.specDigest ||
    job.compiledPromptDigest !== actualPrompt.promptDigest ||
    job.workflowFamily !== actualPrompt.workflowFamily ||
    job.prompt !== actualPrompt.positivePrompt ||
    !sameStrings(job.negativeConstraints, expectedNegativeConstraints) ||
    !sameStrings(job.referenceInputs, actualPrompt.referenceInputs) ||
    job.aspectRatio !== actualPrompt.aspectRatio
  ) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }
}

export function assertExactCanonicalVisualPreflightBoundPlan(
  plan: VisualGenerationPlan,
  receipts: readonly VisualPreflightReceipt[],
): void {
  assertVisualPreflightBoundPlan(plan);
  if (!Array.isArray(receipts) || receipts.length === 0) {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_REQUIRED");
  }
  if (plan.pathwayId !== MUSEO_ZERO_PROJECT_ID) {
    throw new Error("VISUAL_PREFLIGHT_BINDING_INVALID");
  }
  for (const job of plan.jobs) assertExactJobBinding(plan, job, receipts);
}

export function isVisualPreflightBoundPlan(plan: VisualGenerationPlan): boolean {
  try {
    assertVisualPreflightBoundPlan(plan);
    return true;
  } catch {
    return false;
  }
}

export function isExactCanonicalVisualPreflightBoundPlan(
  plan: VisualGenerationPlan,
  receipts: readonly VisualPreflightReceipt[],
): boolean {
  try {
    assertExactCanonicalVisualPreflightBoundPlan(plan, receipts);
    return true;
  } catch {
    return false;
  }
}
