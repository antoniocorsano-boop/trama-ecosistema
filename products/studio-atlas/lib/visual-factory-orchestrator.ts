import type {
  VisualExecutionProviderId,
  VisualExecutionReceipt,
  VisualGenerationPlan,
  VisualOrchestrationEvidence,
  VisualProviderAttemptEvidence,
} from "./visual-factory";

export type VisualProviderId = VisualExecutionProviderId;

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

function stableEvidenceReason(value: string): string {
  return /^[A-Z0-9_:.-]{1,160}$/.test(value) ? value : "PROVIDER_REASON_REDACTED";
}

function attemptEvidence(
  provider: VisualProviderId,
  eligibility: VisualProviderAttemptEvidence["eligibility"],
  eligibilityReason: string,
  startedMs: number,
  completedMs: number,
  quotaRemainingGpuSeconds?: number,
  outcome?: VisualProviderAttemptEvidence["outcome"],
): VisualProviderAttemptEvidence {
  return {
    provider,
    eligibility,
    eligibilityReason: stableEvidenceReason(eligibilityReason),
    quotaRemainingGpuSeconds,
    outcome,
    startedAt: new Date(startedMs).toISOString(),
    completedAt: new Date(completedMs).toISOString(),
    durationMs: Math.max(0, completedMs - startedMs),
  };
}

function orchestrationEvidence(
  orchestrationId: string,
  plan: VisualGenerationPlan,
  consideredProviders: VisualProviderId[],
  attempts: VisualProviderAttemptEvidence[],
  finalState: VisualOrchestrationEvidence["finalState"],
  selectedProvider?: VisualProviderId,
  selectedModelRef?: string,
): VisualOrchestrationEvidence {
  return {
    schemaVersion: "atlas.visual-orchestration-evidence/v0.1",
    orchestrationId,
    workloadClass: plan.planType === "REFERENCE_GENERATION" ? "CANONICAL_REFERENCE" : "SCENE_FRAME",
    consideredProviders,
    selectedProvider,
    selectedModelRef,
    attempts,
    finalState,
  };
}

function waitingReceipt(
  packageDigest: string,
  detail: string,
  orchestration: VisualOrchestrationEvidence,
): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: crypto.randomUUID(),
    packageDigest,
    status: "WAITING_FOR_COMPUTE",
    costClass: "FREE_ONLY",
    assets: [],
    failureCategory: "NO_FREE_PROVIDER",
    failureDetail: detail,
    orchestration,
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
  const attempts: VisualProviderAttemptEvidence[] = [];
  const consideredProviders = selectProviderOrder(plan, ctx);
  const orchestrationId = crypto.randomUUID();

  for (const providerId of consideredProviders) {
    const startedMs = Date.now();
    const adapter = adapters[providerId];
    if (!adapter) {
      const completedMs = Date.now();
      attempts.push(attemptEvidence(
        providerId,
        "NOT_CONFIGURED",
        "NOT_CONFIGURED",
        startedMs,
        completedMs,
      ));
      failures.push(`${providerId}:NOT_CONFIGURED`);
      continue;
    }

    let eligibility: ProviderEligibility;
    try {
      eligibility = await adapter.preflight(plan, ctx);
    } catch {
      const completedMs = Date.now();
      attempts.push(attemptEvidence(
        providerId,
        "PREFLIGHT_ERROR",
        "PREFLIGHT_ERROR",
        startedMs,
        completedMs,
      ));
      failures.push(`${providerId}:PREFLIGHT_ERROR`);
      continue;
    }

    const eligibilityReason = stableEvidenceReason(eligibility.reason);
    if (!eligibility.eligible) {
      const completedMs = Date.now();
      attempts.push(attemptEvidence(
        providerId,
        "INELIGIBLE",
        eligibilityReason,
        startedMs,
        completedMs,
        eligibility.remainingGpuSeconds,
      ));
      failures.push(`${providerId}:INELIGIBLE:${eligibilityReason}`);
      continue;
    }

    let outcome: ProviderAttemptOutcome;
    try {
      outcome = await adapter.execute(plan, ctx);
    } catch {
      const completedMs = Date.now();
      attempts.push(attemptEvidence(
        providerId,
        "ELIGIBLE",
        eligibilityReason,
        startedMs,
        completedMs,
        eligibility.remainingGpuSeconds,
        "RETRYABLE_PROVIDER_FAILURE",
      ));
      failures.push(`${providerId}:EXECUTION_ERROR`);
      continue;
    }

    const completedMs = Date.now();
    const evidenceOutcome = outcome.kind === "SUCCEEDED" && !safeSucceededReceipt(outcome.receipt, plan.packageDigest)
      ? "PERMANENT_FAILURE"
      : outcome.kind;
    attempts.push(attemptEvidence(
      providerId,
      "ELIGIBLE",
      eligibilityReason,
      startedMs,
      completedMs,
      eligibility.remainingGpuSeconds,
      evidenceOutcome,
    ));

    if (outcome.kind === "SUCCEEDED" && safeSucceededReceipt(outcome.receipt, plan.packageDigest)) {
      return {
        ...outcome.receipt,
        orchestration: orchestrationEvidence(
          orchestrationId,
          plan,
          consideredProviders,
          attempts,
          "SUCCEEDED",
          providerId,
          outcome.receipt.assets[0]?.modelRef,
        ),
      };
    }

    failures.push(`${providerId}:${evidenceOutcome}`);
  }

  const orchestration = orchestrationEvidence(
    orchestrationId,
    plan,
    consideredProviders,
    attempts,
    "GENERATION_DEFERRED",
  );
  return waitingReceipt(plan.packageDigest, failures.join("|") || "NO_ELIGIBLE_PROVIDER", orchestration);
}
