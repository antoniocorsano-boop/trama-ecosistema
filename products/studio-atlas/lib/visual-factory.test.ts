import assert from "node:assert/strict";
import test from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import {
  compileReferenceJobs,
  compileShotJobs,
  createInitialVisualFactoryState,
  ingestVisualCandidates,
  lockVisualReference,
  reconcileVisualFactoryState,
  type VisualExecutionReceipt,
} from "./visual-factory";

const DIGEST = "a".repeat(64);
const OTHER_DIGEST = "b".repeat(64);

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

test("MUSEO ZERO compiles five reference jobs before scene production", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);
  const plan = compileReferenceJobs(project, DIGEST, state);

  assert.equal(plan.decision, "REFERENCE_GENERATION_READY");
  assert.deepEqual(
    plan.jobs.map((job) => job.subjectRef),
    ["lia", "omar", "teo", "sala-zero", "cabina-regia"],
  );
  assert.equal(plan.jobs.length, 5);
  assert.equal(plan.paidComputeAuthorized, false);
  assert.equal(plan.allowQualityDowngrade, false);
  assert.equal(plan.runtimeAuthorized, false);
  assert.equal(plan.publicationAuthorityGranted, false);
});

test("reference art direction keeps characters in role and environments free of synthetic UI text", () => {
  const project = createMuseoZeroPilotProject();
  const plan = compileReferenceJobs(project, DIGEST, createInitialVisualFactoryState(DIGEST));
  const bySubject = new Map(plan.jobs.map((job) => [job.subjectRef, job]));

  const liaPrompt = bySubject.get("lia")?.prompt ?? "";
  assert.match(liaPrompt, /visitor-flow markers|circulation route/i);
  assert.match(liaPrompt, /not a posed portrait/i);
  assert.match(liaPrompt, /single subject|no other people/i);
  assert.match(liaPrompt, /blank walls|no wall plaques|no signage anywhere/i);
  assert.doesNotMatch(liaPrompt, /\bLia\b/i);

  const omarPrompt = bySubject.get("omar")?.prompt ?? "";
  assert.match(omarPrompt, /sensor mount|installation hardware/i);
  assert.match(omarPrompt, /hands-on installer/i);
  assert.match(omarPrompt, /single subject|no other people/i);
  assert.doesNotMatch(omarPrompt, /\bOmar\b/i);

  const teoPrompt = bySubject.get("teo")?.prompt ?? "";
  assert.match(teoPrompt, /not security staff/i);
  assert.match(teoPrompt, /adjacent.*warm.*projection.*gallery|adjacent.*projection.*gallery/i);
  assert.match(teoPrompt, /monitor off|no screen interface|physical console only/i);
  assert.match(teoPrompt, /all displays.*dark|no illuminated display|no lettering anywhere/i);
  assert.doesNotMatch(teoPrompt, /\bTeo\b|Sala Zero/i);

  const salaPrompt = bySubject.get("sala-zero")?.prompt ?? "";
  assert.match(salaPrompt, /projection.*abstract light|abstract light.*projection/i);
  assert.match(salaPrompt, /no text|no interface/i);
  assert.match(salaPrompt, /no signage|unlabeled walls|unlabeled doors/i);
  assert.match(salaPrompt, /blank walls|no plaques|no lettering anywhere/i);
  assert.doesNotMatch(salaPrompt, /Sala Zero/i);

  const cabinaPrompt = bySubject.get("cabina-regia")?.prompt ?? "";
  assert.match(cabinaPrompt, /adjacent booth|adjacent.*warm.*projection.*gallery/i);
  assert.match(cabinaPrompt, /physical buttons|tactile controls/i);
  assert.match(cabinaPrompt, /camera inside|interior viewpoint/i);
  assert.match(cabinaPrompt, /window.*projection|projection.*window/i);
  assert.match(cabinaPrompt, /analog control surface|analog console/i);
  assert.match(cabinaPrompt, /no rectangular display panels|no screen-like surfaces/i);
  assert.doesNotMatch(cabinaPrompt, /Sala Zero/i);

  for (const job of plan.jobs) {
    assert.ok(job.negativeConstraints.includes("readable text, pseudo-text, labels, captions, signage, or watermarks"));
    assert.ok(job.negativeConstraints.includes("charts, graphs, dashboards, detached UI panels, or screen-wall interfaces"));
    assert.ok(job.negativeConstraints.includes("illuminated displays, monitor content, interface text, control-screen graphics, or wall placards"));
    assert.ok(job.negativeConstraints.includes("clothing logos, brand marks, badges, embroidered lettering, or printed lettering"));
  }
});

test("scene generation fails closed until every required reference is locked", () => {
  const project = createMuseoZeroPilotProject();
  const state = createInitialVisualFactoryState(DIGEST);
  const plan = compileShotJobs(project, DIGEST, state);

  assert.equal(plan.decision, "STOP_REFERENCE_LOCK_REQUIRED");
  assert.deepEqual(plan.jobs, []);
  assert.ok(plan.blockers.length >= 5);
});

test("a candidate from a stale authoring digest cannot be locked", () => {
  let state = createInitialVisualFactoryState(DIGEST);
  state = ingestVisualCandidates(state, candidateReceipt());
  assert.throws(
    () => lockVisualReference(state, "lia", "lia-1", OTHER_DIGEST),
    /STALE_VISUAL_CANDIDATE/,
  );
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

test("locked MUSEO ZERO references compile exactly F1 through F6", () => {
  const project = createMuseoZeroPilotProject();
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

  const plan = compileShotJobs(project, DIGEST, state);
  assert.equal(plan.decision, "SHOT_GENERATION_READY");
  assert.deepEqual(plan.jobs.map((job) => job.shotId), ["F1", "F2", "F3", "F4", "F5", "F6"]);
  assert.ok(plan.jobs.every((job) => job.referenceInputs.length > 0));
  const liaRef = "https://assets.invalid/lia-1.png";
  for (const shotId of ["F1", "F2", "F3", "F6"]) {
    assert.ok(plan.jobs.find((job) => job.shotId === shotId)?.referenceInputs.includes(liaRef));
  }
  assert.equal(plan.runtimeAuthorized, false);
  assert.equal(plan.publicationAuthorityGranted, false);
});
