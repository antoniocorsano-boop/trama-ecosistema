import type { PathwayProject } from "./model";
import {
  MUSEO_ZERO_REFERENCE_INTENTS,
  MUSEO_ZERO_SHOT_INTENTS,
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
  /** Absent only in legacy persisted state; never sufficient for reuse. */
  profileDigest?: string;
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
  /** Explicit offline profiles require a content-bound receipt. */
  profileDigest?: string;
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
  /** Required for explicit noncanonical profiles. Canonical executor receipts remain compatible. */
  profileDigest?: string;
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

export type VisualProductionProfile = {
  readonly pathwayId: string;
  readonly artDirectionVersion: string;
  readonly references: readonly VisualIntentSpec[];
  readonly shots: readonly VisualIntentSpec[];
};

/** Planning-only profile. Admission to execution remains a separate trusted boundary. */
export function validateVisualProductionProfile(profile: VisualProductionProfile): void {
  const invalid = () => { throw new Error("VISUAL_PRODUCTION_PROFILE_INVALID"); };
  if (!profile.pathwayId.trim() || !profile.artDirectionVersion.trim() ||
      profile.references.length < 1 || profile.references.length > 6 ||
      profile.shots.length < 1 || profile.shots.length > 6) invalid();
  const refs = new Set<string>();
  const shots = new Set<string>();
  const specs = new Set<string>();
  for (const spec of [...profile.references, ...profile.shots]) {
    if (spec.pathwayId !== profile.pathwayId ||
        spec.artDirectionVersion !== profile.artDirectionVersion ||
        !/^[0-9a-f]{64}$/.test(spec.packageDigest) ||
        !spec.specId.trim() || specs.has(spec.specId) ||
        !spec.subjectRefs.length ||
        new Set(spec.subjectRefs).size !== spec.subjectRefs.length ||
        spec.subjectRefs.some(id => !id.trim())) invalid();
    specs.add(spec.specId);
  }
  for (const spec of profile.references) {
    if ((spec.purpose !== "CHARACTER_REFERENCE" && spec.purpose !== "ENVIRONMENT_REFERENCE") ||
        spec.subjectRefs.length !== 1 || spec.sceneRef || spec.shotId ||
        refs.has(spec.subjectRefs[0])) invalid();
    refs.add(spec.subjectRefs[0]);
  }
  for (const spec of profile.shots) {
    if (spec.purpose !== "SCENE_FRAME" || !spec.shotId?.trim() || !spec.sceneRef?.trim() ||
        shots.has(spec.shotId!) || spec.subjectRefs.some(id => !refs.has(id))) invalid();
    shots.add(spec.shotId!);
  }
}

const MUSEO_ZERO_PROFILE: VisualProductionProfile = {
  pathwayId: MUSEO_ZERO_PROJECT_ID,
  artDirectionVersion: MUSEO_ZERO_REFERENCE_INTENTS[0].artDirectionVersion,
  references: MUSEO_ZERO_REFERENCE_INTENTS,
  shots: MUSEO_ZERO_SHOT_INTENTS,
};

function digestVisualProductionProfile(profile: VisualProductionProfile): string {
  validateVisualProductionProfile(profile);
  return canonicalDigest(profile);
}

const CANONICAL_PROFILE_DIGEST = digestVisualProductionProfile(MUSEO_ZERO_PROFILE);

/** Only the existing canonical profile is execution-admitted. Never accept a client profile here. */
export function resolveCanonicalVisualProductionProfile(pathwayId: string): VisualProductionProfile {
  if (pathwayId !== MUSEO_ZERO_PROJECT_ID) throw new Error("VISUAL_FACTORY_UNSUPPORTED_PATHWAY");
  const profile = structuredClone(MUSEO_ZERO_PROFILE);
  validateVisualProductionProfile(profile);
  return profile;
}

function profileSubjects(profile: VisualProductionProfile): VisualSubject[] {
  return profile.references.map(spec => ({
    subjectRef: spec.subjectRefs[0],
    purpose: spec.purpose as VisualSubject["purpose"],
  }));
}

function profileShots(profile: VisualProductionProfile): ShotDefinition[] {
  return profile.shots.map(spec => ({
    shotId: spec.shotId!, sceneRef: spec.sceneRef!, subjectRefs: [...spec.subjectRefs],
  }));
}

export const MUSEO_ZERO_VISUAL_SUBJECTS: VisualSubject[] = profileSubjects(MUSEO_ZERO_PROFILE);

export function getProfileReferenceIntent(profile: VisualProductionProfile, subjectRef: string): VisualIntentSpec {
  const spec = profile.references.find(item => item.subjectRefs[0] === subjectRef);
  if (!spec) throw new Error("VISUAL_FACTORY_UNKNOWN_REFERENCE");
  return spec;
}

export function getProfileShotIntent(profile: VisualProductionProfile, shotId: string): VisualIntentSpec {
  const spec = profile.shots.find(item => item.shotId === shotId);
  if (!spec) throw new Error("VISUAL_FACTORY_UNKNOWN_SHOT");
  return spec;
}

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
  profile: VisualProductionProfile,
): Omit<VisualGenerationPlan, "decision" | "jobs" | "blockers"> {
  validateVisualProductionProfile(profile);
  if (project.projectId !== profile.pathwayId) {
    throw new Error("VISUAL_FACTORY_UNSUPPORTED_PATHWAY");
  }
  if (!/^[0-9a-f]{64}$/.test(packageDigest)) {
    throw new Error("VISUAL_FACTORY_INVALID_PACKAGE_DIGEST");
  }
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: project.projectId,
    packageDigest,
    ...(digestVisualProductionProfile(profile) === CANONICAL_PROFILE_DIGEST ? {} : { profileDigest: digestVisualProductionProfile(profile) }),
    planType,
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

export function createInitialVisualFactoryState(packageDigest: string, profile: VisualProductionProfile = MUSEO_ZERO_PROFILE): VisualFactoryState {
  validateVisualProductionProfile(profile);
  if (!/^[0-9a-f]{64}$/.test(packageDigest)) {
    throw new Error("VISUAL_FACTORY_INVALID_PACKAGE_DIGEST");
  }
  return {
    packageDigest,
    artDirectionVersion: profile.artDirectionVersion,
    profileDigest: digestVisualProductionProfile(profile),
    stage: "NEEDS_REFERENCES",
    candidates: [],
    referenceLocks: [],
    sceneAssets: [],
  };
}

export function reconcileVisualFactoryState(
  state: VisualFactoryState | null | undefined,
  packageDigest: string,
  profile: VisualProductionProfile = MUSEO_ZERO_PROFILE,
): VisualFactoryState {
  validateVisualProductionProfile(profile);
  if (
    !state ||
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== profile.artDirectionVersion ||
    state.profileDigest !== digestVisualProductionProfile(profile)
  ) {
    return createInitialVisualFactoryState(packageDigest, profile);
  }
  return state;
}

export function compileReferenceJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
  preflightReceipts: readonly VisualPreflightReceipt[] = [],
): VisualGenerationPlan {
  return compileProfileReferenceJobs(project, packageDigest, state, preflightReceipts, resolveCanonicalVisualProductionProfile(project.projectId));
}

