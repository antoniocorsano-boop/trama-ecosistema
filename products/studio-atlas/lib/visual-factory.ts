import type { PathwayProject } from "./model";
import {
  getMuseoZeroReferenceIntent,
  getMuseoZeroShotIntent,
} from "./canonical/museo-zero-visual-intents";
import {
  canonicalDigest,
  compileVisualPrompt,
  resolvePreflightState,
  VISUAL_PREFLIGHT_COMPILER_VERSION,
  type CompiledVisualPrompt,
  type VisualIntentSpec,
  type VisualPreflightReceipt,
} from "./visual-preflight";

export type VisualAssetPurpose =
  | "CHARACTER_REFERENCE"
  | "ENVIRONMENT_REFERENCE"
  | "SCENE_FRAME";

export type VisualAssetCandidate = {
  assetId: string;
  subjectRef: string;
  purpose: VisualAssetPurpose;
  url: string;
  sha256: string;
  modelRef: string;
  workflowRef: string;
  createdAt: string;
  packageDigest: string;
  provenanceStatus: "RECORDED";
};

export type VisualReferenceLock = {
  subjectRef: string;
  assetId: string;
  assetUrl: string;
  assetSha256?: string;
  packageDigest: string;
  lockedAt: string;
};

export type VisualFactoryStage =
  | "NEEDS_REFERENCES"
  | "REFERENCE_REVIEW"
  | "READY_FOR_SHOTS"
  | "SHOT_REVIEW"
  | "WAITING_FOR_COMPUTE"
  | "FAILED";

export type VisualFactoryState = {
  packageDigest: string;
  artDirectionVersion?: string;
  stage: VisualFactoryStage;
  candidates: VisualAssetCandidate[];
  referenceLocks: VisualReferenceLock[];
  sceneAssets: VisualAssetCandidate[];
  lastReceipt?: VisualExecutionReceipt;
};

export type VisualGenerationJob = {
  jobId: string;
  purpose: VisualAssetPurpose;
  subjectRef?: string;
  shotId?: string;
  sceneRef?: string;
  workflowFamily: string;
  prompt: string;
  negativeConstraints: string[];
  referenceInputs: string[];
  referenceInputDigests?: string[];
  aspectRatio: string;
  maxVariants: 1;
  preflightReceiptId?: string;
  preflightSpecDigest?: string;
  compiledPromptDigest?: string;
  preflightState?: "PREFLIGHT_PASS";
};

export type VisualGenerationPlan = {
  schemaVersion: "atlas.visual-generation-plan/v0.1";
  pathwayId: string;
  packageDigest: string;
  planType: "REFERENCE_GENERATION" | "SHOT_GENERATION";
  decision:
    | "REFERENCE_GENERATION_READY"
    | "NO_REFERENCE_GENERATION_REQUIRED"
    | "SHOT_GENERATION_READY"
    | "STOP_REFERENCE_LOCK_REQUIRED"
    | "STOP_PREFLIGHT_REQUIRED";
  jobs: VisualGenerationJob[];
  blockers: string[];
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  runtimeAuthorized: false;
  publicationAuthorityGranted: false;
};

export type VisualExecutionProviderId = "HF_ZEROGPU" | "CLOUDFLARE_WORKERS_AI";

