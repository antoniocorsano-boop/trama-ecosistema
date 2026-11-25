import { test } from "node:test";
import assert from "node:assert/strict";
import { createAgricultureDraft, AGRICULTURE_PROJECT_ID } from "./canonical/agriculture";
import { buildProjectVisualProfile, planProjectVisualReferences, usesCanonicalVisualExecutor } from "./visual-project-profile";
import manifest from "../public/design/ess-02/r2b/manifest.json";
import type { SceneIllustration } from "./model";
const DIGEST = "a".repeat(64);
function agricultureProject() {
  const images: Record<string, SceneIllustration> = Object.fromEntries(manifest.scenes.map(item=>[item.sceneId,{sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
  return createAgricultureDraft(images);
}
test("F3.3a actual agriculture project derives five separate references and frames without mutation",()=>{
  const project=agricultureProject();
  const before=JSON.stringify(project);
  const profile=buildProjectVisualProfile(project,DIGEST);
  assert.equal(profile.pathwayId,AGRICULTURE_PROJECT_ID);
  assert.equal(profile.references.length,5);
  assert.equal(new Set(profile.references.map(ref=>ref.subjectRefs[0])).size,5);
  assert.deepEqual(profile.shots.map(shot=>shot.sceneRef),project.scenes.map(scene=>scene.sceneId));
  assert.deepEqual(profile.references.map(ref=>ref.composition.dominantSubject),project.scenes.map(scene=>scene.stage!.locations![0].label));
  assert.equal(JSON.stringify(project),before);
});
test("F3.3a no automatic approval or execution admission",()=>{
  const project=agricultureProject();
  const draft=planProjectVisualReferences(project,DIGEST,false);
  assert.equal(draft.references.decision,"STOP_PREFLIGHT_REQUIRED");
  assert.equal(draft.references.jobs.length,0);
  const confirmed=planProjectVisualReferences(project,DIGEST,true);
  assert.equal(confirmed.references.decision,"REFERENCE_GENERATION_READY");
  assert.equal(confirmed.references.jobs.length,5);
  assert.equal(confirmed.shots.decision,"STOP_REFERENCE_LOCK_REQUIRED");
  assert.equal(confirmed.references.paidComputeAuthorized,false);
  assert.equal(confirmed.references.runtimeAuthorized,false);
  assert.equal(confirmed.references.publicationAuthorityGranted,false);
  assert.equal(usesCanonicalVisualExecutor(AGRICULTURE_PROJECT_ID),false);
  assert.equal(usesCanonicalVisualExecutor("pw-strategy-selection-01-museo-zero"),true);
});
test("F3.3a reject incomplete or ambiguous scenes and preserve canonical isolation",()=>{
  const project=agricultureProject();
  assert.throws(()=>buildProjectVisualProfile({...project,archived:true},DIGEST),/SCOPE_UNSUPPORTED/);
  assert.throws(()=>buildProjectVisualProfile({...project,scenes:[project.scenes[0],project.scenes[0]]},DIGEST),/SCOPE_UNSUPPORTED/);
  assert.throws(()=>buildProjectVisualProfile({...project,scenes:[{...project.scenes[0],stage:undefined,world:undefined}]},DIGEST),/SCENE_INCOMPLETE/);
  assert.throws(()=>buildProjectVisualProfile({...project,projectId:"pw-strategy-selection-01-museo-zero"},DIGEST),/CANONICAL_VISUAL_PROFILE_REQUIRED/);
});
