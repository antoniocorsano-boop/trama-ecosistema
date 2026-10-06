import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createMuseoZeroPilotProject } from "../lib/canonical/museo-zero";
import { digestAuthoringState } from "../lib/production";
import type { VisualPreflightReceipt } from "../lib/visual-preflight";
import {
  compileReferenceJobs,
  createInitialVisualFactoryState,
} from "../lib/visual-factory";
import { selectReferencePlanSubject } from "../lib/visual-reference-plan-selection";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function loadPassPreflightReceipts(
  preflightDirectory: string,
  expectedPackageDigest: string,
): Promise<VisualPreflightReceipt[]> {
  const root = resolve(preflightDirectory);
  const manifestRaw: unknown = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
  if (!isRecord(manifestRaw)) throw new Error("VF_CANONICAL_PREFLIGHT_MANIFEST_INVALID");
  if (
    manifestRaw.schemaVersion !== "atlas.visual-preflight-qualification/v0.1" ||
    manifestRaw.mode !== "references" ||
    manifestRaw.packageDigest !== expectedPackageDigest ||
    manifestRaw.humanPreflightDecision !== "PASS" ||
    manifestRaw.providerCallCount !== 0 ||
    !Array.isArray(manifestRaw.sourceSpecIds) ||
    manifestRaw.sourceSpecIds.length !== 5 ||
    !manifestRaw.sourceSpecIds.every((value) => typeof value === "string" && value.length > 0)
  ) {
    throw new Error("VF_CANONICAL_PREFLIGHT_MANIFEST_INVALID");
  }

  const receipts: VisualPreflightReceipt[] = [];
  for (const specId of manifestRaw.sourceSpecIds as string[]) {
    const raw: unknown = JSON.parse(await readFile(resolve(root, "receipts", `${specId}.json`), "utf8"));
    if (!isRecord(raw)) throw new Error("VF_CANONICAL_PREFLIGHT_RECEIPT_INVALID");
    if (
      raw.schemaVersion !== "atlas.visual-preflight-receipt/v0.1" ||
      raw.specId !== specId ||
      raw.packageDigest !== expectedPackageDigest ||
      raw.finalState !== "PREFLIGHT_PASS" ||
      raw.humanPreflightDecision !== "PASS" ||
      raw.paidComputeAuthorized !== false ||
      raw.allowQualityDowngrade !== false ||
      raw.runtimeAuthorized !== false ||
      raw.publicationAuthorityGranted !== false
    ) {
      throw new Error("VF_CANONICAL_PREFLIGHT_RECEIPT_INVALID");
    }
    receipts.push(raw as unknown as VisualPreflightReceipt);
  }
  return receipts;
}

async function main() {
  const output = argument("--output");
  if (!output) throw new Error("VF_CANONICAL_PLAN_OUTPUT_REQUIRED");
  const preflight = argument("--preflight");
  if (!preflight) throw new Error("VF_CANONICAL_PREFLIGHT_DIRECTORY_REQUIRED");
  const subject = argument("--subject") ?? "all";

  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const state = createInitialVisualFactoryState(packageDigest);
  const receipts = await loadPassPreflightReceipts(preflight, packageDigest);
  const canonicalPlan = compileReferenceJobs(project, packageDigest, state, receipts);

  if (canonicalPlan.decision !== "REFERENCE_GENERATION_READY" || canonicalPlan.jobs.length !== 5) {
    throw new Error("VF_CANONICAL_REFERENCE_PLAN_NOT_READY");
  }
  if (canonicalPlan.jobs.some((job) =>
    job.preflightState !== "PREFLIGHT_PASS" ||
    !job.preflightReceiptId ||
    !job.preflightSpecDigest ||
    !job.compiledPromptDigest ||
    job.maxVariants !== 1
  )) {
    throw new Error("VF_CANONICAL_REFERENCE_PLAN_BINDING_INVALID");
  }

  const plan = selectReferencePlanSubject(canonicalPlan, subject);
  const outputPath = resolve(output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "VF_CANONICAL_PLAN_UNKNOWN_ERROR";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
