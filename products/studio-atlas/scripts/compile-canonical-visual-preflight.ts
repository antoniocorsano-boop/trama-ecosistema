import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createMuseoZeroPilotProject } from "../lib/canonical/museo-zero";
import {
  MUSEO_ZERO_REFERENCE_INTENTS,
  MUSEO_ZERO_SHOT_INTENTS,
} from "../lib/canonical/museo-zero-visual-intents";
import { digestAuthoringState } from "../lib/production";
import {
  MUSEO_ZERO_VISUAL_SUBJECTS,
  type VisualReferenceLock,
} from "../lib/visual-factory";
import {
  PREFLIGHT_AUTHORITY_FLAGS,
  createVisualPreflightReceipt,
  type CompiledVisualPrompt,
  type VisualIntentSpec,
  type VisualPreflightFinding,
  type VisualPreflightReceipt,
} from "../lib/visual-preflight";

export type CanonicalVisualPreflightMode = "references" | "shots";

export type CanonicalVisualPreflightOptions = {
  mode: CanonicalVisualPreflightMode;
  humanPreflightPass: boolean;
  createdAt?: string;
  referenceLocks?: readonly VisualReferenceLock[];
};

export type CanonicalVisualPreflightQualification = {
  schemaVersion: "atlas.visual-preflight-qualification/v0.1";
  mode: CanonicalVisualPreflightMode;
  pathwayId: string;
  packageDigest: string;
  semanticCriticMode: "NOT_AVAILABLE";
  humanPreflightDecision?: "PASS";
  providerCallCount: 0;
  sourceSpecs: VisualIntentSpec[];
  receipts: VisualPreflightReceipt[];
  compiledPromptDigests: string[];
  referenceLocks?: VisualReferenceLock[];
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  runtimeAuthorized: false;
  publicationAuthorityGranted: false;
};

function bindPackageDigest(spec: VisualIntentSpec, packageDigest: string): VisualIntentSpec {
  return { ...structuredClone(spec), packageDigest };
}

function validateShotReferenceLocks(
  referenceLocks: readonly VisualReferenceLock[] | undefined,
  packageDigest: string,
): Map<string, VisualReferenceLock> {
  if (!referenceLocks) {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_REQUIRED");
  }
  const requiredSubjects = MUSEO_ZERO_VISUAL_SUBJECTS.map((subject) => subject.subjectRef);
  if (referenceLocks.length !== requiredSubjects.length) {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
  }
  const lockBySubject = new Map<string, VisualReferenceLock>();
  for (const lock of referenceLocks) {
    if (
      !requiredSubjects.includes(lock.subjectRef) ||
      lockBySubject.has(lock.subjectRef) ||
      lock.packageDigest !== packageDigest ||
      !lock.assetUrl.startsWith("https://") ||
      !lock.assetSha256 ||
      !/^[0-9a-f]{64}$/.test(lock.assetSha256)
    ) {
      throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
    }
    lockBySubject.set(lock.subjectRef, structuredClone(lock));
  }
  if (!requiredSubjects.every((subjectRef) => lockBySubject.has(subjectRef))) {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
  }
  return lockBySubject;
}

