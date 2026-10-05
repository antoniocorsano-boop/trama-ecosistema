import type { PathwayProject } from "./model";

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
  aspectRatio: string;
  maxVariants: number;
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
    | "STOP_REFERENCE_LOCK_REQUIRED";
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
  prompt: string;
};

type ShotDefinition = {
  shotId: string;
  sceneRef: string;
  subjectRefs: string[];
  prompt: string;
};

const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";

export const MUSEO_ZERO_VISUAL_SUBJECTS: VisualSubject[] = [
  {
    subjectRef: "lia",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Lia only, single subject with no other people or partial figures; adult museum exhibition-layout and visitor-flow crew member actively placing clean blank floor-route markers at the new accessible entrance; hands clearly visible doing the task; calm focused physicality; practical contemporary setup clothing; stable hairstyle and one warm accent detail; full-body working pose in a sparse unlabeled museum corridor, not a posed portrait.",
  },
  {
    subjectRef: "omar",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Omar, adult museum hands-on installer physically adjusting a compact sensor mount and nearby installation hardware; practical contemporary workwear; distinct silhouette; grounded posture, small hand tool or fixture detail allowed; participant with partial knowledge, not teacher or supervisor; full-body working continuity reference.",
  },
  {
    subjectRef: "teo",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Teo only, single subject; adult museum AV rehearsal technician, not security staff and no security uniform or badge; contemporary practical clothing distinct from Omar; restrained observant body language inside a compact control booth; physical console only with tactile buttons, knobs and faders, monitor off and no screen interface; clear sightline through an unlabeled interior window toward Sala Zero; working continuity reference, not a guard portrait.",
  },
  {
    subjectRef: "sala-zero",
    purpose: "ENVIRONMENT_REFERENCE",
    prompt: "Sala Zero, contemporary interactive museum room after closing, viewed from the new accessible entrance threshold into a believable deep space; subtle floor circulation route and integrated sensor near the threshold; large projection wall showing abstract light in warm amber tones and simple non-text motion only; no text, no interface, no charts, no signage, unlabeled walls and unlabeled doors; exit light and restrained installation details; narrative physical environment first.",
  },
  {
    subjectRef: "cabina-regia",
    purpose: "ENVIRONMENT_REFERENCE",
    prompt: "Cabina regia, interior viewpoint with the camera inside a small enclosed adjacent booth connected to Sala Zero; a wide observation window looks directly into Sala Zero and the warm abstract projection is visibly framed through that window; tactile control console in the foreground with physical buttons, knobs and faders only; no screens, no monitors, no signage, no wall posters; believable museum AV back-of-house materials and working scale; cinematic environment master.",
  },
];

const MUSEO_ZERO_SHOTS: ShotDefinition[] = [
  {
    shotId: "F1",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    subjectRefs: ["lia", "omar", "teo", "sala-zero"],
    prompt: "After-hours museum, final rehearsal about to start; Lia approaches the new accessible entrance while Omar and Teo are naturally at work; world credibility first, no technical explanation.",
  },
  {
    shotId: "F2",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    subjectRefs: ["lia", "omar", "sala-zero"],
    prompt: "Lia has crossed the new entrance threshold but the projection wall remains dark; Omar sees the sensor respond; same spatial family as F1, closer and readable without captions.",
  },
  {
    shotId: "F3",
    sceneRef: "MZ1_FAILED_REHEARSAL",
    subjectRefs: ["lia", "omar", "teo", "sala-zero"],
    prompt: "The warm projection finally triggers too late; Lia is already deeper inside; visible spatial mismatch between her position and the room response; one restrained crew reaction.",
  },
  {
    shotId: "F4",
    sceneRef: "MZ4_TEST_MAPPING",
    subjectRefs: ["teo", "cabina-regia"],
    prompt: "Teo beside a believable museum AV control surface; one readable mapping relation still points to old entrance logic; the control remains diegetic, never a detached dashboard.",
  },
  {
    shotId: "F5",
    sceneRef: "MZ4_TEST_MAPPING",
    subjectRefs: ["teo", "cabina-regia"],
    prompt: "Same control surface and composition as F4 after one bounded mapping change to the new entrance sensor; state update is quiet and physically believable.",
  },
  {
    shotId: "F6",
    sceneRef: "MZ6_FINAL_REHEARSAL",
    subjectRefs: ["lia", "omar", "teo", "sala-zero"],
    prompt: "Same rehearsal and camera family as F2/F3; Lia crosses the same threshold and the warm projection response begins immediately; restrained crew satisfaction, no reward effect.",
  },
];

