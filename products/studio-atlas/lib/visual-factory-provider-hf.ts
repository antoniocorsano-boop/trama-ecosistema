import type { VisualGenerationPlan } from "./visual-factory";
import { assertVisualPreflightBoundPlan } from "./visual-factory-execution-contract";
import { normalizeGradioExecutionResult } from "./visual-factory-executor";
import {
  computeProtectedHfReserve,
  type OrchestrationContext,
  type ProviderAttemptOutcome,
  type ProviderEligibility,
  type VisualProviderAdapter,
} from "./visual-factory-orchestrator";

export type HfZeroGpuQuota = {
  base: number;
  remaining: number;
  resetsAt?: string | null;
  overquotaUsed: number;
};

export type HfZeroGpuConfig = {
  token?: string;
  spaceUrl?: string;
};

export type HfZeroGpuDeps = {
  getQuota?: (token: string) => Promise<HfZeroGpuQuota>;
  predict?: (input: { spaceUrl: string; token: string; plan: VisualGenerationPlan }) => Promise<unknown>;
};

class ProviderHttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function defaultGetQuota(token: string): Promise<HfZeroGpuQuota> {
  const response = await fetch("https://huggingface.co/api/spaces/zero-gpu/quota", {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ProviderHttpError(`HF_QUOTA_HTTP_${response.status}`, response.status);
  }
  const raw = await response.json() as Record<string, unknown>;
  const base = finiteNumber(raw.base);
  const remaining = finiteNumber(raw.current ?? raw.remaining);
  const overquotaUsed = finiteNumber(raw.overquotaUsed ?? raw.overquota_used);
  if (base === null || remaining === null || overquotaUsed === null) {
    throw new Error("HF_QUOTA_INVALID_RESPONSE");
  }
  const resetsAt = raw.resetsAt ?? raw.resets_at;
  return {
    base,
    remaining,
    overquotaUsed,
    resetsAt: typeof resetsAt === "string" ? resetsAt : null,
  };
}

async function defaultPredict(input: {
  spaceUrl: string;
  token: string;
  plan: VisualGenerationPlan;
}): Promise<unknown> {
  const { Client } = await import("@gradio/client");
  const client = await Client.connect(input.spaceUrl, { token: input.token as `hf_${string}` });
  const result = await client.predict("/execute", { plan_json: JSON.stringify(input.plan) });
  return result.data;
}

function estimatePerUnit(ctx: OrchestrationContext): number {
  return Math.max(ctx.hfConfiguredFloorSeconds, ctx.measuredReferenceP95Seconds ?? 0);
}

function requiredQuotaSeconds(plan: VisualGenerationPlan, ctx: OrchestrationContext): number {
  const unitSeconds = estimatePerUnit(ctx);
  const attemptUnits = Math.max(1, plan.jobs.length);
  const attemptSeconds = attemptUnits * unitSeconds;

  if (plan.planType === "REFERENCE_GENERATION") {
    const remainingAfterBatch = Math.max(0, ctx.unfinishedCanonicalReferenceCount - attemptUnits);
    return attemptSeconds + computeProtectedHfReserve({
      unfinishedReferenceCount: remainingAfterBatch,
      configuredFloorSeconds: ctx.hfConfiguredFloorSeconds,
      measuredReferenceP95Seconds: ctx.measuredReferenceP95Seconds,
      safetyMarginSeconds: ctx.hfSafetyMarginSeconds,
    });
  }

  return attemptSeconds + computeProtectedHfReserve({
    unfinishedReferenceCount: ctx.unfinishedCanonicalReferenceCount,
    configuredFloorSeconds: ctx.hfConfiguredFloorSeconds,
    measuredReferenceP95Seconds: ctx.measuredReferenceP95Seconds,
    safetyMarginSeconds: ctx.hfSafetyMarginSeconds,
  });
}

function statusOf(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function redact(value: string, token?: string): string {
  if (!token) return value;
  return value.split(token).join("[REDACTED]");
}

function classifyExecutionError(error: unknown, token?: string): ProviderAttemptOutcome {
  const status = statusOf(error);
  const raw = error instanceof Error ? error.message : String(error);
  const detail = redact(raw, token);
  const timeout = error instanceof Error && /timeout/i.test(`${error.name}:${error.message}`);

  if (status === 429) return { kind: "PROVIDER_EXHAUSTED", detail: `HTTP_429:${detail}` };
  if (timeout || (typeof status === "number" && status >= 500)) {
    return { kind: "RETRYABLE_PROVIDER_FAILURE", detail };
  }
  return { kind: "PERMANENT_FAILURE", detail };
}

function isBound(plan: VisualGenerationPlan): boolean {
  try {
    assertVisualPreflightBoundPlan(plan);
    return true;
  } catch {
    return false;
  }
}

export function createHfZeroGpuAdapter(
  config: HfZeroGpuConfig,
  deps: HfZeroGpuDeps = {},
): VisualProviderAdapter {
  const getQuota = deps.getQuota ?? defaultGetQuota;
  const predict = deps.predict ?? defaultPredict;

  return {
    id: "HF_ZEROGPU",

    async preflight(plan: VisualGenerationPlan, ctx: OrchestrationContext): Promise<ProviderEligibility> {
      if (!isBound(plan)) {
        return { eligible: false, reason: "VISUAL_PREFLIGHT_BINDING_INVALID" };
      }
      if (!config.token?.trim() || !config.spaceUrl?.trim()) {
        return { eligible: false, reason: "HF_NOT_CONFIGURED" };
      }

      let quota: HfZeroGpuQuota;
      try {
        quota = await getQuota(config.token);
      } catch (error) {
        const detail = redact(error instanceof Error ? error.message : String(error), config.token);
        return { eligible: false, reason: `HF_QUOTA_UNAVAILABLE:${detail}` };
      }

      if (
        !Number.isFinite(quota.base) ||
        !Number.isFinite(quota.remaining) ||
        !Number.isFinite(quota.overquotaUsed) ||
        quota.base < 0 || quota.remaining < 0 || quota.overquotaUsed < 0
      ) {
        return { eligible: false, reason: "HF_QUOTA_INVALID" };
      }

      if (quota.overquotaUsed > 0) {
        return {
          eligible: false,
          reason: "HF_OVERQUOTA_NOT_ALLOWED",
          remainingGpuSeconds: quota.remaining,
        };
      }

      const required = requiredQuotaSeconds(plan, ctx);
      if (quota.remaining < required) {
        return {
          eligible: false,
          reason: "PROVIDER_EXHAUSTED:HF_QUOTA_PROTECTED",
          remainingGpuSeconds: quota.remaining,
        };
      }

      return {
        eligible: true,
        reason: "HF_BASE_QUOTA_SUFFICIENT",
        remainingGpuSeconds: quota.remaining,
      };
    },

    async execute(plan: VisualGenerationPlan): Promise<ProviderAttemptOutcome> {
      if (!isBound(plan)) {
        return { kind: "PERMANENT_FAILURE", detail: "VISUAL_PREFLIGHT_BINDING_INVALID" };
      }
      if (!config.token?.trim() || !config.spaceUrl?.trim()) {
        return { kind: "PROVIDER_INELIGIBLE", detail: "HF_NOT_CONFIGURED" };
      }

      try {
        const data = await predict({
          spaceUrl: config.spaceUrl,
          token: config.token,
          plan,
        });
        const receipt = normalizeGradioExecutionResult(data, plan.packageDigest);
        if (receipt.status !== "SUCCEEDED") {
          return {
            kind: receipt.status === "WAITING_FOR_COMPUTE" ? "PROVIDER_EXHAUSTED" : "PERMANENT_FAILURE",
            detail: receipt.failureDetail ?? receipt.failureCategory ?? "HF_EXECUTION_FAILED",
          };
        }
        return { kind: "SUCCEEDED", receipt };
      } catch (error) {
        return classifyExecutionError(error, config.token);
      }
    },
  };
}
