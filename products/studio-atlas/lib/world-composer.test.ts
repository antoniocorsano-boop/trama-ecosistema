import assert from "node:assert/strict";
import { test } from "node:test";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { compareSceneWorld, worldPlaces } from "./world-composer";

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
