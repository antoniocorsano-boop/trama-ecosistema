import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_EXPERIENCE, EMPTY_STORY, EMPTY_WORLD, STAGES, type PathwayScene } from "./model";
import { deriveAuthoringPlan, parseAuthoringComplexity } from "./authoring-plan";

const base = { experience: EMPTY_EXPERIENCE, scenes: [], story: EMPTY_STORY, world: EMPTY_WORLD };
test("UX1b: optional, valid and backward-compatible authoring preference", () => {
  for (const id of ["ESSENTIAL", "ARTICULATED", "ADVANCED"]) assert.equal(parseAuthoringComplexity(id), id);
  for (const invalid of [undefined, null, "", "PUBLISHED", 3]) assert.equal(parseAuthoringComplexity(invalid), undefined);
  const plan = deriveAuthoringPlan(base);
  assert.equal(plan.suggested, "ESSENTIAL");
  assert.equal(plan.focusStages.includes("Produzione"), false);
  assert.deepEqual(plan.availableStages, STAGES);
  assert.equal(plan.focusStages.includes("Revisione"), true);
});
test("UX1b: complex features survive an essential profile", () => {
  const scene: PathwayScene = {
    sceneId: "s1", kind: "SCENE", interaction: "CHOICE", title: "Prova",
    visibleSituation: "Sistema", learnerAction: "Scegli", consequence: "Verifica", reveal: "",
    world: { place: "Sala", status: "Pronto", signals: [{id:"b",label:"B",state:"READY"}] },
    choices: [{choiceId:"a",label:"A",feedback:"Risposta",targetSceneId:"s2"}],
  };
  const input = {...base, authoringComplexity: "ESSENTIAL" as const, scenes: [scene]};
  const plan = deriveAuthoringPlan(input);
  assert.equal(plan.effective, "ESSENTIAL");
  assert.equal(plan.suggested, "ADVANCED");
  assert.ok(plan.checks.some(check => check.includes("destinazioni")));
  assert.ok(plan.checks.some(check => check.includes("segnali")));
  assert.ok(plan.focusStages.includes("Mondo"));
  assert.deepEqual(plan.availableStages, STAGES);
  assert.equal(scene.choices[0].targetSceneId, "s2");
});
test("UX1b: scope changes recommendations, not available gates or content", () => {
  const essential = deriveAuthoringPlan({...base, authoringComplexity:"ESSENTIAL"});
  const advanced = deriveAuthoringPlan({...base, authoringComplexity:"ADVANCED"});
  assert.deepEqual(advanced.focusStages, STAGES);
  assert.ok(advanced.checks.some(check => check.includes("prestazioni")));
  assert.deepEqual(essential.availableStages, advanced.availableStages);
  assert.ok(essential.checks.every(check => advanced.checks.includes(check)));
});

test("M1/M2: work mode persists apart from the project and does not change gates", async () => {
  const { loadWorkMode, saveWorkMode } = await import("./authoring-catalog");
  const values = new Map([["studio-atlas.projects.v0.1", '{"revision":4,"digest":"original"}']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.equal(loadWorkMode(storage, "p1"), undefined);
  for (const mode of ["DOCUMENT", "IDEA", "CURRICOLO", "PRODUCTION", "COMPOSITION", "REVIEW"] as const) {
    saveWorkMode(storage, "p1", mode);
    assert.equal(loadWorkMode(storage, "p1"), mode);
    assert.deepEqual(deriveAuthoringPlan(base, mode).availableStages, STAGES);
  }
  assert.equal(loadWorkMode(storage, "p2"), undefined);
  assert.equal(loadWorkMode(storage, "p1"), "REVIEW");
  assert.equal(values.get("studio-atlas.projects.v0.1"), '{"revision":4,"digest":"original"}');
  assert.equal(deriveAuthoringPlan(base, "DOCUMENT").workMode?.availability, "BLOCKED");
  assert.equal(deriveAuthoringPlan(base, "CURRICOLO").workMode?.availability, "BLOCKED");
  const production = deriveAuthoringPlan(base, "PRODUCTION").workMode;
  assert.equal(production?.availability, "EDITOR");
  assert.equal(production.stage, "Produzione");
  assert.equal(production.product, "RESOURCE");
  values.set("studio-atlas.work-mode.v1:p1", "PUBLISHED");
  assert.equal(loadWorkMode(storage, "p1"), undefined);
});
