import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import type {ActivityDraft} from "./activity-drafts";
import {previewFile,verifiedPreviewHtml} from "./activity-preview";
import {resolveActivityTechnicalEvidence} from "./content-quality-evidence";
import {activityQualityProgress,type QualityEvidence} from "./content-quality-progress";
import {prepareZipDraft} from "./activity-zip";
import {matchesV91Draft,V91_ID,V91_ARCHIVE,V91_HTML,V91_GUIDE} from "./missione118-v91";

function fixture():ActivityDraft{
 const files=[V91_HTML,V91_GUIDE].map(p=>({...p,base64:"eA=="}));
 return {...V91_ID,key:"fixture",status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-14T00:00:00Z",
  source:{kind:"LOCAL_ZIP",archiveDigest:V91_ARCHIVE,manifestPath:"intake.json"},
  manifest:{title:"test",kind:"EDUTWIN",assets:files.map((f,i)=>({id:"asset-"+i,path:f.path,type:f.type,sha256:f.sha256})),experience:{entrypoint:V91_HTML.path}},
  files};
}
test("V9.1 pins both exact HTML identities; metadata alone never executes altered bytes",async()=>{
 const d=fixture();
 assert.equal(matchesV91Draft(d),true);
 for(const kind of ["EXPERIENCE","GUIDE"] as const){
  assert.ok(previewFile(d,kind));
  await assert.rejects(()=>verifiedPreviewHtml(d,kind));
  assert.equal(previewFile({...d,manifestDigest:"0".repeat(64)},kind),undefined);
  assert.equal(previewFile({...d,version:"0.4.0-draft"},kind),undefined);
  assert.equal(previewFile({...d,source:{kind:"LOCAL_ZIP",archiveDigest:"0".repeat(64),manifestPath:"intake.json"}},kind),undefined);
  assert.equal(previewFile({...d,source:{kind:"LOCAL_ZIP",archiveDigest:V91_ARCHIVE,manifestPath:"other/intake.json"}},kind),undefined);
  assert.equal(previewFile({...d,manifest:{...d.manifest,experience:{entrypoint:"other.html"}}},kind),undefined);
 }
 assert.equal(previewFile({...d,files:[...d.files,d.files[0]]},"EXPERIENCE"),undefined);
 assert.equal(previewFile({...d,manifest:{...d.manifest,assets:d.manifest.assets.filter(a=>a.type!=="TEACHER_GUIDE")}},"GUIDE"),undefined);
 assert.deepEqual(await resolveActivityTechnicalEvidence(d),[]);
});
test("V9.1 has an exact quality plan but no automatic human or public authorization",()=>{
 const evidence:QualityEvidence[]=[
  {...V91_ID,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},
  {...V91_ID,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:"test-only"},
  {...V91_ID,check:"VOICE_TECH",mode:"TECHNICAL",decision:"PASS",reference:"not-admitted"},
  {...V91_ID,check:"VOICE_LISTEN",mode:"HUMAN",decision:"PASS",reference:"not-authenticated"}
 ];
 const q=activityQualityProgress(V91_ID,evidence);
 assert.equal(q.planBound,true);assert.equal(q.next?.id,"PURPOSE");assert.equal(q.complete,false);
 assert.equal(q.publicationAuthorized,false);assert.equal(q.voicePreparation,undefined);
 assert.equal(q.steps.flatMap(s=>s.items).filter(i=>i.decision==="PASS").length,2);
 assert.equal(activityQualityProgress({...V91_ID,manifestDigest:"0".repeat(64)},evidence).planBound,false);
});
// The exact private package is deliberately not committed or uploaded to public CI.
// Run locally with MISSIONE118_V91_ARCHIVE=/absolute/path/to/verified.zip.
const archivePath=process.env.MISSIONE118_V91_ARCHIVE;
test("private V9.1 exact bytes import, verify both previews and only two technical receipts",{skip:!archivePath},async()=>{
 const bytes=await readFile(archivePath!);
 const result=await prepareZipDraft(bytes),d=result.draft;
 assert.equal(result.verified,10);assert.ok(matchesV91Draft(d));
 assert.ok(Object.values(d.manifest.authorization??{}).every(v=>v===false));
 const html=await verifiedPreviewHtml(d,"EXPERIENCE"),guide=await verifiedPreviewHtml(d,"GUIDE");
 assert.match(html,/Content-Security-Policy/);assert.match(guide,/Content-Security-Policy/);
 const e=await resolveActivityTechnicalEvidence(d);
 assert.deepEqual(e.map(x=>x.check),["ASSET_INTEGRITY","BROWSER_SMOKE"]);
 assert.equal(activityQualityProgress(d,e).publicationAuthorized,false);
 const changed={...d,files:d.files.map(f=>f.path===V91_HTML.path?{...f,base64:"eA=="}:f)};
 await assert.rejects(()=>verifiedPreviewHtml(changed,"EXPERIENCE"));
 assert.deepEqual(await resolveActivityTechnicalEvidence(changed),[]);
});
