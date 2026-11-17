import type { EcosystemSnapshot } from "../snapshot/types";

export type EvidenceItem = {
  id: string;
  type?: string;
  area?: string;
  subject?: string;
  status?: string;
  source?: { path?: string; ref?: string; sha256?: string; repository?: string; runId?: string | number; decisionRef?: string };
  observedAt?: string;
  freshness?: { policy?: string; expiresAt?: string | null };
  confidence?: string;
  binding?: { capabilityRef?: string | null; exactHead?: string | null; areaRef?: string | null; releaseRef?: string | null; eventRef?: string | null } | null;
};

export type IntegrityCheck = {
  id: string;
  type?: string;
  status?: string;
  severity?: string;
  summary?: string;
  affectedRefs?: string[];
  details?: string[];
};

export type EvidenceModel = {
  generatedAt: string;
  evidence: EvidenceItem[];
  integrityChecks: IntegrityCheck[];
  capabilities: Array<{ id: string; label?: string; evidenceRefs?: string[] }>;
};

export function toEvidenceModel(snapshot: EcosystemSnapshot): EvidenceModel {
  return {
    generatedAt: snapshot.generatedAt,
    evidence: Array.isArray(snapshot.evidence) ? snapshot.evidence as EvidenceItem[] : [],
    integrityChecks: Array.isArray(snapshot.integrityChecks) ? snapshot.integrityChecks as IntegrityCheck[] : [],
    capabilities: Array.isArray(snapshot.capabilities) ? snapshot.capabilities as EvidenceModel["capabilities"] : [],
  };
}

export function freshnessState(item: EvidenceItem, generatedAt: string) {
  const policy=item.freshness?.policy;
  if (policy === "TIME_BOUND") {
    const expires=item.freshness?.expiresAt;
    if (!expires) return "UNKNOWN";
    const end=new Date(expires).getTime();
    const ref=new Date(generatedAt).getTime();
    if (Number.isNaN(end) || Number.isNaN(ref)) return "UNKNOWN";
    return end < ref ? "EXPIRED" : "CURRENT";
  }
  if (["EVENT_BOUND","UNTIL_CHANGE","RUNTIME_BOUND","MANUAL_REVIEW"].includes(String(policy))) return "POLICY_BOUND";
  return "UNKNOWN";
}

export function linkedCapabilities(model: EvidenceModel, evidenceId: string) {
  const direct=model.evidence.find((item)=>item.id===evidenceId)?.binding?.capabilityRef;
  const refs=model.capabilities.filter((cap)=>cap.evidenceRefs?.includes(evidenceId)).map((cap)=>cap.id);
  if (direct) refs.push(direct);
  return [...new Set(refs)].sort();
}

/** Presentation of the recorded outcome only. No current-candidate or release judgement. */
export function recordedEvidenceLabel(status?: string): string {
  switch (status) {
    case "PASS": return "Verifica registrata con esito positivo";
    case "FAIL": return "Verifica non superata";
    case "PARTIAL": return "Riscontro parziale";
    case "IN_PROGRESS": return "Verifica in corso";
    case "NOT_APPLICABLE": return "Controllo non pertinente";
    default: return "Esito non verificabile";
  }
}

/** Display only provenance already carried by the governed snapshot. */
export function evidenceProvenance(item: EvidenceItem): Array<{label: string; value: string}> {
  const fields: Array<[string, unknown]> = [
    ["Repository", item.source?.repository],
    ["Esecuzione", item.source?.runId],
    ["Versione di rilascio", item.binding?.releaseRef],
    ["Riferimento evento", item.binding?.eventRef],
    ["Riferimento decisione", item.source?.decisionRef],
    ["Ambito associato", item.binding?.areaRef],
  ];
  return fields.flatMap(([label, value]) =>
    typeof value === "string" && value.trim() !== "" ? [{label, value}] :
    label === "Esecuzione" && typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? [{label, value: String(value)}] : []
  );
}
