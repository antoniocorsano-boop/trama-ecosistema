import type { EcosystemSnapshot } from "../snapshot/types";

export type OverviewPhase = {
  id: string;
  name: string;
  status: string;
};

export type OverviewDecision = {
  id: string;
  area?: string;
  type?: string;
  status?: string;
  blocking?: boolean;
  decisionAuthority?: string;
};

export type OverviewModel = {
  generatedAt: string;
  phases: OverviewPhase[];
  completedPhases: OverviewPhase[];
  plannedPhases: OverviewPhase[];
  currentFocus: OverviewPhase[];
  nextPlanned: OverviewPhase | null;
  openDecisions: OverviewDecision[];
  freshSources: number;
  totalSources: number;
  evidencePassCount: number;
  activeCapabilityCount: number;
  deferredCapabilityCount: number;
};

const CLOSED_PHASES = new Set(["COMPLETE", "CLOSED"]);
const ACTIVE_PHASES = new Set(["ACTIVE", "IN_PROGRESS"]);
const PLANNED_PHASES = new Set(["PLANNED", "READY"]);

export function toOverviewModel(snapshot: EcosystemSnapshot): OverviewModel {
  const phases = (Array.isArray(snapshot.phases) ? snapshot.phases : []) as OverviewPhase[];
  const gates = (Array.isArray(snapshot.gates) ? snapshot.gates : []) as OverviewDecision[];
  const sourceState = (snapshot.sourceState ?? {}) as Record<string, { status?: string }>;
  const evidence = (Array.isArray(snapshot.evidence) ? snapshot.evidence : []) as Array<{ status?: string }>;
  const capabilities = (Array.isArray(snapshot.capabilities) ? snapshot.capabilities : []) as Array<{ state?: string }>;

  const completedPhases = phases.filter((phase) => CLOSED_PHASES.has(String(phase.status)));
  const currentFocus = phases.filter((phase) => ACTIVE_PHASES.has(String(phase.status)));
  const plannedPhases = phases.filter((phase) => PLANNED_PHASES.has(String(phase.status)));
  const openDecisions = gates.filter((gate) => Boolean(gate.blocking) && String(gate.status) !== "PASS");

  return {
    generatedAt: snapshot.generatedAt,
    phases,
    completedPhases,
    plannedPhases,
    currentFocus,
    nextPlanned: plannedPhases[0] ?? null,
    openDecisions,
    freshSources: Object.values(sourceState).filter((source) => source.status === "FRESH").length,
    totalSources: Object.keys(sourceState).length,
    evidencePassCount: evidence.filter((item) => item.status === "PASS").length,
    activeCapabilityCount: capabilities.filter((item) => item.state === "ACTIVE").length,
    deferredCapabilityCount: capabilities.filter((item) => item.state === "DEFERRED").length,
  };
}

export function humanPhaseStatus(status: string) {
  return ({
    COMPLETE: "Completata",
    CLOSED: "Chiusa",
    ACTIVE: "Attiva",
    IN_PROGRESS: "In corso",
    PLANNED: "Pianificata",
    READY: "Pronta",
  } as Record<string, string>)[status] ?? status.replaceAll("_", " ");
}
