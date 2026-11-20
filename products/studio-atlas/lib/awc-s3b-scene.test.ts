import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AWC_S3B_ENGINE_VERSION, AWC_S3B_SCENE, AWC_S3B_SOURCE_GIT_BLOB,
  cameraEye, clampOrbit, lightingValues, nextOrbit, validateAwcSceneSpec,
} from "./awc-s3b-scene";

test("AWC S3b: reads the exact immutable AWC-F source blob, never a regenerated scene", () => {
  const original = readFileSync(join(process.cwd(), "lib", "fixtures", "awc-museo-zero-transfer.json"));
  const object = Buffer.concat([Buffer.from(`blob ${original.length}\0`), original]);
  assert.equal(createHash("sha1").update(object).digest("hex"), AWC_S3B_SOURCE_GIT_BLOB);
  assert.doesNotThrow(validateAwcSceneSpec);
  assert.equal(AWC_S3B_ENGINE_VERSION, "0.128.0");
  assert.equal(AWC_S3B_SCENE.objects.length, 16);
  assert.equal(AWC_S3B_SCENE.objects.length * 12, 192);
});

test("AWC S3b: orbit conforms to existing ASD camera.orbit parameter and exact reset", () => {
  const baseline = cameraEye(0);
  const rotated = cameraEye(nextOrbit(0, 30));
  assert.notDeepEqual(rotated, baseline);
  assert.equal(nextOrbit(0, 30), 0.12);
  assert.equal(clampOrbit(100), 0.3);
  assert.equal(clampOrbit(-100), -0.3);
  assert.deepEqual(cameraEye(0), baseline);
  assert.throws(() => clampOrbit(Number.NaN), /orbita/);
  assert.throws(() => nextOrbit(0, Number.POSITIVE_INFINITY), /spostamento/);
});

test("AWC S3b: original and balanced lighting profiles are separate and reversible", () => {
  const reference = lightingValues("reference");
  const balanced = lightingValues("balanced");
  assert.equal(reference.exposure, 1.15);
  assert.equal(reference.hemisphere, 1.1);
  assert.equal(balanced.exposure < reference.exposure, true);
  assert.equal(balanced.hemisphere < reference.hemisphere, true);
  assert.equal(balanced.shadows, true);
  // Mobile A/B screenshots: preserve original reference but move the alternate
  // out of overly dark exposure with walls/trim no longer casting harsh shadows.
  assert.equal(balanced.exposure, 0.86);
  assert.equal(balanced.hemisphere, 0.82);
  assert.equal(balanced.directional, 1.03);
  assert.equal(balanced.fill, 0.72);
  assert.ok(balanced.exposure > 0.74 && balanced.exposure < reference.exposure);
  assert.deepEqual(lightingValues("reference"), reference);
});
