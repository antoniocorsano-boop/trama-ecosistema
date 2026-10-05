import { createCloudflareWorkersAiAdapter, type CloudflareWorkersAiConfig } from "./visual-factory-provider-cloudflare";
import { createHfZeroGpuAdapter, type HfZeroGpuConfig } from "./visual-factory-provider-hf";
import type { VisualProviderAdapter, VisualProviderId } from "./visual-factory-orchestrator";

export type VisualProviderMigrationState =
  | "NOT_CONFIGURED"
  | "NATIVE"
  | "LEGACY_HF_TRANSLATED"
  | "LEGACY_HTTP_REJECTED";

export type VisualProviderRuntimeConfig = {
  hf?: HfZeroGpuConfig;
  cloudflare?: CloudflareWorkersAiConfig;
  hfConfiguredFloorSeconds: number;
  hfSafetyMarginSeconds: number;
  measuredReferenceP95Seconds?: number;
  migrationState: VisualProviderMigrationState;
};

type EnvLike = Readonly<Record<string, string | undefined>>;

function positiveNumber(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function optionalPositiveNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function buildVisualProviderConfig(env: EnvLike): VisualProviderRuntimeConfig {
  const nativeHfToken = env.HF_TOKEN?.trim();
  const nativeHfSpace = env.HF_VISUAL_FACTORY_SPACE_REPO?.trim();
  const legacyKind = (env.VISUAL_FACTORY_EXECUTOR_KIND ?? "GRADIO").trim().toUpperCase();
  const legacyUrl = env.VISUAL_FACTORY_EXECUTOR_URL?.trim();
  const legacyToken = env.VISUAL_FACTORY_EXECUTOR_TOKEN?.trim();

  let hf: HfZeroGpuConfig | undefined;
  let migrationState: VisualProviderMigrationState = "NOT_CONFIGURED";

  if (nativeHfToken && nativeHfSpace) {
    hf = { token: nativeHfToken, spaceUrl: nativeHfSpace };
    migrationState = "NATIVE";
  } else if (legacyUrl && legacyToken) {
    if (legacyKind === "GRADIO") {
      hf = { token: legacyToken, spaceUrl: legacyUrl };
      migrationState = "LEGACY_HF_TRANSLATED";
    } else {
      migrationState = "LEGACY_HTTP_REJECTED";
    }
  }

  const cfToken = env.CLOUDFLARE_API_TOKEN?.trim();
  const cfAccount = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cloudflare = cfToken && cfAccount
    ? {
        token: cfToken,
        accountId: cfAccount,
        workersFreeAdmitted: env.CLOUDFLARE_WORKERS_FREE_ADMITTED?.trim().toLowerCase() === "true",
        timeoutMs: positiveNumber(env.VISUAL_FACTORY_CLOUDFLARE_TIMEOUT_MS, 90_000),
      }
    : undefined;

  if (cloudflare && migrationState === "NOT_CONFIGURED") migrationState = "NATIVE";

  return {
    hf,
    cloudflare,
    hfConfiguredFloorSeconds: positiveNumber(env.VISUAL_FACTORY_HF_FLOOR_SECONDS, 40),
    hfSafetyMarginSeconds: positiveNumber(env.VISUAL_FACTORY_HF_SAFETY_MARGIN_SECONDS, 20),
    measuredReferenceP95Seconds: optionalPositiveNumber(env.VISUAL_FACTORY_HF_REFERENCE_P95_SECONDS),
    migrationState,
  };
}

export function createConfiguredVisualProviderAdapters(
  config: VisualProviderRuntimeConfig,
): Partial<Record<VisualProviderId, VisualProviderAdapter>> {
  const adapters: Partial<Record<VisualProviderId, VisualProviderAdapter>> = {};
  if (config.hf?.token && config.hf.spaceUrl) {
    adapters.HF_ZEROGPU = createHfZeroGpuAdapter(config.hf);
  }
  if (
    config.cloudflare?.token &&
    config.cloudflare.accountId &&
    config.cloudflare.workersFreeAdmitted === true
  ) {
    adapters.CLOUDFLARE_WORKERS_AI = createCloudflareWorkersAiAdapter(config.cloudflare);
  }
  return adapters;
}

export function publicVisualProviderConfigSummary(config: VisualProviderRuntimeConfig) {
  return {
    schemaVersion: "atlas.visual-provider-config-summary/v0.1",
    hfConfigured: Boolean(config.hf?.token && config.hf.spaceUrl),
    cloudflareConfigured: Boolean(config.cloudflare?.token && config.cloudflare.accountId),
    cloudflareWorkersFreeAdmitted: config.cloudflare?.workersFreeAdmitted === true,
    migrationState: config.migrationState,
    paidComputeAuthorized: false as const,
  };
}
