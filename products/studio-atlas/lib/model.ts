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

export type PathwayProject = {
  projectId: string;
  title: string;
  idea: string;
  ageBand: "later-primary" | "lower-secondary" | "mixed-first-cycle";
  humanState: HumanState;
  productionState: ProductionState;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  revision: number;
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
