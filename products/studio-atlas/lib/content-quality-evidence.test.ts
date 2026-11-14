import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {verifyPinnedQualityAssets,resolveActivityTechnicalEvidence,type AssetPin} from "./content-quality-evidence";
import {activityQualityProgress} from "./content-quality-progress";
import type {ActivityDraft} from "./activity-drafts";
const b=Buffer.from("original"),sha=createHash("sha256").update(b).digest("hex");
const pin:AssetPin={path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",bytes:b.length,sha256:sha};
function fixture():ActivityDraft{
 return {activityId:"trama-missione-118-2026",version:"0.3.0-draft",manifestDigest:"407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395",key:"fixture",status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-13T00:00:00Z",source:{kind:"LOCAL_ZIP",archiveDigest:"b93b17206425ecb961c02942feb781f9162006d3bc096a7d6e47e3b4415cc787",manifestPath:"content/staging/missione-118/intake.json"},manifest:{title:"test",kind:"test",assets:[{id:"experience",path:pin.path,type:pin.type,sha256:sha}],experience:{entrypoint:pin.path}},files:[{path:pin.path,type:pin.type,format:pin.format,sha256:sha,base64:b.toString("base64")}]};
}
test("verify actual bytes, not claimed digest or local markers",async()=>{
 const d=fixture();assert.equal(await verifyPinnedQualityAssets(d,[pin]),true);
 d.files[0].base64=Buffer.from("tampered").toString("base64");assert.equal(await verifyPinnedQualityAssets(d,[pin]),false);
 const other=fixture();other.manifest.assets[0].sha256="0".repeat(64);assert.equal(await verifyPinnedQualityAssets(other,[pin]),false);
});
test("missing, duplicate, invalid format and extra assets fail closed",async()=>{
 const d=fixture();d.files.push(d.files[0]);assert.equal(await verifyPinnedQualityAssets(d,[pin]),false);
 const f=fixture();f.files[0].format="image/webp";assert.equal(await verifyPinnedQualityAssets(f,[pin]),false);
 assert.equal(await verifyPinnedQualityAssets(fixture(),[pin,pin]),false);
 assert.equal(await verifyPinnedQualityAssets({...fixture(),files:[]},[pin]),false);
});
test("a forged V7 identity with unrelated content cannot inherit evidence",async()=>{
 assert.deepEqual(await resolveActivityTechnicalEvidence(fixture()),[]);
 assert.deepEqual(await resolveActivityTechnicalEvidence({...fixture(),version:"0.4.0-draft"}),[]);
});
test("technical evidence does not replace final product test or human review",()=>{
 const d=fixture(),r=activityQualityProgress(d,[{...d,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},{...d,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},{...d,check:"VOICE_LISTEN",mode:"HUMAN",decision:"PASS",reference:"not-authoritative"}]);
 const all=r.steps.flatMap(s=>s.items);
 assert.equal(all.find(i=>i.id==="ASSET_INTEGRITY")?.decision,"PASS");
 assert.equal(all.find(i=>i.id==="BROWSER_SMOKE")?.decision,"PASS");
 assert.equal(all.find(i=>i.id==="INTEGRITY")?.decision,"PENDING");
 assert.equal(all.find(i=>i.id==="VOICE_LISTEN")?.decision,"PENDING");
 assert.equal(r.next?.id,"PURPOSE");assert.equal(r.publicationAuthorized,false);
});

test("V9 identity alone cannot inherit technical evidence",async()=>{
 const d=fixture();d.version="0.4.1-draft";d.manifestDigest="1b00cf15c4dc7a54e805489f631b4d7135a3f50e3fd8ec5ee2267d6fd849d990";
 d.source={kind:"LOCAL_ZIP",archiveDigest:"ab2c5a6b48ccb2aa2196c1a91e9aa7452ea36390e98463f7f495c4d709af684e",manifestPath:"intake.json"};
 assert.deepEqual(await resolveActivityTechnicalEvidence(d),[]);
});
