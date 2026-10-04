import { NextResponse } from "next/server";
import type { VisualGenerationPlan } from "../../../../lib/visual-factory";
import {
  normalizeExecutorResponse,
  normalizeGradioExecutionResult,
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

function responseForReceipt(receipt: ReturnType<typeof normalizeExecutorResponse>) {
  const status = receipt.status === "SUCCEEDED"
    ? 200
    : receipt.status === "WAITING_FOR_COMPUTE"
      ? 503
      : 502;
  return NextResponse.json(receipt, { status });
}

function huggingFaceToken(): `hf_${string}` | undefined {
  const token = process.env.VISUAL_FACTORY_EXECUTOR_TOKEN?.trim();
  if (!token) return undefined;
  if (!token.startsWith("hf_")) {
    throw new Error("HF_TOKEN_FORMAT_INVALID");
  }
  return token as `hf_${string}`;
}

async function executeGradio(raw: VisualGenerationPlan, executorUrl: string) {
  const { Client } = await import("@gradio/client");
  const token = huggingFaceToken();
  const client = await Client.connect(
    executorUrl,
    token ? { token } : undefined,
  );
  const result = await client.predict("/execute", {
    plan_json: JSON.stringify(raw),
  });
  return normalizeGradioExecutionResult(result.data, raw.packageDigest);
}

async function executeHttp(raw: VisualGenerationPlan, executorUrl: string) {
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
  return normalizeExecutorResponse(payload, raw.packageDigest);
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
    const kind = (process.env.VISUAL_FACTORY_EXECUTOR_KIND ?? "GRADIO").trim().toUpperCase();
    const receipt = kind === "GRADIO"
      ? await executeGradio(raw, executorUrl)
      : kind === "HTTP"
        ? await executeHttp(raw, executorUrl)
        : waitingForComputeReceipt(raw.packageDigest, `EXECUTOR_KIND_UNSUPPORTED:${kind}`, "EXECUTOR_UNAVAILABLE");
    return responseForReceipt(receipt);
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
