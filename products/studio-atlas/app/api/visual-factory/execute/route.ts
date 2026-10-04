import { NextResponse } from "next/server";
import type { VisualGenerationPlan } from "../../../../lib/visual-factory";
import {
  normalizeExecutorResponse,
  waitingForComputeReceipt,
} from "../../../../lib/visual-factory-executor";

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
    plan.jobs.every((job) => job.maxVariants >= 1 && job.maxVariants <= 3)
  );
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (!isPlan(raw)) {
    return NextResponse.json({ error: "INVALID_VISUAL_GENERATION_PLAN" }, { status: 400 });
  }

  const executorUrl = process.env.VISUAL_FACTORY_EXECUTOR_URL?.trim();
  if (!executorUrl) {
    return NextResponse.json(
      waitingForComputeReceipt(raw.packageDigest, "EXECUTOR_NOT_CONFIGURED"),
      { status: 503 },
    );
  }

  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    const token = process.env.VISUAL_FACTORY_EXECUTOR_TOKEN?.trim();
    if (token) headers.authorization = `Bearer ${token}`;

    const upstream = await fetch(executorUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(raw),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => null);
    const receipt = normalizeExecutorResponse(payload, raw.packageDigest);
    const status = receipt.status === "SUCCEEDED" ? 200 : receipt.status === "WAITING_FOR_COMPUTE" ? 503 : 502;
    return NextResponse.json(receipt, { status });
  } catch (error) {
    return NextResponse.json(
      waitingForComputeReceipt(
        raw.packageDigest,
        error instanceof Error ? error.message : "EXECUTOR_UNAVAILABLE",
        "EXECUTOR_UNAVAILABLE",
      ),
      { status: 503 },
    );
  }
}
