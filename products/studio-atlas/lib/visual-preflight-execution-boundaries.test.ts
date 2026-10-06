import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/visual-factory/execute/route";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { getMuseoZeroReferenceIntent } from "./canonical/museo-zero-visual-intents";
import {
  compileReferenceJobs,
  createInitialVisualFactoryState,
  type VisualGenerationPlan,
} from "./visual-factory";
import { executeVisualFactoryPlan } from "./visual-factory-executor";
import {
  orchestrateVisualGeneration,
  type OrchestrationContext,
  type ProviderAttemptOutcome,
  type ProviderEligibility,
  type VisualProviderAdapter,
  type VisualProviderId,
} from "./visual-factory-orchestrator";
import { createCloudflareWorkersAiAdapter } from "./visual-factory-provider-cloudflare";
import { createHfZeroGpuAdapter } from "./visual-factory-provider-hf";
import { createVisualPreflightReceipt } from "./visual-preflight";

const DIGEST = "a".repeat(64);

function boundPlan(): VisualGenerationPlan {
  const project = createMuseoZeroPilotProject();
  const spec = { ...getMuseoZeroReferenceIntent("lia"), packageDigest: DIGEST };
  const receipt = createVisualPreflightReceipt({
    spec,
    providerFamily: "FLUX2_KLEIN_4B",
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "PASS",
    createdAt: "2026-10-06T02:00:00.000Z",
  });
  const state = {
    ...createInitialVisualFactoryState(DIGEST),
    referenceLocks: ["omar", "teo", "sala-zero", "cabina-regia"].map((subjectRef) => ({
      subjectRef,
      assetId: `${subjectRef}-locked`,
      assetUrl: `https://assets.invalid/${subjectRef}.png`,
      packageDigest: DIGEST,
      lockedAt: "2026-10-06T02:00:00.000Z",
    })),
  };
  return compileReferenceJobs(project, DIGEST, state, [receipt]);
}

function unboundPlan(): VisualGenerationPlan {
  const plan = structuredClone(boundPlan());
  delete plan.jobs[0].preflightReceiptId;
  delete plan.jobs[0].preflightSpecDigest;
  delete plan.jobs[0].compiledPromptDigest;
  delete plan.jobs[0].preflightState;
  return plan;
}

function ctx(): OrchestrationContext {
  return {
    unfinishedCanonicalReferenceCount: 1,
    hfConfiguredFloorSeconds: 40,
    hfSafetyMarginSeconds: 20,
  };
}

function successOutcome(provider: VisualProviderId): ProviderAttemptOutcome {
  return {
    kind: "SUCCEEDED",
    receipt: {
      schemaVersion: "atlas.visual-execution-receipt/v0.1",
      receiptId: `receipt-${provider}`,
      packageDigest: DIGEST,
      status: "SUCCEEDED",
      costClass: "FREE_ONLY",
      assets: [{
        assetId: "lia-1",
        subjectRef: "lia",
        purpose: "CHARACTER_REFERENCE",
        url: "https://assets.invalid/lia.png",
        sha256: "d".repeat(64),
        modelRef: provider,
        workflowRef: "fixture/v0.1",
        createdAt: "2026-10-06T02:00:00.000Z",
        packageDigest: DIGEST,
        provenanceStatus: "RECORDED",
      }],
      paidComputeAuthorized: false,
      allowQualityDowngrade: false,
      runtimeAuthorized: false,
      publicationAuthorityGranted: false,
    },
  };
}

test("same-origin executor performs zero fetches for an unbound hand-crafted plan", async () => {
  let fetchCalls = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCalls += 1;
    return new Response("{}", { status: 200 });
  };

  const receipt = await executeVisualFactoryPlan(unboundPlan(), fetchImpl);

  assert.equal(fetchCalls, 0);
  assert.equal(receipt.status, "FAILED");
  assert.equal(receipt.failureDetail, "VISUAL_PREFLIGHT_BINDING_INVALID");
});

test("valid-looking forged prompt or digest bindings perform zero gateway fetches", async () => {
  const mutations: Array<(plan: VisualGenerationPlan) => void> = [
    (plan) => { plan.jobs[0].prompt = `${plan.jobs[0].prompt}. rogue dashboard`; },
    (plan) => { plan.jobs[0].compiledPromptDigest = "e".repeat(64); },
    (plan) => { plan.jobs[0].preflightSpecDigest = "f".repeat(64); },
    (plan) => { plan.jobs[0].preflightReceiptId = "vpc-ffffffffffffffffffffffffffffffff"; },
  ];

  for (const mutate of mutations) {
    let fetchCalls = 0;
    const plan = structuredClone(boundPlan());
    mutate(plan);
    const receipt = await executeVisualFactoryPlan(plan, async () => {
      fetchCalls += 1;
      return new Response("{}", { status: 200 });
    });
    assert.equal(fetchCalls, 0);
    assert.equal(receipt.status, "FAILED");
    assert.equal(receipt.failureDetail, "VISUAL_PREFLIGHT_BINDING_INVALID");
  }
});

