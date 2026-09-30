import type { EcosystemSnapshot } from "../snapshot/types";

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
};

export function toEcosystemModel(snapshot: EcosystemSnapshot): EcosystemModel {
  return {
    generatedAt: snapshot.generatedAt,
    capabilities: Array.isArray(snapshot.capabilities) ? snapshot.capabilities as Capability[] : [],
    dependencies: Array.isArray(snapshot.dependencies) ? snapshot.dependencies as Dependency[] : [],
  };
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
  } as Record<string,string>)[kind] ?? kind.replaceAll("_", " ");
}

export function capabilityStateLabel(state?: string) {
  return ({
    CLOSED: "Chiusa",
    COMPLETE: "Completa",
    ACTIVE: "Attiva",
    PLANNED: "Pianificata",
    DEFERRED: "Deferred",
  } as Record<string,string>)[String(state || "")] ?? String(state || "Non dichiarato").replaceAll("_", " ");
}
