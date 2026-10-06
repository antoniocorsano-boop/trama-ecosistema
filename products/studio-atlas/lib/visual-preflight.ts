import { createHash } from "node:crypto";

export const VISUAL_INTENT_SPEC_SCHEMA_VERSION = "atlas.visual-intent-spec/v0.1" as const;
export const VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION = "atlas.visual-preflight-receipt/v0.1" as const;
export const VISUAL_PREFLIGHT_COMPILER_VERSION = "vpc-compiler/v0.1" as const;
export const VISUAL_PREFLIGHT_CHECKER_VERSION = "vpc-deterministic/v0.1" as const;

export const PREFLIGHT_AUTHORITY_FLAGS = {
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
} as const;

export type VisualIntentPurpose = "CHARACTER_REFERENCE" | "ENVIRONMENT_REFERENCE" | "SCENE_FRAME";
export type VisualPreflightSeverity = "ERROR" | "WARNING";
export type VisualPreflightDimension =
  | "COMPLETENESS"
  | "CONTRADICTION"
  | "ART_DIRECTION"
  | "PROMPT_RISK"
  | "IDENTITY"
  | "SPATIALITY"
  | "CONTINUITY"
  | "CAMERA";

export type VisualIntentSpec = {
  schemaVersion: typeof VISUAL_INTENT_SPEC_SCHEMA_VERSION;
  specId: string;
  pathwayId: string;
  packageDigest: string;
  purpose: VisualIntentPurpose;
  subjectRefs: string[];
  sceneRef?: string;
  shotId?: string;
  narrativeFunction: string;
  requiredVisualFacts: string[];
  worldAnchors: string[];
  identityAnchors: string[];
  composition: {
    dominantSubject: string;
    foreground: string[];
    midground: string[];
    background: string[];
    spatialRelation: string;
    diegeticScene: boolean;
    dominantSurface?: string;
    focalActions?: string[];
  };
  camera: {
    framing: string;
    angle: string;
    movement?: string;
    conflictingDirectives?: string[];
  };
  lightingMood: string;
  materialLanguage: string[];
  interactionState?: string;
  continuityFamily?: string;
  negativeConstraints: string[];
  forbiddenTextPatterns: string[];
  exactTextRequired?: string[];
  qualityCriteria: string[];
  aspectRatio: "3:4" | "4:3" | "1:1" | "16:9" | "9:16";
  artDirectionVersion: string;
};

export type VisualPreflightFinding = {
  code: string;
  severity: VisualPreflightSeverity;
  dimension: VisualPreflightDimension;
  message: string;
  sourcePath: string;
  suggestedResolution: string;
  checkerVersion: string;
};

export type SemanticCriticResult = {
  mode: "LOCAL_BROWSER" | "LOCAL_CI" | "NOT_AVAILABLE";
  modelRef?: string;
  modelDigest?: string;
  result: "PASS" | "REVISE" | "NOT_RUN";
  findings: VisualPreflightFinding[];
};

export type CompiledVisualPrompt = {
  providerFamily: "FLUX2_KLEIN_4B";
  workflowFamily: "flux2-klein-4b/v0.2";
  positivePrompt: string;
  negativePrompt: string;
  referenceInputs: string[];
  aspectRatio: VisualIntentSpec["aspectRatio"];
  maxVariants: 1;
  promptDigest: string;
  sourceSpecDigest: string;
  compilerVersion: string;
};

export type VisualPreflightReceipt = {
  schemaVersion: typeof VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION;
  receiptId: string;
  specId: string;
  pathwayId: string;
  packageDigest: string;
  specDigest: string;
  compilerVersion: string;
  artDirectionVersion: string;
  deterministicChecks: VisualPreflightFinding[];
  semanticCritic: SemanticCriticResult;
  humanPreflightRequired: boolean;
  humanPreflightDecision?: "PASS" | "REVISE";
  compiledPrompts: CompiledVisualPrompt[];
  finalState: "PREFLIGHT_PASS" | "PREFLIGHT_REVISE";
  createdAt: string;
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  runtimeAuthorized: false;
  publicationAuthorityGranted: false;
};

