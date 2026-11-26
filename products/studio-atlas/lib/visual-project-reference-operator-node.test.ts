import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp,readFile,writeFile,rm,mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash,generateKeyPairSync,sign } from "node:crypto";
import sharp from "sharp";
import { createAgricultureDraft } from "./canonical/agriculture";
import manifest from "../public/design/ess-02/r2b/manifest.json";
import type { SceneIllustration } from "./model";
import { createProjectSourceCandidate } from "./visual-project-source";
import { approveProjectSourceFile,inspectProjectSourceCandidate } from "./visual-project-source-operator-node";
import { planProjectVisualReferences } from "./visual-project-profile";
import { canonicalDigest } from "./visual-preflight";
import { runApprovedProjectReference,prepareApprovedProjectReference } from "./visual-project-reference-operator-node";

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
async function proofFixture(dir:string,opts:Awaited<ReturnType<typeof fixture>>,changes:Record<string,unknown>={}){
 const {privateKey,publicKey}=generateKeyPairSync("ed25519");
 const ledger=join(dir,"ledger");await mkdir(ledger,{recursive:true});
 const source=Buffer.from("SYNTHETIC TEST EVIDENCE — NOT A REAL PROVIDER PLAN");
 const sourcePath=join(dir,"source.txt"),keyPath=join(dir,"verifier.pem"),proofPath=join(dir,"proof.json");
 await writeFile(sourcePath,source);
 await writeFile(keyPath,publicKey.export({type:"spki",format:"pem"}));
 const digest=(b:string|Buffer)=>createHash("sha256").update(b).digest("hex");
 const prepared=await prepareApprovedProjectReference(opts.approvalFile,opts.reviewedPlanDigest,opts.jobId);
 const payload={schemaVersion:"atlas.visual-free-execution-proof/v0.1",provider:"CLOUDFLARE_WORKERS_AI",
  model:"@cf/black-forest-labs/flux-2-klein-4b",accountId:free.CLOUDFLARE_ACCOUNT_ID,credentialSha256:digest(free.CLOUDFLARE_API_TOKEN),
  scopedPlanDigest:prepared.scopedPlanDigest,verifiedPlan:"FREE",hardPaidOverageBlocked:true,maxCalls:1,remainingFreeUnits:1000,requiredFreeUnits:100,
  sourceSha256:digest(source),issuedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+120000).toISOString(),...changes};
 await writeFile(proofPath,JSON.stringify({payload,signature:sign(null,Buffer.from(canonicalDigest(payload)),privateKey).toString("base64")}));
 return {...free,VISUAL_FACTORY_FREE_PROOF_FILE:proofPath,VISUAL_FACTORY_FREE_PROOF_SOURCE_FILE:sourcePath,
  VISUAL_FACTORY_FREE_VERIFIER_PUBLIC_KEY_FILE:keyPath,VISUAL_FACTORY_FREE_VERIFIER_KEY_SHA256:digest(publicKey.export({type:"spki",format:"der"})),
  VISUAL_FACTORY_FREE_PROOF_LEDGER_DIR:ledger};
}
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
  const admitted=await proofFixture(dir,opts);
  const evidence=await runApprovedProjectReference(opts,admitted,fetcher);
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
  const quota=await runApprovedProjectReference(opts,await proofFixture(dir,opts),async()=>new Response("quota",{status:429}));
  assert.equal(quota.status,"WAITING_FOR_COMPUTE");
  assert.equal(quota.providerCallCount,1);
  assert.equal(quota.asset,null);
  const bad=await runApprovedProjectReference({...opts,outputDir:join(dir,"bad")},await proofFixture(dir,opts),async()=>Response.json({result:{image:Buffer.from("not an image").toString("base64")}}));
  assert.equal(bad.status,"FAILED");
  assert.equal(bad.asset,null);
  assert.equal(bad.providerCallCount,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test("F3.4a1c-R1 flags alone, invalid/expired proofs, changed credentials and replay never reach provider",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"visual-project-proof-"));
 try{
  const opts=await fixture(dir);let calls=0;
  const transport:typeof fetch=async()=>{calls++;return new Response("quota",{status:429});};
  const run=async(label:string,env:Record<string,string>)=>runApprovedProjectReference({...opts,outputDir:join(dir,label)},env,transport);
  assert.equal((await run("flags",free)).providerCallCount,0);
  for(const [label,changes] of Object.entries({account:{accountId:"other"},credential:{credentialSha256:"0".repeat(64)},scope:{scopedPlanDigest:"0".repeat(64)},paid:{verifiedPlan:"PAID"},overage:{hardPaidOverageBlocked:false},quota:{remainingFreeUnits:0},expired:{expiresAt:new Date(Date.now()-1).toISOString()},long:{expiresAt:new Date(Date.now()+3600000).toISOString()},multiple:{maxCalls:2}})){
   const result=await run(label,await proofFixture(dir,opts,changes));
   assert.equal(result.status,"WAITING_FOR_COMPUTE",label);assert.equal(result.providerCallCount,0,label);
  }
  const valid=await proofFixture(dir,opts);
  assert.equal((await run("changed-token",{...valid,CLOUDFLARE_API_TOKEN:"changed"})).providerCallCount,0);
  assert.equal((await run("wrong-key",{...valid,VISUAL_FACTORY_FREE_VERIFIER_KEY_SHA256:"0".repeat(64)})).providerCallCount,0);
  const proofPath=valid.VISUAL_FACTORY_FREE_PROOF_FILE;
  const envelope=JSON.parse(await readFile(proofPath,"utf8"));
  await writeFile(proofPath,JSON.stringify({...envelope,signature:"A".repeat(86)+"=="}));
  assert.equal((await run("forged",valid)).providerCallCount,0);
  await writeFile(proofPath,JSON.stringify(envelope));
  await writeFile(valid.VISUAL_FACTORY_FREE_PROOF_SOURCE_FILE,"tampered");
  assert.equal((await run("source",valid)).providerCallCount,0);
  await writeFile(valid.VISUAL_FACTORY_FREE_PROOF_SOURCE_FILE,"SYNTHETIC TEST EVIDENCE — NOT A REAL PROVIDER PLAN");
  assert.equal(calls,0);
  const results=await Promise.all([run("first",valid),run("replay",valid)]);
  assert.equal(results.reduce((n,r)=>n+r.providerCallCount,0),1);assert.equal(calls,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
