import assert from "node:assert/strict";
import test from "node:test";
import {
  PREFLIGHT_AUTHORITY_FLAGS,
  VISUAL_INTENT_SCHEMA_VERSION,
  VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION,
  canonicalDigest,
} from "./visual-preflight";

test("visual preflight contracts use exact schema identities and fixed authority defaults", () => {
  assert.equal(VISUAL_INTENT_SCHEMA_VERSION, "atlas.visual-intent-spec/v0.1");
  assert.equal(VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION, "atlas.visual-preflight-receipt/v0.1");
  assert.deepEqual(PREFLIGHT_AUTHORITY_FLAGS, {
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  });
});

test("canonical digest is stable across object key ordering and changes with semantic content", () => {
  const left = {
    schemaVersion: "atlas.visual-intent-spec/v0.1",
    subjectRefs: ["lia"],
    camera: { viewpoint: "eye-level", shotScale: "medium" },
  };
  const reordered = {
    camera: { shotScale: "medium", viewpoint: "eye-level" },
    subjectRefs: ["lia"],
    schemaVersion: "atlas.visual-intent-spec/v0.1",
  };
  const changed = {
    ...left,
    subjectRefs: ["omar"],
  };

  assert.equal(canonicalDigest(left), canonicalDigest(reordered));
  assert.notEqual(canonicalDigest(left), canonicalDigest(changed));
  assert.match(canonicalDigest(left), /^[0-9a-f]{64}$/);
});
