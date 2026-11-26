import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp,readFile,writeFile,rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { createAgricultureDraft } from "./canonical/agriculture";
import manifest from "../public/design/ess-02/r2b/manifest.json";
import type { SceneIllustration } from "./model";
import { createProjectSourceCandidate } from "./visual-project-source";
import { approveProjectSourceFile,inspectProjectSourceCandidate } from "./visual-project-source-operator-node";
import { planProjectVisualReferences } from "./visual-project-profile";
import { runApprovedProjectReference } from "./visual-project-reference-operator-node";

async function fixture(dir:string){
 const images:Record<string,SceneIllustration>=Object.fromEntries(manifest.scenes.map(item=>[item.sceneId,{sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
 const project=createAgricultureDraft(images);
 const candidate=await createProjectSourceCandidate(project,true);
 const input=join(dir,"candidate.json"),approvalFile=join(dir,"approval.json");
 await writeFile(input,JSON.stringify(candidate));
 await approveProjectSourceFile(input,approvalFile,(await inspectProjectSourceCandidate(candidate)).digest);
 const plan=planProjectVisualReferences(project,candidate.packageDigest,true).references;
 return {approvalFile,reviewedPlanDigest:candidate.planDigest,jobId:plan.jobs[0].jobId,outputDir:join(dir,"run"),execute:true};
}
const free={VISUAL_FACTORY_PROJECT_REFERENCE_EXECUTION:"true",CLOUDFLARE_WORKERS_FREE_ADMITTED:"true",CLOUDFLARE_API_TOKEN:"fixture-token",CLOUDFLARE_ACCOUNT_ID:"fixture-account"};
test("F3.4a1c invalid approval, digest, job and absent gate never call provider",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"visual-project-run-"));
 try{
  const opts=await fixture(dir);
  let calls=0;
  const fetcher:typeof fetch=async()=>{calls++;throw Error("unexpected");};
  await assert.rejects(runApprovedProjectReference({...opts,reviewedPlanDigest:"0".repeat(64)},free,fetcher),/REVIEW_MISMATCH/);
  await assert.rejects(runApprovedProjectReference({...opts,jobId:"unknown"},free,fetcher),/JOB_INVALID/);
  const blocked=await runApprovedProjectReference(opts,{...free,VISUAL_FACTORY_PROJECT_REFERENCE_EXECUTION:"false"},fetcher);
  assert.equal(blocked.status,"WAITING_FOR_COMPUTE");
  assert.equal(blocked.providerCallCount,0);
  assert.equal(calls,0);
  await assert.rejects(runApprovedProjectReference(opts,free,fetcher),{code:"EEXIST"});
  const prepared=await runApprovedProjectReference({...opts,execute:false,outputDir:join(dir,"prepare")},free,fetcher);
  assert.equal(prepared.providerCallCount,0);
  assert.equal(calls,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test("F3.4a1c one reviewed reference uses actual Cloudflare adapter with fixture transport and archives checked bytes",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"visual-project-run-"));
 try{
  const opts=await fixture(dir);
  const bytes=await sharp({create:{width:1024,height:576,channels:3,background:"#6a9c55"}}).png().toBuffer();
  let calls=0;
  const fetcher:typeof fetch=async(input,init)=>{
    calls++;
    assert.match(String(input),/^https:\/\/api\.cloudflare\.com\//);
    assert.equal(init?.method,"POST");
    assert.ok(init?.body instanceof FormData);
    assert.equal(init.body.get("width"),"1024");
    assert.equal(init.body.get("height"),"576");
    return Response.json({result:{image:bytes.toString("base64")}});
  };
  const evidence=await runApprovedProjectReference(opts,free,fetcher);
  assert.equal(evidence.status,"SUCCEEDED");
  assert.equal(calls,1);
  assert.equal(evidence.providerCallCount,1);
  assert.equal(evidence.asset?.sha256,createHash("sha256").update(bytes).digest("hex"));
  assert.deepEqual(await readFile(join(opts.outputDir,"candidate.png")),bytes);
  const receipt=JSON.parse(await readFile(join(opts.outputDir,"receipt.json"),"utf8"));
  assert.equal(receipt.profileDigest,evidence.profileDigest);
  assert.equal(receipt.orchestration.workloadClass,"PROJECT_REFERENCE");
  assert.deepEqual(receipt.orchestration.consideredProviders,["CLOUDFLARE_WORKERS_AI"]);
  assert.equal(evidence.licenseVerification,"PENDING");
  assert.equal(evidence.actualCostVerification,"PENDING");
  assert.equal(evidence.publicationAuthorityGranted,false);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test("F3.4a1c quota exhaustion and corrupt image cannot produce candidates",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"visual-project-run-"));
 try{
  const opts=await fixture(dir);
  const quota=await runApprovedProjectReference(opts,free,async()=>new Response("quota",{status:429}));
  assert.equal(quota.status,"WAITING_FOR_COMPUTE");
  assert.equal(quota.providerCallCount,1);
  assert.equal(quota.asset,null);
  const bad=await runApprovedProjectReference({...opts,outputDir:join(dir,"bad")},free,async()=>Response.json({result:{image:Buffer.from("not an image").toString("base64")}}));
  assert.equal(bad.status,"FAILED");
  assert.equal(bad.asset,null);
  assert.equal(bad.providerCallCount,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
