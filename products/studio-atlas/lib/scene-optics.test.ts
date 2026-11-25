import assert from "node:assert/strict";
import { test } from "node:test";
import { makeEnvironment, OPTICAL_ENV_INTENSITY, makeSurfaceMaps, SURFACE_MAP_SIZE, SURFACE_RELIEF, type SurfaceRole } from "./scene-optics";
import { MATERIAL_PRESETS } from "./scene-visual-recipe";

test("VF-MOTION-05B1: deterministic local environment, fixed texture budget",()=>{
 const a=makeEnvironment(), b=makeEnvironment();
 assert.equal(a.byteLength,256*128*4);
 assert.deepEqual(a,b);
 assert.ok(a.every((v,i)=>i%4!==3||v===255));
 assert.notDeepEqual(a.slice(0,4),a.slice(128*128*4,128*128*4+4));
 assert.throws(()=>makeEnvironment(512,256),/budget/);
});
test("VF-MOTION-05B1: optical roles match qualified material presets, original is neutral",()=>{
 assert.deepEqual(Object.keys(OPTICAL_ENV_INTENSITY),Object.keys(MATERIAL_PRESETS));
 assert.equal(OPTICAL_ENV_INTENSITY.original,0);
 assert.equal(OPTICAL_ENV_INTENSITY.bronze,.82);
 assert.ok(Object.values(OPTICAL_ENV_INTENSITY).every(n=>n>=0&&n<=1));
});

test("ART-R1: deterministic bounded opaque and differentiated surface maps",()=>{
 const roles:SurfaceRole[]=["stone","bronze","obsidian","frame"];
 const maps=roles.map(role=>makeSurfaceMaps(role));
 for(let i=0;i<roles.length;i++){
  const m=maps[i];assert.deepEqual(m,makeSurfaceMaps(roles[i]));
  for(const pixels of [m.color,m.height]){
   assert.equal(pixels.byteLength,SURFACE_MAP_SIZE**2*4);
   assert.ok(pixels.every((v,k)=>k%4!==3||v===255));
   assert.ok(new Set(pixels.filter((_,k)=>k%4===0)).size>2);
  }
  assert.ok(SURFACE_RELIEF[roles[i]]>0&&SURFACE_RELIEF[roles[i]]<=.05);
  for(let j=0;j<i;j++)assert.notDeepEqual(m.color,maps[j].color);
 }
 assert.throws(()=>makeSurfaceMaps("original" as SurfaceRole),/Invalid/);
});
