import {test} from "node:test";
import assert from "node:assert/strict";
import {makeSceneIllustration,sceneImageErrors,projectImageErrors,attachSceneMedia,validHotspot} from "./scene-media";
import {buildStudioAtlasReviewPreviewSnapshot} from "./preview";
import {mediaDigestInput,shaText} from "./preview-media-integrity";
import {createMuseoZeroPilotProject} from "./canonical/museo-zero";
const base64="UklGRh4AAABXRUJQVlA4TBEAAAAvH8AHAAdQoMIUqv+BiOh/AAA=";
async function fixture(){
 const p=structuredClone(createMuseoZeroPilotProject());
 p.projectId="ess-image-test";p.storyReview={decision:"PASS"};
 const scene=p.scenes.find(s=>s.stage?.evidence?.length)!;
 scene.illustration={...await makeSceneIllustration(Uint8Array.from(atob(base64),c=>c.charCodeAt(0))),alt:"Campo illustrato"};
 scene.stage!.evidence![0].hotspot={x:30,y:60};
 return {p,scene};
}
test("ESS-01B exact image bytes bound to private snapshot and omitted from scene graph",async()=>{
 const {p,scene}=await fixture();
 assert.deepEqual(projectImageErrors(p.scenes),[]);
 const snapshot=await buildStudioAtlasReviewPreviewSnapshot(p);
 assert.equal(snapshot.sceneMedia?.images[0].base64,base64);
 assert.equal(snapshot.sceneMedia?.revisionDigest,snapshot.packageDigest);
 assert.equal(snapshot.sceneMedia?.mediaDigest,await shaText(mediaDigestInput(snapshot,snapshot.sceneMedia!)));
 assert.equal(snapshot.scenes.find(s=>s.sceneId===scene.sceneId)?.illustration,undefined);
 assert.equal(snapshot.studentAuthorized,false);assert.equal(snapshot.runtimeAuthorized,false);
 scene.illustration!.sha256="0".repeat(64);
 await assert.rejects(buildStudioAtlasReviewPreviewSnapshot(p),/SCENE_MEDIA_HASH/);
});
test("ESS-01B missing image, alt, points and bad coordinates fail closed",async()=>{
 const {scene}=await fixture();
 assert.equal(validHotspot({x:101,y:10}),false);
 assert.equal(validHotspot({x:0,y:100}),true);
 assert.ok(sceneImageErrors({...scene,illustration:undefined}).includes("IMAGE_REQUIRED"));
 assert.ok(sceneImageErrors({...scene,illustration:{...scene.illustration!,alt:""}}).includes("ALT"));
 scene.stage!.evidence![0].hotspot={x:-1,y:50};
 assert.ok(sceneImageErrors(scene).includes("POINTS"));
 await assert.rejects(makeSceneIllustration(new Uint8Array(262145)),/IMAGE_LIMIT/);
});
