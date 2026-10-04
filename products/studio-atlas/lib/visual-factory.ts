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

export type VisualExecutionReceipt = {
  schemaVersion: "atlas.visual-execution-receipt/v0.1";
  receiptId: string;
  packageDigest: string;
  status: "SUCCEEDED" | "WAITING_FOR_COMPUTE" | "FAILED";
  costClass: "FREE_ONLY";
  assets: VisualAssetCandidate[];
  failureCategory?: "NO_FREE_PROVIDER" | "EXECUTOR_UNAVAILABLE" | "INVALID_EXECUTOR_RESPONSE" | "EXECUTION_FAILED";
  failureDetail?: string;
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

const MUSEO_ZERO_PROJECT_ID = "PW-STRATEGY-SELECTION-01";

export const MUSEO_ZERO_VISUAL_SUBJECTS: VisualSubject[] = [
  {
    subjectRef: "lia",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Lia, adult museum exhibition-layout and visitor-flow crew member; calm focused physicality; practical contemporary setup clothing; stable hairstyle and warm accent detail; full-body and medium-shot continuity sheet.",
  },
  {
    subjectRef: "omar",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Omar, adult museum installer; practical contemporary workwear; distinct silhouette; grounded posture near sensors and installation props; participant, not teacher; full-body and medium-shot continuity sheet.",
  },
  {
    subjectRef: "teo",
    purpose: "CHARACTER_REFERENCE",
    prompt: "Teo, adult museum control and rehearsal crew member; contemporary practical clothing; observant restrained body language; distinct silhouette associated with the control booth; continuity sheet.",
  },
  {
    subjectRef: "sala-zero",
    purpose: "ENVIRONMENT_REFERENCE",
    prompt: "Sala Zero contemporary interactive museum room after closing; large projection wall, new accessible entrance threshold, subtle floor route, integrated sensor, exit light, believable architecture and spatial depth; cinematic editorial illustration environment master.",
  },
  {
    subjectRef: "cabina-regia",
    purpose: "ENVIRONMENT_REFERENCE",
    prompt: "Cabina regia physically adjacent to Sala Zero; tactile believable museum AV control surface, spatial connection back to the exhibition, simple readable cue mapping and replay controls; cinematic editorial illustration environment master.",
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
      workflowFamily: "diffusers.flux1-schnell/v0.1",
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
    return { ...state, stage: receipt.status === "WAITING_FOR_COMPUTE" ? "WAITING_FOR_COMPUTE" : "FAILED", lastReceipt: receipt };
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
    workflowFamily: "comfyui.sdxl-ipadapter-controlnet/v0.1",
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
