import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { materializeReviewAssets } from "../lib/visual-factory-artifact-materializer";
import type { VisualGenerationPlan, VisualExecutionReceipt } from "../lib/visual-factory";
import {
  assertExactCanonicalVisualPreflightBoundPlan,
  assertVisualPreflightBoundPlan,
} from "../lib/visual-factory-execution-contract";
import {
  loadPersistedVisualPreflightEvidence,
  loadPersistedVisualReferenceLockEvidence,
} from "../lib/visual-preflight-evidence-node";
import {
  orchestrateVisualGeneration,
  selectProviderOrder,
  type OrchestrationContext,
  type VisualProviderId,
} from "../lib/visual-factory-orchestrator";
import {
  buildVisualProviderConfig,
  createConfiguredVisualProviderAdapters,
  publicVisualProviderConfigSummary,
} from "../lib/visual-factory-route-config";

type RunMode = "dry-run" | "references" | "shots";
type EligibilityRecord = { provider: VisualProviderId; configured: boolean; eligible: boolean; reason: string; remainingGpuSeconds?: number };

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}
function parseMode(value: string | undefined): RunMode {
  if (value === "dry-run" || value === "references" || value === "shots") return value;
  throw new Error("VF_ORCH_INVALID_MODE");
}
function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error("VF_ORCH_INVALID_REFERENCE_COUNT");
  return parsed;
}
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }

function validatePlanShape(raw: unknown, mode: RunMode): VisualGenerationPlan {
  if (!isRecord(raw)) throw new Error("VF_ORCH_PLAN_NOT_OBJECT");
  if (raw.schemaVersion !== "atlas.visual-generation-plan/v0.1") throw new Error("VF_ORCH_PLAN_SCHEMA_UNSUPPORTED");
  if (typeof raw.packageDigest !== "string" || !/^[0-9a-f]{64}$/.test(raw.packageDigest)) throw new Error("VF_ORCH_PLAN_DIGEST_INVALID");
  if (!Array.isArray(raw.jobs) || !Array.isArray(raw.blockers)) throw new Error("VF_ORCH_PLAN_COLLECTIONS_INVALID");
  if (raw.paidComputeAuthorized !== false || raw.allowQualityDowngrade !== false || raw.runtimeAuthorized !== false || raw.publicationAuthorityGranted !== false) {
    throw new Error("VF_ORCH_PLAN_AUTHORITY_VIOLATION");
  }
  const plan = raw as unknown as VisualGenerationPlan;
  assertVisualPreflightBoundPlan(plan);
  if (mode === "references" && plan.planType !== "REFERENCE_GENERATION") throw new Error("VF_ORCH_REFERENCE_PLAN_REQUIRED");
  if (mode === "shots") {
    if (plan.planType !== "SHOT_GENERATION" || plan.decision !== "SHOT_GENERATION_READY") throw new Error("VF_ORCH_LOCKED_SHOT_PLAN_REQUIRED");
    if (!plan.jobs.length || plan.jobs.some((job) => !job.referenceInputs.length)) throw new Error("VF_ORCH_LOCKED_REFERENCES_REQUIRED");
  }
  return plan;
}

function contextFor(plan: VisualGenerationPlan): OrchestrationContext {
  return {
    unfinishedCanonicalReferenceCount: positiveInteger(process.env.VISUAL_FACTORY_UNFINISHED_CANONICAL_REFERENCES, plan.planType === "REFERENCE_GENERATION" ? plan.jobs.length : 0),
    hfConfiguredFloorSeconds: Number(process.env.VISUAL_FACTORY_HF_FLOOR_SECONDS || 40),
    hfSafetyMarginSeconds: Number(process.env.VISUAL_FACTORY_HF_SAFETY_MARGIN_SECONDS || 20),
    measuredReferenceP95Seconds: process.env.VISUAL_FACTORY_HF_REFERENCE_P95_SECONDS ? Number(process.env.VISUAL_FACTORY_HF_REFERENCE_P95_SECONDS) : undefined,
  };
}
function assertGovernedReceipt(receipt: VisualExecutionReceipt): void {
  if (receipt.costClass !== "FREE_ONLY" || receipt.paidComputeAuthorized !== false || receipt.allowQualityDowngrade !== false || receipt.runtimeAuthorized !== false || receipt.publicationAuthorityGranted !== false) {
    throw new Error("VF_ORCH_RECEIPT_AUTHORITY_VIOLATION");
  }
}

