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

export type CompiledVisualPrompt = {
  providerFamily: "FLUX2_KLEIN_4B";
  workflowFamily: string;
  positivePrompt: string;
  negativePrompt: string;
  referenceInputs: string[];
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
): VisualPreflightFinding {
  return {
    code,
    severity: "ERROR",
    dimension: "CONTRACT",
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
