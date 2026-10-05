import assert from "node:assert/strict";
import test from "node:test";
import {
  PREFLIGHT_AUTHORITY_FLAGS,
  VISUAL_INTENT_SCHEMA_VERSION,
  VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION,
  canonicalDigest,
  hasPreflightErrors,
  resolvePreflightState,
  runDeterministicPreflight,
  type SemanticCriticResult,
  type VisualIntentSpec,
} from "./visual-preflight";

const DIGEST = "a".repeat(64);

function validSpec(overrides: Partial<VisualIntentSpec> = {}): VisualIntentSpec {
  return {
    schemaVersion: "atlas.visual-intent-spec/v0.1",
    specId: "museo-zero-lia-v0.3",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    purpose: "CHARACTER_REFERENCE",
    subjectRefs: ["lia"],
    narrativeFunction: "Establish Lia as a persistent museum crew member before scene production.",
    requiredVisualFacts: [
      "Lia stands naturally in the after-hours museum world",
      "practical contemporary setup clothing",
    ],
    worldAnchors: ["after-hours contemporary museum", "believable physical architecture"],
    identityAnchors: ["stable hairstyle", "warm accent detail", "calm focused physicality"],
    composition: {
      dominantSubject: "Lia full-body character reference",
      foreground: [],
      midground: ["Lia"],
      background: ["restrained museum context"],
      spatialRelation: "Lia is grounded on the museum floor rather than floating over an interface.",
      focalActions: ["standing in a neutral working pose"],
      diegeticScene: true,
      dominantSurface: "physical museum environment",
    },
    camera: {
      shotScale: "full-body and medium reference",
      viewpoint: "eye-level",
      lensLanguage: "natural perspective without distortion",
    },
    lightingMood: "restrained warm after-hours museum light",
    materialTextureLanguage: ["painted wall", "practical textiles", "matte museum flooring"],
    continuityRefs: [],
    negativeConstraints: ["dashboard aesthetic", "large educational captions"],
    forbiddenTextPatterns: ["large educational captions", "pseudo-interface labels"],
    qualityCriteria: ["adult professional identity is distinct", "character reads as part of the physical world"],
    targetAspectRatio: "3:4",
    artDirectionVersion: "museo-zero-art-direction/v0.3",
    ...overrides,
  };
}

const semanticPass: SemanticCriticResult = {
  mode: "LOCAL_CI",
  modelRef: "fixture/local-critic",
  modelDigest: "fixture-digest",
  result: "PASS",
  findings: [],
};

const semanticRevise: SemanticCriticResult = {
  mode: "LOCAL_CI",
  modelRef: "fixture/local-critic",
  modelDigest: "fixture-digest",
  result: "REVISE",
  findings: [],
};

const semanticUnavailable: SemanticCriticResult = {
  mode: "NOT_AVAILABLE",
  result: "NOT_RUN",
  findings: [],
};

test("visual preflight contracts use exact schema identities and fixed authority defaults", () => {
  assert.equal(VISUAL_INTENT_SCHEMA_VERSION, "atlas.visual-intent-spec/v0.1");
  assert.equal(VISUAL_PREFLIGHT_RECEIPT_SCHEMA_VERSION, "atlas.visual-preflight-receipt/v0.1");
  assert.deepEqual(PREFLIGHT_AUTHORITY_FLAGS, {
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  });
});

test("canonical digest is stable across object key ordering and changes with semantic content", () => {
  const left = {
    schemaVersion: "atlas.visual-intent-spec/v0.1",
    subjectRefs: ["lia"],
    camera: { viewpoint: "eye-level", shotScale: "medium" },
  };
  const reordered = {
    camera: { shotScale: "medium", viewpoint: "eye-level" },
    subjectRefs: ["lia"],
    schemaVersion: "atlas.visual-intent-spec/v0.1",
  };
  const changed = {
    ...left,
    subjectRefs: ["omar"],
  };

  assert.equal(canonicalDigest(left), canonicalDigest(reordered));
  assert.notEqual(canonicalDigest(left), canonicalDigest(changed));
  assert.match(canonicalDigest(left), /^[0-9a-f]{64}$/);
});

test("deterministic preflight rejects a character reference without identity anchors", () => {
  const findings = runDeterministicPreflight(validSpec({ identityAnchors: [] }));
  assert.ok(findings.some((item) => item.code === "CHARACTER_IDENTITY_ANCHORS_REQUIRED" && item.severity === "ERROR"));
  assert.equal(hasPreflightErrors(findings), true);
});

