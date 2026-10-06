import assert from "node:assert/strict";
import test from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import {
  getMuseoZeroReferenceIntent,
  getMuseoZeroShotIntent,
} from "./canonical/museo-zero-visual-intents";
import {
  createVisualPreflightReceipt,
  type VisualIntentSpec,
  type VisualPreflightReceipt,
} from "./visual-preflight";
import {
  MUSEO_ZERO_VISUAL_SUBJECTS,
  compileReferenceJobs,
  compileShotJobs,
  createInitialVisualFactoryState,
  ingestVisualCandidates,
  lockVisualReference,
  reconcileVisualFactoryState,
  type VisualExecutionReceipt,
  type VisualFactoryState,
} from "./visual-factory";

const DIGEST = "a".repeat(64);
const OTHER_DIGEST = "b".repeat(64);
const SHOT_IDS = ["F1", "F2", "F3", "F4", "F5", "F6"] as const;

function bindDigest(spec: VisualIntentSpec, packageDigest = DIGEST): VisualIntentSpec {
  return { ...spec, packageDigest };
}

function passReceipt(
  spec: VisualIntentSpec,
  referenceInputs: readonly string[] = [],
): VisualPreflightReceipt {
  return createVisualPreflightReceipt({
    spec,
    providerFamily: "FLUX2_KLEIN_4B",
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "PASS",
    referenceInputs,
    createdAt: "2026-10-05T20:00:00.000Z",
  });
}

function referenceReceipts(packageDigest = DIGEST): VisualPreflightReceipt[] {
  return MUSEO_ZERO_VISUAL_SUBJECTS.map((subject) =>
    passReceipt(bindDigest(getMuseoZeroReferenceIntent(subject.subjectRef), packageDigest))
  );
}

function candidateReceipt(): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-reference-1",
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [
      ["lia", "lia-1"],
      ["omar", "omar-1"],
      ["teo", "teo-1"],
      ["sala-zero", "sala-zero-1"],
      ["cabina-regia", "cabina-regia-1"],
    ].map(([subjectRef, assetId]) => ({
      assetId,
      subjectRef,
      purpose: subjectRef.includes("sala") || subjectRef.includes("cabina")
        ? "ENVIRONMENT_REFERENCE" as const
        : "CHARACTER_REFERENCE" as const,
      url: `https://assets.invalid/${assetId}.png`,
      sha256: "c".repeat(64),
      modelRef: "fixture/model",
      workflowRef: "fixture/workflow",
      createdAt: "2026-10-04T20:00:00.000Z",
      packageDigest: DIGEST,
      provenanceStatus: "RECORDED" as const,
    })),
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function lockedState(): VisualFactoryState {
  let state = createInitialVisualFactoryState(DIGEST);
  state = ingestVisualCandidates(state, candidateReceipt());
  for (const [subjectRef, assetId] of [
    ["lia", "lia-1"],
    ["omar", "omar-1"],
    ["teo", "teo-1"],
    ["sala-zero", "sala-zero-1"],
    ["cabina-regia", "cabina-regia-1"],
  ] as const) {
    state = lockVisualReference(state, subjectRef, assetId, DIGEST);
  }
  return state;
}

function shotReceipts(state: VisualFactoryState): VisualPreflightReceipt[] {
  const lockBySubject = new Map(state.referenceLocks.map((item) => [item.subjectRef, item]));
  return SHOT_IDS.map((shotId) => {
    const spec = bindDigest(getMuseoZeroShotIntent(shotId));
    const refs = spec.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl);
    return passReceipt(spec, refs);
  });
}

test("reference jobs fail closed without exact preflight receipts", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);
  const plan = compileReferenceJobs(project, DIGEST, state, []);

  assert.equal(plan.decision, "STOP_PREFLIGHT_REQUIRED");
  assert.deepEqual(plan.jobs, []);
  assert.equal(plan.blockers.length, 5);
  assert.ok(plan.blockers.every((item) => item.startsWith("VISUAL_PREFLIGHT_")));
});

test("stale or revise reference preflight blocks generation", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);

  const stale = referenceReceipts();
  stale[0] = passReceipt(bindDigest(getMuseoZeroReferenceIntent("lia"), OTHER_DIGEST));
  const stalePlan = compileReferenceJobs(project, DIGEST, state, stale);
  assert.equal(stalePlan.decision, "STOP_PREFLIGHT_REQUIRED");
  assert.deepEqual(stalePlan.jobs, []);
  assert.ok(stalePlan.blockers.some((item) => item.includes("STALE_RECEIPT:lia")));

  const reviseSpec = bindDigest(getMuseoZeroReferenceIntent("lia"));
  const revise = createVisualPreflightReceipt({
    spec: reviseSpec,
    providerFamily: "FLUX2_KLEIN_4B",
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "REVISE",
    createdAt: "2026-10-05T20:00:00.000Z",
  });
  const revised = referenceReceipts();
  revised[0] = revise;
  const revisePlan = compileReferenceJobs(project, DIGEST, state, revised);
  assert.equal(revisePlan.decision, "STOP_PREFLIGHT_REQUIRED");
  assert.deepEqual(revisePlan.jobs, []);
  assert.ok(revisePlan.blockers.some((item) => item.includes("NOT_PASSED:lia")));
});

test("tampered PASS receipt with stale receiptId is rejected before job compilation", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);
  const receipts = referenceReceipts();
  receipts[0] = {
    ...receipts[0],
    humanPreflightDecision: "REVISE",
  };

  const plan = compileReferenceJobs(project, DIGEST, state, receipts);
  assert.equal(plan.decision, "STOP_PREFLIGHT_REQUIRED");
  assert.deepEqual(plan.jobs, []);
  assert.ok(plan.blockers.some((item) => item.includes("RECEIPT_INTEGRITY_INVALID:lia")));
});

