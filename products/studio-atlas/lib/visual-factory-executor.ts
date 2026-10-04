import type {
  VisualAssetCandidate,
  VisualExecutionReceipt,
  VisualGenerationPlan,
} from "./visual-factory";

function noAuthorityReceipt(
  packageDigest: string,
  status: VisualExecutionReceipt["status"],
  failureCategory?: VisualExecutionReceipt["failureCategory"],
  failureDetail?: string,
): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: crypto.randomUUID(),
    packageDigest,
    status,
    costClass: "FREE_ONLY",
    assets: [],
    failureCategory,
    failureDetail,
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isAsset(value: unknown, expectedDigest: string): value is VisualAssetCandidate {
  if (!isObject(value)) return false;
  const purpose = value.purpose;
  return (
    typeof value.assetId === "string" && value.assetId.length > 0 &&
    typeof value.subjectRef === "string" && value.subjectRef.length > 0 &&
    (purpose === "CHARACTER_REFERENCE" || purpose === "ENVIRONMENT_REFERENCE" || purpose === "SCENE_FRAME") &&
    typeof value.url === "string" && value.url.length > 0 &&
    typeof value.sha256 === "string" && /^[0-9a-f]{64}$/.test(value.sha256) &&
    typeof value.modelRef === "string" && value.modelRef.length > 0 &&
    typeof value.workflowRef === "string" && value.workflowRef.length > 0 &&
    typeof value.createdAt === "string" && value.createdAt.length > 0 &&
    value.packageDigest === expectedDigest &&
    value.provenanceStatus === "RECORDED"
  );
}

export function normalizeExecutorResponse(
  value: unknown,
  expectedDigest: string,
): VisualExecutionReceipt {
  if (!isObject(value)) {
    return noAuthorityReceipt(expectedDigest, "FAILED", "INVALID_EXECUTOR_RESPONSE", "NOT_AN_OBJECT");
  }
  const status = value.status;
  if (
    value.schemaVersion !== "atlas.visual-execution-receipt/v0.1" ||
    typeof value.receiptId !== "string" || !value.receiptId ||
    value.packageDigest !== expectedDigest ||
    (status !== "SUCCEEDED" && status !== "WAITING_FOR_COMPUTE" && status !== "FAILED") ||
    value.costClass !== "FREE_ONLY" ||
    !Array.isArray(value.assets) ||
    value.paidComputeAuthorized !== false ||
    value.allowQualityDowngrade !== false ||
    value.runtimeAuthorized !== false ||
    value.publicationAuthorityGranted !== false ||
    !value.assets.every((asset) => isAsset(asset, expectedDigest))
  ) {
    return noAuthorityReceipt(expectedDigest, "FAILED", "INVALID_EXECUTOR_RESPONSE", "CONTRACT_MISMATCH");
  }

  return value as VisualExecutionReceipt;
}

export function waitingForComputeReceipt(
  packageDigest: string,
  detail: string,
  category: VisualExecutionReceipt["failureCategory"] = "NO_FREE_PROVIDER",
): VisualExecutionReceipt {
  return noAuthorityReceipt(packageDigest, "WAITING_FOR_COMPUTE", category, detail);
}

export async function executeVisualFactoryPlan(
  plan: VisualGenerationPlan,
  fetchImpl: typeof fetch = fetch,
): Promise<VisualExecutionReceipt> {
  try {
    const response = await fetchImpl("/api/visual-factory/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(plan),
    });
    const value = await response.json().catch(() => null);
    return normalizeExecutorResponse(value, plan.packageDigest);
  } catch (error) {
    return waitingForComputeReceipt(
      plan.packageDigest,
      error instanceof Error ? error.message : "EXECUTOR_UNAVAILABLE",
      "EXECUTOR_UNAVAILABLE",
    );
  }
}
