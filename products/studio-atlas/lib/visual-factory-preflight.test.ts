import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationJob, VisualGenerationPlan } from "./visual-factory";
import { routeVisualModel } from "./visual-factory-model-router";
import { preflightVisualGenerationPlan } from "./visual-factory-preflight";
import { compileProviderNeutralGenerationSpec } from "./visual-factory-prompt-compiler";

const DIGEST = "a".repeat(64);

const BASE_PLAN: Omit<VisualGenerationPlan, "jobs"> = {
  schemaVersion: "atlas.visual-generation-plan/v0.1",
  pathwayId: "pw-strategy-selection-01-museo-zero",
  packageDigest: DIGEST,
  planType: "REFERENCE_GENERATION",
  decision: "REFERENCE_GENERATION_READY",
  blockers: [],
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
};

const REFERENCE_JOB: VisualGenerationJob = {
  jobId: "reference-lia",
  purpose: "CHARACTER_REFERENCE",
  subjectRef: "lia",
  workflowFamily: "flux2-klein-4b/v0.2",
  prompt: "  Lia working in the museum.  ",
  negativeConstraints: [" text ", "logos"],
  referenceInputs: [],
  aspectRatio: "3:4",
  maxVariants: 2,
};

function referencePlan(overrides: Partial<VisualGenerationPlan> = {}): VisualGenerationPlan {
  return {
    ...BASE_PLAN,
    jobs: [REFERENCE_JOB],
    ...overrides,
  } as VisualGenerationPlan;
}

test("VF-GEN-01 accepts a canonical reference plan and compiles it", () => {
  const result = preflightVisualGenerationPlan(referencePlan());
  assert.equal(result.status, "READY");
  assert.equal(result.compiledJobs.length, 1);
  assert.equal(result.compiledJobs[0].spec.prompt, "Lia working in the museum.");
});

test("VF-GEN-01 requires multi-reference capability for a scene with multiple locks", () => {
  const sceneJob: VisualGenerationJob = {
    ...REFERENCE_JOB,
    jobId: "shot-F1",
    purpose: "SCENE_FRAME",
    subjectRef: "F1",
    shotId: "F1",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    aspectRatio: "4:3",
    referenceInputs: ["lia.png", "omar.png", "teo.png", "sala-zero.png"],
  };
  const result = preflightVisualGenerationPlan(referencePlan({
    planType: "SHOT_GENERATION",
    decision: "SHOT_GENERATION_READY",
    jobs: [sceneJob],
  }));
  assert.equal(result.status, "READY");
  assert.deepEqual(result.compiledJobs[0].modelRoute.requiredCapabilities, [
    "TEXT_TO_IMAGE",
    "IMAGE_INPUT",
    "MULTI_REFERENCE",
  ]);
});

test("VF-GEN-01 blocks a scene without locked references before inference", () => {
  const sceneJob: VisualGenerationJob = {
    ...REFERENCE_JOB,
    jobId: "shot-F1",
    purpose: "SCENE_FRAME",
    subjectRef: "F1",
    shotId: "F1",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    aspectRatio: "4:3",
    referenceInputs: [],
  };
  const result = preflightVisualGenerationPlan(referencePlan({
    planType: "SHOT_GENERATION",
    decision: "SHOT_GENERATION_READY",
    jobs: [sceneJob],
  }));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "SCENE_REFERENCE_REQUIRED"));
});

test("VF-GEN-01 blocks a non-canonical model family", () => {
  const result = preflightVisualGenerationPlan(referencePlan({
    jobs: [{ ...REFERENCE_JOB, workflowFamily: "flux1-schnell" }],
  }));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "MODEL_NOT_ALLOWLISTED"));
});

test("VF-GEN-01 blocks more than four image references", () => {
  const sceneJob: VisualGenerationJob = {
    ...REFERENCE_JOB,
    jobId: "shot-F1",
    purpose: "SCENE_FRAME",
    subjectRef: "F1",
    shotId: "F1",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    aspectRatio: "4:3",
    referenceInputs: ["1", "2", "3", "4", "5"],
  };
  const result = preflightVisualGenerationPlan(referencePlan({
    planType: "SHOT_GENERATION",
    decision: "SHOT_GENERATION_READY",
    jobs: [sceneJob],
  }));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "REFERENCE_LIMIT_EXCEEDED"));
});

test("VF-GEN-01 blocks duplicate job ids", () => {
  const result = preflightVisualGenerationPlan(referencePlan({ jobs: [REFERENCE_JOB, { ...REFERENCE_JOB }] }));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "DUPLICATE_JOB_ID"));
});

test("VF-GEN-01 blocks any authority escalation", () => {
  const malformedPlan = {
    ...referencePlan(),
    paidComputeAuthorized: true,
  } as unknown as VisualGenerationPlan;
  const result = preflightVisualGenerationPlan(malformedPlan);
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "AUTHORITY_VIOLATION"));
});

test("prompt compiler normalizes text without mutating reference inputs", () => {
  const spec = compileProviderNeutralGenerationSpec(REFERENCE_JOB);
  assert.equal(spec.prompt, "Lia working in the museum.");
  assert.equal(spec.negativePrompt, "text, logos");
  assert.notEqual(spec.referenceInputs, REFERENCE_JOB.referenceInputs);
});

test("model router never silently changes the canonical family", () => {
  const route = routeVisualModel(compileProviderNeutralGenerationSpec(REFERENCE_JOB));
  assert.equal(route.workflowFamily, "flux2-klein-4b/v0.2");
  assert.equal(route.modelPolicy, "CANONICAL_FLUX2_KLEIN_4B");
});

test("VF-GEN-01 blocks malformed job contracts without throwing", () => {
  const malformedJob = {
    ...REFERENCE_JOB,
    prompt: 42,
    negativeConstraints: null,
    referenceInputs: null,
  } as unknown as VisualGenerationJob;
  const result = preflightVisualGenerationPlan(referencePlan({ jobs: [malformedJob] }));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "JOB_CONTRACT_INVALID"));
});
