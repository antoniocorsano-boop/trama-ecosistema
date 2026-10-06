import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import { createCloudflareWorkersAiAdapter } from "./visual-factory-provider-cloudflare";
import { assertVisualReferenceBytesMatchDigest } from "./visual-reference-integrity";

const bytes = Uint8Array.from([1, 2, 3, 4, 5]);
const digest = createHash("sha256").update(bytes).digest("hex");

test("reference bytes must match the immutable lock digest", () => {
  assert.doesNotThrow(() => assertVisualReferenceBytesMatchDigest(bytes, digest));
  assert.throws(
    () => assertVisualReferenceBytesMatchDigest(bytes, "f".repeat(64)),
    /VISUAL_REFERENCE_CONTENT_DIGEST_MISMATCH/,
  );
});

function shotPlan(): VisualGenerationPlan {
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: "a".repeat(64),
    planType: "SHOT_GENERATION",
    decision: "SHOT_GENERATION_READY",
    jobs: [{
      jobId: "shot-F4",
      purpose: "SCENE_FRAME",
      subjectRef: "F4",
      shotId: "F4",
      sceneRef: "MZ4_TEST_MAPPING",
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: "fixture",
      negativeConstraints: [],
      referenceInputs: ["https://assets.invalid/teo.png"],
      referenceInputDigests: [digest],
      aspectRatio: "16:9",
      maxVariants: 1,
      preflightReceiptId: "vpc-fixture",
      preflightSpecDigest: "b".repeat(64),
      compiledPromptDigest: "c".repeat(64),
      preflightState: "PREFLIGHT_PASS",
    }],
    blockers: [],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

test("Cloudflare preparation receives the digest bound to each reference URL", async () => {
  const seen: Array<[string, string | undefined]> = [];
  const adapter = createCloudflareWorkersAiAdapter({
    token: "token",
    accountId: "account",
    workersFreeAdmitted: true,
  }, {
    prepareReferenceImage: async (url: string, expectedDigest?: string) => {
      seen.push([url, expectedDigest]);
      return new Blob([bytes], { type: "image/webp" });
    },
    fetchImpl: async () => new Response(JSON.stringify({
      success: true,
      result: { image: Buffer.from(bytes).toString("base64") },
    }), { status: 200, headers: { "content-type": "application/json" } }),
  });

  const outcome = await adapter.execute(shotPlan(), {
    unfinishedCanonicalReferenceCount: 0,
    hfConfiguredFloorSeconds: 40,
    hfSafetyMarginSeconds: 20,
  });
  assert.equal(outcome.kind, "SUCCEEDED");
  assert.deepEqual(seen, [["https://assets.invalid/teo.png", digest]]);
});
