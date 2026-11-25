import assert from "node:assert/strict";
import { test } from "node:test";
import { makeEnvironment, OPTICAL_ENV_INTENSITY } from "./scene-optics";
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
