import {test} from "node:test";
import assert from "node:assert/strict";
import {ENVIRONMENTS,AUTHORING_TOOLS,normalizeAuthoringSelection,suggestEnvironments,suggestedTools} from "./authoring-catalog";
import {deriveAuthoringPlan} from "./authoring-plan";
import {EMPTY_STORY,EMPTY_WORLD,EMPTY_EXPERIENCE,STAGES} from "./model";
test("UX2a: suggestions are transparent and cover different subjects",()=>{
  assert.equal(suggestEnvironments("Sensori, automazione, energia")[0].environment.id,"LAB");
  assert.equal(suggestEnvironments("Agricoltura, colture e paesaggio")[0].environment.id,"NATURE");
  assert.equal(suggestEnvironments("CITTÀ")[0].environment.id,"CITY");
  assert.deepEqual(suggestEnvironments("non specificato"),[]);
  assert.equal(new Set(ENVIRONMENTS.map(x=>x.id)).size,ENVIRONMENTS.length);
  assert.equal(new Set(AUTHORING_TOOLS.map(x=>x.id)).size,AUTHORING_TOOLS.length);
});
test("UX2a: invalid, duplicate and historic selections normalize safely",()=>{
  assert.equal(normalizeAuthoringSelection(undefined),undefined);
  assert.deepEqual(normalizeAuthoringSelection({environment:"bad",tools:["CHOICES","CHOICES","UNKNOWN"]}),{tools:["CHOICES"]});
  assert.deepEqual(normalizeAuthoringSelection({environment:"LAB",tools:["WORLD"]}),{environment:"LAB",tools:["WORLD"]});
});
test("UX2a: explicit selected capabilities add planning checks even in essential scope",()=>{
  const plan=deriveAuthoringPlan({authoringComplexity:"ESSENTIAL",authoringSelection:{environment:"LAB",tools:["CHOICES","SIMULATION"]},experience:EMPTY_EXPERIENCE,story:EMPTY_STORY,world:EMPTY_WORLD,scenes:[]});
  assert.ok(plan.focusStages.includes("Mondo"));
  assert.ok(plan.checks.some(x=>x.includes("destinazioni")));
  assert.ok(plan.checks.some(x=>x.includes("segnali")));
  assert.deepEqual(plan.availableStages,STAGES);
  assert.ok(suggestedTools({experience:{grammar:"SIMULATION_MICROWORLD",rationale:""},scenes:[]}).some(x=>x.id==="SIMULATION"&&x.availability==="PLANNING"));
});
