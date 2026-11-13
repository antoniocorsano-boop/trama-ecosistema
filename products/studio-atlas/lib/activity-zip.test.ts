import { test } from "node:test";
import sharp from "sharp";
import assert from "node:assert/strict";
import { crc32, deflateRawSync } from "node:zlib";
import { prepareZipDraft, readActivityZip } from "./activity-zip";
import { sha256 } from "./activity-intake";
import { POST as zipPost } from "../app/api/attivita/importa/zip/route";

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
test("ZIP draft preserves verified content and never publishes",async()=>{
  const result=await prepareZipDraft(zip(fixture()));
  assert.equal(result.verified,1);assert.equal(result.draft.status,"DRAFT_PENDING_HUMAN_REVIEW");
  assert.equal(result.draft.source.kind,"LOCAL_ZIP");assert.equal(result.draft.files[0].base64,html.toString("base64"));
});
test("stored ZIP entries work",async()=>assert.equal((await prepareZipDraft(zip(fixture(),0))).verified,1));
test("traversal, duplicates, unknown assets rejected",async()=>{
  for(const path of ["../escape","content/staging/prova/experience.html","extra.txt"])
    await assert.rejects(()=>prepareZipDraft(zip(fixture(manifest(),[[path,Buffer.from("x")]]))));
});
test("authority tampering rejected",async()=>{
  const m=manifest();m.authorization.atlasPublished=true;
  await assert.rejects(()=>prepareZipDraft(zip(fixture(m))));
});
test("asset tampering rejected",async()=>{
  const entries=fixture();entries[1][1]=Buffer.from("changed");
  await assert.rejects(()=>prepareZipDraft(zip(entries)));
});
test("missing and multiple manifests rejected",async()=>{
  await assert.rejects(()=>prepareZipDraft(zip([["experience.html",html]])));
  await assert.rejects(()=>prepareZipDraft(zip(fixture(manifest(),[["intake.json",Buffer.from("{}")]]))));
});
test("invalid or trailing archive rejected",async()=>{
  assert.throws(()=>readActivityZip(Buffer.from("not a ZIP")));
  assert.throws(()=>readActivityZip(Buffer.concat([zip(fixture()),Buffer.from("x")])));
});
test("oversize uncompressed member rejected",async()=>{
  assert.throws(()=>readActivityZip(zip([["huge.bin",Buffer.alloc(4*1024*1024+1)]])));
});
test("invalid review and learner data declarations rejected",async()=>{
  const m=manifest();m.review.rights="APPROVED";await assert.rejects(()=>prepareZipDraft(zip(fixture(m))));
  const n=manifest();n.experience.learnerPersonalData=true;await assert.rejects(()=>prepareZipDraft(zip(fixture(n))));
});

test("missing embedded profile and non-draft version rejected",async()=>{
  const m=manifest();m.experience.embeddedImagesCount=1;await assert.rejects(()=>prepareZipDraft(zip(fixture(m))));
  const n=manifest();n.version="0.1.1";await assert.rejects(()=>prepareZipDraft(zip(fixture(n))));
});

test("malformed objectives are rejected before ZIP persistence",async()=>{
  for(const objectives of ["testo",[{}],[42]]){
    const m=manifest();
    Object.assign(m.learning,{objectives});
    await assert.rejects(()=>prepareZipDraft(zip(fixture(m))),/Metadati/);
  }
});
async function mediaFixture(width:number,height:number,count:number){
  const m=manifest(),root="content/staging/prova/";
  const images: [string,Buffer][]=[];
  const parts:string[]=[];
  for(let i=0;i<count;i++){
    const data=await sharp({create:{width,height,channels:3,background:{r:10+i,g:20,b:30}}}).webp({lossless:true}).toBuffer();
    const path="media/illustration-"+i+".webp";
    m.assets.push({id:"image-"+i,path,type:"IMAGE",format:"image/webp",sha256:sha256(data),bytes:data.length});
    images.push([root+path,data]);parts.push("data:image/webp;base64,"+data.toString("base64"));
  }
  const content=Buffer.from('<!doctype html><html lang="it"><head></head><body>'+parts.join(" ")+'</body></html>');
  m.assets[0].sha256=sha256(content);m.assets[0].bytes=content.length;
  m.experience.entrypointSha256=sha256(content);m.experience.embeddedImagesCount=count;
  return zip([[root+"intake.json",Buffer.from(JSON.stringify(m))],[root+"experience.html",content],...images]);
}
test("tiny compressed archive with an oversized derivative is rejected",async()=>{
  const b=await mediaFixture(4096,4096,1);assert.ok(b.length<100_000);
  await assert.rejects(()=>prepareZipDraft(b),/Dimensione/);
});
test("aggregate image pixel budget is enforced and valid 4K remains admissible",async()=>{
  const valid=await prepareZipDraft(await mediaFixture(3840,2160,1));
  assert.equal(valid.draft.files[1].pixelWidth,3840);
  const large=await mediaFixture(3840,2160,3);assert.ok(large.length<100_000);
  await assert.rejects(()=>prepareZipDraft(large),/budget pixel/);
});

test("full ZIP route streams a verified JSON response above 4.5 MB without truncating originals",async()=>{
  const content=Buffer.from('<!doctype html><html lang="it"><head></head><body>'+ "a".repeat(3_600_000) +'</body></html>');
  const m=manifest();
  m.assets[0].sha256=sha256(content);m.assets[0].bytes=content.length;
  m.experience.entrypointSha256=sha256(content);
  const archive=zip([["intake.json",Buffer.from(JSON.stringify(m))],["experience.html",content]]);
  const response=await zipPost(new Request("http://localhost/api/attivita/importa/zip",{method:"POST",headers:{"content-type":"application/zip"},body:Uint8Array.from(archive)}));
  assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");
  assert.equal(response.headers.get("content-length"),null);
  const reader=response.body!.getReader();let bytes=0,count=0;const chunks:Buffer[]=[];
  for(;;){const {done,value}=await reader.read();if(done)break;count++;bytes+=value.byteLength;chunks.push(Buffer.from(value));}
  assert.ok(bytes>4_500_000);assert.ok(count>1);
  const result=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  assert.equal(result.verified,1);assert.deepEqual(Buffer.from(result.draft.files[0].base64,"base64"),content);
  assert.equal(result.draft.status,"DRAFT_PENDING_HUMAN_REVIEW");
  assert.equal(result.draft.manifest.authorization.atlasPublished,false);
});
test("ZIP route rejects a tampered asset before sending successful response bytes",async()=>{
  const entries=fixture();entries[1][1]=Buffer.from("altered");
  const response=await zipPost(new Request("http://localhost/api/attivita/importa/zip",{method:"POST",headers:{"content-type":"application/zip"},body:Uint8Array.from(zip(entries))}));
  assert.equal(response.status,422);assert.equal((await response.json()).draft,undefined);
});
