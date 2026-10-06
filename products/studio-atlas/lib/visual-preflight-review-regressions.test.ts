import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
import * as canonicalPreflight from "../scripts/compile-canonical-visual-preflight";
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

test("offline shot preflight binds receipts to ordered immutable reference URLs and content digests", async () => {
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
    const prompt = receipt?.compiledPrompts[0] as (typeof receipt.compiledPrompts)[number] & {
      referenceInputDigests?: string[];
    };
    const expectedUrls = spec.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl);
    const expectedDigests = spec.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetSha256!);
    assert.deepEqual(prompt.referenceInputs, expectedUrls);
    assert.deepEqual(prompt.referenceInputDigests, expectedDigests);
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

test("shot receipt binding changes when locked bytes change at the same URL", async () => {
  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const firstLocks = makeReferenceLocks(packageDigest);
  const changedLocks = firstLocks.map((lock) =>
    lock.subjectRef === "lia" ? { ...lock, assetSha256: "f".repeat(64) } : lock,
  );

  const first = await compileCanonicalVisualPreflight({
    mode: "shots",
    humanPreflightPass: true,
    createdAt: "2026-10-06T05:40:00.000Z",
    referenceLocks: firstLocks,
  });
  const changed = await compileCanonicalVisualPreflight({
    mode: "shots",
    humanPreflightPass: true,
    createdAt: "2026-10-06T05:40:00.000Z",
    referenceLocks: changedLocks,
  });

  assert.equal(first.receipts[0]?.compiledPrompts[0]?.referenceInputs[0], changed.receipts[0]?.compiledPrompts[0]?.referenceInputs[0]);
  assert.notEqual(first.receipts[0]?.compiledPrompts[0]?.promptDigest, changed.receipts[0]?.compiledPrompts[0]?.promptDigest);
  assert.notEqual(first.receipts[0]?.receiptId, changed.receipts[0]?.receiptId);
});

test("offline shot qualification rejects incomplete lock metadata before persistence", async () => {
  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);

  const malformedLocks: VisualReferenceLock[][] = [
    makeReferenceLocks(packageDigest).map((lock, index) => index === 0 ? { ...lock, assetId: "" } : lock),
    makeReferenceLocks(packageDigest).map((lock, index) => index === 0 ? { ...lock, lockedAt: "" } : lock),
    (() => {
      const locks = structuredClone(makeReferenceLocks(packageDigest));
      delete (locks[0] as Partial<VisualReferenceLock>).assetId;
      return locks as VisualReferenceLock[];
    })(),
    (() => {
      const locks = structuredClone(makeReferenceLocks(packageDigest));
      delete (locks[0] as Partial<VisualReferenceLock>).lockedAt;
      return locks as VisualReferenceLock[];
    })(),
  ];

  for (const referenceLocks of malformedLocks) {
    await assert.rejects(
      () => compileCanonicalVisualPreflight({
        mode: "shots",
        humanPreflightPass: true,
        createdAt: "2026-10-06T05:40:00.000Z",
        referenceLocks,
      }),
      /VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID/,
    );
  }
});

test("offline shot qualification persists the exact validated reference-lock envelope", async () => {
  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const referenceLocks = makeReferenceLocks(packageDigest);
  const qualification = await compileCanonicalVisualPreflight({
    mode: "shots",
    humanPreflightPass: true,
    createdAt: "2026-10-06T05:40:00.000Z",
    referenceLocks,
  });
  const writer = (canonicalPreflight as unknown as {
    writeQualificationArtifacts?: (outputDir: string, value: typeof qualification) => Promise<void>;
  }).writeQualificationArtifacts;
  assert.equal(typeof writer, "function");

  const directory = await mkdtemp(join(tmpdir(), "vpc-shot-review-"));
  try {
    await writer!(directory, qualification);
    const envelope = JSON.parse(await readFile(join(directory, "reference-locks.json"), "utf8")) as {
      schemaVersion?: string;
      pathwayId?: string;
      packageDigest?: string;
      locks?: VisualReferenceLock[];
      runtimeAuthorized?: boolean;
      publicationAuthorityGranted?: boolean;
    };
    assert.equal(envelope.schemaVersion, "atlas.visual-reference-lock-evidence/v0.1");
    assert.equal(envelope.pathwayId, qualification.pathwayId);
    assert.equal(envelope.packageDigest, packageDigest);
    assert.deepEqual(envelope.locks, referenceLocks);
    assert.equal(envelope.runtimeAuthorized, false);
    assert.equal(envelope.publicationAuthorityGranted, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
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
