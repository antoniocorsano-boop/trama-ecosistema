import type { VisualExecutionReceipt, VisualGenerationPlan } from "./visual-factory";

export type VisualProviderId = "HF_ZEROGPU" | "CLOUDFLARE_WORKERS_AI";

export type ProviderEligibility = {
  eligible: boolean;
  reason: string;
  remainingGpuSeconds?: number;
};

export type ProviderAttemptOutcome = {
  kind:
    | "SUCCEEDED"
    | "RETRYABLE_PROVIDER_FAILURE"
    | "PROVIDER_EXHAUSTED"
    | "PROVIDER_INELIGIBLE"
    | "LICENSE_BLOCKED"
    | "PERMANENT_FAILURE";
  receipt?: VisualExecutionReceipt;
  detail?: string;
};

export type OrchestrationContext = {
  unfinishedCanonicalReferenceCount: number;
  hfQuotaRemainingSeconds?: number;
  hfConfiguredFloorSeconds: number;
  measuredReferenceP95Seconds?: number;
  hfSafetyMarginSeconds: number;
};

export type HfReserveInput = {
  unfinishedReferenceCount: number;
  configuredFloorSeconds: number;
  measuredReferenceP95Seconds?: number;
  safetyMarginSeconds: number;
};

export type VisualProviderAdapter = {
  id: VisualProviderId;
  preflight(plan: VisualGenerationPlan, ctx: OrchestrationContext): Promise<ProviderEligibility>;
  execute(plan: VisualGenerationPlan, ctx: OrchestrationContext): Promise<ProviderAttemptOutcome>;
};

function estimateReferenceSeconds(ctx: OrchestrationContext): number {
  return Math.max(ctx.hfConfiguredFloorSeconds, ctx.measuredReferenceP95Seconds ?? 0);
}

export function computeProtectedHfReserve(input: HfReserveInput): number {
  const estimate = Math.max(input.configuredFloorSeconds, input.measuredReferenceP95Seconds ?? 0);
  return Math.max(0, input.unfinishedReferenceCount) * estimate + input.safetyMarginSeconds;
}

function estimatedAttemptSeconds(plan: VisualGenerationPlan, ctx: OrchestrationContext): number {
  return Math.max(1, plan.jobs.length) * estimateReferenceSeconds(ctx);
}

function hfCanServeCanonicalReference(plan: VisualGenerationPlan, ctx: OrchestrationContext): boolean {
  // Unknown quota is not eligibility. It only keeps HF in the bounded candidate
  // list so the adapter can perform the authoritative authenticated preflight.
  if (typeof ctx.hfQuotaRemainingSeconds !== "number") return true;
  const attemptUnits = Math.max(1, plan.jobs.length);
  const otherUnfinished = Math.max(0, ctx.unfinishedCanonicalReferenceCount - attemptUnits);
  const reserveForOthers = computeProtectedHfReserve({
    unfinishedReferenceCount: otherUnfinished,
    configuredFloorSeconds: ctx.hfConfiguredFloorSeconds,
    measuredReferenceP95Seconds: ctx.measuredReferenceP95Seconds,
    safetyMarginSeconds: ctx.hfSafetyMarginSeconds,
  });
  return ctx.hfQuotaRemainingSeconds >= estimatedAttemptSeconds(plan, ctx) + reserveForOthers;
}

function hfCanServeNonReference(plan: VisualGenerationPlan, ctx: OrchestrationContext): boolean {
  if (typeof ctx.hfQuotaRemainingSeconds !== "number") return true;
  const protectedReserve = computeProtectedHfReserve({
    unfinishedReferenceCount: ctx.unfinishedCanonicalReferenceCount,
    configuredFloorSeconds: ctx.hfConfiguredFloorSeconds,
    measuredReferenceP95Seconds: ctx.measuredReferenceP95Seconds,
    safetyMarginSeconds: ctx.hfSafetyMarginSeconds,
  });
  return ctx.hfQuotaRemainingSeconds - estimatedAttemptSeconds(plan, ctx) >= protectedReserve;
}

export function selectProviderOrder(
  plan: VisualGenerationPlan,
  ctx: OrchestrationContext,
): VisualProviderId[] {
  if (plan.planType === "REFERENCE_GENERATION") {
    return hfCanServeCanonicalReference(plan, ctx)
      ? ["HF_ZEROGPU", "CLOUDFLARE_WORKERS_AI"]
      : ["CLOUDFLARE_WORKERS_AI"];
  }

  if (ctx.unfinishedCanonicalReferenceCount > 0) {
    return hfCanServeNonReference(plan, ctx)
      ? ["CLOUDFLARE_WORKERS_AI", "HF_ZEROGPU"]
      : ["CLOUDFLARE_WORKERS_AI"];
  }

  return hfCanServeNonReference(plan, ctx)
    ? ["HF_ZEROGPU", "CLOUDFLARE_WORKERS_AI"]
    : ["CLOUDFLARE_WORKERS_AI"];
}

function safeSucceededReceipt(
  receipt: VisualExecutionReceipt | undefined,
  expectedDigest: string,
): receipt is VisualExecutionReceipt {
  return Boolean(
    receipt &&
    receipt.status === "SUCCEEDED" &&
    receipt.packageDigest === expectedDigest &&
    receipt.costClass === "FREE_ONLY" &&
    receipt.paidComputeAuthorized === false &&
    receipt.allowQualityDowngrade === false &&
    receipt.runtimeAuthorized === false &&
    receipt.publicationAuthorityGranted === false,
  );
}

function waitingReceipt(packageDigest: string, detail: string): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: crypto.randomUUID(),
    packageDigest,
    status: "WAITING_FOR_COMPUTE",
    costClass: "FREE_ONLY",
    assets: [],
    failureCategory: "NO_FREE_PROVIDER",
    failureDetail: detail,
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

export async function orchestrateVisualGeneration(
  plan: VisualGenerationPlan,
  adapters: Partial<Record<VisualProviderId, VisualProviderAdapter>>,
  ctx: OrchestrationContext,
): Promise<VisualExecutionReceipt> {
  const failures: string[] = [];

  for (const providerId of selectProviderOrder(plan, ctx)) {
    const adapter = adapters[providerId];
    if (!adapter) {
      failures.push(`${providerId}:NOT_CONFIGURED`);
      continue;
    }

    let eligibility: ProviderEligibility;
    try {
      eligibility = await adapter.preflight(plan, ctx);
    } catch (error) {
      failures.push(`${providerId}:PREFLIGHT_ERROR:${error instanceof Error ? error.message : "UNKNOWN"}`);
      continue;
    }

    if (!eligibility.eligible) {
      failures.push(`${providerId}:INELIGIBLE:${eligibility.reason}`);
      continue;
    }

    let outcome: ProviderAttemptOutcome;
    try {
      outcome = await adapter.execute(plan, ctx);
    } catch (error) {
      failures.push(`${providerId}:EXECUTION_ERROR:${error instanceof Error ? error.message : "UNKNOWN"}`);
      continue;
    }

    if (outcome.kind === "SUCCEEDED" && safeSucceededReceipt(outcome.receipt, plan.packageDigest)) {
      return outcome.receipt;
    }

    failures.push(`${providerId}:${outcome.kind}:${outcome.detail ?? "NO_DETAIL"}`);
  }

  return waitingReceipt(plan.packageDigest, failures.join("|") || "NO_ELIGIBLE_PROVIDER");
}
