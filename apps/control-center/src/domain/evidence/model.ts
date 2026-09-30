import type { EcosystemSnapshot } from "../snapshot/types";

export type EvidenceItem = {
  id: string;
  type?: string;
  area?: string;
  subject?: string;
  status?: string;
  source?: { path?: string; ref?: string; sha256?: string };
  observedAt?: string;
  freshness?: { policy?: string; expiresAt?: string | null };
  confidence?: string;
  binding?: { capabilityRef?: string; exactHead?: string };
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
