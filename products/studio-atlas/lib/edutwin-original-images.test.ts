import {test} from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {sha256} from "./activity-intake";
import {resolveOriginalImages} from "./edutwin-original-images";
import type {ActivityDraft} from "./activity-drafts";
import type {ConversationRevision} from "./edutwin-conversation";

async function source(){
 const bytes=await sharp({create:{width:32,height:32,channels:3,background:"#304050"}}).webp().toBuffer();
 const digest=sha256(bytes),path="art/city.webp";
 const draft:ActivityDraft={
  key:"pilot@0.1.0-draft#"+digest,activityId:"pilot",version:"0.1.0-draft",manifestDigest:digest,
  manifest:{title:"Fixture",kind:"EDUTWIN",assets:[{id:"city",type:"IMAGE",path,sha256:digest}]},
  files:[{path,type:"IMAGE",format:"image/webp",sha256:digest,base64:bytes.toString("base64")}],
  source:{kind:"LOCAL_ZIP",archiveDigest:digest,manifestPath:"intake.json"},
  status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-14T17:00:00.000Z",galleryValidation:"WEBP_HEADER_V1"
 };
 const refs:ConversationRevision["assets"]=[{id:"original-city",kind:"IMAGE",sha256:digest}];
 return {draft,refs,path};
}
test("matches exact verified local WebP, independent of asset naming and without modifying archives",async()=>{
 const {draft,refs,path}=await source();
 const before=structuredClone(draft);
 const result=await resolveOriginalImages(refs,[draft]);
 assert.equal(result[0].state,"VERIFIED_LOCAL");
 assert.deepEqual(result[0].source,{activityId:draft.activityId,version:draft.version,manifestDigest:draft.manifestDigest,path});
 assert.equal(result[0].image?.base64,draft.files[0].base64);
 assert.equal(result[0].image?.pixelWidth,32);
 assert.equal(result[0].image?.pixelHeight,32);
 assert.deepEqual(draft,before);
});
test("stored verification marker never authorizes altered bytes or declarations",async()=>{
 const {draft,refs}=await source();
 draft.files[0].base64=Buffer.from("not webp").toString("base64");
 const corrupt=(await resolveOriginalImages(refs,[draft]))[0];
 assert.equal(corrupt.state,"MISSING");assert.equal(corrupt.image,undefined);
 const fresh=await source();
 fresh.draft.manifest.assets[0].sha256="a".repeat(64);
 assert.equal((await resolveOriginalImages(fresh.refs,[fresh.draft]))[0].state,"MISSING");
});
test("does not substitute a similar image, and audio remains unsupported",async()=>{
 const {draft,refs}=await source();
 const other:ConversationRevision["assets"]=[{...refs[0],sha256:"f".repeat(64)},{id:"narration",kind:"AUDIO",sha256:refs[0].sha256}];
 assert.deepEqual((await resolveOriginalImages(other,[draft])).map(x=>x.state),["MISSING","UNSUPPORTED"]);
 assert.equal((await resolveOriginalImages(refs,[]))[0].state,"MISSING");
});
test("falls through corrupt versions to the same original bytes in another archive",async()=>{
 const {draft,refs}=await source(),bad=structuredClone(draft);
 bad.files[0].base64="AA==";bad.version="0.2.0-draft";
 assert.equal((await resolveOriginalImages(refs,[bad,draft]))[0].source?.version,"0.1.0-draft");
});

test("malformed declarations cannot hide an intact original in a later archive",async()=>{
 const {draft,refs}=await source();const bad=structuredClone(draft);
 bad.manifest.assets=[null] as unknown as ActivityDraft["manifest"]["assets"];
 assert.equal((await resolveOriginalImages(refs,[bad,draft]))[0].state,"VERIFIED_LOCAL");
 assert.equal((await resolveOriginalImages(refs,[bad]))[0].state,"MISSING");
});
