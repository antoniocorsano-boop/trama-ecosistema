import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { VisualGenerationPlan } from "./visual-factory";
import type { VisualPreflightReceipt } from "./visual-preflight";

export type PersistedVisualPreflightMode = "references" | "shots";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeSpecId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function expectedMode(plan: VisualGenerationPlan): PersistedVisualPreflightMode {
  return plan.planType === "SHOT_GENERATION" ? "shots" : "references";
}

function assertReceiptShape(
  raw: unknown,
  specId: string,
  packageDigest: string,
): asserts raw is VisualPreflightReceipt {
  if (!isRecord(raw)) throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
  if (
    raw.schemaVersion !== "atlas.visual-preflight-receipt/v0.1" ||
    raw.specId !== specId ||
    raw.packageDigest !== packageDigest ||
    typeof raw.receiptId !== "string" || !raw.receiptId ||
    typeof raw.specDigest !== "string" || !/^[0-9a-f]{64}$/.test(raw.specDigest) ||
    typeof raw.compilerVersion !== "string" || !raw.compilerVersion ||
    typeof raw.artDirectionVersion !== "string" || !raw.artDirectionVersion ||
    raw.finalState !== "PREFLIGHT_PASS" ||
    !Array.isArray(raw.deterministicChecks) ||
    !isRecord(raw.semanticCritic) ||
    !Array.isArray(raw.compiledPrompts) ||
    raw.compiledPrompts.length !== 1 ||
    raw.paidComputeAuthorized !== false ||
    raw.allowQualityDowngrade !== false ||
    raw.runtimeAuthorized !== false ||
    raw.publicationAuthorityGranted !== false
  ) {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
  }
  if (raw.humanPreflightRequired === true && raw.humanPreflightDecision !== "PASS") {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
  }
}

export async function loadPersistedVisualPreflightEvidence(
  directory: string,
  plan: VisualGenerationPlan,
): Promise<VisualPreflightReceipt[]> {
  const root = resolve(directory);
  let manifestRaw: unknown;
  try {
    manifestRaw = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
  } catch {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_UNAVAILABLE");
  }

  if (!isRecord(manifestRaw)) throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
  const sourceSpecIds = manifestRaw.sourceSpecIds;
  const receiptIds = manifestRaw.receiptIds;
  const finalStates = manifestRaw.finalStates;
  const compiledPromptDigests = manifestRaw.compiledPromptDigests;
  if (
    manifestRaw.schemaVersion !== "atlas.visual-preflight-qualification/v0.1" ||
    manifestRaw.mode !== expectedMode(plan) ||
    manifestRaw.pathwayId !== plan.pathwayId ||
    manifestRaw.packageDigest !== plan.packageDigest ||
    manifestRaw.providerCallCount !== 0 ||
    !Array.isArray(sourceSpecIds) || sourceSpecIds.length < 1 || sourceSpecIds.length > 6 ||
    !sourceSpecIds.every(isSafeSpecId) ||
    !Array.isArray(receiptIds) || receiptIds.length !== sourceSpecIds.length ||
    !receiptIds.every((value) => typeof value === "string" && value.length > 0) ||
    !Array.isArray(finalStates) || finalStates.length !== sourceSpecIds.length ||
    !finalStates.every((value) => value === "PREFLIGHT_PASS") ||
    !Array.isArray(compiledPromptDigests) || compiledPromptDigests.length !== sourceSpecIds.length ||
    !compiledPromptDigests.every((value) => typeof value === "string" && /^[0-9a-f]{64}$/.test(value)) ||
    manifestRaw.paidComputeAuthorized !== false ||
    manifestRaw.allowQualityDowngrade !== false ||
    manifestRaw.runtimeAuthorized !== false ||
    manifestRaw.publicationAuthorityGranted !== false
  ) {
    throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
  }

  const receipts: VisualPreflightReceipt[] = [];
  for (let index = 0; index < sourceSpecIds.length; index += 1) {
    const specId = sourceSpecIds[index];
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(resolve(root, "receipts", `${specId}.json`), "utf8"));
    } catch {
      throw new Error("VISUAL_PREFLIGHT_EVIDENCE_UNAVAILABLE");
    }
    assertReceiptShape(raw, specId, plan.packageDigest);
    const prompt = raw.compiledPrompts[0];
    if (
      raw.receiptId !== receiptIds[index] ||
      raw.finalState !== finalStates[index] ||
      !prompt ||
      prompt.promptDigest !== compiledPromptDigests[index]
    ) {
      throw new Error("VISUAL_PREFLIGHT_EVIDENCE_INVALID");
    }
    receipts.push(raw);
  }

  return receipts;
}
