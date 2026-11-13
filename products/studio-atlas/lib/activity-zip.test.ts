import { test } from "node:test";
import assert from "node:assert/strict";
import { crc32, deflateRawSync } from "node:zlib";
import { prepareZipDraft, readActivityZip } from "./activity-zip";
import { sha256 } from "./activity-intake";

function zip(entries: [string,Buffer][],method=8) {
  const locals:Buffer[]=[], central:Buffer[]=[];
  let offset=0;
  for(const [name,bytes] of entries) {
    const n=Buffer.from(name), data=method===8?deflateRawSync(bytes):bytes, crc=crc32(bytes);
    const l=Buffer.alloc(30), c=Buffer.alloc(46);
    l.writeUInt32LE(0x04034b50); l.writeUInt16LE(20,4);l.writeUInt16LE(method,8);
    l.writeUInt32LE(crc,14);l.writeUInt32LE(data.length,18);l.writeUInt32LE(bytes.length,22);l.writeUInt16LE(n.length,26);
    c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(method,10);
    c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);
    locals.push(l,n,data);central.push(c,n);offset+=l.length+n.length+data.length;
  }
  const dir=Buffer.concat(central),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(dir.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,dir,end]);
}
const html=Buffer.from('<!doctype html><html lang="it"><head></head><body>Prova</body></html>');
const manifest=()=>({contract:"trama.activity-intake/v0.1",activityId:"edutwin-prova",version:"0.1.1-draft",title:"Prova",kind:"INTERACTIVE_SIMULATION",
  assets:[{id:"experience",path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",sha256:sha256(html),bytes:html.length}],
  experience:{entrypoint:"experience.html",entrypointSha256:sha256(html),embeddedImagesCount:0,learnerPersonalData:false,telemetry:false,trustPolicy:"ISOLATED_HTML_SANDBOX_REQUIRED"},
  learning:{arenaObjectiveRefs:[],udaRefs:[],arenaCurricoloVersionRef:null},
  review:{status:"DRAFT_PENDING_HUMAN_REVIEW",rights:"PENDING"},
  authorization:{atlasPublished:false,studentRuntimeAllowed:false,docenteOsWriteAllowed:false,autoMergeAllowed:false}});
function fixture(m=manifest(), extra:[string,Buffer][]=[]):[string,Buffer][] {
  const root="content/staging/prova/";
  return [[root+"intake.json",Buffer.from(JSON.stringify(m))],[root+"experience.html",html],...extra];
}
test("ZIP draft preserves verified content and never publishes",()=>{
  const result=prepareZipDraft(zip(fixture()));
  assert.equal(result.verified,1);assert.equal(result.draft.status,"DRAFT_PENDING_HUMAN_REVIEW");
  assert.equal(result.draft.source.kind,"LOCAL_ZIP");assert.equal(result.draft.files[0].base64,html.toString("base64"));
});
test("stored ZIP entries work",()=>assert.equal(prepareZipDraft(zip(fixture(),0)).verified,1));
test("traversal, duplicates, unknown assets rejected",()=>{
  for(const path of ["../escape","content/staging/prova/experience.html","extra.txt"])
    assert.throws(()=>prepareZipDraft(zip(fixture(manifest(),[[path,Buffer.from("x")]]))));
});
test("authority tampering rejected",()=>{
  const m=manifest();m.authorization.atlasPublished=true;
  assert.throws(()=>prepareZipDraft(zip(fixture(m))));
});
test("asset tampering rejected",()=>{
  const entries=fixture();entries[1][1]=Buffer.from("changed");
  assert.throws(()=>prepareZipDraft(zip(entries)));
});
test("missing and multiple manifests rejected",()=>{
  assert.throws(()=>prepareZipDraft(zip([["experience.html",html]])));
  assert.throws(()=>prepareZipDraft(zip(fixture(manifest(),[["intake.json",Buffer.from("{}")]]))));
});
test("invalid or trailing archive rejected",()=>{
  assert.throws(()=>readActivityZip(Buffer.from("not a ZIP")));
  assert.throws(()=>readActivityZip(Buffer.concat([zip(fixture()),Buffer.from("x")])));
});
test("oversize uncompressed member rejected",()=>{
  assert.throws(()=>readActivityZip(zip([["huge.bin",Buffer.alloc(4*1024*1024+1)]])));
});
test("invalid review and learner data declarations rejected",()=>{
  const m=manifest();m.review.rights="APPROVED";assert.throws(()=>prepareZipDraft(zip(fixture(m))));
  const n=manifest();n.experience.learnerPersonalData=true;assert.throws(()=>prepareZipDraft(zip(fixture(n))));
});

test("missing embedded profile and non-draft version rejected",()=>{
  const m=manifest();m.experience.embeddedImagesCount=1;assert.throws(()=>prepareZipDraft(zip(fixture(m))));
  const n=manifest();n.version="0.1.1";assert.throws(()=>prepareZipDraft(zip(fixture(n))));
});