test("deterministic preflight rejects an environment reference without world anchors or spatial relation", () => {
  const spec = validSpec({
    purpose: "ENVIRONMENT_REFERENCE",
    subjectRefs: ["sala-zero"],
    identityAnchors: [],
    worldAnchors: [],
    composition: {
      ...validSpec().composition,
      dominantSubject: "Sala Zero",
      spatialRelation: "",
    },
  });
  const findings = runDeterministicPreflight(spec);
  assert.ok(findings.some((item) => item.code === "ENVIRONMENT_WORLD_ANCHORS_REQUIRED"));
  assert.ok(findings.some((item) => item.code === "SPATIAL_RELATION_REQUIRED"));
});

test("deterministic preflight rejects a scene frame without narrative and shot identity", () => {
  const spec = validSpec({
    purpose: "SCENE_FRAME",
    subjectRefs: ["lia", "sala-zero"],
    narrativeFunction: "",
    sceneRef: undefined,
    shotId: undefined,
  });
  const findings = runDeterministicPreflight(spec);
  assert.ok(findings.some((item) => item.code === "NARRATIVE_FUNCTION_REQUIRED"));
  assert.ok(findings.some((item) => item.code === "SCENE_REF_REQUIRED"));
  assert.ok(findings.some((item) => item.code === "SHOT_ID_REQUIRED"));
});

test("contradiction preflight rejects required text that is also forbidden", () => {
  const findings = runDeterministicPreflight(validSpec({
    exactTextRequired: ["EXIT"],
    forbiddenTextPatterns: ["EXIT"],
  }));
  assert.ok(findings.some((item) => item.code === "REQUIRED_FORBIDDEN_TEXT_CONTRADICTION" && item.severity === "ERROR"));
});

test("contradiction preflight rejects a detached dashboard as the dominant diegetic surface", () => {
  const findings = runDeterministicPreflight(validSpec({
    composition: {
      ...validSpec().composition,
      diegeticScene: true,
      dominantSurface: "detached SaaS dashboard overlay",
    },
  }));
  assert.ok(findings.some((item) => item.code === "DIEGETIC_DASHBOARD_CONTRADICTION"));
});

test("contradiction preflight rejects incompatible camera directives", () => {
  const findings = runDeterministicPreflight(validSpec({
    camera: {
      ...validSpec().camera,
      conflictingDirectives: ["extreme overhead", "strict eye-level"],
    },
  }));
  assert.ok(findings.some((item) => item.code === "CAMERA_DIRECTIVES_CONFLICT"));
});

test("prompt risk preflight rejects provider-specific syntax in canonical intent", () => {
  const findings = runDeterministicPreflight(validSpec({
    requiredVisualFacts: ["Lia in museum --ar 3:4 --stylize 250"],
  }));
  assert.ok(findings.some((item) => item.code === "PROVIDER_SYNTAX_FORBIDDEN" && item.severity === "ERROR"));
});

test("prompt risk preflight rejects forbidden visual tropes when requested positively", () => {
  const findings = runDeterministicPreflight(validSpec({
    requiredVisualFacts: ["generic cyberpunk neon default with large educational captions"],
  }));
  assert.ok(findings.some((item) => item.code === "FORBIDDEN_POSITIVE_TROPE" && item.severity === "ERROR"));
});

test("prompt risk preflight warns about too many focal actions and unprioritized adjective chains", () => {
  const findings = runDeterministicPreflight(validSpec({
    requiredVisualFacts: ["warm, polished, contemporary, cinematic, editorial, realistic, atmospheric museum scene"],
    composition: {
      ...validSpec().composition,
      focalActions: ["walks", "points", "reads", "repairs"],
    },
  }));
  assert.ok(findings.some((item) => item.code === "TOO_MANY_FOCAL_ACTIONS" && item.severity === "WARNING"));
  assert.ok(findings.some((item) => item.code === "UNPRIORITIZED_ADJECTIVE_CHAIN" && item.severity === "WARNING"));
});

test("semantic critic PASS admits deterministic-clean intent", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: runDeterministicPreflight(validSpec()),
    semanticCritic: semanticPass,
  }), "PREFLIGHT_PASS");
});

test("semantic critic REVISE blocks preflight", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: runDeterministicPreflight(validSpec()),
    semanticCritic: semanticRevise,
  }), "PREFLIGHT_REVISE");
});

test("semantic critic unavailable never silently becomes PASS", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: runDeterministicPreflight(validSpec()),
    semanticCritic: semanticUnavailable,
  }), "PREFLIGHT_REVISE");
});

test("explicit human preflight PASS can admit deterministic-clean intent when critic is unavailable", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: runDeterministicPreflight(validSpec()),
    semanticCritic: semanticUnavailable,
    humanPreflightDecision: "PASS",
  }), "PREFLIGHT_PASS");
});
