import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { PathwayProject } from "./model";
import type { VisualExecutionReceipt, VisualGenerationPlan } from "./visual-factory";
import { canonicalDigest } from "./visual-preflight";
import { planProjectVisualReferences } from "./visual-project-profile";
import { readProjectSourceFile } from "./visual-project-source-operator-node";
import { verifyApprovedProjectPlan } from "./visual-project-admission-node";
import { assertVisualPreflightBoundPlan } from "./visual-factory-execution-contract";
import { buildVisualProviderConfig } from "./visual-factory-route-config";
import { createCloudflareWorkersAiAdapter } from "./visual-factory-provider-cloudflare";
import { orchestrateVisualGeneration } from "./visual-factory-orchestrator";
import { normalizeExecutorResponse, waitingForComputeReceipt } from "./visual-factory-executor";

type Env = Readonly<Record<string,string|undefined>>;
type Options = { approvalFile:string; reviewedPlanDigest:string; jobId:string; outputDir:string; execute:boolean };
const MAX_IMAGE_BYTES=10*1024*1024;

export async function prepareApprovedProjectReference(approvalFile:string,reviewedPlanDigest:string,jobId:string) {
  const raw=await readProjectSourceFile(approvalFile) as {project?:PathwayProject;packageDigest?:string;planDigest?:string};
  if(!raw?.project || typeof raw.packageDigest!=="string" || !/^[a-f0-9]{64}$/.test(reviewedPlanDigest) ||
     raw.planDigest!==reviewedPlanDigest) throw Error("PROJECT_EXECUTION_REVIEW_MISMATCH");
  const full=planProjectVisualReferences(raw.project,raw.packageDigest,true).references;
  if(await verifyApprovedProjectPlan(full,raw)!=="PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED" ||
     canonicalDigest(full)!==reviewedPlanDigest || !full.profileDigest) throw Error("PROJECT_EXECUTION_SOURCE_INVALID");
  const matches=full.jobs.filter(job=>job.jobId===jobId);
  const job=matches[0];
  if(matches.length!==1 || !job || job.purpose!=="ENVIRONMENT_REFERENCE" || !job.subjectRef ||
     job.maxVariants!==1 || job.referenceInputs.length!==0 || (job.referenceInputDigests?.length??0)!==0 ||
     job.aspectRatio!=="16:9") throw Error("PROJECT_EXECUTION_JOB_INVALID");
  const plan:VisualGenerationPlan={...full,jobs:[job]};
  assertVisualPreflightBoundPlan(plan);
  return {plan,reviewedPlanDigest,scopedPlanDigest:canonicalDigest(plan),revision:raw.project.revision};
}

async function validateImage(receipt:VisualExecutionReceipt,plan:VisualGenerationPlan) {
  const asset=receipt.assets[0],job=plan.jobs[0];
  if(receipt.orchestration?.selectedProvider!=="CLOUDFLARE_WORKERS_AI" ||
     receipt.assets.length!==1 || !asset || asset.subjectRef!==job.subjectRef ||
     asset.purpose!==job.purpose || asset.modelRef!=="@cf/black-forest-labs/flux-2-klein-4b" ||
     asset.workflowRef!=="cloudflare-workers-ai.flux2-klein-4b/v0.1") throw Error("PROJECT_ASSET_BINDING_INVALID");
  const match=/^data:image\/png;base64,([A-Za-z0-9+/=\r\n]+)$/.exec(asset.url);
  if(!match || match[1].length>Math.ceil(MAX_IMAGE_BYTES/3)*4+1024) throw Error("PROJECT_ASSET_SIZE_INVALID");
  const bytes=Buffer.from(match[1],"base64");
  if(!bytes.length || bytes.length>MAX_IMAGE_BYTES ||
     createHash("sha256").update(bytes).digest("hex")!==asset.sha256) throw Error("PROJECT_ASSET_DIGEST_INVALID");
  const image=sharp(bytes,{limitInputPixels:2_000_000,failOn:"error"});
  const meta=await image.metadata();
  if(!["png","jpeg","webp"].includes(meta.format??"") || meta.width!==1024 || meta.height!==576 ||
     (meta.pages??1)!==1) throw Error("PROJECT_ASSET_FORMAT_INVALID");
  await image.raw().toBuffer();
  const format=meta.format==="jpeg"?"jpg":meta.format;
  return {bytes,filename:"candidate."+format,mime:meta.format==="jpeg"?"image/jpeg":"image/"+meta.format,width:meta.width,height:meta.height};
}

