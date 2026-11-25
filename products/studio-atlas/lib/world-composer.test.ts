import assert from "node:assert/strict";
import { test } from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { compareSceneWorld, updateSceneFocus, updateWorldChoiceStatus, worldPlaces } from "./world-composer";

test("AWC S2: riusa luoghi e identità dal progetto canonico", () => {
  const project = createMuseoZeroPilotProject();
  const before = JSON.stringify(project);
  const places = worldPlaces(project);
  assert.ok(places.some((place) => place.label === "Sala Zero"));
  assert.ok(places.some((place) => place.label === "Cabina regia"));
  assert.equal(new Set(places.map((place) => place.id)).size, places.length);
  assert.equal(JSON.stringify(project), before);
});

test("AWC S2: confronta solo stati dopo una scelta realmente documentata", () => {
  const project = createMuseoZeroPilotProject();
  const scene = project.scenes.find((item) => item.sceneId === "MZ4_TEST_MAPPING");
  assert.ok(scene);
  const before = JSON.stringify(scene);
  const original = compareSceneWorld(scene, null);
  assert.ok(original.original);
  assert.equal(original.variation, null);
  const revised = compareSceneWorld(scene, "switch-b");
  assert.match(revised.original?.status ?? "", /Sensor A/);
  assert.match(revised.variation?.status ?? "", /mappatura aggiornata/);
  assert.match(revised.choiceLabel ?? "", /Sensor B/);
  assert.equal(JSON.stringify(scene), before);
});

test("AWC S2: scelta non documentata non inventa uno stato visivo", () => {
  const scene = createMuseoZeroPilotProject().scenes[0];
  const result = compareSceneWorld(scene, "invented");
  assert.equal(result.variation, null);
  assert.equal(result.feedback, null);
});


test("AWC S2: una conseguenza modificata resta separata dallo stato originale", () => {
  const project = createMuseoZeroPilotProject();
  const originalJson = JSON.stringify(project.scenes);
  const changed = updateWorldChoiceStatus(
    project.scenes,
    "MZ4_TEST_MAPPING",
    "switch-b",
    "  La scena si sincronizza e il nuovo ingresso resta accessibile.  ",
  );
  const source = project.scenes.find((s) => s.sceneId === "MZ4_TEST_MAPPING");
  const result = changed.find((s) => s.sceneId === "MZ4_TEST_MAPPING");
  assert.ok(source?.world && result?.world);
  assert.deepEqual(result.world, source.world);
  assert.equal(
    result.choices.find((c) => c.choiceId === "switch-b")?.worldAfter?.status,
    "La scena si sincronizza e il nuovo ingresso resta accessibile.",
  );
  assert.equal(JSON.stringify(project.scenes), originalJson);
  assert.throws(
    () => updateWorldChoiceStatus(project.scenes, "MZ4_TEST_MAPPING", "other", "Proposta"),
    /SCENE_VARIATION_NOT_FOUND/,
  );
  assert.throws(
    () => updateWorldChoiceStatus(project.scenes, "MZ4_TEST_MAPPING", "switch-b", " "),
    /EMPTY_SCENE_VARIATION/,
  );
});

test("UX2b: modifica solo il fuoco reale, senza clonare o inventare luoghi", () => {
  const project = createMuseoZeroPilotProject();
  const scene = project.scenes.find(item => (item.stage?.locations?.length ?? 0) > 1);
  assert.ok(scene?.stage?.locations);
  const target = scene.stage.locations.find(location => location.id !== scene.stage?.focusLocationId);
  assert.ok(target);
  const before = JSON.stringify(scene);
  const next = updateSceneFocus(scene, target.id);
  assert.equal(next.stage?.focusLocationId, target.id);
  assert.deepEqual(next, { ...scene, stage: { ...scene.stage, focusLocationId: target.id } });
  assert.equal(JSON.stringify(scene), before);
  assert.equal(updateSceneFocus(next, target.id), next);
  assert.throws(() => updateSceneFocus(scene, "invented"), /SCENE_FOCUS_LOCATION_NOT_FOUND/);
});

test("AWC: gli identificativi locali non collassano luoghi di scene diverse", () => {
  const project = createMuseoZeroPilotProject();
  const first = project.scenes[0];
  const second = project.scenes[1];
  assert.ok(first.stage && second.stage);
  const location = first.stage.locations![0];
  const scoped = {
    ...project,
    scenes: [
      { ...first, world: undefined, stage: { ...first.stage, locations: [location, location] } },
      { ...second, world: undefined, stage: { ...second.stage, locations: [
        { ...location, label: "Altro ambiente", detail: "Altro dettaglio" },
      ] } },
    ],
  };
  const before = JSON.stringify(scoped);
  const places = worldPlaces(scoped);
  assert.deepEqual(places.map(({ label, detail }) => ({ label, detail })), [
    { label: location.label, detail: location.detail },
    { label: "Altro ambiente", detail: "Altro dettaglio" },
  ]);
  assert.equal(new Set(places.map(place => place.id)).size, 2);
  assert.deepEqual(worldPlaces(scoped), places);
  assert.equal(JSON.stringify(scoped), before);
});
