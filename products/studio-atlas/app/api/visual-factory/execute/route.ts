import { NextResponse } from "next/server";
import type { VisualExecutionReceipt, VisualGenerationPlan } from "../../../../lib/visual-factory";
import { waitingForComputeReceipt } from "../../../../lib/visual-factory-executor";
import { orchestrateVisualGeneration } from "../../../../lib/visual-factory-orchestrator";
import { preflightVisualGenerationPlan } from "../../../../lib/visual-factory-preflight";
import {
  buildVisualProviderConfig,
  createConfiguredVisualProviderAdapters,
} from "../../../../lib/visual-factory-route-config";

export const runtime = "nodejs";

function isPlan(value: unknown): value is VisualGenerationPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Partial<VisualGenerationPlan>;
  return (
    plan.schemaVersion === "atlas.visual-generation-plan/v0.1" &&
    typeof plan.pathwayId === "string" &&
    typeof plan.packageDigest === "string" &&
    /^[0-9a-f]{64}$/.test(plan.packageDigest) &&
    Array.isArray(plan.jobs) &&
    plan.jobs.length > 0 &&
    plan.jobs.length <= 6 &&
    plan.paidComputeAuthorized === false &&
    plan.allowQualityDowngrade === false &&
    plan.runtimeAuthorized === false &&
    plan.publicationAuthorityGranted === false &&
    plan.jobs.every((job) =>
      job.workflowFamily === "flux2-klein-4b/v0.2" &&
      job.maxVariants >= 1 &&
      job.maxVariants <= 3
    )
  );
}

function responseForReceipt(receipt: VisualExecutionReceipt) {
  const status = receipt.status === "SUCCEEDED"
    ? 200
    : receipt.status === "WAITING_FOR_COMPUTE"
      ? 503
      : 502;
  return NextResponse.json(receipt, { status });
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (!isPlan(raw)) {
    return NextResponse.json({ error: "INVALID_VISUAL_GENERATION_PLAN" }, { status: 400 });
  }

  const generationPreflight = preflightVisualGenerationPlan(raw);
  if (generationPreflight.status !== "READY") {
    return NextResponse.json(
      {
        error: "VISUAL_GENERATION_PREFLIGHT_BLOCKED",
        issues: generationPreflight.issues,
      },
      { status: 422 },
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
      receipt.failureDetail = receipt.failureDetail
        ? `LEGACY_HTTP_EXECUTOR_NOT_ADMITTED|${receipt.failureDetail}`
        : "LEGACY_HTTP_EXECUTOR_NOT_ADMITTED";
    }
    return responseForReceipt(receipt);
  } catch {
    return NextResponse.json(
      waitingForComputeReceipt(raw.packageDigest, "ORCHESTRATION_UNAVAILABLE", "EXECUTOR_UNAVAILABLE"),
      { status: 503 },
    );
  }
}