/** Operator-only path. HTTP admission remains blocked. No network by default.
 * The operator must verify the actual free plan/quota before setting the gate.
 * An exclusive output directory preserves each attempt; no automatic retry. */
export async function runApprovedProjectReference(options:Options,env:Env,fetchImpl:typeof fetch=fetch) {
  const prepared=await prepareApprovedProjectReference(options.approvalFile,options.reviewedPlanDigest,options.jobId);
  const {plan}=prepared;
  await mkdir(options.outputDir,{mode:0o700});
  const save=(name:string,value:unknown)=>writeFile(join(options.outputDir,name),JSON.stringify(value,null,2)+"\n",{flag:"wx",mode:0o600});
  await save("request.json",{...prepared,mode:options.execute?"EXECUTE":"PREPARE",provider:"CLOUDFLARE_WORKERS_AI",
    paidComputeAuthorized:false,runtimeAuthorized:false,publicationAuthorityGranted:false});
  const config=buildVisualProviderConfig(env);
  const enabled=options.execute===true && env.VISUAL_FACTORY_PROJECT_REFERENCE_EXECUTION==="true" &&
    config.cloudflare?.workersFreeAdmitted===true && !!config.cloudflare.token && !!config.cloudflare.accountId;
  let providerCallCount=0;
  let receipt:VisualExecutionReceipt;
  if(!enabled) receipt=waitingForComputeReceipt(plan.packageDigest,options.execute?"PROJECT_FREE_PROVIDER_NOT_ADMITTED":"PROJECT_PREPARE_ONLY");
  else {
    const adapter=createCloudflareWorkersAiAdapter(config.cloudflare!,{fetchImpl:async (input,init)=>{
      if(providerCallCount!==0) throw Error("PROJECT_EXECUTION_CALL_LIMIT");
      providerCallCount++;
      return fetchImpl(input,init);
    }});
    const result=await orchestrateVisualGeneration(plan,{CLOUDFLARE_WORKERS_AI:adapter},{
      unfinishedCanonicalReferenceCount:0,hfConfiguredFloorSeconds:config.hfConfiguredFloorSeconds,hfSafetyMarginSeconds:config.hfSafetyMarginSeconds});
    receipt=normalizeExecutorResponse(result,plan.packageDigest);
  }
  receipt={...receipt,profileDigest:plan.profileDigest};
  let assetFile:null|{file:string;sha256:string;width:number;height:number}=null;
  if(receipt.status==="SUCCEEDED"){
    try {
      const image=await validateImage(receipt,plan);
      const asset=receipt.assets[0];
      await writeFile(join(options.outputDir,image.filename),image.bytes,{flag:"wx",mode:0o600});
      assetFile={file:image.filename,sha256:asset.sha256,width:image.width,height:image.height};
      receipt.assets=[{...asset,url:"data:"+image.mime+";base64,"+image.bytes.toString("base64")}];
    } catch {
      receipt={...receipt,status:"FAILED",assets:[],orchestration:undefined,failureCategory:"INVALID_EXECUTOR_RESPONSE",failureDetail:"PROJECT_ASSET_VALIDATION_FAILED"};
    }
  }
  if(receipt.status!=="SUCCEEDED") receipt={...receipt,assets:[]};
  await save("receipt.json",receipt);
  const evidence={schemaVersion:"atlas.visual-project-reference-evidence/v0.1",pathwayId:plan.pathwayId,
    revision:prepared.revision,reviewedPlanDigest:prepared.reviewedPlanDigest,scopedPlanDigest:prepared.scopedPlanDigest,
    packageDigest:plan.packageDigest,profileDigest:plan.profileDigest,jobId:options.jobId,providerCallCount,
    status:receipt.status,asset:assetFile,licenseVerification:"PENDING",humanReview:"PENDING",
    actualCostVerification:"PENDING",paidComputeAuthorized:false,runtimeAuthorized:false,publicationAuthorityGranted:false};
  await save("evidence.json",evidence);
  return evidence;
}
