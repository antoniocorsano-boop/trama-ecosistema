import { createHash } from "node:crypto";
import type {
  VisualAssetCandidate,
  VisualExecutionReceipt,
  VisualGenerationJob,
  VisualGenerationPlan,
} from "./visual-factory";
import { assertVisualPreflightBoundPlan } from "./visual-factory-execution-contract";
import type {
  OrchestrationContext,
  ProviderAttemptOutcome,
  ProviderEligibility,
  VisualProviderAdapter,
} from "./visual-factory-orchestrator";
import { assertVisualReferenceBytesMatchDigest } from "./visual-reference-integrity";

const MODEL_REF = "@cf/black-forest-labs/flux-2-klein-4b";
const WORKFLOW_REF = "cloudflare-workers-ai.flux2-klein-4b/v0.1";
const MAX_REFERENCE_IMAGES = 4;

export type CloudflareWorkersAiConfig = {
  token?: string;
  accountId?: string;
  workersFreeAdmitted?: boolean;
  timeoutMs?: number;
};

export type CloudflareWorkersAiDeps = {
  fetchImpl?: typeof fetch;
  prepareReferenceImage?: (url: string, expectedDigest: string) => Promise<Blob>;
};

function redact(value: string, config: CloudflareWorkersAiConfig): string {
  let result = value;
  for (const secret of [config.token, config.accountId]) {
    if (secret) result = result.split(secret).join("[REDACTED]");
  }
  return result;
}

function decodeDataUrl(url: string): Uint8Array | null {
  const match = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/.exec(url);
  if (!match) return null;
  return Uint8Array.from(Buffer.from(match[1], "base64"));
}

async function defaultPrepareReferenceImage(url: string, expectedDigest: string): Promise<Blob> {
  let bytes: Uint8Array;
  const inline = decodeDataUrl(url);
  if (inline) {
    bytes = inline;
  } else {
    if (!url.startsWith("https://")) throw new Error("REFERENCE_URL_NOT_HTTPS_OR_DATA_IMAGE");
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`REFERENCE_FETCH_HTTP_${response.status}`);
    bytes = new Uint8Array(await response.arrayBuffer());
  }
  assertVisualReferenceBytesMatchDigest(bytes, expectedDigest);

  const sharp = (await import("sharp")).default;
  const output = await sharp(bytes)
    .resize({ width: 511, height: 511, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  return new Blob([Uint8Array.from(output)], { type: "image/webp" });
}

function dimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "3:4": return { width: 768, height: 1024 };
    case "16:9": return { width: 1024, height: 576 };
    case "1:1": return { width: 1024, height: 1024 };
    case "4:3":
    default: return { width: 1024, height: 768 };
  }
}

function seedFor(packageDigest: string, jobId: string, variant: number): number {
  const hex = createHash("sha256")
    .update(`${packageDigest}:${jobId}:${variant}`)
    .digest("hex")
    .slice(0, 8);
  return Number.parseInt(hex, 16) >>> 0;
}

function promptFor(job: VisualGenerationJob): string {
  if (!job.negativeConstraints.length) return job.prompt;
  return `${job.prompt}\n\nAvoid: ${job.negativeConstraints.join(", ")}.`;
}

