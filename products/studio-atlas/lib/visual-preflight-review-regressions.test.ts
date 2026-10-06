import assert from "node:assert/strict";
import test from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { getMuseoZeroReferenceIntent } from "./canonical/museo-zero-visual-intents";
import { digestAuthoringState } from "./production";
import {
  MUSEO_ZERO_VISUAL_SUBJECTS,
  compileShotJobs,
  createInitialVisualFactoryState,
  type VisualReferenceLock,
} from "./visual-factory";
import {
  compileVisualPrompt,
  type VisualIntentSpec,
} from "./visual-preflight";
import {
  compileCanonicalVisualPreflight,
  type CanonicalVisualPreflightOptions,
} from "../scripts/compile-canonical-visual-preflight";

function makeReferenceLocks(packageDigest: string): VisualReferenceLock[] {
  return MUSEO_ZERO_VISUAL_SUBJECTS.map((subject, index) => ({
    subjectRef: subject.subjectRef,
    assetId: `${subject.subjectRef}-locked`,
    assetUrl: `https://assets.invalid/${subject.subjectRef}.webp`,
    assetSha256: `${index + 1}`.repeat(64),
    packageDigest,
    lockedAt: "2026-10-06T05:40:00.000Z",
  }));
}

test("exactTextRequired is preserved in the positive prompt and prompt digest", () => {
  const withoutText = getMuseoZeroReferenceIntent("lia");
  withoutText.packageDigest = "a".repeat(64);
  withoutText.negativeConstraints = [];
  withoutText.forbiddenTextPatterns = [];

  const withText: VisualIntentSpec = {
    ...structuredClone(withoutText),
    exactTextRequired: ["EXIT 7"],
  };

  const base = compileVisualPrompt(withoutText, "FLUX2_KLEIN_4B");
  const compiled = compileVisualPrompt(withText, "FLUX2_KLEIN_4B");

  assert.match(compiled.positivePrompt, /exact text required:\s*EXIT 7/i);
  assert.notEqual(compiled.promptDigest, base.promptDigest);
});

test("offline shot preflight binds receipts to the ordered immutable reference locks used by shot compilation", async () => {
  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const referenceLocks = makeReferenceLocks(packageDigest);
  const options: CanonicalVisualPreflightOptions & { referenceLocks: VisualReferenceLock[] } = {
    mode: "shots",
    humanPreflightPass: true,
    createdAt: "2026-10-06T05:40:00.000Z",
    referenceLocks,
  };

  const qualification = await compileCanonicalVisualPreflight(options);
  assert.equal(qualification.mode, "shots");
  assert.equal(qualification.receipts.length, 6);

  const lockBySubject = new Map(referenceLocks.map((lock) => [lock.subjectRef, lock]));
  for (let index = 0; index < qualification.sourceSpecs.length; index += 1) {
    const spec = qualification.sourceSpecs[index];
    const receipt = qualification.receipts[index];
    const expectedUrls = spec.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl);
    assert.deepEqual(receipt?.compiledPrompts[0]?.referenceInputs, expectedUrls);
  }

  const state = {
    ...createInitialVisualFactoryState(packageDigest),
    stage: "READY_FOR_SHOTS" as const,
    referenceLocks,
  };
  const plan = compileShotJobs(project, packageDigest, state, qualification.receipts);
  assert.equal(plan.decision, "SHOT_GENERATION_READY");
  assert.equal(plan.jobs.length, 6);
  for (const job of plan.jobs) {
    assert.equal(job.referenceInputs.length, job.referenceInputDigests?.length);
    for (let index = 0; index < job.referenceInputs.length; index += 1) {
      const lock = referenceLocks.find((item) => item.assetUrl === job.referenceInputs[index]);
      assert.equal(job.referenceInputDigests?.[index], lock?.assetSha256);
    }
  }
});

test("offline shot preflight fails closed without immutable reference-lock evidence", async () => {
  await assert.rejects(
    () => compileCanonicalVisualPreflight({
      mode: "shots",
      humanPreflightPass: true,
      createdAt: "2026-10-06T05:40:00.000Z",
    }),
    /REFERENCE_LOCK/i,
  );
});
