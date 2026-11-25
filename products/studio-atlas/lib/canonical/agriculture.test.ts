import {test} from "node:test";
import assert from "node:assert/strict";
import {bindAgricultureHotspots,createAgricultureDraft} from "./agriculture";
import type {SceneIllustration,SceneStage} from "../model";
import {stagePlaceErrors} from "../scene-places";
import {worldPlaces} from "../world-composer";
import manifest from "../../public/design/ess-02/r2b/manifest.json";
test("all five canonical illustrations preserve their evidence bindings",()=>{
 const images:Record<string,SceneIllustration>=Object.fromEntries(manifest.scenes.map(item=>[item.sceneId,{sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
 const project=createAgricultureDraft(images);
 assert.equal(project.scenes.length,5);
 let count=0;
 for(const binding of manifest.scenes){
  const scene=project.scenes.find(s=>s.sceneId===binding.sceneId)!;
  assert.equal(scene.illustration,images[binding.sceneId]);
  assert.deepEqual(Object.fromEntries(scene.stage!.evidence!.map(e=>[e.id,e.hotspot])),binding.hotspots);
  assert.deepEqual(stagePlaceErrors(scene.stage),[]);
  count+=scene.stage!.evidence!.length;
 }
 assert.equal(count,18);
});
test("hotspot binding rejects missing, foreign, duplicate and invalid coordinates",()=>{
 const stage:SceneStage={visualMode:"CINEMATIC_EDITORIAL",locations:[{id:"site",label:"Luogo",detail:"Dettaglio",position:"ROOM"}],focusLocationId:"site",evidence:[{id:"a",locationId:"site",label:"Indizio",detail:"Dettaglio",kind:"OBJECT",hotspot:{x:10,y:20}}]};
 const next=bindAgricultureHotspots(stage,{a:{x:0,y:100}});
 assert.deepEqual(next.evidence![0].hotspot,{x:0,y:100});
 assert.deepEqual(stage.evidence![0].hotspot,{x:10,y:20});
 assert.throws(()=>bindAgricultureHotspots(stage,{}),/HOTSPOT_COUNT/);
 assert.throws(()=>bindAgricultureHotspots(stage,{b:{x:0,y:100}}),/HOTSPOT_MISSING/);
 for(const value of [null,undefined,{x:101,y:0},{x:0.1,y:0},{x:"10",y:0},{x:10,y:0,z:1}])assert.throws(()=>bindAgricultureHotspots(stage,{a:value}),/HOTSPOT_INVALID/);
 assert.throws(()=>bindAgricultureHotspots({...stage,evidence:[stage.evidence![0],stage.evidence![0]]},{a:{x:0,y:0},b:{x:1,y:1}}),/HOTSPOT_COUNT/);
});

test("panoramica Mondo: preserva tutti i cinque luoghi canonici con id locale site",()=>{
 const images:Record<string,SceneIllustration>=Object.fromEntries(manifest.scenes.map(item=>[item.sceneId,{sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
 const project=createAgricultureDraft(images);
 const before=JSON.stringify(project);
 const places=worldPlaces(project);
 assert.deepEqual(project.scenes.map(scene=>scene.stage!.locations![0].id),["site","site","site","site","site"]);
 for(const scene of project.scenes){
  const location=scene.stage!.locations![0];
  assert.ok(places.some(place=>place.label===location.label&&place.detail===location.detail),location.label);
 }
 assert.equal(new Set(places.map(place=>place.id)).size,places.length);
 assert.equal(JSON.stringify(project),before);
});
