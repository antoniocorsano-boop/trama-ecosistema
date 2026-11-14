import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {compileConversationRevision} from "./edutwin-conversation";
import {missione118DraftInput} from "./canonical/missione118-generator-pilot";
import {buildEduTwinIllustratedReviewSnapshot,mediaDigestInput,type LocalStoryReview} from "./edutwin-illustrated-preview";
import type {ActivityDraft} from "./activity-drafts";
const base64="UklGRh4AAABXRUJQVlA4TBEAAAAvH8AHAAdQoMIUqv+BiOh/AAA=";
const sha=(data:string|Buffer)=>createHash("sha256").update(data).digest("hex");
const digest=sha(Buffer.from(base64,"base64"));
const identity={projectId:"illustrated-review-test",now:"2026-11-14T17:00:00.000Z"};
async function fresh(transfer=true){
 const authoring=structuredClone(missione118DraftInput);
 if(transfer)authoring.scenes.push({sceneId:"transfer",kind:"TRANSFER",interaction:"SUMMARY",title:"Un nuovo avviso",visibleSituation:"In biblioteca un avviso parziale indica soltanto l'orario di chiusura.",learnerAction:"Confronta l'avviso con il documento completo.",consequence:"Puoi distinguere le fasce di apertura.",reveal:"La strategia vale anche per altre fonti.",choices:[]});
 const revision=await compileConversationRevision({brief:{theme:"Informazione e IA",ageBand:"lower-secondary",objective:"Confrontare fonti",durationMinutes:15,constraints:["FREE_ONLY"]},authoring,decisions:[],feedback:[],
 assets:[{id:"city",kind:"IMAGE",sha256:digest}],responses:[],
 sceneIllustrations:[{sceneId:"edutwin-opening",assetId:"city",alt:"Città sintetica",role:"SETTING"}]},identity);
 const path="art/city.webp";
 const draft:ActivityDraft={key:"synthetic@0.1.0-draft#"+digest,activityId:"synthetic",version:"0.1.0-draft",manifestDigest:digest,
 manifest:{title:"Synthetic fixture",kind:"EDUTWIN",assets:[{id:"city",type:"IMAGE",path,sha256:digest}]},
 files:[{path,type:"IMAGE",format:"image/webp",sha256:digest,base64}],source:{kind:"LOCAL_ZIP",archiveDigest:digest,manifestPath:"intake.json"},
 status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:identity.now};
 const review:LocalStoryReview={revisionDigest:revision.digest,decision:"PASS",reviewedAt:"2026-11-14T17:01:00.000Z"};
 return {revision,draft,review};
}
test("explicit exact-revision story review produces a private illustrated snapshot without promoting archive",async()=>{
 const {revision,draft,review}=await fresh(),before=structuredClone(revision);
 const snapshot=await buildEduTwinIllustratedReviewSnapshot(revision,review,[draft]);
 assert.equal(snapshot.runtimeAuthorized,false);assert.equal(snapshot.studentAuthorized,false);
 assert.equal(snapshot.edutwinMedia?.revisionDigest,revision.digest);
 assert.equal(snapshot.edutwinMedia?.images[0].base64,base64);
 assert.equal(snapshot.edutwinMedia?.images[0].sha256,digest);
 assert.equal(snapshot.edutwinMedia?.mediaDigest,sha(mediaDigestInput(snapshot,snapshot.edutwinMedia!)));
 assert.deepEqual(revision,before);assert.equal(revision.project.storyReview.decision,"DRAFT");
});
test("rejects absent, stale or older story decisions",async()=>{
 const {revision,draft,review}=await fresh();
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(revision,undefined,[draft]),/STORY_REVIEW_REQUIRED/);
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(revision,{...review,revisionDigest:"0".repeat(64)},[draft]),/STORY_REVIEW_REQUIRED/);
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(revision,{...review,reviewedAt:"2025-01-01T00:00:00.000Z"},[draft]),/STORY_REVIEW_REQUIRED/);
});
test("keeps structural gates and blocks missing or corrupt original media",async()=>{
 const x=await fresh(false);
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(x.revision,x.review,[x.draft]),/TRANSFER_SCENE_REQUIRED/);
 const {revision,draft,review}=await fresh();
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(revision,review,[]),/ORIGINAL_IMAGE_REQUIRED/);
 draft.files[0].base64="AA==";
 await assert.rejects(buildEduTwinIllustratedReviewSnapshot(revision,review,[draft]),/ORIGINAL_IMAGE_REQUIRED/);
});
