export type RealizationState = "REAL" | "PARTIAL" | "DESIGNED" | "DEFERRED";

export type EcosystemGap = {
  summary: string;
  missing: string[];
};

export type EcosystemTarget = {
  boundary: string;
  value: string;
};

export type NextAllowedIntervention = {
  action: string;
  preconditions: string[];
  forbiddenUntil: string[];
};

export type MaturityContext = {
  confirmedLevel: number;
  candidateLevel: number;
  evidenceBindingStatus: "NONE" | "PARTIAL" | "COMPLETE";
  nextTargetLevel: number | null;
  nextRequiredEvidenceTypes: string[];
  interpretation: "BOUND_EVIDENCE_ONLY";
  sourceRef: string;
  authorityRef: string;
};

export type EcosystemGraphSubject = {
  id: string;
  state: RealizationState;
  targetState: RealizationState;
  boundary: string;
  authorityOwner: string | null;
  authorityRefs: string[];
  implementationOwners: string[];
  maturityRef: string | null;
  evidenceRefs: string[];
  blockerRefs: string[];
  gap: EcosystemGap;
  target: EcosystemTarget;
  nextAllowedIntervention: NextAllowedIntervention;
  sourceRefs: string[];
  lastSignificantChange: string | null;
  decisionRefs: string[];
};

export type EcosystemGraphNodeData = EcosystemGraphSubject & {
  label: string;
  plane: string;
  maturityContext?: MaturityContext;
};

export type EcosystemGraphFlowData = EcosystemGraphSubject & {
  from: string;
  to: string;
  kind: "NAVIGATION" | "AUTHENTICATION" | "AUTHORITY" | "DATA" | "AUTHORING" | "PUBLICATION" | "ASSIGNMENT" | "GOVERNANCE" | "OTHER";
};

export type EcosystemExternalActor = {
  id: string;
  label: string;
  kind: "HUMAN_ACTOR" | "SYSTEM_ACTOR";
};

export type EcosystemGraphProjectionData = {
  schemaVersion: "trama.ecosystem.state/v0.3";
  asOf: string;
  sourceRef: string;
  authorityPolicy: Record<string, unknown>;
  legend: Record<string, unknown>;
  externalActors: EcosystemExternalActor[];
  nodes: EcosystemGraphNodeData[];
  flows: EcosystemGraphFlowData[];
  views: Record<string, unknown>;
  transitionPolicy: Record<string, unknown>;
};

export type EcosystemSnapshot = Record<string, unknown> & {
  schemaVersion: string;
  generatedAt: string;
  ecosystemGraph?: EcosystemGraphProjectionData;
};
