import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {compileSpecializedReviewSnapshot} from "./specialized-review-preview";
const fixture=JSON.parse(readFileSync(new URL("./fixtures/axf-energy-package.v0.2.json",import.meta.url),"utf8"));
test("compile one real renderer binding and explicit transfer without publication",async()=>{
 const s=await compileSpecializedReviewSnapshot(fixture);
 assert.equal(s.schemaVersion,"studio-atlas.preview-snapshot/v0.2");
 assert.equal(s.runtimeAuthorized,false);assert.equal(s.studentAuthorized,false);
 assert.match(s.packageDigest,/^[a-f0-9]{64}$/);
 assert.deepEqual(s.scenes[0].specialized,{rendererId:"energy-lamp",version:1});
 assert.deepEqual(s.scenes[0].nextSceneRefs,["transfer"]);
 assert.equal(s.scenes[1].kind,"TRANSFER");
});
test("reject unsupported and bypassing packages",async()=>{
 for(const change of [
  (p:any)=>{p.runtimeAuthorized=true},
  (p:any)=>{p.publicationCandidate.decision="PUBLISH_CANDIDATE"},
  (p:any)=>{p.authoringState="REVIEWABLE"},
  (p:any)=>{p.scenes[0].specialized.rendererId="unknown"},
  (p:any)=>{p.scenes[0].specialized.version=2},
  (p:any)=>{p.scenes[0].specialized.url="https://example.com"},
  (p:any)=>{p.scenes[0].nextSceneRefs=[]},
  (p:any)=>{p.scenes[0].stage={}},
  (p:any)=>{p.scenes[1].kind="SCENE"},
  (p:any)=>{p.scenes[0].sceneId=p.scenes[1].sceneId},
  (p:any)=>{p.scenes[0].interaction="SUMMARY"}
 ]){const p=structuredClone(fixture);change(p);await assert.rejects(()=>compileSpecializedReviewSnapshot(p),/AXF_SPECIALIZED_PACKAGE_INVALID/)}
});