export type PreflightDecisionInput = {
  deterministicFindings: readonly VisualPreflightFinding[];
  semanticCritic: SemanticCriticResult;
  humanPreflightDecision?: "PASS" | "REVISE";
};

export type CompileVisualPromptOptions = {
  compilerVersion?: string;
  referenceInputs?: readonly string[];
};

export type CreateVisualPreflightReceiptInput = {
  spec: VisualIntentSpec;
  providerFamily: "FLUX2_KLEIN_4B";
  semanticCritic: SemanticCriticResult;
  humanPreflightDecision?: "PASS" | "REVISE";
  referenceInputs?: readonly string[];
  compilerVersion?: string;
  createdAt?: string;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return Object.fromEntries(entries.map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function canonicalDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function finding(
  code: string,
  message: string,
  sourcePath: string,
  severity: VisualPreflightSeverity,
  dimension: VisualPreflightDimension,
  suggestedResolution = "Revise the VisualIntentSpec and recompile preflight.",
): VisualPreflightFinding {
  return {
    code,
    severity,
    dimension,
    message,
    sourcePath,
    suggestedResolution,
    checkerVersion: VISUAL_PREFLIGHT_CHECKER_VERSION,
  };
}

const PROVIDER_SYNTAX = /(?:--ar\b|--stylize\b|<lora:|\(\w+:[0-9.]+\)|CFG\s*[=:]|steps\s*[=:])/i;
const FORBIDDEN_POSITIVE_TROPES = [
  /dashboard aesthetic/i,
  /generic SaaS/i,
  /floating avatar/i,
  /chibi/i,
  /mascot treatment/i,
  /generic cyberpunk/i,
  /technical diagram as dominant/i,
  /large educational captions/i,
  /decorative AI clutter/i,
];

function positiveSemanticText(spec: VisualIntentSpec): string[] {
  return [
    spec.narrativeFunction,
    ...spec.requiredVisualFacts,
    ...spec.worldAnchors,
    ...spec.identityAnchors,
    spec.composition.dominantSubject,
    ...spec.composition.foreground,
    ...spec.composition.midground,
    ...spec.composition.background,
    spec.composition.spatialRelation,
    spec.composition.dominantSurface ?? "",
    ...(spec.composition.focalActions ?? []),
    spec.camera.framing,
    spec.camera.angle,
    spec.camera.movement ?? "",
    spec.lightingMood,
    ...spec.materialLanguage,
    spec.interactionState ?? "",
    spec.continuityFamily ?? "",
    ...spec.qualityCriteria,
  ].filter(Boolean);
}

export function runDeterministicPreflight(spec: VisualIntentSpec): VisualPreflightFinding[] {
  const findings: VisualPreflightFinding[] = [];

  if (spec.schemaVersion !== VISUAL_INTENT_SPEC_SCHEMA_VERSION) {
    findings.push(finding("INTENT_SCHEMA_UNSUPPORTED", "Visual intent schema is unsupported.", "schemaVersion", "ERROR", "COMPLETENESS"));
  }
  if (!spec.specId?.trim()) findings.push(finding("SPEC_ID_REQUIRED", "specId is required.", "specId", "ERROR", "COMPLETENESS"));
  if (!spec.pathwayId?.trim()) findings.push(finding("PATHWAY_ID_REQUIRED", "pathwayId is required.", "pathwayId", "ERROR", "COMPLETENESS"));
  if (!/^[0-9a-f]{64}$/.test(spec.packageDigest)) {
    findings.push(finding("PACKAGE_DIGEST_INVALID", "packageDigest must be a 64-character lowercase hex digest.", "packageDigest", "ERROR", "COMPLETENESS"));
  }
  if (!spec.narrativeFunction?.trim()) findings.push(finding("NARRATIVE_FUNCTION_REQUIRED", "narrativeFunction is required.", "narrativeFunction", "ERROR", "COMPLETENESS"));
  if (spec.requiredVisualFacts.length === 0) findings.push(finding("VISUAL_FACT_REQUIRED", "At least one required visual fact is required.", "requiredVisualFacts", "ERROR", "COMPLETENESS"));
  if (!spec.composition.dominantSubject?.trim()) findings.push(finding("DOMINANT_SUBJECT_REQUIRED", "A dominant subject is required.", "composition.dominantSubject", "ERROR", "COMPLETENESS"));
  if (!spec.composition.spatialRelation?.trim()) findings.push(finding("SPATIAL_RELATION_REQUIRED", "A spatial relation is required.", "composition.spatialRelation", "ERROR", "SPATIALITY"));
  if (!spec.camera.framing?.trim() || !spec.camera.angle?.trim()) {
    findings.push(finding("CAMERA_REQUIRED", "Camera framing and angle are required.", "camera", "ERROR", "CAMERA"));
  }
  if (!spec.lightingMood?.trim()) findings.push(finding("LIGHTING_REQUIRED", "lightingMood is required.", "lightingMood", "ERROR", "COMPLETENESS"));
  if (spec.materialLanguage.length === 0) findings.push(finding("MATERIAL_LANGUAGE_REQUIRED", "materialLanguage is required.", "materialLanguage", "ERROR", "COMPLETENESS"));
  if (spec.qualityCriteria.length === 0) findings.push(finding("QUALITY_CRITERIA_REQUIRED", "qualityCriteria is required.", "qualityCriteria", "ERROR", "COMPLETENESS"));
  if (!spec.artDirectionVersion?.trim()) findings.push(finding("ART_DIRECTION_VERSION_REQUIRED", "artDirectionVersion is required.", "artDirectionVersion", "ERROR", "COMPLETENESS"));

  if (spec.purpose === "CHARACTER_REFERENCE" && spec.identityAnchors.length === 0) {
    findings.push(finding("IDENTITY_ANCHOR_REQUIRED", "Character references require identity anchors.", "identityAnchors", "ERROR", "IDENTITY"));
  }
  if (spec.purpose === "ENVIRONMENT_REFERENCE" && spec.worldAnchors.length === 0) {
    findings.push(finding("WORLD_ANCHOR_REQUIRED", "Environment references require world anchors.", "worldAnchors", "ERROR", "SPATIALITY"));
  }
  if (spec.purpose === "SCENE_FRAME") {
    if (!spec.sceneRef?.trim()) {
      findings.push(finding("SCENE_REF_REQUIRED", "Scene frames require a sceneRef.", "sceneRef", "ERROR", "COMPLETENESS"));
    }
    if (!spec.shotId?.trim()) {
      findings.push(finding("SHOT_ID_REQUIRED", "Scene frames require a shotId.", "shotId", "ERROR", "COMPLETENESS"));
    }
  }

  const forbiddenText = new Set(spec.forbiddenTextPatterns.map((item) => item.trim().toLocaleLowerCase()).filter(Boolean));
  for (const text of spec.exactTextRequired ?? []) {
    if (forbiddenText.has(text.trim().toLocaleLowerCase())) {
      findings.push(finding("REQUIRED_FORBIDDEN_TEXT_CONTRADICTION", "The same text cannot be both required and forbidden.", "exactTextRequired", "ERROR", "CONTRADICTION"));
      break;
    }
  }

  if (
    spec.composition.diegeticScene === true &&
    /(?:detached|saas).*dashboard|dashboard.*(?:detached|saas)/i.test(spec.composition.dominantSurface ?? "")
  ) {
    findings.push(finding("DIEGETIC_DASHBOARD_CONTRADICTION", "A diegetic scene cannot use a detached dashboard as its dominant surface.", "composition.dominantSurface", "ERROR", "CONTRADICTION"));
  }

  if ((spec.camera.conflictingDirectives?.length ?? 0) > 0) {
    findings.push(finding("CAMERA_DIRECTIVES_CONFLICT", "Camera directives contain an explicit unresolved conflict.", "camera.conflictingDirectives", "ERROR", "CAMERA"));
  }

  const positiveText = positiveSemanticText(spec);
  if (positiveText.some((item) => PROVIDER_SYNTAX.test(item))) {
    findings.push(finding("PROVIDER_SYNTAX_FORBIDDEN", "Provider-specific syntax is not allowed in canonical visual intent.", "visualIntent", "ERROR", "PROMPT_RISK"));
  }
  if (positiveText.some((item) => FORBIDDEN_POSITIVE_TROPES.some((pattern) => pattern.test(item)))) {
    findings.push(finding("FORBIDDEN_POSITIVE_TROPE", "A forbidden visual trope is being requested positively.", "visualIntent", "ERROR", "ART_DIRECTION"));
  }

  if ((spec.composition.focalActions?.length ?? 0) > 3) {
    findings.push(finding("TOO_MANY_FOCAL_ACTIONS", "More than three simultaneous focal actions weakens visual hierarchy.", "composition.focalActions", "WARNING", "PROMPT_RISK"));
  }
  if (positiveText.some((item) => item.split(",").filter((part) => part.trim()).length >= 7)) {
    findings.push(finding("UNPRIORITIZED_ADJECTIVE_CHAIN", "Long comma-separated descriptor chains should be prioritised before generation.", "visualIntent", "WARNING", "PROMPT_RISK"));
  }

  return findings;
}

export function hasPreflightErrors(findings: readonly VisualPreflightFinding[]): boolean {
  return findings.some((item) => item.severity === "ERROR");
}

export function resolvePreflightState(
  input: PreflightDecisionInput,
): "PREFLIGHT_PASS" | "PREFLIGHT_REVISE" {
  if (hasPreflightErrors(input.deterministicFindings)) return "PREFLIGHT_REVISE";
  if (input.humanPreflightDecision === "REVISE") return "PREFLIGHT_REVISE";
  if (input.semanticCritic.mode === "NOT_AVAILABLE") {
    if (input.semanticCritic.result !== "NOT_RUN") return "PREFLIGHT_REVISE";
    return input.humanPreflightDecision === "PASS" ? "PREFLIGHT_PASS" : "PREFLIGHT_REVISE";
  }
  if (input.semanticCritic.result === "REVISE") return "PREFLIGHT_REVISE";
  if (input.semanticCritic.result === "PASS") return "PREFLIGHT_PASS";
  return "PREFLIGHT_REVISE";
}

function joinSection(values: readonly string[]): string {
  return values.map((item) => item.trim()).filter(Boolean).join("; ");
}

export function compileVisualPrompt(
  spec: VisualIntentSpec,
  providerFamily: "FLUX2_KLEIN_4B",
  options: CompileVisualPromptOptions = {},
): CompiledVisualPrompt {
  const deterministicFindings = runDeterministicPreflight(spec);
  if (hasPreflightErrors(deterministicFindings)) {
    throw new Error("VISUAL_PREFLIGHT_SPEC_NOT_COMPILABLE");
  }

  const compilerVersion = options.compilerVersion ?? VISUAL_PREFLIGHT_COMPILER_VERSION;
  const sourceSpecDigest = canonicalDigest(spec);
  const positivePrompt = [
    "medium/style: cinematic editorial illustration; polished 2-D illustrated realism",
    `narrative/world: ${joinSection([spec.narrativeFunction, ...spec.worldAnchors])}`,
    `identity: ${joinSection(spec.identityAnchors.length > 0 ? spec.identityAnchors : spec.worldAnchors)}`,
    `action/state: ${joinSection([...spec.requiredVisualFacts, spec.interactionState ?? ""])}`,
    `composition: ${joinSection([
      spec.composition.dominantSubject,
      ...spec.composition.foreground,
      ...spec.composition.midground,
      ...spec.composition.background,
      spec.composition.spatialRelation,
    ])}`,
    `camera: ${joinSection([spec.camera.framing, spec.camera.angle, spec.camera.movement ?? ""])}`,
    `lighting/material: ${joinSection([spec.lightingMood, ...spec.materialLanguage])}`,
    `continuity: ${joinSection([spec.continuityFamily ?? "standalone", ...spec.qualityCriteria])}`,
    "provider adaptation: preserve authored physical-world semantics; do not invent UI, text, captions, diagrams, or decorative AI motifs",
  ].join("\n");
  const negativePrompt = joinSection([...spec.negativeConstraints, ...spec.forbiddenTextPatterns]);
  const referenceInputs = [...(options.referenceInputs ?? [])];
  const promptDigest = canonicalDigest({
    providerFamily,
    workflowFamily: "flux2-klein-4b/v0.2",
    positivePrompt,
    negativePrompt,
    referenceInputs,
    aspectRatio: spec.aspectRatio,
    maxVariants: 1,
    sourceSpecDigest,
    compilerVersion,
  });

  return {
    providerFamily,
    workflowFamily: "flux2-klein-4b/v0.2",
    positivePrompt,
    negativePrompt,
    referenceInputs,
    aspectRatio: spec.aspectRatio,
    maxVariants: 1,
    promptDigest,
    sourceSpecDigest,
    compilerVersion,
  };
}

export function createVisualPreflightReceipt(
  input: CreateVisualPreflightReceiptInput,
): VisualPreflightReceipt {
  const deterministicChecks = runDeterministicPreflight(input.spec);
  const finalState = resolvePreflightState({
    deterministicFindings: deterministicChecks,
    semanticCritic: input.semanticCritic,
    humanPreflightDecision: input.humanPreflightDecision,
  });
  const compiledPrompts = hasPreflightErrors(deterministicChecks)
    ? []
    : [compileVisualPrompt(input.spec, input.providerFamily, {
        compilerVersion: input.compilerVersion,
        referenceInputs: input.referenceInputs,
      })];
  const compilerVersion = input.compilerVersion ?? VISUAL_PREFLIGHT_COMPILER_VERSION;
  const specDigest = canonicalDigest(input.spec);
  const humanPreflightRequired =
    input.semanticCritic.mode === "NOT_AVAILABLE" && input.semanticCritic.result === "NOT_RUN";
  const bindingDigest = canonicalDigest({
    specDigest,
    packageDigest: input.spec.packageDigest,
    compilerVersion,
    artDirectionVersion: input.spec.artDirectionVersion,
    finalState,
    promptDigests: compiledPrompts.map((prompt) => prompt.promptDigest),
    semanticCritic: {
      mode: input.semanticCritic.mode,
      modelRef: input.semanticCritic.modelRef ?? null,
      modelDigest: input.semanticCritic.modelDigest ?? null,
      result: input.semanticCritic.result,
    },
    humanPreflightDecision: input.humanPreflightDecision ?? null,
  });

  return {
    schemaVersion: VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION,
    receiptId: `vpc-${bindingDigest.slice(0, 32)}`,
    specId: input.spec.specId,
    pathwayId: input.spec.pathwayId,
    packageDigest: input.spec.packageDigest,
    specDigest,
    compilerVersion,
    artDirectionVersion: input.spec.artDirectionVersion,
    deterministicChecks,
    semanticCritic: input.semanticCritic,
    humanPreflightRequired,
    ...(input.humanPreflightDecision ? { humanPreflightDecision: input.humanPreflightDecision } : {}),
    compiledPrompts,
    finalState,
    createdAt: input.createdAt ?? new Date().toISOString(),
    ...PREFLIGHT_AUTHORITY_FLAGS,
  };
}
