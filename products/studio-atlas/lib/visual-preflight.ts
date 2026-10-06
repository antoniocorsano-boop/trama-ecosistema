import { createHash } from "node:crypto";

export const VISUAL_INTENT_SCHEMA_VERSION = "atlas.visual-intent-spec/v0.1" as const;
export const VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION = "atlas.visual-preflight-receipt/v0.1" as const;
export const VISUAL_PREFLIGHT_CHECKER_VERSION = "vpc-01/v0.1" as const;
export const VISUAL_PREFLIGHT_COMPILER_VERSION = "vpc-01-compiler/v0.1" as const;

export const PREFLIGHT_AUTHORITY_FLAGS = {
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
} as const;

export type VisualIntentPurpose =
  | "CHARACTER_REFERENCE"
  | "ENVIRONMENT_REFERENCE"
  | "SCENE_FRAME";

export type VisualIntentComposition = {
  dominantSubject: string;
  foreground: string[];
  midground: string[];
  background: string[];
  spatialRelation: string;
  focalActions?: string[];
  diegeticScene?: boolean;
  dominantSurface?: string;
};

export type VisualIntentCamera = {
  shotScale: string;
  viewpoint: string;
  lensLanguage: string;
  continuityFamily?: string;
  conflictingDirectives?: string[];
};

export type VisualIntentSpec = {
  schemaVersion: typeof VISUAL_INTENT_SCHEMA_VERSION;
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
  composition: VisualIntentComposition;
  camera: VisualIntentCamera;
  lightingMood: string;
  materialTextureLanguage: string[];
  interactionState?: string;
  continuityRefs: string[];
  negativeConstraints: string[];
  forbiddenTextPatterns: string[];
  exactTextRequired?: string[];
  qualityCriteria: string[];
  targetAspectRatio: string;
  artDirectionVersion: string;
};

export type VisualPreflightFinding = {
  code: string;
  severity: "ERROR" | "WARNING" | "INFO";
  dimension: string;
  message: string;
  sourcePath?: string;
  suggestedResolution?: string;
  checkerVersion: string;
};

export type SemanticCriticResult = {
  mode: "LOCAL_BROWSER" | "LOCAL_CI" | "NOT_AVAILABLE";
  modelRef?: string;
  modelDigest?: string;
  result: "PASS" | "REVISE" | "NOT_RUN";
  findings: VisualPreflightFinding[];
};

export type PreflightDecisionInput = {
  deterministicFindings: readonly VisualPreflightFinding[];
  semanticCritic: SemanticCriticResult;
  humanPreflightDecision?: "PASS" | "REVISE";
};

export type CompiledVisualPrompt = {
  providerFamily: "FLUX2_KLEIN_4B";
  workflowFamily: string;
  positivePrompt: string;
  negativePrompt: string;
  referenceInputs: string[];
  referenceInputDigests: string[];
  aspectRatio: string;
  maxVariants: 1;
  promptDigest: string;
  sourceSpecDigest: string;
  compilerVersion: string;
};

export type VisualPreflightReceipt = {
  schemaVersion: typeof VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION;
  receiptId: string;
  specId: string;
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

export type CompileVisualPromptOptions = {
  compilerVersion?: string;
  referenceInputs?: readonly string[];
  referenceInputDigests?: readonly string[];
};

export type CreateVisualPreflightReceiptInput = {
  spec: VisualIntentSpec;
  providerFamily: "FLUX2_KLEIN_4B";
  semanticCritic: SemanticCriticResult;
  humanPreflightDecision?: "PASS" | "REVISE";
  compilerVersion?: string;
  referenceInputs?: readonly string[];
  referenceInputDigests?: readonly string[];
  createdAt?: string;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .map((key) => [key, canonicalize(source[key])]),
    );
  }
  return value;
}

export function canonicalDigest(value: unknown): string {
  const encoded = JSON.stringify(canonicalize(value));
  if (encoded === undefined) {
    throw new Error("VISUAL_PREFLIGHT_VALUE_NOT_JSON_SERIALIZABLE");
  }
  return createHash("sha256").update(encoded, "utf8").digest("hex");
}