export type VisualProviderAttemptEvidence = {
  provider: VisualExecutionProviderId;
  eligibility: "ELIGIBLE" | "INELIGIBLE" | "NOT_CONFIGURED" | "PREFLIGHT_ERROR";
  eligibilityReason: string;
  quotaRemainingGpuSeconds?: number;
  outcome?:
    | "SUCCEEDED"
    | "RETRYABLE_PROVIDER_FAILURE"
    | "PROVIDER_EXHAUSTED"
    | "PROVIDER_INELIGIBLE"
    | "LICENSE_BLOCKED"
    | "PERMANENT_FAILURE";
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

export type VisualOrchestrationEvidence = {
  schemaVersion: "atlas.visual-orchestration-evidence/v0.1";
  orchestrationId: string;
  workloadClass: "CANONICAL_REFERENCE" | "SCENE_FRAME";
  consideredProviders: VisualExecutionProviderId[];
  selectedProvider?: VisualExecutionProviderId;
  selectedModelRef?: string;
  attempts: VisualProviderAttemptEvidence[];
  finalState: "SUCCEEDED" | "GENERATION_DEFERRED";
};

export type VisualExecutionReceipt = {
  schemaVersion: "atlas.visual-execution-receipt/v0.1";
  receiptId: string;
  packageDigest: string;
  status: "SUCCEEDED" | "WAITING_FOR_COMPUTE" | "FAILED";
  costClass: "FREE_ONLY";
  assets: VisualAssetCandidate[];
  failureCategory?: "NO_FREE_PROVIDER" | "EXECUTOR_UNAVAILABLE" | "INVALID_EXECUTOR_RESPONSE" | "EXECUTION_FAILED";
  failureDetail?: string;
  orchestration?: VisualOrchestrationEvidence;
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  runtimeAuthorized: false;
  publicationAuthorityGranted: false;
};

type VisualSubject = {
  subjectRef: string;
  purpose: "CHARACTER_REFERENCE" | "ENVIRONMENT_REFERENCE";
};

type ShotDefinition = {
  shotId: string;
  sceneRef: string;
  subjectRefs: string[];
};

type QualifiedPreflight = {
  receipt: VisualPreflightReceipt;
  compiled: CompiledVisualPrompt;
};

const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";
const MUSEO_ZERO_ART_DIRECTION_VERSION = getMuseoZeroReferenceIntent("lia").artDirectionVersion;

export const MUSEO_ZERO_VISUAL_SUBJECTS: VisualSubject[] = [
  { subjectRef: "lia", purpose: "CHARACTER_REFERENCE" },
  { subjectRef: "omar", purpose: "CHARACTER_REFERENCE" },
  { subjectRef: "teo", purpose: "CHARACTER_REFERENCE" },
  { subjectRef: "sala-zero", purpose: "ENVIRONMENT_REFERENCE" },
  { subjectRef: "cabina-regia", purpose: "ENVIRONMENT_REFERENCE" },
];

const MUSEO_ZERO_SHOTS: ShotDefinition[] = [
  { shotId: "F1", sceneRef: "MZ1_FAILED_REHEARSAL", subjectRefs: ["lia", "omar", "teo", "sala-zero"] },
  { shotId: "F2", sceneRef: "MZ1_FAILED_REHEARSAL", subjectRefs: ["lia", "omar", "sala-zero"] },
  { shotId: "F3", sceneRef: "MZ1_FAILED_REHEARSAL", subjectRefs: ["lia", "omar", "teo", "sala-zero"] },
  { shotId: "F4", sceneRef: "MZ4_TEST_MAPPING", subjectRefs: ["teo", "cabina-regia"] },
  { shotId: "F5", sceneRef: "MZ4_TEST_MAPPING", subjectRefs: ["teo", "cabina-regia"] },
  { shotId: "F6", sceneRef: "MZ6_FINAL_REHEARSAL", subjectRefs: ["lia", "omar", "teo", "sala-zero"] },
];

function bindPackageDigest(intent: VisualIntentSpec, packageDigest: string): VisualIntentSpec {
  return { ...intent, packageDigest };
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function hasSelfConsistentReceiptBinding(receipt: VisualPreflightReceipt): boolean {
  const expectedFinalState = resolvePreflightState({
    deterministicFindings: receipt.deterministicChecks,
    semanticCritic: receipt.semanticCritic,
    humanPreflightDecision: receipt.humanPreflightDecision,
  });
  const expectedHumanPreflightRequired =
    receipt.semanticCritic.mode === "NOT_AVAILABLE" && receipt.semanticCritic.result === "NOT_RUN";
  const bindingDigest = canonicalDigest({
    specDigest: receipt.specDigest,
    packageDigest: receipt.packageDigest,
    compilerVersion: receipt.compilerVersion,
    artDirectionVersion: receipt.artDirectionVersion,
    finalState: receipt.finalState,
    promptDigests: receipt.compiledPrompts.map((prompt) => prompt.promptDigest),
    semanticCritic: {
      mode: receipt.semanticCritic.mode,
      modelRef: receipt.semanticCritic.modelRef ?? null,
      modelDigest: receipt.semanticCritic.modelDigest ?? null,
      result: receipt.semanticCritic.result,
    },
    humanPreflightDecision: receipt.humanPreflightDecision ?? null,
  });

  return (
    receipt.finalState === expectedFinalState &&
    receipt.humanPreflightRequired === expectedHumanPreflightRequired &&
    (!expectedHumanPreflightRequired || receipt.humanPreflightDecision === "PASS") &&
    receipt.receiptId === `vpc-${bindingDigest.slice(0, 32)}`
  );
}

function qualifyPreflight(
  intentTemplate: VisualIntentSpec,
  packageDigest: string,
  receipts: readonly VisualPreflightReceipt[],
  key: string,
  referenceInputs: readonly string[] = [],
  referenceInputDigests: readonly string[] = [],
): { qualified?: QualifiedPreflight; blocker?: string } {
  const intent = bindPackageDigest(intentTemplate, packageDigest);
  const receipt = receipts.find((item) => item.specId === intent.specId);
  if (!receipt) return { blocker: `VISUAL_PREFLIGHT_RECEIPT_MISSING:${key}` };
  if (!hasSelfConsistentReceiptBinding(receipt)) {
    return { blocker: `VISUAL_PREFLIGHT_RECEIPT_INTEGRITY_INVALID:${key}` };
  }
  if (receipt.finalState !== "PREFLIGHT_PASS") {
    return { blocker: `VISUAL_PREFLIGHT_NOT_PASSED:${key}` };
  }
  const expectedSpecDigest = canonicalDigest(intent);
  if (
    receipt.packageDigest !== packageDigest ||
    receipt.specDigest !== expectedSpecDigest ||
    receipt.specId !== intent.specId
  ) {
    return { blocker: `VISUAL_PREFLIGHT_STALE_RECEIPT:${key}` };
  }
  if (receipt.compilerVersion !== VISUAL_PREFLIGHT_COMPILER_VERSION) {
    return { blocker: `VISUAL_PREFLIGHT_COMPILER_VERSION_MISMATCH:${key}` };
  }
  if (receipt.artDirectionVersion !== intent.artDirectionVersion) {
    return { blocker: `VISUAL_PREFLIGHT_ART_DIRECTION_VERSION_MISMATCH:${key}` };
  }
  if (
    receipt.paidComputeAuthorized !== false ||
    receipt.allowQualityDowngrade !== false ||
    receipt.runtimeAuthorized !== false ||
    receipt.publicationAuthorityGranted !== false
  ) {
    return { blocker: `VISUAL_PREFLIGHT_AUTHORITY_VIOLATION:${key}` };
  }
  if (receipt.compiledPrompts.length !== 1) {
    return { blocker: `VISUAL_PREFLIGHT_PROMPT_MISSING:${key}` };
  }
  const expected = compileVisualPrompt(intent, "FLUX2_KLEIN_4B", {
    referenceInputs,
    referenceInputDigests,
  });
  const compiled = receipt.compiledPrompts[0];
  if (
    compiled.promptDigest !== expected.promptDigest ||
    compiled.sourceSpecDigest !== expected.sourceSpecDigest ||
    compiled.compilerVersion !== expected.compilerVersion ||
    compiled.maxVariants !== 1 ||
    !sameStringArray(compiled.referenceInputs, expected.referenceInputs) ||
    !sameStringArray(compiled.referenceInputDigests, expected.referenceInputDigests) ||
    canonicalDigest(compiled) !== canonicalDigest(expected)
  ) {
    return { blocker: `VISUAL_PREFLIGHT_PROMPT_DIGEST_MISMATCH:${key}` };
  }
  return { qualified: { receipt, compiled } };
}

function basePlan(
  project: PathwayProject,
  packageDigest: string,
  planType: VisualGenerationPlan["planType"],
): Omit<VisualGenerationPlan, "decision" | "jobs" | "blockers"> {
  if (project.projectId !== MUSEO_ZERO_PROJECT_ID) {
    throw new Error("VISUAL_FACTORY_UNSUPPORTED_PATHWAY");
  }
  if (!/^[0-9a-f]{64}$/.test(packageDigest)) {
    throw new Error("VISUAL_FACTORY_INVALID_PACKAGE_DIGEST");
  }
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: project.projectId,
    packageDigest,
    planType,
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

export function createInitialVisualFactoryState(packageDigest: string): VisualFactoryState {
  if (!/^[0-9a-f]{64}$/.test(packageDigest)) {
    throw new Error("VISUAL_FACTORY_INVALID_PACKAGE_DIGEST");
  }
  return {
    packageDigest,
    artDirectionVersion: MUSEO_ZERO_ART_DIRECTION_VERSION,
    stage: "NEEDS_REFERENCES",
    candidates: [],
    referenceLocks: [],
    sceneAssets: [],
  };
}

export function reconcileVisualFactoryState(
  state: VisualFactoryState | null | undefined,
  packageDigest: string,
): VisualFactoryState {
  if (
    !state ||
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== MUSEO_ZERO_ART_DIRECTION_VERSION
  ) {
    return createInitialVisualFactoryState(packageDigest);
  }
  return state;
}

export function compileReferenceJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
  preflightReceipts: readonly VisualPreflightReceipt[] = [],
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "REFERENCE_GENERATION");
  if (
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== MUSEO_ZERO_ART_DIRECTION_VERSION
  ) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const locked = new Set(state.referenceLocks.map((item) => item.subjectRef));
  const pending = MUSEO_ZERO_VISUAL_SUBJECTS.filter((subject) => !locked.has(subject.subjectRef));
  if (pending.length === 0) {
    return { ...prefix, decision: "NO_REFERENCE_GENERATION_REQUIRED", jobs: [], blockers: [] };
  }

  const qualified = pending.map((subject) => ({
    subject,
    result: qualifyPreflight(
      getMuseoZeroReferenceIntent(subject.subjectRef),
      packageDigest,
      preflightReceipts,
      subject.subjectRef,
    ),
  }));
  const blockers = qualified.flatMap((item) => item.result.blocker ? [item.result.blocker] : []);
  if (blockers.length > 0) {
    return { ...prefix, decision: "STOP_PREFLIGHT_REQUIRED", jobs: [], blockers };
  }

  const jobs = qualified.map<VisualGenerationJob>(({ subject, result }) => {
    const { receipt, compiled } = result.qualified!;
    return {
      jobId: `reference-${subject.subjectRef}`,
      purpose: subject.purpose,
      subjectRef: subject.subjectRef,
      workflowFamily: compiled.workflowFamily,
      prompt: compiled.positivePrompt,
      negativeConstraints: compiled.negativePrompt ? [compiled.negativePrompt] : [],
      referenceInputs: [...compiled.referenceInputs],
      referenceInputDigests: [...compiled.referenceInputDigests],
      aspectRatio: compiled.aspectRatio,
      maxVariants: 1,
      preflightReceiptId: receipt.receiptId,
      preflightSpecDigest: receipt.specDigest,
      compiledPromptDigest: compiled.promptDigest,
      preflightState: "PREFLIGHT_PASS",
    };
  });

  return { ...prefix, decision: "REFERENCE_GENERATION_READY", jobs, blockers: [] };
}

export function ingestVisualCandidates(
  state: VisualFactoryState,
  receipt: VisualExecutionReceipt,
): VisualFactoryState {
  if (receipt.status !== "SUCCEEDED") {
    return {
      ...state,
      stage: receipt.status === "WAITING_FOR_COMPUTE" ? "WAITING_FOR_COMPUTE" : "FAILED",
      lastReceipt: receipt,
    };
  }
  if (receipt.packageDigest !== state.packageDigest) {
    throw new Error("STALE_VISUAL_CANDIDATE");
  }
  if (
    receipt.paidComputeAuthorized !== false ||
    receipt.allowQualityDowngrade !== false ||
    receipt.runtimeAuthorized !== false ||
    receipt.publicationAuthorityGranted !== false
  ) {
    throw new Error("VISUAL_EXECUTION_AUTHORITY_VIOLATION");
  }
  if (receipt.assets.some((asset) => asset.packageDigest !== state.packageDigest)) {
    throw new Error("STALE_VISUAL_CANDIDATE");
  }

  const candidateMap = new Map(state.candidates.map((asset) => [asset.assetId, asset]));
  for (const asset of receipt.assets.filter((item) => item.purpose !== "SCENE_FRAME")) {
    candidateMap.set(asset.assetId, asset);
  }
  const sceneMap = new Map(state.sceneAssets.map((asset) => [asset.assetId, asset]));
  for (const asset of receipt.assets.filter((item) => item.purpose === "SCENE_FRAME")) {
    sceneMap.set(asset.assetId, asset);
  }

  return {
    ...state,
    stage: receipt.assets.some((item) => item.purpose === "SCENE_FRAME") ? "SHOT_REVIEW" : "REFERENCE_REVIEW",
    candidates: [...candidateMap.values()],
    sceneAssets: [...sceneMap.values()],
    lastReceipt: receipt,
  };
}

export function lockVisualReference(
  state: VisualFactoryState,
  subjectRef: string,
  assetId: string,
  packageDigest: string,
): VisualFactoryState {
  if (packageDigest !== state.packageDigest) {
    throw new Error("STALE_VISUAL_CANDIDATE");
  }
  const candidate = state.candidates.find(
    (asset) => asset.assetId === assetId && asset.subjectRef === subjectRef,
  );
  if (!candidate || candidate.packageDigest !== packageDigest) {
    throw new Error("STALE_VISUAL_CANDIDATE");
  }
  const locks = state.referenceLocks.filter((item) => item.subjectRef !== subjectRef);
  locks.push({
    subjectRef,
    assetId,
    assetUrl: candidate.url,
    assetSha256: candidate.sha256,
    packageDigest,
    lockedAt: new Date().toISOString(),
  });
  const required = new Set(MUSEO_ZERO_VISUAL_SUBJECTS.map((item) => item.subjectRef));
  const locked = new Set(locks.map((item) => item.subjectRef));
  const ready = [...required].every((subject) => locked.has(subject));
  return {
    ...state,
    referenceLocks: locks,
    stage: ready ? "READY_FOR_SHOTS" : "REFERENCE_REVIEW",
  };
}

export function compileShotJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
  preflightReceipts: readonly VisualPreflightReceipt[] = [],
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "SHOT_GENERATION");
  if (
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== MUSEO_ZERO_ART_DIRECTION_VERSION
  ) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const lockBySubject = new Map(state.referenceLocks.map((item) => [item.subjectRef, item]));
  const missing = MUSEO_ZERO_VISUAL_SUBJECTS
    .map((item) => item.subjectRef)
    .filter((subjectRef) => {
      const lock = lockBySubject.get(subjectRef);
      return !lock || !lock.assetSha256 || !/^[0-9a-f]{64}$/.test(lock.assetSha256);
    });

  if (missing.length > 0) {
    return {
      ...prefix,
      decision: "STOP_REFERENCE_LOCK_REQUIRED",
      jobs: [],
      blockers: missing.map((subjectRef) => `REFERENCE_LOCK_PROVENANCE_MISSING:${subjectRef}`),
    };
  }

  const qualified = MUSEO_ZERO_SHOTS.map((shot) => {
    const referenceInputs = shot.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl);
    const referenceInputDigests = shot.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetSha256!);
    return {
      shot,
      referenceInputs,
      referenceInputDigests,
      result: qualifyPreflight(
        getMuseoZeroShotIntent(shot.shotId),
        packageDigest,
        preflightReceipts,
        shot.shotId,
        referenceInputs,
        referenceInputDigests,
      ),
    };
  });
  const blockers = qualified.flatMap((item) => item.result.blocker ? [item.result.blocker] : []);
  if (blockers.length > 0) {
    return { ...prefix, decision: "STOP_PREFLIGHT_REQUIRED", jobs: [], blockers };
  }

  const jobs = qualified.map<VisualGenerationJob>(({ shot, result }) => {
    const { receipt, compiled } = result.qualified!;
    return {
      jobId: `shot-${shot.shotId}`,
      purpose: "SCENE_FRAME",
      subjectRef: shot.shotId,
      shotId: shot.shotId,
      sceneRef: shot.sceneRef,
      workflowFamily: compiled.workflowFamily,
      prompt: compiled.positivePrompt,
      negativeConstraints: compiled.negativePrompt ? [compiled.negativePrompt] : [],
      referenceInputs: [...compiled.referenceInputs],
      referenceInputDigests: [...compiled.referenceInputDigests],
      aspectRatio: compiled.aspectRatio,
      maxVariants: 1,
      preflightReceiptId: receipt.receiptId,
      preflightSpecDigest: receipt.specDigest,
      compiledPromptDigest: compiled.promptDigest,
      preflightState: "PREFLIGHT_PASS",
    };
  });

  return { ...prefix, decision: "SHOT_GENERATION_READY", jobs, blockers: [] };
}
