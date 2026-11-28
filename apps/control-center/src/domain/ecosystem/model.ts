import type {
  EcosystemGraphFlowData,
  EcosystemGraphNodeData,
  EcosystemGraphProjectionData,
  EcosystemSnapshot,
  RealizationState as SnapshotRealizationState,
} from "../snapshot/types";

export type RealizationState = SnapshotRealizationState;
export type EcosystemGraphNode = EcosystemGraphNodeData;
export type EcosystemGraphFlow = EcosystemGraphFlowData;
export type EcosystemGraphProjection = EcosystemGraphProjectionData;

export type Capability = {
  id: string;
  label: string;
  ownerDomain?: string;
  state?: string;
  humanReview?: string;
  runtimeState?: string | null;
  maturityAreaRef?: string;
  dependencyRefs?: string[];
  gateRefs?: string[];
  evidenceRefs?: string[];
  sourceRef?: string;
  sourceUpdatedAt?: string;
};

export type Dependency = {
  id: string;
  from: string;
  to: string;
  kind: string;
  status: string;
  governanceRefs?: string[];
  gateRefs?: string[];
  evidenceRefs?: string[];
};

export type EcosystemModel = {
  generatedAt: string;
  capabilities: Capability[];
  dependencies: Dependency[];
  ecosystemGraph: EcosystemGraphProjection;
};

export type GapEntry = {
  id: string;
  subjectType: "node" | "flow";
  subjectId: string;
  label: string;
  currentState: RealizationState;
  targetState: RealizationState;
  gapSummary: string;
  missing: string[];
  targetBoundary: string;
  targetValue: string;
  nextAction: string;
  preconditions: string[];
  forbiddenUntil: string[];
  safeguard: boolean;
};

const EMPTY_GRAPH: EcosystemGraphProjection = {
  schemaVersion: "trama.ecosystem.state/v0.3",
  asOf: "",
  sourceRef: "",
  authorityPolicy: {},
  legend: {},
  externalActors: [],
  nodes: [],
  flows: [],
  views: {},
  transitionPolicy: {},
};

function isEcosystemGraphProjection(value: unknown): value is EcosystemGraphProjection {
  if (!value || typeof value !== "object") return false;
  const graph=value as Partial<EcosystemGraphProjection>;
  return graph.schemaVersion === "trama.ecosystem.state/v0.3"
    && typeof graph.sourceRef === "string"
    && Array.isArray(graph.externalActors)
    && Array.isArray(graph.nodes)
    && Array.isArray(graph.flows);
}

export function toEcosystemModel(snapshot: EcosystemSnapshot): EcosystemModel {
  return {
    generatedAt: snapshot.generatedAt,
    capabilities: Array.isArray(snapshot.capabilities) ? snapshot.capabilities as Capability[] : [],
    dependencies: Array.isArray(snapshot.dependencies) ? snapshot.dependencies as Dependency[] : [],
    ecosystemGraph: isEcosystemGraphProjection(snapshot.ecosystemGraph) ? snapshot.ecosystemGraph : EMPTY_GRAPH,
  };
}

export function selectGapEntries(
  graph: EcosystemGraphProjection,
  includeSafeguards = false,
): GapEntry[] {
  const fromNode = (node: EcosystemGraphNode): GapEntry | null => {
    const hasGap = node.state !== node.targetState || node.gap.missing.length > 0;
    const safeguard = node.state === "REAL"
      && node.targetState === "REAL"
      && !hasGap
      && node.nextAllowedIntervention.action === "NONE";
    if (!hasGap && !(includeSafeguards && safeguard)) return null;
    return {
      id: `node:${node.id}`,
      subjectType: "node",
      subjectId: node.id,
      label: node.label,
      currentState: node.state,
      targetState: node.targetState,
      gapSummary: node.gap.summary,
      missing: [...node.gap.missing],
      targetBoundary: node.target.boundary,
      targetValue: node.target.value,
      nextAction: node.nextAllowedIntervention.action,
      preconditions: [...node.nextAllowedIntervention.preconditions],
      forbiddenUntil: [...node.nextAllowedIntervention.forbiddenUntil],
      safeguard,
    };
  };

  const nodeLabel = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const actorLabel = new Map(graph.externalActors.map((actor) => [actor.id, actor.label]));
  const endpointLabel = (id: string) => nodeLabel.get(id) ?? actorLabel.get(id) ?? id;

  const fromFlow = (flow: EcosystemGraphFlow): GapEntry | null => {
    const hasGap = flow.state !== flow.targetState || flow.gap.missing.length > 0;
    const safeguard = flow.state === "REAL"
      && flow.targetState === "REAL"
      && !hasGap
      && flow.nextAllowedIntervention.action === "NONE";
    if (!hasGap && !(includeSafeguards && safeguard)) return null;
    return {
      id: `flow:${flow.id}`,
      subjectType: "flow",
      subjectId: flow.id,
      label: `${endpointLabel(flow.from)} → ${endpointLabel(flow.to)}`,
      currentState: flow.state,
      targetState: flow.targetState,
      gapSummary: flow.gap.summary,
      missing: [...flow.gap.missing],
      targetBoundary: flow.target.boundary,
      targetValue: flow.target.value,
      nextAction: flow.nextAllowedIntervention.action,
      preconditions: [...flow.nextAllowedIntervention.preconditions],
      forbiddenUntil: [...flow.nextAllowedIntervention.forbiddenUntil],
      safeguard,
    };
  };

  return [
    ...graph.nodes.map(fromNode).filter((entry): entry is GapEntry => entry !== null),
    ...graph.flows.map(fromFlow).filter((entry): entry is GapEntry => entry !== null),
  ];
}

export function authorityDisplayLabel(owner: string | null, refs: string[]) {
  const ownerLabel = owner?.trim() ?? "";
  const refsLabel = refs.join(", ").trim();
  return [ownerLabel, refsLabel].filter(Boolean).join(" · ") || "—";
}

export function realizationStateLabel(state: RealizationState) {
  return ({ REAL: "Reale", PARTIAL: "Parziale", DESIGNED: "Progettato", DEFERRED: "Differito" } as const)[state];
}

export function relationTone(kind: string) {
  switch (kind) {
    case "AUTHORITY": return "authority";
    case "DATA_FLOW": return "data";
    case "FUTURE_NOT_AUTHORIZED": return "future";
    default: return "neutral";
  }
}

export function relationKindLabel(kind: string) {
  return ({
    AUTHORITY: "Authority",
    DATA_FLOW: "Flusso dati",
    FUTURE_NOT_AUTHORIZED: "Futuro non autorizzato",
    NAVIGATION: "Navigazione",
    AUTHENTICATION: "Autenticazione",
    DATA: "Dati",
    AUTHORING: "Authoring",
    PUBLICATION: "Pubblicazione",
    ASSIGNMENT: "Assegnazione",
    GOVERNANCE: "Governance",
    OTHER: "Altro",
  } as Record<string,string>)[kind] ?? kind.replaceAll("_", " ");
}

export function capabilityStateLabel(state?: string) {
  return ({
    CLOSED: "Chiusa",
    COMPLETE: "Completa",
    ACTIVE: "Attiva",
    PLANNED: "Pianificata",
    DEFERRED: "Differita",
  } as Record<string,string>)[String(state || "")] ?? String(state || "Non dichiarato").replaceAll("_", " ");
}