export async function compileCanonicalVisualPreflight(
  options: CanonicalVisualPreflightOptions,
): Promise<CanonicalVisualPreflightQualification> {
  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const templates = options.mode === "references"
    ? MUSEO_ZERO_REFERENCE_INTENTS
    : MUSEO_ZERO_SHOT_INTENTS;
  const sourceSpecs = templates.map((spec) => bindPackageDigest(spec, packageDigest));
  const createdAt = options.createdAt ?? new Date().toISOString();
  const lockBySubject = options.mode === "shots"
    ? validateShotReferenceLocks(options.referenceLocks, packageDigest)
    : undefined;
  const validatedReferenceLocks = lockBySubject
    ? MUSEO_ZERO_VISUAL_SUBJECTS.map((subject) => structuredClone(lockBySubject.get(subject.subjectRef)!))
    : undefined;

  const receipts = sourceSpecs.map((spec) => {
    const referenceInputs = lockBySubject
      ? spec.subjectRefs.map((subjectRef) => {
          const lock = lockBySubject.get(subjectRef);
          if (!lock) throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
          return lock.assetUrl;
        })
      : [];
    const referenceInputDigests = lockBySubject
      ? spec.subjectRefs.map((subjectRef) => {
          const lock = lockBySubject.get(subjectRef);
          if (!lock?.assetSha256) throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
          return lock.assetSha256;
        })
      : [];
    return createVisualPreflightReceipt({
      spec,
      providerFamily: "FLUX2_KLEIN_4B",
      semanticCritic: {
        mode: "NOT_AVAILABLE",
        result: "NOT_RUN",
        findings: [],
      },
      ...(options.humanPreflightPass ? { humanPreflightDecision: "PASS" as const } : {}),
      ...(referenceInputs.length > 0 ? { referenceInputs, referenceInputDigests } : {}),
      createdAt,
    });
  });

  return {
    schemaVersion: "atlas.visual-preflight-qualification/v0.1",
    mode: options.mode,
    pathwayId: project.projectId,
    packageDigest,
    semanticCriticMode: "NOT_AVAILABLE",
    ...(options.humanPreflightPass ? { humanPreflightDecision: "PASS" as const } : {}),
    providerCallCount: 0,
    sourceSpecs,
    receipts,
    compiledPromptDigests: receipts.flatMap((receipt) => receipt.compiledPrompts.map((prompt) => prompt.promptDigest)),
    ...(validatedReferenceLocks ? { referenceLocks: validatedReferenceLocks } : {}),
    ...PREFLIGHT_AUTHORITY_FLAGS,
  };
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function parseMode(value: string | undefined): CanonicalVisualPreflightMode {
  if (value === "references" || value === "shots") return value;
  throw new Error("VPC_CANONICAL_PREFLIGHT_MODE_INVALID");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function loadReferenceLocks(path: string): Promise<VisualReferenceLock[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(resolve(path), "utf8"));
  } catch {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_UNAVAILABLE");
  }
  if (
    !isRecord(parsed) ||
    parsed.schemaVersion !== "atlas.visual-reference-lock-evidence/v0.1" ||
    parsed.runtimeAuthorized !== false ||
    parsed.publicationAuthorityGranted !== false ||
    !Array.isArray(parsed.locks)
  ) {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_INVALID");
  }
  return parsed.locks as VisualReferenceLock[];
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeQualificationArtifacts(
  outputDir: string,
  qualification: CanonicalVisualPreflightQualification,
): Promise<void> {
  const root = resolve(outputDir);
  const directories = ["specs", "findings", "prompts", "receipts", "bundles"];
  await mkdir(root, { recursive: true });
  await Promise.all(directories.map((directory) => mkdir(resolve(root, directory), { recursive: true })));

  for (let index = 0; index < qualification.sourceSpecs.length; index += 1) {
    const spec = qualification.sourceSpecs[index];
    const receipt = qualification.receipts[index];
    if (!receipt || receipt.specId !== spec.specId) {
      throw new Error("VPC_CANONICAL_PREFLIGHT_RECEIPT_ALIGNMENT_INVALID");
    }
    const prompt: CompiledVisualPrompt | undefined = receipt.compiledPrompts[0];
    const findings: VisualPreflightFinding[] = [
      ...receipt.deterministicChecks,
      ...receipt.semanticCritic.findings,
    ];

    await Promise.all([
      writeJson(resolve(root, "specs", `${spec.specId}.json`), spec),
      writeJson(resolve(root, "findings", `${spec.specId}.json`), findings),
      writeJson(resolve(root, "prompts", `${spec.specId}.json`), prompt ?? null),
      writeJson(resolve(root, "receipts", `${spec.specId}.json`), receipt),
      writeJson(resolve(root, "bundles", `${spec.specId}.json`), {
        schemaVersion: "atlas.visual-preflight-bundle/v0.1",
        spec,
        findings,
        compiledPrompt: prompt ?? null,
        receipt,
      }),
    ]);
  }

  if (qualification.mode === "shots") {
    if (!qualification.referenceLocks || qualification.referenceLocks.length !== MUSEO_ZERO_VISUAL_SUBJECTS.length) {
      throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_REQUIRED");
    }
    await writeJson(resolve(root, "reference-locks.json"), {
      schemaVersion: "atlas.visual-reference-lock-evidence/v0.1",
      pathwayId: qualification.pathwayId,
      packageDigest: qualification.packageDigest,
      locks: qualification.referenceLocks,
      runtimeAuthorized: false,
      publicationAuthorityGranted: false,
    });
  }

  await writeJson(resolve(root, "manifest.json"), {
    schemaVersion: qualification.schemaVersion,
    mode: qualification.mode,
    pathwayId: qualification.pathwayId,
    packageDigest: qualification.packageDigest,
    semanticCriticMode: qualification.semanticCriticMode,
    humanPreflightDecision: qualification.humanPreflightDecision,
    providerCallCount: qualification.providerCallCount,
    sourceSpecIds: qualification.sourceSpecs.map((spec) => spec.specId),
    receiptIds: qualification.receipts.map((receipt) => receipt.receiptId),
    finalStates: qualification.receipts.map((receipt) => receipt.finalState),
    compiledPromptDigests: qualification.compiledPromptDigests,
    paidComputeAuthorized: qualification.paidComputeAuthorized,
    allowQualityDowngrade: qualification.allowQualityDowngrade,
    runtimeAuthorized: qualification.runtimeAuthorized,
    publicationAuthorityGranted: qualification.publicationAuthorityGranted,
  });
}

async function main(): Promise<void> {
  const mode = parseMode(argument("--mode"));
  const output = argument("--output");
  if (!output) throw new Error("VPC_CANONICAL_PREFLIGHT_OUTPUT_REQUIRED");
  const referenceLocksPath = argument("--reference-locks");
  if (mode === "shots" && !referenceLocksPath) {
    throw new Error("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_REQUIRED");
  }
  const referenceLocks = referenceLocksPath ? await loadReferenceLocks(referenceLocksPath) : undefined;

  const qualification = await compileCanonicalVisualPreflight({
    mode,
    humanPreflightPass: hasFlag("--human-preflight-pass"),
    ...(referenceLocks ? { referenceLocks } : {}),
  });

  if (qualification.receipts.some((receipt) => receipt.finalState !== "PREFLIGHT_PASS")) {
    throw new Error("VPC_CANONICAL_PREFLIGHT_NOT_PASS");
  }
  if (qualification.providerCallCount !== 0) {
    throw new Error("VPC_CANONICAL_PREFLIGHT_PROVIDER_CALL_FORBIDDEN");
  }

  await writeQualificationArtifacts(output, qualification);
  process.stdout.write(`${JSON.stringify({
    schemaVersion: qualification.schemaVersion,
    mode: qualification.mode,
    packageDigest: qualification.packageDigest,
    receiptCount: qualification.receipts.length,
    providerCallCount: qualification.providerCallCount,
    finalStates: qualification.receipts.map((receipt) => receipt.finalState),
  }, null, 2)}\n`);
}

const invokedAsScript = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false;

if (invokedAsScript) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "VPC_CANONICAL_PREFLIGHT_UNKNOWN_ERROR";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
