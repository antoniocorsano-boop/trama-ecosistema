import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import type { OrchestrationContext } from "./visual-factory-orchestrator";
import { createCloudflareWorkersAiAdapter } from "./visual-factory-provider-cloudflare";

const DIGEST = "e".repeat(64);
const TOKEN = "cf_secret_test_value";
const ACCOUNT_ID = "account-test";
const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

function context(): OrchestrationContext {
  return { unfinishedCanonicalReferenceCount: 0, hfConfiguredFloorSeconds: 40, hfSafetyMarginSeconds: 20 };
}

function plan(referenceInputs: string[] = []): VisualGenerationPlan {
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    planType: referenceInputs.length ? "SHOT_GENERATION" : "REFERENCE_GENERATION",
    decision: referenceInputs.length ? "SHOT_GENERATION_READY" : "REFERENCE_GENERATION_READY",
    jobs: [{
      jobId: referenceInputs.length ? "shot-F1" : "reference-lia",
      purpose: referenceInputs.length ? "SCENE_FRAME" : "CHARACTER_REFERENCE",
      subjectRef: referenceInputs.length ? "F1" : "lia",
      shotId: referenceInputs.length ? "F1" : undefined,
      sceneRef: referenceInputs.length ? "MZ1_FAILED_REHEARSAL" : undefined,
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: "cinematic museum scene",
      negativeConstraints: ["dashboard aesthetic"],
      referenceInputs,
      referenceInputDigests: referenceInputs.map(() => "d".repeat(64)),
      aspectRatio: "4:3",
      maxVariants: 1,
      preflightReceiptId: "vpc-test-receipt",
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

function successResponse(bytes = Uint8Array.from([1, 2, 3, 4])): Response {
  return new Response(JSON.stringify({ success: true, result: { image: Buffer.from(bytes).toString("base64") } }), { status: 200, headers: { "content-type": "application/json" } });
}

test("Cloudflare is ineligible without explicit credentials and Workers Free admission", async () => {
  let calls = 0;
  for (const config of [{}, { token: TOKEN, accountId: ACCOUNT_ID }, { token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: false }]) {
    const adapter = createCloudflareWorkersAiAdapter(config, { fetchImpl: async () => { calls += 1; return successResponse(); } });
    const eligibility = await adapter.preflight(plan(), context());
    assert.equal(eligibility.eligible, false);
  }
  assert.equal(calls, 0);
});

test("Cloudflare uses the exact preflight-authorized FLUX.2 Klein 4B endpoint and rejects capacity queuing", async () => {
  let requestedUrl = "";
  const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
    fetchImpl: async (input) => { requestedUrl = String(input); return successResponse(); },
  });
  const outcome = await adapter.execute(plan(), context());
  assert.equal(outcome.kind, "SUCCEEDED");
  const url = new URL(requestedUrl);
  assert.equal(`${url.origin}${url.pathname}`, `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`);
  assert.equal(url.searchParams.get("rejectIfBusy"), "true");
  assert.equal(outcome.receipt?.assets[0]?.modelRef, MODEL);
});

test("Cloudflare forwards up to four prepared reference images as input_image_0..3", async () => {
  const refs = [0, 1, 2, 3].map((index) => `https://assets.invalid/ref-${index}.webp`);
  const prepared: string[] = [];
  const fields: string[] = [];
  const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
    async prepareReferenceImage(url) {
      prepared.push(url);
      return new Blob([Uint8Array.from([7, 8, 9])], { type: "image/webp" });
    },
    fetchImpl: async (_input, init) => {
      const form = init?.body as FormData;
      for (const key of form.keys()) fields.push(key);
      return successResponse();
    },
  });
  const outcome = await adapter.execute(plan(refs), context());
  assert.equal(outcome.kind, "SUCCEEDED");
  assert.deepEqual(prepared, refs);
  assert.deepEqual(fields.filter((key) => key.startsWith("input_image_")), ["input_image_0", "input_image_1", "input_image_2", "input_image_3"]);
});

test("more than four required reference images fails closed before Workers AI", async () => {
  let calls = 0;
  const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
    fetchImpl: async () => { calls += 1; return successResponse(); },
  });
  const outcome = await adapter.execute(plan(["a", "b", "c", "d", "e"]), context());
  assert.equal(outcome.kind, "PERMANENT_FAILURE");
  assert.equal(outcome.detail, "CLOUDFLARE_REFERENCE_LIMIT_EXCEEDED");
  assert.equal(calls, 0);
});

test("Cloudflare 429 is exhausted while timeout and transient 5xx are retryable", async () => {
  const cases: Array<{ response?: Response; error?: Error; expected: string }> = [
    { response: new Response("rate", { status: 429 }), expected: "PROVIDER_EXHAUSTED" },
    { response: new Response("temporary", { status: 503 }), expected: "RETRYABLE_PROVIDER_FAILURE" },
    { error: Object.assign(new Error("timeout"), { name: "TimeoutError" }), expected: "RETRYABLE_PROVIDER_FAILURE" },
  ];
  for (const item of cases) {
    const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
      fetchImpl: async () => { if (item.error) throw item.error; return item.response!; },
    });
    const outcome = await adapter.execute(plan(), context());
    assert.equal(outcome.kind, item.expected);
  }
});

test("Cloudflare authentication failures are non-retryable and redact credentials", async () => {
  for (const status of [401, 403]) {
    const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
      fetchImpl: async () => new Response(`denied ${TOKEN}`, { status }),
    });
    const outcome = await adapter.execute(plan(), context());
    assert.equal(outcome.kind, "PROVIDER_INELIGIBLE");
    assert.equal(outcome.detail?.includes(TOKEN), false);
  }
});

test("valid Cloudflare Base64 output becomes a provenance-complete hashed candidate", async () => {
  const bytes = Uint8Array.from([10, 20, 30, 40]);
  const adapter = createCloudflareWorkersAiAdapter({ token: TOKEN, accountId: ACCOUNT_ID, workersFreeAdmitted: true }, {
    fetchImpl: async () => successResponse(bytes),
  });
  const outcome = await adapter.execute(plan(), context());
  assert.equal(outcome.kind, "SUCCEEDED");
  const asset = outcome.receipt?.assets[0];
  assert.ok(asset);
  assert.equal(asset.modelRef, MODEL);
  assert.equal(asset.workflowRef, "cloudflare-workers-ai.flux2-klein-4b/v0.1");
  assert.match(asset.sha256, /^[0-9a-f]{64}$/);
  assert.equal(asset.provenanceStatus, "RECORDED");
  assert.equal(asset.packageDigest, DIGEST);
  assert.ok(asset.url.startsWith("data:image/"));
  assert.equal(outcome.receipt?.paidComputeAuthorized, false);
  assert.equal(outcome.receipt?.publicationAuthorityGranted, false);
});
