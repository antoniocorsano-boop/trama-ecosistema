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

export type PathwayScene = {
  sceneId: string;
  title: string;
  visibleSituation: string;
  learnerAction: string;
  consequence: string;
  reveal: string;
};

export type HumanReview = {
  decision: ReviewDecision;
  reviewedAt?: string;
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
  experience: ExperienceDraft;
  scenes: PathwayScene[];
  storyboardReady: boolean;
  lastProductionRequest?: VisualProductionRequest;
  lastProductionReceipt?: VisualProductionReceipt;
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
