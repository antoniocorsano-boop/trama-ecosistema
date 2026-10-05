import assert from "node:assert/strict";
import test from "node:test";
import { orchestrateVisualGeneration } from "./visual-factory-orchestrator";
import type { VisualGenerationPlan } from "./visual-factory";
import {
  buildVisualProviderConfig,
  createConfiguredVisualProviderAdapters,
  publicVisualProviderConfigSummary,
} from "./visual-factory-route-config";

const DIGEST = "f".repeat(64);

const PLAN: VisualGenerationPlan = {
  schemaVersion: "atlas.visual-generation-plan/v0.1",
  pathwayId: "pw-strategy-selection-01-museo-zero",
  packageDigest: DIGEST,
  planType: "REFERENCE_GENERATION",
  decision: "REFERENCE_GENERATION_READY",
  jobs: [{
    jobId: "reference-lia",
    purpose: "CHARACTER_REFERENCE",
    subjectRef: "lia",
    workflowFamily: "flux2-klein-4b/v0.2",
    prompt: "test",
    negativeConstraints: [],
    referenceInputs: [],
    aspectRatio: "3:4",
    maxVariants: 1,
  }],
  blockers: [],
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
};

function orchestrationContext() {
  return {
    unfinishedCanonicalReferenceCount: 1,
    hfConfiguredFloorSeconds: 40,
    hfSafetyMarginSeconds: 20,
  };
}

test("no provider configuration produces no adapters and degrades to WAITING_FOR_COMPUTE", async () => {
  const config = buildVisualProviderConfig({});
  const adapters = createConfiguredVisualProviderAdapters(config);
  assert.deepEqual(Object.keys(adapters), []);

  const receipt = await orchestrateVisualGeneration(PLAN, adapters, orchestrationContext());
  assert.equal(receipt.status, "WAITING_FOR_COMPUTE");
  assert.equal(receipt.failureCategory, "NO_FREE_PROVIDER");
});

test("HF credentials never authorize Cloudflare and Cloudflare credentials never authorize HF", () => {
  const hfOnly = buildVisualProviderConfig({
    HF_TOKEN: "hf_secret",
    HF_VISUAL_FACTORY_SPACE_REPO: "owner/space",
  });
  assert.equal(Boolean(hfOnly.hf), true);
  assert.equal(Boolean(hfOnly.cloudflare), false);

  const cfOnly = buildVisualProviderConfig({
    CLOUDFLARE_API_TOKEN: "cf_secret",
    CLOUDFLARE_ACCOUNT_ID: "account",
    CLOUDFLARE_WORKERS_FREE_ADMITTED: "true",
  });
  assert.equal(Boolean(cfOnly.hf), false);
  assert.equal(Boolean(cfOnly.cloudflare), true);
});

test("Cloudflare Workers Free admission defaults to false", () => {
  const config = buildVisualProviderConfig({
    CLOUDFLARE_API_TOKEN: "cf_secret",
    CLOUDFLARE_ACCOUNT_ID: "account",
  });
  assert.equal(config.cloudflare?.workersFreeAdmitted, false);
  assert.deepEqual(Object.keys(createConfiguredVisualProviderAdapters(config)), []);
});

test("public provider summary contains readiness only and never serializes provider secrets", () => {
  const hfSecret = "hf_super_secret";
  const cfSecret = "cf_super_secret";
  const accountSecret = "account_super_secret";
  const config = buildVisualProviderConfig({
    HF_TOKEN: hfSecret,
    HF_VISUAL_FACTORY_SPACE_REPO: "owner/private-space",
    CLOUDFLARE_API_TOKEN: cfSecret,
    CLOUDFLARE_ACCOUNT_ID: accountSecret,
    CLOUDFLARE_WORKERS_FREE_ADMITTED: "true",
  });
  const serialized = JSON.stringify(publicVisualProviderConfigSummary(config));
  assert.equal(serialized.includes(hfSecret), false);
  assert.equal(serialized.includes(cfSecret), false);
  assert.equal(serialized.includes(accountSecret), false);
  assert.equal(serialized.includes("owner/private-space"), false);
});

test("legacy Gradio executor configuration is translated only to the HF adapter", () => {
  const config = buildVisualProviderConfig({
    VISUAL_FACTORY_EXECUTOR_KIND: "GRADIO",
    VISUAL_FACTORY_EXECUTOR_URL: "owner/legacy-space",
    VISUAL_FACTORY_EXECUTOR_TOKEN: "hf_legacy",
  });
  assert.equal(config.migrationState, "LEGACY_HF_TRANSLATED");
  assert.equal(config.hf?.spaceUrl, "owner/legacy-space");
  assert.equal(config.hf?.token, "hf_legacy");
  assert.equal(Boolean(config.cloudflare), false);
});

test("legacy generic HTTP executor is rejected with a stable migration state", () => {
  const config = buildVisualProviderConfig({
    VISUAL_FACTORY_EXECUTOR_KIND: "HTTP",
    VISUAL_FACTORY_EXECUTOR_URL: "https://executor.invalid/run",
    VISUAL_FACTORY_EXECUTOR_TOKEN: "secret",
  });
  assert.equal(config.migrationState, "LEGACY_HTTP_REJECTED");
  assert.equal(Boolean(config.hf), false);
  assert.equal(Boolean(config.cloudflare), false);
});
