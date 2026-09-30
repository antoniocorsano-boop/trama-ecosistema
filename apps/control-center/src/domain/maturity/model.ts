export const COMPONENT_STAGES = [
  "REGISTERED",
  "ISOLATED",
  "BEHAVIOURAL",
  "RESPONSIVE_VISUAL",
  "ACCESSIBILITY",
] as const;

export type ComponentStage = (typeof COMPONENT_STAGES)[number];

export const STAGE_LABELS: Record<ComponentStage, string> = {
  REGISTERED: "Registrato",
  ISOLATED: "Isolato",
  BEHAVIOURAL: "Comportamento",
  RESPONSIVE_VISUAL: "Responsive / visuale",
  ACCESSIBILITY: "Accessibilità",
};

export const PRODUCT_LABELS: Record<string, string> = {
  ARENA: "Arena",
  ATLAS: "Atlas",
  DOCENTE_OS: "Docente OS",
  "DOCENTE OS": "Docente OS",
  TRAMA_CONTROL_CENTER: "Control Center",
};

export const LIFECYCLE_LABELS: Record<string, string> = {
  PROPOSED: "Proposto",
  TRIAL: "In prova",
  STABLE: "Stabile",
  LEGACY: "Legacy",
  DEPRECATED: "Deprecato",
  RETIRED: "Ritirato",
  SPECIALIST: "Specialistico",
  NATIVE: "Nativo",
};

export const SOURCE_LABELS: Record<string, string> = {
  NATIVE_PLATFORM: "Piattaforma nativa",
  PRODUCT_OWNED: "Componente del prodotto",
  TRAMA_SHARED_SEMANTIC: "Semantica condivisa TRAMA",
  EXTERNAL_PRIMITIVE: "Primitiva esterna",
  SPECIALIST_LIBRARY: "Libreria specialistica",
};

export const EVIDENCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: "Presente",
  PARTIAL: "Parziale",
  DOCUMENTED_ONLY: "Solo documentata",
  NOT_OBSERVED: "Non osservata",
  NOT_APPLICABLE: "Non applicabile",
};

export type MaturityArea = {
  id: string;
  name: string;
  ownerDomain?: string;
  confirmedLevel: number;
  candidateLevel: number;
  evidenceBindingStatus?: string;
  nextTargetLevel?: number | null;
  nextRequiredEvidenceTypes?: string[];
};

export type ComponentEvidenceItem = {
  type?: string;
  status?: string;
  ref?: string;
  sourcePlane?: string;
  exactHead?: string;
  repository?: string;
  runId?: string;
};

export type MaturityComponent = {
  componentId: string;
  product?: string;
  target?: string | null;
  semanticPattern?: string | null;
  lifecycle?: string;
  sourceClass?: string;
  sourceRef?: string;
  maturity?: {
    confirmedStage?: ComponentStage;
    candidateStage?: ComponentStage;
    qualificationStatus?: string;
    remainingEvidenceTypes?: string[];
  };
  evidenceStatus?: Record<string, ComponentEvidenceItem>;
};

export type MaturitySnapshot = {
  schemaVersion: string;
  generatedAt: string;
  areas: MaturityArea[];
  components: MaturityComponent[];
  sourceState?: Record<string, { status?: string }>;
};

export function productLabel(value?: string) {
  return PRODUCT_LABELS[value ?? ""] ?? String(value || "Non assegnato").replaceAll("_", " ");
}

export function lifecycleLabel(value?: string) {
  return LIFECYCLE_LABELS[value ?? ""] ?? String(value || "—").replaceAll("_", " ");
}

export function sourceLabel(value?: string) {
  return SOURCE_LABELS[value ?? ""] ?? String(value || "—").replaceAll("_", " ");
}

export function evidenceDisplayLabel(item?: ComponentEvidenceItem) {
  const status = EVIDENCE_STATUS_LABELS[item?.status ?? "NOT_OBSERVED"]
    ?? String(item?.status || "Non osservata").replaceAll("_", " ");
  return item?.sourcePlane === "LIVE_VERIFIED" ? `${status} · live verificata` : status;
}

export function shortComponentName(component: MaturityComponent) {
  const target = String(component.target || "");
  if (target) {
    const last = target.split("/").pop() || target;
    return last.replace(/\.(tsx?|jsx?|html|vue|svelte)$/i, "");
  }
  if (component.semanticPattern) return String(component.semanticPattern).replaceAll("_", " ");
  const parts = component.componentId.split(".");
  return parts.length > 1 ? parts.slice(1).join(" · ") : parts[0];
}

export function stageIndex(stage?: string) {
  const index = COMPONENT_STAGES.indexOf(stage as ComponentStage);
  return index < 0 ? 0 : index;
}

export function bindingLabel(value?: string) {
  return ({
    NONE: "Non collegate",
    PARTIAL: "Parziali",
    COMPLETE: "Complete",
  } as Record<string, string>)[String(value || "").toUpperCase()] ?? String(value || "—");
}