function finding(
  code: string,
  message: string,
  sourcePath: string,
  severity: VisualPreflightFinding["severity"] = "ERROR",
  dimension = "CONTRACT",
): VisualPreflightFinding {
  return {
    code,
    severity,
    dimension,
    message,
    sourcePath,
    checkerVersion: VISUAL_PREFLIGHT_CHECKER_VERSION,
  };
}

export function validateVisualIntentSpec(spec: VisualIntentSpec): VisualPreflightFinding[] {
  const findings: VisualPreflightFinding[] = [];
  if (spec.schemaVersion !== VISUAL_INTENT_SCHEMA_VERSION) {
    findings.push(finding("SCHEMA_VERSION_UNSUPPORTED", "Visual intent schema version is unsupported.", "schemaVersion"));
  }
  if (!/^[0-9a-f]{64}$/.test(spec.packageDigest)) {
    findings.push(finding("PACKAGE_DIGEST_INVALID", "Package digest must be 64 lowercase hexadecimal characters.", "packageDigest"));
  }
  if (!spec.specId.trim()) {
    findings.push(finding("SPEC_ID_REQUIRED", "Visual intent specId is required.", "specId"));
  }
  if (!spec.pathwayId.trim()) {
    findings.push(finding("PATHWAY_ID_REQUIRED", "Visual intent pathwayId is required.", "pathwayId"));
  }
  return findings;
}

function positiveSemanticText(spec: VisualIntentSpec): string[] {
  return [
    spec.narrativeFunction,
    ...spec.requiredVisualFacts,
    ...(spec.exactTextRequired ?? []),
    ...spec.worldAnchors,
    ...spec.identityAnchors,
    spec.composition.dominantSubject,
    ...spec.composition.foreground,
    ...spec.composition.midground,
    ...spec.composition.background,
    spec.composition.spatialRelation,
    ...(spec.composition.focalActions ?? []),
    spec.composition.dominantSurface ?? "",
    spec.camera.shotScale,
    spec.camera.viewpoint,
    spec.camera.lensLanguage,
    spec.camera.continuityFamily ?? "",
    spec.lightingMood,
    ...spec.materialTextureLanguage,
    spec.interactionState ?? "",
    ...spec.continuityRefs,
    ...spec.qualityCriteria,
  ].filter(Boolean);
}

const PROVIDER_SYNTAX = /(?:--ar\b|--stylize\b|\bcfg[_ -]?scale\b|@cf\/|black-forest-labs\/flux|\bseed\s*=)/i;
const FORBIDDEN_POSITIVE_TROPES = [
  /dashboard aesthetic/i,
  /detached (?:saas )?dashboard/i,
  /floating avatar heads?/i,
  /chibi|mascot treatment/i,
  /generic cyberpunk(?:[- ]neon)? default/i,
  /large educational captions?/i,
  /technical diagram as dominant scene/i,
  /decorative ai clutter/i,
];

