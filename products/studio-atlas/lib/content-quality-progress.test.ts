import {test} from "node:test";
import assert from "node:assert/strict";
import {evaluateContentQuality,activityQualityProgress,type QualityCandidate,type QualityPlan,type QualityEvidence} from "./content-quality-progress";
const c:QualityCandidate={activityId:"demo",version:"1.0.0-draft",manifestDigest:"a".repeat(64)};
const p:QualityPlan={...c,narrative:true,visual:true,voice:"REQUIRED"};
const full=():QualityEvidence[]=>evaluateContentQuality(c,p,[]).steps.flatMap(s=>s.items).map(i=>({...c,check:i.id,mode:i.mode,decision:"PASS",reference:"governed-evidence/test-only"}));
test("unreviewed candidate starts at purpose and requires voice when applicable",()=>{
 const r=evaluateContentQuality(c,p,[]);assert.equal(r.next?.id,"PURPOSE");assert.equal(r.complete,false);assert.equal(r.publicationAuthorized,false);assert.ok(r.steps.flatMap(s=>s.items).some(i=>i.id==="VOICE_LISTEN"));
});
test("complete evidence is not publication authorization",()=>{
 const r=evaluateContentQuality(c,p,full());assert.equal(r.complete,true);assert.equal(r.publicationAuthorized,false);
});
test("changed digest, missing review, duplicate and wrong authority never pass",()=>{
 const all=full(),changed={...c,manifestDigest:"b".repeat(64)};
 assert.equal(evaluateContentQuality(changed,p,all).complete,false);
 assert.equal(evaluateContentQuality(c,p,all.filter(e=>e.check!=="WRITING")).next?.id,"WRITING");
 assert.equal(evaluateContentQuality(c,p,[...all,all[0]]).next?.id,"PURPOSE");
 assert.equal(evaluateContentQuality(c,p,all.map(e=>e.check==="VOICE_LISTEN"?{...e,mode:"TECHNICAL"}:e)).next?.id,"VOICE_LISTEN");
});
test("acoustic success cannot replace listening; REWORK stops the flow",()=>{
 const all=full().map(e=>e.check==="VOICE_LISTEN"?{...e,decision:"REWORK" as const}:e);
 const r=evaluateContentQuality(c,p,all);assert.equal(r.next?.id,"VOICE_LISTEN");assert.equal(r.steps[1].decision,"REWORK");assert.equal(r.complete,false);
});
test("only an exact governed plan can omit narrative, visual or voice checks",()=>{
 const plain:QualityPlan={...p,narrative:false,visual:false,voice:"NOT_PLANNED"};
 assert.equal(evaluateContentQuality(c,plain,[]).steps.some(s=>s.title==="Produci"),false);
 const unknown=evaluateContentQuality({...c,version:"2.0.0-draft"},plain,full());
 assert.ok(unknown.steps.flatMap(s=>s.items).some(i=>i.id==="VOICE_LISTEN"));assert.equal(unknown.planBound,false);
});
test("imported flags are not approval; current pilot still awaits human review",()=>{
 const v7={activityId:"trama-missione-118-2026",version:"0.3.0-draft",manifestDigest:"407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395",review:{status:"PASS"},authorization:{atlasPublished:true}};
 const r=activityQualityProgress(v7);assert.equal(r.planBound,true);assert.equal(r.next?.id,"PURPOSE");assert.equal(r.publicationAuthorized,false);
});

test("voice preparation is context only and requires the exact V7 technical checks",()=>{
 const v7={activityId:"trama-missione-118-2026",version:"0.3.0-draft",manifestDigest:"407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395"};
 const asset:QualityEvidence={...v7,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:"test-only"};
 const browser:QualityEvidence={...asset,check:"BROWSER_SMOKE"};
 const voice:QualityEvidence={...asset,check:"VOICE_TECH"};
 assert.equal(activityQualityProgress(v7,[asset]).voicePreparation,undefined);
 assert.equal(activityQualityProgress(v7,[asset,browser,browser]).voicePreparation,undefined);
 assert.equal(activityQualityProgress({...v7,version:"0.4.0-draft"},[asset,browser]).voicePreparation,undefined);
 const result=activityQualityProgress(v7,[asset,browser,voice]);
 assert.equal(result.voicePreparation?.sceneCount,5);
 for(const id of ["VOICE_TECH","VOICE_LISTEN"]){
  assert.equal(result.steps.flatMap(s=>s.items).find(i=>i.id===id)?.decision,"PENDING");
 }
 assert.equal(result.publicationAuthorized,false);
});

test("V9 exact plan requires review; technical evidence does not authorize publication",()=>{
 const v9={activityId:"trama-missione-118-2026",version:"0.4.1-draft",manifestDigest:"1b00cf15c4dc7a54e805489f631b4d7135a3f50e3fd8ec5ee2267d6fd849d990"};
 const evidence:QualityEvidence[]=[
  {...v9,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},
  {...v9,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},
  {...v9,check:"VOICE_LISTEN",mode:"HUMAN",decision:"PASS",reference:"not-authenticated"}
 ];
 const r=activityQualityProgress(v9,evidence);assert.equal(r.planBound,true);assert.equal(r.next?.id,"PURPOSE");
 assert.equal(r.voicePreparation,undefined);assert.equal(r.publicationAuthorized,false);
 assert.equal(r.steps.flatMap(s=>s.items).find(i=>i.id==="VOICE_LISTEN")?.decision,"PENDING");
 assert.equal(r.steps.flatMap(s=>s.items).find(i=>i.id==="ASSET_INTEGRITY")?.decision,"PASS");
 assert.equal(activityQualityProgress({...v9,manifestDigest:"0".repeat(64)},evidence).planBound,false);
});