const COMMON_NEGATIVE = [
  "dashboard aesthetic",
  "generic SaaS cards",
  "floating avatar heads",
  "chibi or mascot treatment",
  "cyberpunk neon default",
  "technical diagram as dominant scene",
  "large educational captions",
  "decorative AI clutter",
  "readable text, pseudo-text, labels, captions, signage, or watermarks",
  "charts, graphs, dashboards, detached UI panels, or screen-wall interfaces",
  "partial, cropped, headless, duplicate, or malformed human figures",
  "computer monitor interfaces, source-code screens, or software windows",
];

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
  if (!state || state.packageDigest !== packageDigest) {
    return createInitialVisualFactoryState(packageDigest);
  }
  return state;
}

export function compileReferenceJobs(
  project: PathwayProject,
  packageDigest: string,
  state: VisualFactoryState,
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "REFERENCE_GENERATION");
  if (state.packageDigest !== packageDigest) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const locked = new Set(state.referenceLocks.map((item) => item.subjectRef));
  const jobs = MUSEO_ZERO_VISUAL_SUBJECTS
    .filter((subject) => !locked.has(subject.subjectRef))
    .map<VisualGenerationJob>((subject) => ({
      jobId: `reference-${subject.subjectRef}`,
      purpose: subject.purpose,
      subjectRef: subject.subjectRef,
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: `cinematic editorial illustration; polished 2-D illustrated realism; after-hours contemporary museum. ${subject.prompt}`,
      negativeConstraints: [...COMMON_NEGATIVE],
      referenceInputs: [],
      aspectRatio: subject.purpose === "CHARACTER_REFERENCE" ? "3:4" : "4:3",
      maxVariants: 3,
    }));

  return {
    ...prefix,
    decision: jobs.length > 0 ? "REFERENCE_GENERATION_READY" : "NO_REFERENCE_GENERATION_REQUIRED",
    jobs,
    blockers: [],
  };
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
): VisualGenerationPlan {
  const prefix = basePlan(project, packageDigest, "SHOT_GENERATION");
  if (state.packageDigest !== packageDigest) {
    throw new Error("STALE_VISUAL_FACTORY_STATE");
  }
  const lockBySubject = new Map(state.referenceLocks.map((item) => [item.subjectRef, item]));
  const missing = MUSEO_ZERO_VISUAL_SUBJECTS
    .map((item) => item.subjectRef)
    .filter((subjectRef) => !lockBySubject.has(subjectRef));

  if (missing.length > 0) {
    return {
      ...prefix,
      decision: "STOP_REFERENCE_LOCK_REQUIRED",
      jobs: [],
      blockers: missing.map((subjectRef) => `REFERENCE_NOT_LOCKED:${subjectRef}`),
    };
  }

  const jobs = MUSEO_ZERO_SHOTS.map<VisualGenerationJob>((shot) => ({
    jobId: `shot-${shot.shotId}`,
    purpose: "SCENE_FRAME",
    subjectRef: shot.shotId,
    shotId: shot.shotId,
    sceneRef: shot.sceneRef,
    workflowFamily: "flux2-klein-4b/v0.2",
    prompt: `cinematic editorial illustration; polished 2-D illustrated realism; believable museum architecture; character-in-world staging. ${shot.prompt}`,
    negativeConstraints: [...COMMON_NEGATIVE, "website mockup", "floating UI overlay"],
    referenceInputs: shot.subjectRefs.map((subjectRef) => lockBySubject.get(subjectRef)!.assetUrl),
    aspectRatio: "4:3",
    maxVariants: 3,
  }));

  return {
    ...prefix,
    decision: "SHOT_GENERATION_READY",
    jobs,
    blockers: [],
  };
}
