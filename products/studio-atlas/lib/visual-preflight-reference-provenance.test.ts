import assert from "node:assert/strict";
import test from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { getMuseoZeroShotIntent } from "./canonical/museo-zero-visual-intents";
import {
  compileShotJobs,
  createInitialVisualFactoryState,
  ingestVisualCandidates,
  lockVisualReference,
  type VisualExecutionReceipt,
  type VisualFactoryState,
  type VisualReferenceLock,
} from "./visual-factory";
import { assertExactCanonicalVisualPreflightBoundPlan } from "./visual-factory-execution-contract";
import { createVisualPreflightReceipt, type VisualPreflightReceipt } from "./visual-preflight";

const DIGEST = "a".repeat(64);
const SHOT_IDS = ["F1", "F2", "F3", "F4", "F5", "F6"] as const;
const SUBJECTS = ["lia", "omar", "teo", "sala-zero", "cabina-regia"] as const;

function referenceReceipt(): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-reference-provenance",
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: SUBJECTS.map((subjectRef, index) => ({
      assetId: `${subjectRef}-locked`,
      subjectRef,
      purpose: subjectRef === "sala-zero" || subjectRef === "cabina-regia" ? "ENVIRONMENT_REFERENCE" as const : "CHARACTER_REFERENCE" as const,
      url: `https://assets.invalid/${subjectRef}.png`,
      sha256: `${(index + 10).toString(16)}`.repeat(64),
      modelRef: "fixture/model",
      workflowRef: "fixture/workflow",
      createdAt: "2026-10-06T04:00:00.000Z",
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
  state = ingestVisualCandidates(state, referenceReceipt());
  for (const subjectRef of SUBJECTS) state = lockVisualReference(state, subjectRef, `${subjectRef}-locked`, DIGEST);
  return state;
}

function shotReceipts(state: VisualFactoryState): VisualPreflightReceipt[] {
  const locks = new Map(state.referenceLocks.map((lock) => [lock.subjectRef, lock]));
  return SHOT_IDS.map((shotId) => {
    const spec = { ...getMuseoZeroShotIntent(shotId), packageDigest: DIGEST };
    const referenceInputs = spec.subjectRefs.map((subjectRef) => locks.get(subjectRef)!.assetUrl);
    return createVisualPreflightReceipt({
      spec,
      providerFamily: "FLUX2_KLEIN_4B",
      semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
      humanPreflightDecision: "PASS",
      referenceInputs,
      createdAt: "2026-10-06T04:00:00.000Z",
    });
  });
}

test("reference locks preserve the immutable asset digest", () => {
  const state = lockedState();
  for (const lock of state.referenceLocks) {
    const candidate = state.candidates.find((item) => item.assetId === lock.assetId)!;
    assert.equal(lock.assetSha256, candidate.sha256);
  }
});

test("shot jobs carry content digests aligned with their locked reference inputs", () => {
  const project = createMuseoZeroPilotProject();
  const state = lockedState();
  const plan = compileShotJobs(project, DIGEST, state, shotReceipts(state));
  assert.equal(plan.decision, "SHOT_GENERATION_READY");
  for (const job of plan.jobs) {
    assert.ok(Array.isArray(job.referenceInputDigests));
    assert.equal(job.referenceInputDigests?.length, job.referenceInputs.length);
    assert.ok(job.referenceInputDigests?.every((digest) => /^[0-9a-f]{64}$/.test(digest)));
  }
});

test("shot admission requires persisted reference-lock evidence", () => {
  const project = createMuseoZeroPilotProject();
  const state = lockedState();
  const receipts = shotReceipts(state);
  const plan = compileShotJobs(project, DIGEST, state, receipts);
  assert.throws(() => assertExactCanonicalVisualPreflightBoundPlan(plan, receipts), /VISUAL_REFERENCE_LOCK_EVIDENCE_REQUIRED/);
});

test("shot admission rejects persisted lock evidence with a mismatched content digest", () => {
  const project = createMuseoZeroPilotProject();
  const state = lockedState();
  const receipts = shotReceipts(state);
  const plan = compileShotJobs(project, DIGEST, state, receipts);
  const locks = structuredClone(state.referenceLocks) as VisualReferenceLock[];
  locks[0].assetSha256 = "f".repeat(64);
  assert.throws(
    () => assertExactCanonicalVisualPreflightBoundPlan(plan, receipts, locks),
    /VISUAL_REFERENCE_LOCK_BINDING_INVALID/,
  );
});