export function runDeterministicPreflight(spec: VisualIntentSpec): VisualPreflightFinding[] {
  const findings = [...validateVisualIntentSpec(spec)];

  if (!spec.narrativeFunction.trim()) {
    findings.push(finding("NARRATIVE_FUNCTION_REQUIRED", "Narrative function must be explicit before generation.", "narrativeFunction", "ERROR", "COMPLETENESS"));
  }
  if (spec.requiredVisualFacts.length === 0) {
    findings.push(finding("REQUIRED_VISUAL_FACTS_REQUIRED", "At least one required visual fact is required.", "requiredVisualFacts", "ERROR", "COMPLETENESS"));
  }
  if (!spec.composition.spatialRelation.trim()) {
    findings.push(finding("SPATIAL_RELATION_REQUIRED", "Spatial relation must be explicit.", "composition.spatialRelation", "ERROR", "COMPOSITION"));
  }
  if (spec.purpose === "CHARACTER_REFERENCE" && spec.identityAnchors.length === 0) {
    findings.push(finding("CHARACTER_IDENTITY_ANCHORS_REQUIRED", "Character references require stable identity anchors.", "identityAnchors", "ERROR", "CONTINUITY"));
  }
  if (spec.purpose === "ENVIRONMENT_REFERENCE" && spec.worldAnchors.length === 0) {
    findings.push(finding("ENVIRONMENT_WORLD_ANCHORS_REQUIRED", "Environment references require world anchors.", "worldAnchors", "ERROR", "WORLD"));
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
  const exactTextSection = joinSection(spec.exactTextRequired ?? []);
  const referenceInputs = [...(options.referenceInputs ?? [])];
  const referenceInputDigests = [...(options.referenceInputDigests ?? [])];
  if (referenceInputDigests.length > 0 && referenceInputDigests.length !== referenceInputs.length) {
    throw new Error("VISUAL_PREFLIGHT_REFERENCE_DIGEST_ALIGNMENT_INVALID");
  }
  if (referenceInputDigests.some((digest) => !/^[0-9a-f]{64}$/.test(digest))) {
    throw new Error("VISUAL_PREFLIGHT_REFERENCE_DIGEST_INVALID");
  }
  const positivePrompt = [
    "medium/style: cinematic editorial illustration; polished 2-D illustrated realism",
    `narrative/world: ${joinSection([spec.narrativeFunction, ...spec.worldAnchors])}`,
    `identity: ${joinSection(spec.identityAnchors.length > 0 ? spec.identityAnchors : spec.worldAnchors)}`,
    `action/state: ${joinSection([...spec.requiredVisualFacts, spec.interactionState ?? ""])}`,
    ...(exactTextSection ? [`exact text required: ${exactTextSection}`] : []),
    `composition: ${joinSection([
      spec.composition.dominantSubject,
      ...spec.composition.foreground,
      ...spec.composition.midground,
      ...spec.composition.background,
      spec.composition.spatialRelation,
      ...(spec.composition.focalActions ?? []),
    ])}`,
    `camera: ${joinSection([
      spec.camera.shotScale,
      spec.camera.viewpoint,
      spec.camera.lensLanguage,
      spec.camera.continuityFamily ?? "",
    ])}`,
    `lighting/material: ${joinSection([spec.lightingMood, ...spec.materialTextureLanguage])}`,
    `continuity: ${joinSection(spec.continuityRefs.length > 0 ? spec.continuityRefs : ["preserve approved identity and world anchors"])}`,
    "provider adaptation: FLUX.2 Klein 4B; preserve semantic priority in section order",
  ].join(". ");
  const negativePrompt = joinSection([
    ...spec.negativeConstraints,
    ...spec.forbiddenTextPatterns.map((item) => `forbid text pattern: ${item}`),
  ]);
  const promptCore = {
    providerFamily,
    workflowFamily: "flux2-klein-4b/v0.2",
    positivePrompt,
    negativePrompt,
    referenceInputs,
    referenceInputDigests,
    aspectRatio: spec.targetAspectRatio,
    maxVariants: 1 as const,
    sourceSpecDigest,
    compilerVersion,
  };

  return {
    ...promptCore,
    promptDigest: canonicalDigest(promptCore),
  };
}

export function createVisualPreflightReceipt(
  input: CreateVisualPreflightReceiptInput,
): VisualPreflightReceipt {
  const compilerVersion = input.compilerVersion ?? VISUAL_PREFLIGHT_COMPILER_VERSION;
  const deterministicChecks = runDeterministicPreflight(input.spec);
  const finalState = resolvePreflightState({
    deterministicFindings: deterministicChecks,
    semanticCritic: input.semanticCritic,
    humanPreflightDecision: input.humanPreflightDecision,
  });
  const specDigest = canonicalDigest(input.spec);
  const compiledPrompts = hasPreflightErrors(deterministicChecks)
    ? []
    : [compileVisualPrompt(input.spec, input.providerFamily, {
        compilerVersion,
        referenceInputs: input.referenceInputs,
        referenceInputDigests: input.referenceInputDigests,
      })];
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
