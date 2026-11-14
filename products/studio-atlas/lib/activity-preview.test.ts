import { test } from "node:test";
import assert from "node:assert/strict";
import { previewFile, verifiedPreviewHtml } from "./activity-preview";
import type { ActivityDraft } from "./activity-drafts";
const sha="18468a82b020ff106c2281d24304570b9e7efb17f25e5eebd6af766764be173b";
const fixture=():ActivityDraft=>({key:"test",activityId:"trama-missione-118-luce-giusta",version:"0.1.1-draft",
  manifestDigest:"765d7885dd457a90afdb0aadd6b31ae95b286160b140a41f7d9d007a786cd977",
  manifest:{title:"Test",kind:"INTERACTIVE_SIMULATION",assets:[{path:"experience.html",type:"INTERACTIVE_HTML",id:"experience",sha256:sha}],experience:{entrypoint:"experience.html"}},
  source:{kind:"LOCAL_ZIP",archiveDigest:"a4a6ea4727eedbce6e1d56b6cb08246a8dcff3faecabf9f48e1d6bfb69d1ba77",manifestPath:"intake.json"},
  files:[{path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",sha256:sha,base64:Buffer.from("<html>alterato</html>").toString("base64")}],
  status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-13"});
test("only the pinned media source and declared entrypoint are eligible",()=>{
  const d=fixture();assert.ok(previewFile(d,"EXPERIENCE"));
  assert.equal(previewFile({...d,manifestDigest:"0".repeat(64)},"EXPERIENCE"),undefined);
  assert.equal(previewFile({...d,manifest:{...d.manifest,experience:{entrypoint:"other.html"}}},"EXPERIENCE"),undefined);
  assert.equal(previewFile(d,"GUIDE"),undefined);
});
test("forged metadata cannot execute altered bytes",async()=>{
  await assert.rejects(()=>verifiedPreviewHtml(fixture(),"EXPERIENCE"));
});
test("unknown ZIP and unknown GitHub revision do not get an HTML preview",()=>{
  const d=fixture();
  assert.equal(previewFile({...d,activityId:"different"},"EXPERIENCE"),undefined);
  assert.equal(previewFile({...d,source:{repository:"other/repo",pullRequest:84,commitSha:"x",manifestPath:"intake.json"}},"EXPERIENCE"),undefined);
});

test("strict header rejects fake head and pre-head script",async()=>{
  const {isolatedHtml}=await import("./activity-drafts");
  for(const html of ["<!-- <head> --><html><head></head></html>","<!doctype html><html><script></script><head></head></html>"]){
    assert.throws(()=>isolatedHtml(html,true));
  }
});

test("V9 preview is limited to the exact local archive and both pinned resources",async()=>{
  const d=fixture();
  d.activityId="trama-missione-118-2026";d.version="0.4.1-draft";
  d.manifestDigest="1b00cf15c4dc7a54e805489f631b4d7135a3f50e3fd8ec5ee2267d6fd849d990";
  d.source={kind:"LOCAL_ZIP",archiveDigest:"ab2c5a6b48ccb2aa2196c1a91e9aa7452ea36390e98463f7f495c4d709af684e",manifestPath:"intake.json"};
  d.files[0].sha256="9ae45c2c54e39306f4b0a138d14ec98257205bd65ce50326175292548a60e4ba";d.manifest.assets[0].sha256="9ae45c2c54e39306f4b0a138d14ec98257205bd65ce50326175292548a60e4ba";
  d.files.push({path:"teacher/guida_docente.html",type:"TEACHER_GUIDE",format:"text/html",sha256:"a6d8f907d44dcd4061cb3c1cd2ee8147de8bc510b0db5563c9a8fd878c7d2fb3",base64:"eA=="});
  d.manifest.assets.push({id:"guide",path:"teacher/guida_docente.html",type:"TEACHER_GUIDE",sha256:"a6d8f907d44dcd4061cb3c1cd2ee8147de8bc510b0db5563c9a8fd878c7d2fb3"});
  for(const kind of ["EXPERIENCE","GUIDE"] as const){
    assert.ok(previewFile(d,kind));
    assert.equal(previewFile({...d,version:"0.4.0-draft"},kind),undefined);
    assert.equal(previewFile({...d,manifestDigest:"0".repeat(64)},kind),undefined);
    assert.equal(previewFile({...d,source:{...d.source,archiveDigest:"0".repeat(64)}},kind),undefined);
    assert.equal(previewFile({...d,source:{...d.source,manifestPath:"other/intake.json"}},kind),undefined);
    await assert.rejects(()=>verifiedPreviewHtml(d,kind));
  }
  assert.equal(previewFile({...d,files:[...d.files,d.files[0]]},"EXPERIENCE"),undefined);
  assert.equal(previewFile({...d,manifest:{...d.manifest,assets:d.manifest.assets.filter(a=>a.type!=="TEACHER_GUIDE")}},"GUIDE"),undefined);
});
