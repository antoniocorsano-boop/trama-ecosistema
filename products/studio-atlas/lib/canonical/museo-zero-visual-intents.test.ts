import assert from "node:assert/strict";
import test from "node:test";
import { compileVisualPrompt, runDeterministicPreflight } from "../visual-preflight";
import {
  MUSEO_ZERO_REFERENCE_INTENTS,
  MUSEO_ZERO_SHOT_INTENTS,
  getMuseoZeroReferenceIntent,
  getMuseoZeroShotIntent,
} from "./museo-zero-visual-intents";

test("MUSEO ZERO visual intent corpus contains the five canonical references in order", () => {
  assert.deepEqual(
    MUSEO_ZERO_REFERENCE_INTENTS.map((spec) => spec.subjectRefs[0]),
    ["lia", "omar", "teo", "sala-zero", "cabina-regia"],
  );
  for (const spec of MUSEO_ZERO_REFERENCE_INTENTS) {
    assert.deepEqual(runDeterministicPreflight(spec).filter((item) => item.severity === "ERROR"), []);
    assert.ok(spec.narrativeFunction.length > 0);
    assert.ok(spec.requiredVisualFacts.length > 0);
    assert.ok(spec.composition.dominantSubject.length > 0);
    assert.ok(spec.composition.spatialRelation.length > 0);
    assert.ok(spec.camera.shotScale.length > 0);
    assert.ok(spec.camera.viewpoint.length > 0);
    assert.ok(spec.camera.lensLanguage.length > 0);
    assert.ok(spec.lightingMood.length > 0);
    assert.ok(spec.negativeConstraints.length > 0);
    assert.ok(spec.forbiddenTextPatterns.length > 0);
    assert.ok(spec.qualityCriteria.length > 0);
    assert.equal(spec.artDirectionVersion, "museo-zero-art-direction/v0.4");
  }
});

test("MUSEO ZERO character references use determinate v0.4 identities", () => {
  const expectedIdentityFacts = new Map([
    ["lia", ["short dark wavy bob", "burnt-orange overshirt", "charcoal base layer", "technical crossbody bag"]],
    ["omar", ["very short dark hair", "short beard", "olive/moss work jacket", "small dark tool bag"]],
    ["teo", ["short greying hair", "thin metal glasses", "slate-blue overshirt", "analog controls"]],
  ]);
  const genericIdentityMarkers = [
    "stable hairstyle",
    "stable workwear",
    "stable clothing",
    "stable outerwear silhouette",
    "distinct silhouette",
    "warm accent detail",
  ];

  for (const [subjectRef, expectedFacts] of expectedIdentityFacts) {
    const spec = getMuseoZeroReferenceIntent(subjectRef);
    const semanticText = [
      spec.narrativeFunction,
      ...spec.requiredVisualFacts,
      ...spec.identityAnchors,
      spec.composition.dominantSubject,
      spec.composition.spatialRelation,
      ...spec.materialTextureLanguage,
      ...spec.qualityCriteria,
    ].join(" ").toLocaleLowerCase();
    for (const marker of genericIdentityMarkers) {
      assert.ok(!semanticText.includes(marker), `${subjectRef} must not use generic marker: ${marker}`);
    }
    for (const fact of expectedFacts) {
      assert.ok(semanticText.includes(fact), `${subjectRef} missing determinate fact: ${fact}`);
    }

    const prompt = compileVisualPrompt(spec, "FLUX2_KLEIN_4B").positivePrompt.toLocaleLowerCase();
    for (const fact of expectedFacts) {
      assert.ok(prompt.includes(fact), `${subjectRef} compiled prompt missing: ${fact}`);
    }
  }
});

test("MUSEO ZERO visual intent mutations fail before provider execution", () => {
  const lia = getMuseoZeroReferenceIntent("lia");
  const noIdentity = { ...lia, identityAnchors: [] };
  assert.ok(runDeterministicPreflight(noIdentity).some((item) => item.code === "CHARACTER_IDENTITY_ANCHORS_REQUIRED"));

  const sala = getMuseoZeroReferenceIntent("sala-zero");
  const dashboardSala = {
    ...sala,
    composition: { ...sala.composition, diegeticScene: true, dominantSurface: "detached SaaS dashboard overlay" },
  };
  assert.ok(runDeterministicPreflight(dashboardSala).some((item) => item.code === "DIEGETIC_DASHBOARD_CONTRADICTION"));

  const cabina = getMuseoZeroReferenceIntent("cabina-regia");
  assert.ok(runDeterministicPreflight({ ...cabina, worldAnchors: [], composition: { ...cabina.composition, spatialRelation: "" } })
    .some((item) => item.code === "ENVIRONMENT_WORLD_ANCHORS_REQUIRED"));

  assert.ok(runDeterministicPreflight({ ...sala, requiredVisualFacts: [...sala.requiredVisualFacts, "large educational captions"] })
    .some((item) => item.code === "FORBIDDEN_POSITIVE_TROPE"));
  assert.ok(runDeterministicPreflight({ ...sala, requiredVisualFacts: [...sala.requiredVisualFacts, "generic cyberpunk neon default"] })
    .some((item) => item.code === "FORBIDDEN_POSITIVE_TROPE"));
});

test("MUSEO ZERO visual intent corpus contains F1 through F6 with continuity families", () => {
  assert.deepEqual(MUSEO_ZERO_SHOT_INTENTS.map((spec) => spec.shotId), ["F1", "F2", "F3", "F4", "F5", "F6"]);
  for (const spec of MUSEO_ZERO_SHOT_INTENTS) {
    assert.deepEqual(runDeterministicPreflight(spec).filter((item) => item.severity === "ERROR"), []);
    assert.ok((spec.composition.focalActions?.length ?? 0) > 0);
    assert.ok(spec.composition.spatialRelation.length > 0);
    assert.equal(spec.artDirectionVersion, "museo-zero-art-direction/v0.4");
  }

  const thresholdFamily = ["F2", "F3", "F6"].map((id) => getMuseoZeroShotIntent(id).camera.continuityFamily);
  assert.deepEqual(new Set(thresholdFamily).size, 1);
  assert.ok(thresholdFamily[0]?.includes("threshold"));

  const controlFamily = ["F4", "F5"].map((id) => getMuseoZeroShotIntent(id).camera.continuityFamily);
  assert.deepEqual(new Set(controlFamily).size, 1);
  assert.ok(controlFamily[0]?.includes("control"));
  assert.match(getMuseoZeroShotIntent("F5").interactionState ?? "", /one bounded mapping change/i);
});

test("MUSEO ZERO visual intent lookups fail closed for unknown identities", () => {
  assert.throws(() => getMuseoZeroReferenceIntent("unknown"), /MUSEO_ZERO_VISUAL_INTENT_NOT_FOUND/);
  assert.throws(() => getMuseoZeroShotIntent("F99"), /MUSEO_ZERO_VISUAL_INTENT_NOT_FOUND/);
});
