import {test} from "node:test";
import assert from "node:assert/strict";
import {compileConversationRevision} from "./edutwin-conversation";
import {missione118DraftInput} from "./canonical/missione118-generator-pilot";
import {getProductionBlockers} from "./production";

const identity={projectId:"missione118-conversation",now:"2026-11-14T17:00:00.000Z"};
const later={...identity,now:"2026-11-14T17:01:00.000Z"};
const asset={id:"original-city",kind:"IMAGE",sha256:"a".repeat(64)};
const fresh=()=>({
 brief:{theme:"Informazioni e IA",ageBand:"lower-secondary",objective:"Verificare un avviso automatico",durationMinutes:15,constraints:["FREE_ONLY","Nessun dato studente"]},
 authoring:structuredClone(missione118DraftInput),
 decisions:[{id:"context",category:"CONTEXT",requirement:"Presentare mondo, personaggi, problema e missione prima delle scelte."}],
 feedback:[] as Array<{id:string;category:string;observation:string;requestedChange:string}>,
 assets:[{...asset}],
 responses:[] as Array<{feedbackId:string;proposedChange:string}>
});
function revise(){
 const input=fresh();input.decisions=[];input.assets=[];
 input.feedback.push({id:"orientation",category:"ACTION",observation:"La prima azione non è comprensibile.",requestedChange:"Collegare l'azione al risultato atteso."});
 input.responses.push({feedbackId:"orientation",proposedChange:"Esplicitare il confronto dei due avvisi."});
 input.authoring.opening.firstAction="Tocca il primo display per leggere il suo avviso.";
 return input;
}

test("compiles conversational decisions to a draft and canonical authoring package without granting authority",async()=>{
 const input=fresh(),result=await compileConversationRevision(input,identity);
 assert.equal(result.project.humanState,"STORY_DRAFT");
 assert.equal(result.project.storyReview.decision,"DRAFT");
 assert.equal(result.reviewRequired,true);
 assert.equal(result.assetBytesVerified,false);
 assert.equal(result.publicationAuthorized,false);
 assert.equal(result.studentAuthorized,false);
 assert.equal(result.runtimeAuthorized,false);
 assert.ok(getProductionBlockers(result.project).includes("STORY_REVIEW_NOT_PASS"));
 assert.match(result.digest,/^[a-f0-9]{64}$/);
 const pkg=result.authoringPackage as {schemaVersion:string;publicationCandidate:{decision:string};runtimeAuthorized:boolean;sourceDigest:string;scenes:Array<{learnerVisibleSituation:string;nextSceneRefs:string[]}>};
 assert.equal(pkg.schemaVersion,"atlas.pathway-authoring-package/v0.1");
 assert.equal(pkg.publicationCandidate.decision,"DRAFT");
 assert.equal(pkg.runtimeAuthorized,false);
 assert.match(pkg.sourceDigest,/^[a-f0-9]{64}$/);
 assert.ok(pkg.scenes[0].learnerVisibleSituation.includes(input.authoring.opening.mission));
 assert.deepEqual(pkg.scenes[1].nextSceneRefs,["compare","source"]);
 assert.deepEqual(await compileConversationRevision(input,identity),result);
});

test("revision preserves exact decisions and assets, binds feedback to parent, never resolves it automatically",async()=>{
 const initial=await compileConversationRevision(fresh(),identity);
 const result=await compileConversationRevision(revise(),later,initial,initial.digest);
 assert.equal(result.parentDigest,initial.digest);
 assert.equal(result.project.revision,2);
 assert.equal(result.project.createdAt,initial.project.createdAt);
 assert.deepEqual(result.decisions,initial.decisions);
 assert.deepEqual(result.assets,initial.assets);
 assert.equal(result.feedback[0].targetDigest,initial.digest);
 assert.equal(result.feedback[0].targetRevision,1);
 assert.equal(result.responses[0].revision,2);
 assert.equal(result.reviewRequired,true);
 assert.equal(result.project.storyReview.decision,"DRAFT");
 assert.notEqual(result.digest,initial.digest);
 assert.notEqual(result.project.scenes[0].learnerAction,initial.project.scenes[0].learnerAction);
 const third=revise();third.feedback=[];third.responses=[];
 const r3=await compileConversationRevision(third,{...later,now:"2026-11-14T17:02:00.000Z"},result,result.digest);
 assert.deepEqual(r3.feedback,result.feedback);
 assert.deepEqual(r3.responses,result.responses);
 assert.equal(r3.reviewRequired,true);
});

test("rejects unknown fields and nested authority or student data fields",async()=>{
 const initial=fresh();
 await assert.rejects(compileConversationRevision({...initial,transcript:"raw chat"},identity),/INVALID_INPUT_FIELDS/);
 await assert.rejects(compileConversationRevision({...initial,authoring:{...initial.authoring,storyReview:{decision:"PASS"}}},identity),/INVALID_INPUT_FIELDS/);
 const nested=fresh();Object.assign(nested.authoring.scenes[0].choices[0],{studentId:"test"});
 await assert.rejects(compileConversationRevision(nested,identity),/INVALID_INPUT_FIELDS/);
 const unsupported=fresh();Object.assign(unsupported.authoring.scenes[0],{stage:{visualMode:"CINEMATIC_EDITORIAL"}});
 await assert.rejects(compileConversationRevision(unsupported,identity),/INVALID_INPUT_FIELDS/);
});

test("rejects stale or tampered revision and project identity mismatch",async()=>{
 const first=await compileConversationRevision(fresh(),identity);
 await assert.rejects(compileConversationRevision(revise(),later,first,"0".repeat(64)),/STALE_OR_CHANGED_PARENT/);
 const changed=structuredClone(first);changed.project.title="altered";
 await assert.rejects(compileConversationRevision(revise(),later,changed,first.digest),/STALE_OR_CHANGED_PARENT/);
 await assert.rejects(compileConversationRevision(revise(),{...later,projectId:"other-project"},first,first.digest),/STALE_OR_CHANGED_PARENT/);
});

test("prevents asset replacement, duplicate decisions, and fabricated feedback references",async()=>{
 const first=await compileConversationRevision(fresh(),identity);
 const replaced=revise();replaced.assets=[{...asset,sha256:"b".repeat(64)}];
 await assert.rejects(compileConversationRevision(replaced,later,first,first.digest),/ASSET_ID_ALREADY_RECORDED/);
 const repeated=revise();repeated.decisions=fresh().decisions;
 await assert.rejects(compileConversationRevision(repeated,later,first,first.digest),/DUPLICATE_DECISION/);
 const unknown=revise();unknown.responses[0].feedbackId="missing";
 await assert.rejects(compileConversationRevision(unknown,later,first,first.digest),/INVALID_RESPONSE_REFERENCE/);
 await assert.rejects(compileConversationRevision(revise(),identity),/PARENT_REQUIRED/);
});

test("rejects inconsistent brief, invalid digests and incomplete opening",async()=>{
 const audience=fresh();audience.brief.ageBand="later-primary";
 await assert.rejects(compileConversationRevision(audience,identity),/AUDIENCE_MISMATCH/);
 const digest=fresh();digest.assets[0].sha256="not-a-digest";
 await assert.rejects(compileConversationRevision(digest,identity),/INVALID_DIGEST/);
 const opening=fresh();opening.authoring.opening.mission="";
 await assert.rejects(compileConversationRevision(opening,identity),/INVALID_INPUT_TEXT/);
});
