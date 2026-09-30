export type ProjectKnowledgeEvent = {
  eventId?: string;
  type?: string;
  subject?: string;
  statement?: string;
  status?: string;
  rationale?: string;
  validFrom?: string;
};

export type ProjectKnowledgePack = {
  schemaVersion: string;
  subject: string;
  asOf: string;
  status: string;
  facts: ProjectKnowledgeEvent[];
  activeInvariants: ProjectKnowledgeEvent[];
  blockingGates: unknown[];
  knownConflicts: unknown[];
  knownRejectedApproaches: ProjectKnowledgeEvent[];
  nextCandidateActions: unknown[];
};

export type ProjectKnowledgeState =
  | { status: "LOADING" }
  | { status: "READY"; data: ProjectKnowledgePack }
  | { status: "INVALID"; error: Error }
  | { status: "UNAVAILABLE"; error: Error };

export function parseProjectKnowledge(value: unknown): ProjectKnowledgePack {
  if (!value || typeof value !== "object") throw new Error("TRAMA_PROJECT_KNOWLEDGE_INVALID");
  const data = value as Partial<ProjectKnowledgePack>;
  if (
    typeof data.schemaVersion !== "string"
    || data.subject !== "project-knowledge"
    || typeof data.asOf !== "string"
    || typeof data.status !== "string"
    || !Array.isArray(data.facts)
    || !Array.isArray(data.activeInvariants)
    || !Array.isArray(data.blockingGates)
    || !Array.isArray(data.knownConflicts)
    || !Array.isArray(data.knownRejectedApproaches)
    || !Array.isArray(data.nextCandidateActions)
  ) {
    throw new Error("TRAMA_PROJECT_KNOWLEDGE_INVALID");
  }
  return data as ProjectKnowledgePack;
}

export function projectKnowledgeTone(status: string): "quiet" | "attention" | "blocked" {
  const normalized = status.toUpperCase();
  if (normalized === "BLOCKED" || normalized === "CONFLICT") return "blocked";
  if (normalized === "PARTIAL" || normalized === "DEGRADED" || normalized === "STALE") return "attention";
  return "quiet";
}

export function projectKnowledgeLabel(status: string) {
  return ({
    CURRENT: "Aggiornata",
    COMPLETE: "Completa",
    PARTIAL: "Parziale",
    DEGRADED: "Da verificare",
    STALE: "Non recente",
    BLOCKED: "Bloccata",
  } as Record<string, string>)[status.toUpperCase()] ?? status.replaceAll("_", " ");
}
