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