test("HTTP execution route rejects an unbound canonical plan before provider selection", async () => {
  const request = new Request("http://localhost/api/visual-factory/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(unboundPlan()),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "INVALID_VISUAL_GENERATION_PLAN" });
});

test("HTTP execution route rejects valid-looking forged prompt bindings", async () => {
  const plan = boundPlan();
  plan.jobs[0].prompt = `${plan.jobs[0].prompt}. injected semantic mutation`;
  const request = new Request("http://localhost/api/visual-factory/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(plan),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "INVALID_VISUAL_GENERATION_PLAN" });
});

test("orchestrator rejects an unbound hand-crafted plan before adapter preflight", async () => {
  let providerCalls = 0;
  const adapter: VisualProviderAdapter = {
    id: "HF_ZEROGPU",
    async preflight(): Promise<ProviderEligibility> {
      providerCalls += 1;
      return { eligible: true, reason: "SHOULD_NOT_RUN" };
    },
    async execute(): Promise<ProviderAttemptOutcome> {
      providerCalls += 1;
      return successOutcome("HF_ZEROGPU");
    },
  };

  await assert.rejects(
    () => orchestrateVisualGeneration(unboundPlan(), { HF_ZEROGPU: adapter }, ctx()),
    /VISUAL_PREFLIGHT_BINDING_INVALID/,
  );
  assert.equal(providerCalls, 0);
});

test("HF provider boundary rejects missing preflight bindings before quota or inference calls", async () => {
  let quotaCalls = 0;
  let predictCalls = 0;
  const adapter = createHfZeroGpuAdapter(
    { token: "hf_test", spaceUrl: "owner/space" },
    {
      async getQuota() { quotaCalls += 1; return { base: 300, remaining: 300, overquotaUsed: 0 }; },
      async predict() { predictCalls += 1; return []; },
    },
  );

  const eligibility = await adapter.preflight(unboundPlan(), ctx());
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.reason, "VISUAL_PREFLIGHT_BINDING_INVALID");
  assert.equal(quotaCalls, 0);

  const outcome = await adapter.execute(unboundPlan(), ctx());
  assert.equal(outcome.kind, "PERMANENT_FAILURE");
  assert.equal(outcome.detail, "VISUAL_PREFLIGHT_BINDING_INVALID");
  assert.equal(predictCalls, 0);
});

test("Cloudflare provider boundary rejects missing preflight bindings before Workers AI", async () => {
  let fetchCalls = 0;
  const adapter = createCloudflareWorkersAiAdapter(
    { token: "cf_test", accountId: "account", workersFreeAdmitted: true },
    {
      fetchImpl: async () => {
        fetchCalls += 1;
        return new Response("{}", { status: 500 });
      },
    },
  );

  const eligibility = await adapter.preflight(unboundPlan(), ctx());
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.reason, "VISUAL_PREFLIGHT_BINDING_INVALID");
  const outcome = await adapter.execute(unboundPlan(), ctx());
  assert.equal(outcome.kind, "PERMANENT_FAILURE");
  assert.equal(outcome.detail, "VISUAL_PREFLIGHT_BINDING_INVALID");
  assert.equal(fetchCalls, 0);
});

test("HF to Cloudflare fallback preserves exact prompt and all preflight binding fields", async () => {
  const observed: Array<[VisualProviderId, string, string | undefined, string | undefined, string | undefined]> = [];
  function recordingAdapter(
    id: VisualProviderId,
    outcome: ProviderAttemptOutcome,
  ): VisualProviderAdapter {
    return {
      id,
      async preflight(plan): Promise<ProviderEligibility> {
        const job = plan.jobs[0];
        observed.push([id, job.prompt, job.compiledPromptDigest, job.preflightSpecDigest, job.preflightReceiptId]);
        return { eligible: true, reason: "ELIGIBLE", remainingGpuSeconds: 300 };
      },
      async execute(plan): Promise<ProviderAttemptOutcome> {
        const job = plan.jobs[0];
        observed.push([id, job.prompt, job.compiledPromptDigest, job.preflightSpecDigest, job.preflightReceiptId]);
        return outcome;
      },
    };
  }

  const plan = boundPlan();
  const receipt = await orchestrateVisualGeneration(
    plan,
    {
      HF_ZEROGPU: recordingAdapter("HF_ZEROGPU", { kind: "RETRYABLE_PROVIDER_FAILURE", detail: "TIMEOUT" }),
      CLOUDFLARE_WORKERS_AI: recordingAdapter("CLOUDFLARE_WORKERS_AI", successOutcome("CLOUDFLARE_WORKERS_AI")),
    },
    { ...ctx(), hfQuotaRemainingSeconds: 300 },
  );

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(observed.length, 4);
  const expected = [
    plan.jobs[0].prompt,
    plan.jobs[0].compiledPromptDigest,
    plan.jobs[0].preflightSpecDigest,
    plan.jobs[0].preflightReceiptId,
  ];
  for (const [, prompt, promptDigest, specDigest, receiptId] of observed) {
    assert.deepEqual([prompt, promptDigest, specDigest, receiptId], expected);
  }
});
