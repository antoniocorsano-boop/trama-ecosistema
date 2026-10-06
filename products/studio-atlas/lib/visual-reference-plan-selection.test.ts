import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import { selectReferencePlanSubject } from "./visual-reference-plan-selection";

function plan(planType: VisualGenerationPlan["planType"] = "REFERENCE_GENERATION"): VisualGenerationPlan {
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: "a".repeat(64),
    planType,
    decision: planType === "REFERENCE_GENERATION" ? "REFERENCE_GENERATION_READY" : "SHOT_GENERATION_READY",
    jobs: [
      {
        jobId: "reference-lia",
        purpose: "CHARACTER_REFERENCE",
        subjectRef: "lia",
        workflowFamily: "flux2-klein-4b/v0.2",
        prompt: "lia prompt",
        negativeConstraints: [],
        referenceInputs: [],
        referenceInputDigests: [],
        aspectRatio: "3:4",
        maxVariants: 1,
        preflightReceiptId: "vpc-lia",
        preflightSpecDigest: "b".repeat(64),
        compiledPromptDigest: "c".repeat(64),
        preflightState: "PREFLIGHT_PASS",
      },
      {
        jobId: "reference-omar",
        purpose: "CHARACTER_REFERENCE",
        subjectRef: "omar",
        workflowFamily: "flux2-klein-4b/v0.2",
        prompt: "omar prompt",
        negativeConstraints: [],
        referenceInputs: [],
        referenceInputDigests: [],
        aspectRatio: "3:4",
        maxVariants: 1,
        preflightReceiptId: "vpc-omar",
        preflightSpecDigest: "d".repeat(64),
        compiledPromptDigest: "e".repeat(64),
        preflightState: "PREFLIGHT_PASS",
      },
    ],
    blockers: [],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

test("single-reference selection preserves the exact governed job and authority flags", () => {
  const original = plan();
  const selected = selectReferencePlanSubject(original, "lia");

  assert.equal(selected.jobs.length, 1);
  assert.deepEqual(selected.jobs[0], original.jobs[0]);
  assert.equal(selected.packageDigest, original.packageDigest);
  assert.equal(selected.paidComputeAuthorized, false);
  assert.equal(selected.allowQualityDowngrade, false);
  assert.equal(selected.runtimeAuthorized, false);
  assert.equal(selected.publicationAuthorityGranted, false);
});

test("all keeps the canonical reference batch unchanged", () => {
  const original = plan();
  const selected = selectReferencePlanSubject(original, "all");
  assert.deepEqual(selected, original);
});

test("unknown subject fails closed instead of silently running the full batch", () => {
  assert.throws(() => selectReferencePlanSubject(plan(), "unknown"), /VF_REFERENCE_SUBJECT_UNKNOWN/);
});

test("single-reference selection cannot be applied to shot plans", () => {
  assert.throws(() => selectReferencePlanSubject(plan("SHOT_GENERATION"), "lia"), /VF_REFERENCE_SUBJECT_REQUIRES_REFERENCE_PLAN/);
});
