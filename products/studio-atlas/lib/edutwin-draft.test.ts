import {test} from "node:test";
import assert from "node:assert/strict";
import {compileEduTwinDraft, type EduTwinDraftInput} from "./edutwin-draft";
import {getProductionBlockers} from "./production";
import {buildStudioAtlasReviewPreviewSnapshot} from "./preview";
import {missione118DraftInput} from "./canonical/missione118-generator-pilot";

const id={projectId:"edutwin-test-1",now:"2026-11-14T17:00:00.000Z"};
const fresh=()=>structuredClone(missione118DraftInput);

test("compiles explicit orientation into actual learner-visible opening, without granting authority",async()=>{
 const input=fresh(),project=compileEduTwinDraft(input,id);
 assert.equal(project.humanState,"STORY_DRAFT");
 assert.equal(project.storyReview.decision,"DRAFT");
 assert.equal(project.worldReview.decision,"DRAFT");
 assert.equal(project.productReview?.decision,"DRAFT");
 assert.equal(project.storyboardReady,false);
 assert.equal(project.productionState,"NOT_REQUESTED");
 assert.equal(project.scenes[0].sceneId,"edutwin-opening");
 for(const text of Object.values(input.opening).slice(0,6)) assert.ok(project.scenes[0].visibleSituation.includes(text));
 assert.equal(project.scenes[0].learnerAction,input.opening.firstAction);
 assert.ok(getProductionBlockers(project).includes("STORY_REVIEW_NOT_PASS"));
 await assert.rejects(()=>buildStudioAtlasReviewPreviewSnapshot(project),/STORY_REVIEW_NOT_PASS/);
 assert.deepEqual(compileEduTwinDraft(input,id),project);
 input.scenes[0].title="changed";
 assert.notEqual(project.scenes[1].title,"changed");
});

test("rejects missing orientation and opaque first action before creating a draft",()=>{
 for(const field of ["theme","setting","characters","disruption","role","mission","firstAction"] as const){
  const input=fresh();input.opening[field]="   ";
  assert.throws(()=>compileEduTwinDraft(input,id),/OPENING_INCOMPLETE/);
 }
 const input=fresh();input.opening.firstAction="Continua";
 assert.throws(()=>compileEduTwinDraft(input,id),/GENERIC_FIRST_ACTION/);
});

test("rejects duplicate scene identifiers and missing branches",()=>{
 const duplicate=fresh();duplicate.scenes[1].sceneId=duplicate.scenes[0].sceneId;
 assert.throws(()=>compileEduTwinDraft(duplicate,id),/DUPLICATE_SCENE/);
 const broken=fresh();broken.scenes[0].choices[0].targetSceneId="unknown";
 assert.throws(()=>compileEduTwinDraft(broken,id),/INVALID_TARGET/);
});

test("rejects cosmetic choices and missing visible consequence",()=>{
 const same=fresh();same.scenes[0].choices[1].targetSceneId=same.scenes[0].choices[0].targetSceneId;
 assert.throws(()=>compileEduTwinDraft(same,id),/INDISTINGUISHABLE_BRANCHES/);
 const missing=fresh();delete missing.scenes[0].choices[0].worldAfter;
 assert.throws(()=>compileEduTwinDraft(missing,id),/MISSING_WORLD_CONSEQUENCE/);
 const identical=fresh();identical.scenes[0].choices[1].worldAfter=structuredClone(identical.scenes[0].choices[0].worldAfter);
 assert.throws(()=>compileEduTwinDraft(identical,id),/INDISTINGUISHABLE_CONSEQUENCES/);
});

test("rejects unreachable or nonterminating narrative and missing closure",()=>{
 const noEnd=fresh();noEnd.scenes.at(-1)!.consequence="";
 assert.throws(()=>compileEduTwinDraft(noEnd,id),/INCOMPLETE_SCENE/);
 const unreachable=fresh();unreachable.scenes.splice(1,0,{...unreachable.scenes.at(-1)!,sceneId:"unused"});
 assert.throws(()=>compileEduTwinDraft(unreachable,id),/UNREACHABLE_SCENE/);
 const loop=fresh();loop.scenes.at(-1)!.interaction="CHOICE";loop.scenes.at(-1)!.choices=structuredClone(loop.scenes[0].choices);
 assert.throws(()=>compileEduTwinDraft(loop,id),/MISSING_NARRATIVE_CLOSURE/);
});

test("does not import supplied review, production or publication fields",()=>{
 const input={...fresh(),storyReview:{decision:"PASS"},worldReview:{decision:"PASS"},runtimeAuthorized:true,studentAuthorized:true} as EduTwinDraftInput;
 const project=compileEduTwinDraft(input,id);
 assert.equal(project.storyReview.decision,"DRAFT");
 assert.equal(project.worldReview.decision,"DRAFT");
 assert.equal("runtimeAuthorized" in project,false);
 assert.equal("studentAuthorized" in project,false);
});