function endpoint(accountId: string): string {
  const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL_REF}`);
  url.searchParams.set("rejectIfBusy", "true");
  return url.toString();
}

function successReceipt(plan: VisualGenerationPlan, assets: VisualAssetCandidate[]): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: crypto.randomUUID(),
    packageDigest: plan.packageDigest,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets,
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function classifyHttpFailure(status: number, detail: string): ProviderAttemptOutcome {
  if (status === 429) return { kind: "PROVIDER_EXHAUSTED", detail: `HTTP_429:${detail}` };
  if (status >= 500) return { kind: "RETRYABLE_PROVIDER_FAILURE", detail: `HTTP_${status}:${detail}` };
  if (status === 401 || status === 403) return { kind: "PROVIDER_INELIGIBLE", detail: `HTTP_${status}:${detail}` };
  return { kind: "PERMANENT_FAILURE", detail: `HTTP_${status}:${detail}` };
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && /timeout/i.test(`${error.name}:${error.message}`);
}

function extractBase64Image(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (typeof value.image === "string") return value.image;
  const result = value.result;
  if (result && typeof result === "object" && !Array.isArray(result)) {
    const image = (result as Record<string, unknown>).image;
    if (typeof image === "string") return image;
  }
  return null;
}

async function executeJob(
  job: VisualGenerationJob,
  plan: VisualGenerationPlan,
  variant: number,
  config: Required<Pick<CloudflareWorkersAiConfig, "token" | "accountId">> & CloudflareWorkersAiConfig,
  fetchImpl: typeof fetch,
  prepareReferenceImage: (url: string, expectedDigest: string) => Promise<Blob>,
): Promise<VisualAssetCandidate | ProviderAttemptOutcome> {
  if (job.referenceInputs.length > MAX_REFERENCE_IMAGES) {
    return { kind: "PERMANENT_FAILURE", detail: "CLOUDFLARE_REFERENCE_LIMIT_EXCEEDED" };
  }
  const referenceDigests = job.referenceInputDigests ?? [];
  if (referenceDigests.length !== job.referenceInputs.length) {
    return { kind: "PERMANENT_FAILURE", detail: "VISUAL_REFERENCE_LOCK_BINDING_INVALID" };
  }

  const form = new FormData();
  const size = dimensions(job.aspectRatio);
  form.append("prompt", promptFor(job));
  form.append("width", String(size.width));
  form.append("height", String(size.height));
  form.append("seed", String(seedFor(plan.packageDigest, job.jobId, variant)));

  try {
    for (let index = 0; index < job.referenceInputs.length; index += 1) {
      const image = await prepareReferenceImage(job.referenceInputs[index], referenceDigests[index]);
      form.append(`input_image_${index}`, image, `reference-${index}.webp`);
    }
  } catch (error) {
    return {
      kind: "PERMANENT_FAILURE",
      detail: redact(error instanceof Error ? error.message : String(error), config),
    };
  }

  let response: Response;
  try {
    response = await fetchImpl(endpoint(config.accountId), {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}` },
      body: form,
      signal: AbortSignal.timeout(config.timeoutMs ?? 90_000),
    });
  } catch (error) {
    const detail = redact(error instanceof Error ? error.message : String(error), config);
    return { kind: isTimeout(error) ? "RETRYABLE_PROVIDER_FAILURE" : "RETRYABLE_PROVIDER_FAILURE", detail };
  }

  if (!response.ok) {
    const detail = redact(await response.text().catch(() => ""), config);
    return classifyHttpFailure(response.status, detail);
  }

  const payload = await response.json().catch(() => null);
  const base64 = extractBase64Image(payload);
  if (!base64 || !/^[A-Za-z0-9+/=\r\n]+$/.test(base64)) {
    return { kind: "PERMANENT_FAILURE", detail: "CLOUDFLARE_INVALID_IMAGE_RESPONSE" };
  }

  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) return { kind: "PERMANENT_FAILURE", detail: "CLOUDFLARE_EMPTY_IMAGE_RESPONSE" };
  const digest = createHash("sha256").update(bytes).digest("hex");
  const subjectRef = job.subjectRef ?? job.shotId ?? job.jobId;
  return {
    assetId: `${subjectRef}-${variant + 1}-${digest.slice(0, 12)}`,
    subjectRef,
    purpose: job.purpose,
    url: `data:image/png;base64,${base64}`,
    sha256: digest,
    modelRef: MODEL_REF,
    workflowRef: WORKFLOW_REF,
    createdAt: new Date().toISOString(),
    packageDigest: plan.packageDigest,
    provenanceStatus: "RECORDED",
  };
}

function isAttemptOutcome(value: VisualAssetCandidate | ProviderAttemptOutcome): value is ProviderAttemptOutcome {
  return "kind" in value;
}

function isBound(plan: VisualGenerationPlan): boolean {
  try {
    assertVisualPreflightBoundPlan(plan);
    return true;
  } catch {
    return false;
  }
}

export function createCloudflareWorkersAiAdapter(
  config: CloudflareWorkersAiConfig,
  deps: CloudflareWorkersAiDeps = {},
): VisualProviderAdapter {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const prepareReferenceImage = deps.prepareReferenceImage ?? defaultPrepareReferenceImage;

  return {
    id: "CLOUDFLARE_WORKERS_AI",
    async preflight(plan: VisualGenerationPlan): Promise<ProviderEligibility> {
      if (!isBound(plan)) return { eligible: false, reason: "VISUAL_PREFLIGHT_BINDING_INVALID" };
      if (!config.token?.trim() || !config.accountId?.trim()) return { eligible: false, reason: "CLOUDFLARE_NOT_CONFIGURED" };
      if (config.workersFreeAdmitted !== true) return { eligible: false, reason: "CLOUDFLARE_FREE_PLAN_NOT_ADMITTED" };
      return { eligible: true, reason: "CLOUDFLARE_WORKERS_FREE_ADMITTED" };
    },
    async execute(plan: VisualGenerationPlan, _ctx: OrchestrationContext): Promise<ProviderAttemptOutcome> {
      if (!isBound(plan)) return { kind: "PERMANENT_FAILURE", detail: "VISUAL_PREFLIGHT_BINDING_INVALID" };
      if (!config.token?.trim() || !config.accountId?.trim() || config.workersFreeAdmitted !== true) {
        return { kind: "PROVIDER_INELIGIBLE", detail: "CLOUDFLARE_ZERO_COST_GUARD_REJECTED" };
      }
      const admitted = { ...config, token: config.token, accountId: config.accountId };
      const assets: VisualAssetCandidate[] = [];
      for (const job of plan.jobs) {
        if (job.referenceInputs.length > MAX_REFERENCE_IMAGES) {
          return { kind: "PERMANENT_FAILURE", detail: "CLOUDFLARE_REFERENCE_LIMIT_EXCEEDED" };
        }
        for (let variant = 0; variant < job.maxVariants; variant += 1) {
          const result = await executeJob(job, plan, variant, admitted, fetchImpl, prepareReferenceImage);
          if (isAttemptOutcome(result)) return result;
          assets.push(result);
        }
      }
      return { kind: "SUCCEEDED", receipt: successReceipt(plan, assets) };
    },
  };
}