/** Offline planning for an explicit profile; does not admit that profile to any executor. */
export function compileProfileReferenceJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
  preflightReceipts: readonly VisualPreflightReceipt[],
  profile: VisualProductionProfile,
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "REFERENCE_GENERATION", profile);
  if (
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== profile.artDirectionVersion ||
    state.profileDigest !== digestVisualProductionProfile(profile)
  ) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const locked = new Set(state.referenceLocks.map((item) => item.subjectRef));
  const pending = profileSubjects(profile).filter((subject) => !locked.has(subject.subjectRef));
  if (pending.length === 0) {
    return { ...prefix, decision: "NO_REFERENCE_GENERATION_REQUIRED", jobs: [], blockers: [] };
  }

  const qualified = pending.map((subject) => ({
    subject,
    result: qualifyPreflight(
      getProfileReferenceIntent(profile, subject.subjectRef),
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
  // The existing executor admits only the canonical Museo Zero profile. Never
  // interpret a legacy/unbound receipt as evidence for an explicit profile.
  if (!state.profileDigest || receipt.packageDigest !== state.packageDigest ||
      (receipt.profileDigest === undefined
        ? state.profileDigest !== CANONICAL_PROFILE_DIGEST
        : receipt.profileDigest !== state.profileDigest)) {
    throw new Error("STALE_VISUAL_CANDIDATE");
  }
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
  profile: VisualProductionProfile = MUSEO_ZERO_PROFILE,
): VisualFactoryState {
  validateVisualProductionProfile(profile);
  if (state.artDirectionVersion !== profile.artDirectionVersion || packageDigest !== state.packageDigest ||
      state.profileDigest !== digestVisualProductionProfile(profile)) {
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
  const required = new Set(profileSubjects(profile).map((item) => item.subjectRef));
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
  return compileProfileShotJobs(project, packageDigest, state, preflightReceipts, resolveCanonicalVisualProductionProfile(project.projectId));
}

/** Offline planning for an explicit profile; execution admission is unchanged. */
export function compileProfileShotJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
  preflightReceipts: readonly VisualPreflightReceipt[],
  profile: VisualProductionProfile,
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "SHOT_GENERATION", profile);
  if (
    state.packageDigest !== packageDigest ||
    state.artDirectionVersion !== profile.artDirectionVersion ||
    state.profileDigest !== digestVisualProductionProfile(profile)
  ) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const lockBySubject = new Map(state.referenceLocks.map((item) => [item.subjectRef, item]));
  const missing = profileSubjects(profile)
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

  const qualified = profileShots(profile).map((shot) => {
    const referenceInputs = shot.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl);
    const referenceInputDigests = shot.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetSha256!);
    return {
      shot,
      referenceInputs,
      referenceInputDigests,
      result: qualifyPreflight(
        getProfileShotIntent(profile, shot.shotId),
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
