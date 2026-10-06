import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { VisualGenerationPlan, VisualReferenceLock } from "./visual-factory";
import { loadPersistedVisualReferenceLockEvidence } from "./visual-preflight-evidence-node";

const DIGEST = "a".repeat(64);

function shotPlan(): VisualGenerationPlan {
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    planType: "SHOT_GENERATION",
    decision: "SHOT_GENERATION_READY",
    jobs: [{
      jobId: "shot-F1",
      purpose: "SCENE_FRAME",
      subjectRef: "F1",
      shotId: "F1",
      sceneRef: "MZ1_FAILED_REHEARSAL",
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: "fixture",
      negativeConstraints: [],
      referenceInputs: ["https://assets.invalid/lia.png"],
      referenceInputDigests: ["b".repeat(64)],
      aspectRatio: "16:9",
      maxVariants: 1,
      preflightReceiptId: "vpc-fixture",
      preflightSpecDigest: "c".repeat(64),
      compiledPromptDigest: "d".repeat(64),
      preflightState: "PREFLIGHT_PASS",
    }],
    blockers: [],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function locks(): VisualReferenceLock[] {
  return ["lia", "omar", "teo", "sala-zero", "cabina-regia"].map((subjectRef, index) => ({
    subjectRef,
    assetId: `${subjectRef}-locked`,
    assetUrl: `https://assets.invalid/${subjectRef}.png`,
    assetSha256: `${(index + 11).toString(16)}`.repeat(64),
    packageDigest: DIGEST,
    lockedAt: "2026-10-06T04:30:00.000Z",
  }));
}

test("shot lock evidence is unavailable when reference-locks.json is missing", async () => {
  const directory = await mkdtemp(join(tmpdir(), "vpc-locks-missing-"));
  await assert.rejects(
    () => loadPersistedVisualReferenceLockEvidence(directory, shotPlan()),
    /VISUAL_REFERENCE_LOCK_EVIDENCE_UNAVAILABLE/,
  );
});

test("persisted shot lock evidence loads only immutable same-package locks", async () => {
  const directory = await mkdtemp(join(tmpdir(), "vpc-locks-valid-"));
  const expected = locks();
  await writeFile(join(directory, "reference-locks.json"), JSON.stringify({
    schemaVersion: "atlas.visual-reference-lock-evidence/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    locks: expected,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  }));
  const actual = await loadPersistedVisualReferenceLockEvidence(directory, shotPlan());
  assert.deepEqual(actual, expected);
});

test("persisted shot lock evidence rejects duplicate subjects and invalid content digests", async () => {
  const directory = await mkdtemp(join(tmpdir(), "vpc-locks-invalid-"));
  const invalid = locks();
  invalid[1] = { ...invalid[0], assetId: "forged", assetSha256: "not-a-digest" };
  await writeFile(join(directory, "reference-locks.json"), JSON.stringify({
    schemaVersion: "atlas.visual-reference-lock-evidence/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    locks: invalid,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  }));
  await assert.rejects(
    () => loadPersistedVisualReferenceLockEvidence(directory, shotPlan()),
    /VISUAL_REFERENCE_LOCK_EVIDENCE_INVALID/,
  );
});