test("five exact PASS receipts compile five bound reference jobs", () => {
  const project = createMuseoZeroPilotProject();
  const receipts = referenceReceipts();
  const plan = compileReferenceJobs(project, DIGEST, createInitialVisualFactoryState(DIGEST), receipts);

  assert.equal(plan.decision, "REFERENCE_GENERATION_READY");
  assert.deepEqual(plan.jobs.map((job) => job.subjectRef), ["lia", "omar", "teo", "sala-zero", "cabina-regia"]);
  assert.equal(plan.jobs.length, 5);
  for (const job of plan.jobs) {
    const receipt = receipts.find((item) => item.receiptId === job.preflightReceiptId)!;
    const compiled = receipt.compiledPrompts[0];
    assert.equal(job.maxVariants, 1);
    assert.equal(job.preflightState, "PREFLIGHT_PASS");
    assert.equal(job.preflightSpecDigest, receipt.specDigest);
    assert.equal(job.compiledPromptDigest, compiled.promptDigest);
    assert.equal(job.prompt, compiled.positivePrompt);
  }
  assert.equal(plan.paidComputeAuthorized, false);
  assert.equal(plan.allowQualityDowngrade, false);
  assert.equal(plan.runtimeAuthorized, false);
  assert.equal(plan.publicationAuthorityGranted, false);
});

test("reference art direction remains present in preflight-compiled jobs", () => {
  const project = createMuseoZeroPilotProject();
  const plan = compileReferenceJobs(project, DIGEST, createInitialVisualFactoryState(DIGEST), referenceReceipts());
  const bySubject = new Map(plan.jobs.map((job) => [job.subjectRef, job]));

  assert.match(bySubject.get("lia")?.prompt ?? "", /visitor-flow markers|circulation route/i);
  assert.match(bySubject.get("omar")?.prompt ?? "", /sensor mount|installation hardware/i);
  assert.match(bySubject.get("teo")?.prompt ?? "", /monitor remains off|monitor off/i);
  assert.match(bySubject.get("sala-zero")?.prompt ?? "", /projection wall|projection response/i);
  assert.match(bySubject.get("cabina-regia")?.prompt ?? "", /analog.*console|tactile controls/i);
});

test("scene generation fails closed until every required reference is locked", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);
  const plan = compileShotJobs(project, DIGEST, state, []);

  assert.equal(plan.decision, "STOP_REFERENCE_LOCK_REQUIRED");
  assert.deepEqual(plan.jobs, []);
  assert.ok(plan.blockers.length >= 5);
});

test("locked references do not bypass scene preflight", () => {
  const project = createMuseoZeroPilotProject();
  const plan = compileShotJobs(project, DIGEST, lockedState(), []);
  assert.equal(plan.decision, "STOP_PREFLIGHT_REQUIRED");
  assert.deepEqual(plan.jobs, []);
  assert.equal(plan.blockers.length, 6);
});

test("locked references plus exact shot preflight compile F1 through F6", () => {
  const project = createMuseoZeroPilotProject();
  const state = lockedState();
  const receipts = shotReceipts(state);
  const plan = compileShotJobs(project, DIGEST, state, receipts);

  assert.equal(plan.decision, "SHOT_GENERATION_READY");
  assert.deepEqual(plan.jobs.map((job) => job.shotId), ["F1", "F2", "F3", "F4", "F5", "F6"]);
  assert.ok(plan.jobs.every((job) => job.referenceInputs.length > 0));
  assert.ok(plan.jobs.every((job) => job.maxVariants === 1));
  assert.ok(plan.jobs.every((job) => job.preflightState === "PREFLIGHT_PASS"));
  const liaRef = "https://assets.invalid/lia-1.png";
  for (const shotId of ["F1", "F2", "F3", "F6"]) {
    assert.ok(plan.jobs.find((job) => job.shotId === shotId)?.referenceInputs.includes(liaRef));
  }
  assert.equal(plan.runtimeAuthorized, false);
  assert.equal(plan.publicationAuthorityGranted, false);
});

test("a candidate from a stale authoring digest cannot be locked", () => {
  let state = createInitialVisualFactoryState(DIGEST);
  state = ingestVisualCandidates(state, candidateReceipt());
  assert.throws(() => lockVisualReference(state, "lia", "lia-1", OTHER_DIGEST), /STALE_VISUAL_CANDIDATE/);
});

test("a newer authoring digest invalidates old candidates and locks", () => {
  let state = createInitialVisualFactoryState(DIGEST);
  state = ingestVisualCandidates(state, candidateReceipt());
  state = lockVisualReference(state, "lia", "lia-1", DIGEST);
  const reconciled = reconcileVisualFactoryState(state, OTHER_DIGEST);

  assert.equal(reconciled.packageDigest, OTHER_DIGEST);
  assert.equal(reconciled.stage, "NEEDS_REFERENCES");
  assert.deepEqual(reconciled.candidates, []);
  assert.deepEqual(reconciled.referenceLocks, []);
  assert.deepEqual(reconciled.sceneAssets, []);
});

test("the same authoring digest preserves visual review state", () => {
  let state = createInitialVisualFactoryState(DIGEST);
  state = ingestVisualCandidates(state, candidateReceipt());
  assert.equal(reconcileVisualFactoryState(state, DIGEST), state);
});