async function main(): Promise<void> {
  const mode = parseMode(argument("--mode") ?? process.env.VISUAL_FACTORY_MODE ?? "dry-run");
  const planPath = argument("--plan") ?? process.env.VISUAL_FACTORY_PLAN_PATH;
  if (!planPath) throw new Error("VF_ORCH_PLAN_PATH_REQUIRED");
  const preflightPath = argument("--preflight") ?? process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR;
  if (!preflightPath) throw new Error("VF_ORCH_PREFLIGHT_EVIDENCE_REQUIRED");
  const outputDir = resolve(argument("--output") ?? process.env.VISUAL_FACTORY_EVIDENCE_DIR ?? "visual-factory-evidence");
  await mkdir(outputDir, { recursive: true });

  const plan = validatePlanShape(JSON.parse(await readFile(resolve(planPath), "utf8")), mode);
  const preflightReceipts = await loadPersistedVisualPreflightEvidence(preflightPath, plan);
  const referenceLocks = await loadPersistedVisualReferenceLockEvidence(preflightPath, plan);
  assertExactCanonicalVisualPreflightBoundPlan(plan, preflightReceipts, referenceLocks);

  const config = buildVisualProviderConfig(process.env);
  const adapters = createConfiguredVisualProviderAdapters(config);
  const ctx = contextFor(plan);
  const consideredProviders = selectProviderOrder(plan, ctx);

  if (mode === "dry-run") {
    const eligibility: EligibilityRecord[] = [];
    for (const provider of consideredProviders) {
      const adapter = adapters[provider];
      if (!adapter) { eligibility.push({ provider, configured: false, eligible: false, reason: "NOT_CONFIGURED" }); continue; }
      try {
        const result = await adapter.preflight(plan, ctx);
        eligibility.push({ provider, configured: true, eligible: result.eligible, reason: result.reason, remainingGpuSeconds: result.remainingGpuSeconds });
      } catch { eligibility.push({ provider, configured: true, eligible: false, reason: "PREFLIGHT_ERROR" }); }
    }
    await writeFile(resolve(outputDir, "eligibility.json"), `${JSON.stringify({
      schemaVersion: "atlas.visual-orchestrator-dry-run/v0.1", mode, packageDigest: plan.packageDigest, costClass: "FREE_ONLY",
      providerConfig: publicVisualProviderConfigSummary(config), consideredProviders, eligibility,
      runtimeAuthorized: false, publicationAuthorityGranted: false,
    }, null, 2)}\n`, "utf8");
    console.log("VF_ORCH_DRY_RUN_COMPLETE");
    return;
  }

  const receipt = await orchestrateVisualGeneration(plan, adapters, ctx);
  assertGovernedReceipt(receipt);
  await writeFile(resolve(outputDir, "receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDir, "asset-index.json"), `${JSON.stringify({
    schemaVersion: "atlas.visual-orchestrator-asset-index/v0.1", packageDigest: receipt.packageDigest, status: receipt.status, costClass: "FREE_ONLY",
    assets: receipt.assets.map(({ assetId, subjectRef, purpose, sha256, modelRef, workflowRef, createdAt, packageDigest, provenanceStatus }) => ({ assetId, subjectRef, purpose, sha256, modelRef, workflowRef, createdAt, packageDigest, provenanceStatus })),
    runtimeAuthorized: false, publicationAuthorityGranted: false,
  }, null, 2)}\n`, "utf8");
  if (receipt.status === "SUCCEEDED") await materializeReviewAssets(receipt, resolve(outputDir, "candidates"), { token: process.env.HF_TOKEN });
  console.log(`VF_ORCH_${receipt.status}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "VF_ORCH_UNKNOWN_ERROR";
  console.error(message);
  process.exitCode = 1;
});
