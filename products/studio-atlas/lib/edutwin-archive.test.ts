import {test} from "node:test";
import assert from "node:assert/strict";
import {parseHandoff,prepareHandoff,replayArchive,MAX_HANDOFF_BYTES} from "./edutwin-archive";
import {missione118DraftInput} from "./canonical/missione118-generator-pilot";

const id="missione118-s2b";
const firstTime="2026-11-14T17:00:00.000Z",secondTime="2026-11-14T17:01:00.000Z";
function input(){
 return {
  brief:{theme:"Informazione e IA",ageBand:"lower-secondary",objective:"Confrontare fonti",durationMinutes:15,constraints:["FREE_ONLY"]},
  authoring:structuredClone(missione118DraftInput),
  decisions:[{id:"context",category:"CONTEXT",requirement:"La missione deve essere comprensibile prima delle scelte."}],
  feedback:[],assets:[{id:"synthetic-image",kind:"IMAGE",sha256:"a".repeat(64)}],responses:[]
 };
}
const first=()=>({projectId:id,expectedParentDigest:null,input:input()});
function next(digest:string){
 const raw=input();
 raw.decisions=[];raw.assets=[];
 raw.authoring.opening.firstAction="Leggi il primo avviso sul display.";
 return {projectId:id,expectedParentDigest:digest,input:{...raw,
  feedback:[{id:"orientation",category:"ACTION",observation:"La prima azione non è chiara.",requestedChange:"Indicare il primo oggetto da osservare."}],
  responses:[{feedbackId:"orientation",proposedChange:"La prima azione indica il display."}]
 }};
}

test("local handoff validates a closed, bounded envelope",()=>{
 assert.deepEqual(parseHandoff(JSON.stringify(first())),first());
 assert.throws(()=>parseHandoff(JSON.stringify({...first(),runtimeAuthorized:true})),/INVALID_HANDOFF/);
 assert.throws(()=>parseHandoff(JSON.stringify({...first(),projectId:"../wrong"})),/INVALID_HANDOFF/);
 assert.throws(()=>parseHandoff(JSON.stringify({...first(),expectedParentDigest:"wrong"})),/INVALID_HANDOFF/);
 assert.throws(()=>parseHandoff(" ".repeat(MAX_HANDOFF_BYTES+1)),/HANDOFF_TOO_LARGE/);
});

test("archive reopens a compiled draft without trusting a stored project or review",async()=>{
 const a=await prepareHandoff(first(),firstTime);
 assert.equal(a.revision.project.humanState,"STORY_DRAFT");
 assert.equal(a.revision.reviewRequired,true);
 assert.equal(a.revision.publicationAuthorized,false);
 assert.equal(a.revision.assetBytesVerified,false);
 const stored=JSON.parse(JSON.stringify(a.archive));
 assert.deepEqual(await replayArchive(stored),a.revision);
});

test("new handoff preserves old inputs, decisions and exact feedback association",async()=>{
 const a=await prepareHandoff(first(),firstTime);
 const b=await prepareHandoff(next(a.revision.digest),secondTime,a.archive);
 assert.equal(a.archive.entries.length,1);
 assert.equal(b.archive.entries.length,2);
 assert.equal(b.revision.project.revision,2);
 assert.equal(b.revision.feedback[0].targetDigest,a.revision.digest);
 assert.deepEqual(b.revision.assets,a.revision.assets);
 assert.deepEqual(b.revision.decisions,a.revision.decisions);
 assert.equal(b.revision.reviewRequired,true);
 assert.deepEqual(await replayArchive(b.archive),b.revision);
});

test("rejects stale handoffs and a changed earlier revision",async()=>{
 const a=await prepareHandoff(first(),firstTime);
 const b=await prepareHandoff(next(a.revision.digest),secondTime,a.archive);
 await assert.rejects(prepareHandoff(first(),secondTime,a.archive),/STALE_HANDOFF/);
 await assert.rejects(prepareHandoff(next(a.revision.digest),secondTime,b.archive),/STALE_HANDOFF/);
 const changed=structuredClone(b.archive);
 (changed.entries[0].handoff.input as ReturnType<typeof input>).authoring.title="Alterato";
 await assert.rejects(replayArchive(changed),/INVALID_CHAIN/);
 const bad=structuredClone(b.archive);bad.entries[1].digest="b".repeat(64);
 await assert.rejects(replayArchive(bad),/INVALID_CHAIN/);
});

test("rejects an imported claimed approval, preserves prior archive",async()=>{
 const a=await prepareHandoff(first(),firstTime);
 const n=next(a.revision.digest);
 Object.assign(n.input.authoring,{storyReview:{decision:"PASS"}});
 await assert.rejects(prepareHandoff(n,secondTime,a.archive),/INVALID_INPUT_FIELDS/);
 assert.equal(a.archive.entries.length,1);
 assert.deepEqual(await replayArchive(a.archive),a.revision);
});
