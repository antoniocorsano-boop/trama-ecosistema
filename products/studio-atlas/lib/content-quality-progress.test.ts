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
