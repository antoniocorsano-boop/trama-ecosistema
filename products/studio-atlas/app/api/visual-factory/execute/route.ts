import { NextResponse } from "next/server";
import type { VisualExecutionReceipt, VisualGenerationPlan } from "../../../../lib/visual-factory";
import {
  assertExactCanonicalVisualPreflightBoundPlan,
  isVisualPreflightBoundPlan,
} from "../../../../lib/visual-factory-execution-contract";
import { waitingForComputeReceipt } from "../../../../lib/visual-factory-executor";
import {
  loadPersistedVisualPreflightEvidence,
  loadPersistedVisualReferenceLockEvidence,
} from "../../../../lib/visual-preflight-evidence-node";
import { orchestrateVisualGeneration } from "../../../../lib/visual-factory-orchestrator";
import {
  buildVisualProviderConfig,
  createConfiguredVisualProviderAdapters,
} from "../../../../lib/visual-factory-route-config";

export const runtime = "nodejs";

function isPlan(value: unknown): value is VisualGenerationPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Partial<VisualGenerationPlan>;
  if (
    plan.schemaVersion !== "atlas.visual-generation-plan/v0.1" ||
    typeof plan.pathwayId !== "string" ||
    typeof plan.packageDigest !== "string" ||
    !/^[0-9a-f]{64}$/.test(plan.packageDigest) ||
    !Array.isArray(plan.jobs) || plan.jobs.length < 1 || plan.jobs.length > 6 ||
    plan.paidComputeAuthorized !== false || plan.allowQualityDowngrade !== false ||
    plan.runtimeAuthorized !== false || plan.publicationAuthorityGranted !== false ||
    !plan.jobs.every((job) => job.workflowFamily === "flux2-klein-4b/v0.2" && job.maxVariants === 1)
  ) return false;
  return isVisualPreflightBoundPlan(plan as VisualGenerationPlan);
}

function responseForReceipt(receipt: VisualExecutionReceipt) {
  const status = receipt.status === "SUCCEEDED" ? 200 : receipt.status === "WAITING_FOR_COMPUTE" ? 503 : 502;
  return NextResponse.json(receipt, { status });
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (!isPlan(raw)) return NextResponse.json({ error: "INVALID_VISUAL_GENERATION_PLAN" }, { status: 400 });

  const evidenceDirectory = process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR?.trim();
  if (!evidenceDirectory) return NextResponse.json({ error: "PREFLIGHT_EVIDENCE_UNAVAILABLE" }, { status: 409 });

  try {
    const receipts = await loadPersistedVisualPreflightEvidence(evidenceDirectory, raw);
    const referenceLocks = await loadPersistedVisualReferenceLockEvidence(evidenceDirectory, raw);
    assertExactCanonicalVisualPreflightBoundPlan(raw, receipts, referenceLocks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "VISUAL_PREFLIGHT_EVIDENCE_INVALID";
    const unavailable = message === "VISUAL_PREFLIGHT_EVIDENCE_UNAVAILABLE" || message === "VISUAL_REFERENCE_LOCK_EVIDENCE_UNAVAILABLE";
    return NextResponse.json(
      { error: unavailable ? "PREFLIGHT_EVIDENCE_UNAVAILABLE" : "INVALID_VISUAL_GENERATION_PLAN" },
      { status: unavailable ? 409 : 400 },
    );
  }

  const config = buildVisualProviderConfig(process.env);
  const adapters = createConfiguredVisualProviderAdapters(config);
  const context = {
    unfinishedCanonicalReferenceCount: raw.planType === "REFERENCE_GENERATION" ? raw.jobs.length : 0,
    hfConfiguredFloorSeconds: config.hfConfiguredFloorSeconds,
    measuredReferenceP95Seconds: config.measuredReferenceP95Seconds,
    hfSafetyMarginSeconds: config.hfSafetyMarginSeconds,
  };
  try {
    const receipt = await orchestrateVisualGeneration(raw, adapters, context);
    if (config.migrationState === "LEGACY_HTTP_REJECTED" && receipt.status === "WAITING_FOR_COMPUTE") {
      receipt.failureDetail = receipt.failureDetail ? `LEGACY_HTTP_EXECUTOR_NOT_ADMITTED|${receipt.failureDetail}` : "LEGACY_HTTP_EXECUTOR_NOT_ADMITTED";
    }
    return responseForReceipt(receipt);
  } catch {
    return NextResponse.json(waitingForComputeReceipt(raw.packageDigest, "ORCHESTRATION_UNAVAILABLE", "EXECUTOR_UNAVAILABLE"), { status: 503 });
  }
}
