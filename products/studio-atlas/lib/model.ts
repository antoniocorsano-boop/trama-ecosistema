export type HumanState =
  | "IDEA"
  | "STORY_DRAFT"
  | "STORY_REVIEW"
  | "WORLD_DESIGN"
  | "SCENES"
  | "PRODUCTION"
  | "PREVIEW"
  | "REVIEW"
  | "PUBLISH_CANDIDATE"
  | "PUBLISHED"
  | "WITHDRAWN";

export type ProductionState =
  | "NOT_REQUESTED"
  | "WAITING_FOR_COMPUTE"
  | "RUNNING"
  | "READY"
  | "FAILED";

export type ReviewDecision = "DRAFT" | "READY" | "PASS" | "REVISE";
export type ProductReviewDecision = ReviewDecision | "REJECT";

export type StoryDraft = {
  hook: string;
  setting: string;
  characters: string;
  characterGoal: string;
  disruption: string;
  unknown: string;
  learnerRole: string;
  turningPoint: string;
  ending: string;
};

export type WorldDraft = {
  learnerRole: string;
  canObserve: string;
  canChange: string;
  unknown: string;
  consequence: string;
  motivation: string;
};

export type ExperienceGrammar =
  | ""
  | "INQUIRY_EVIDENCE"
  | "BRANCHING_CONSEQUENCE"
  | "WORKSHOP_CONSTRUCTION"
  | "SIMULATION_MICROWORLD"
  | "VISUAL_NARRATIVE"
  | "ENVIRONMENTAL_STORYTELLING";

export type ExperienceDraft = {
  grammar: ExperienceGrammar;
  rationale: string;
};

export type SceneWorldSignalState =
  | "OFF"
  | "READY"
  | "ACTIVE"
  | "DELAYED"
  | "MISMATCH"
  | "STABLE"
  | "MANUAL";

export type SceneWorldSignal = {
  id: string;
  label: string;
  state: SceneWorldSignalState;
  detail?: string;
};

export type SceneWorldState = {
  place: string;
  status: string;
  signals: SceneWorldSignal[];
};

export type SceneStageLocationPosition = "ENTRY" | "ROOM" | "CONTROL" | "LAB";
export type SceneStageEvidenceKind = "TRACE" | "OBJECT" | "PERSON" | "SYSTEM";
export type SceneWorkbenchMode = "TIMELINE" | "CONNECTIONS" | "COMPARE";

export type SceneStage = {
  visualMode: "CINEMATIC_EDITORIAL";
  focusLocationId?: string;
  locations?: Array<{
    id: string;
    label: string;
    detail: string;
    position: SceneStageLocationPosition;
  }>;
  evidence?: Array<{
    id: string;
    label: string;
    detail: string;
    locationId: string;
    kind: SceneStageEvidenceKind;
    character?: string;
  }>;
  characterBeat?: {
    name: string;
    role: string;
    line: string;
  };
  workbench?: {
    modes: SceneWorkbenchMode[];
    prompt: string;
    minEvidence: number;
    transitionMap?: Partial<Record<SceneWorkbenchMode, string>>;
  };
};

export type PathwaySceneChoice = {
  choiceId: string;
  label: string;
  feedback: string;
  targetSceneId: string;
  worldAfter?: SceneWorldState;
};

export type PathwayScene = {
  sceneId: string;
  kind: "SCENE" | "TRANSFER";
  interaction: "SUMMARY" | "CHOICE";
  title: string;
  visibleSituation: string;
  learnerAction: string;
  consequence: string;
  reveal: string;
  world?: SceneWorldState;
  stage?: SceneStage;
  choices: PathwaySceneChoice[];
};

export type HumanReview = {
  decision: ReviewDecision;
  reviewedAt?: string;
  evidenceRef?: string;
};

export type ProductReview = {
  decision: ProductReviewDecision;
  reviewedAt?: string;
  evidenceRef?: string;
};

export type VisualProductionRequest = {
  schemaVersion: "atlas.visual-production-request/v0.1";
  requestId: string;
  pathwayId: string;
  packageDigest: string;
  operation: "GENERATE";
  sceneRefs: string[];
  qualityProfile: "Q4";
  productForm: "illustrated-sequence";
  computePolicyRef: "TRAMA Compute Policy v0.1";
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  maxAttempts: 4;
  requestedAt: string;
};

export type StudioAtlasPreviewSnapshot = {
  schemaVersion: "studio-atlas.preview-snapshot/v0.1";
  snapshotId: string;
  packageDigest: string;
  pathwayId: string;
  version: string;
  title: string;
  description: string;
  runtimeAuthorized: false;
  studentAuthorized: false;
  scenes: PathwayScene[];
};

export type VisualProductionReceipt = {
  schemaVersion: "atlas.visual-production-receipt/v0.1";
  receiptId: string;
  requestId: string;
  status: "WAITING_FOR_COMPUTE";
  qualityProfile: "Q4";
  effectiveCostClass: "UNKNOWN";
  costClass: "FREE_ONLY";
  attempts: 0;
  failureCategory: "NO_FREE_PROVIDER";
  failureDetail: string;
  publicationAuthorityGranted: false;
};

export type PathwayProject = {
  projectId: string;
  title: string;
  idea: string;
  ageBand: "later-primary" | "lower-secondary" | "mixed-first-cycle";
  humanState: HumanState;
  productionState: ProductionState;
  story: StoryDraft;
  storyReview: HumanReview;
  world: WorldDraft;
  worldReview: HumanReview;
  productReview?: ProductReview;
  experience: ExperienceDraft;
  scenes: PathwayScene[];
  storyboardReady: boolean;
  lastProductionRequest?: VisualProductionRequest;
  lastProductionReceipt?: VisualProductionReceipt;
  lastPreviewSnapshot?: StudioAtlasPreviewSnapshot;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  revision: number;
};

export const EMPTY_STORY: StoryDraft = {
  hook: "",
  setting: "",
  characters: "",
  characterGoal: "",
  disruption: "",
  unknown: "",
  learnerRole: "",
  turningPoint: "",
  ending: "",
};

export const EMPTY_WORLD: WorldDraft = {
  learnerRole: "",
  canObserve: "",
  canChange: "",
  unknown: "",
  consequence: "",
  motivation: "",
};

export const EMPTY_EXPERIENCE: ExperienceDraft = {
  grammar: "",
  rationale: "",
};

export const STAGES = [
  "Idea",
  "Storia",
  "Mondo",
  "Esperienza",
  "Scene",
  "Produzione",
  "Prova",
  "Revisione",
] as const;
