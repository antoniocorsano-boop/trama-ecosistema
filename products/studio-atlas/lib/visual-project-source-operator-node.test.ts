import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createAgricultureDraft } from "./canonical/agriculture";
import manifest from "../public/design/ess-02/r2b/manifest.json";
import type { SceneIllustration } from "./model";
import { createProjectSourceCandidate, PROJECT_CANDIDATE_SCHEMA } from "./visual-project-source";
import { approveProjectSourceFile, inspectProjectSourceCandidate } from "./visual-project-source-operator-node";
import { planProjectVisualReferences } from "./visual-project-profile";
import { checkServerProjectPlan, verifyApprovedProjectPlan } from "./visual-project-admission-node";
import { digestAuthoringState } from "./production";

function fixture(){
 const images:Record<string,SceneIllustration>=Object.fromEntries(manifest.scenes.map(item=>[item.sceneId,{sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
 return createAgricultureDraft(images);
}
test("F3.4a1b candidate needs explicit confirmation and preserves authoring identity, not approval",async()=>{
 const project=fixture();
 await assert.rejects(createProjectSourceCandidate(project,false),/PROJECT_CONFIRMATION_REQUIRED/);
 const before=JSON.stringify(project);
 const candidate=await createProjectSourceCandidate(project,true);
 assert.equal(JSON.stringify(project),before);
 assert.equal(candidate.schemaVersion,PROJECT_CANDIDATE_SCHEMA);
 assert.equal(candidate.decision,"PENDING_OPERATOR_REVIEW");
 assert.equal(candidate.packageDigest,await digestAuthoringState(project));
 const plan=planProjectVisualReferences(project,candidate.packageDigest,true).references;
 assert.equal(await verifyApprovedProjectPlan(plan,candidate),"PROJECT_SOURCE_INVALID");
 for(const bad of [{...candidate,decision:"APPROVED_FOR_REFERENCE_PLAN_QUALIFICATION"},{...candidate,planDigest:"0".repeat(64)},{...candidate,project:{...candidate.project,revision:project.revision+1}},{...candidate,executionAuthorized:true}]){
  await assert.rejects(inspectProjectSourceCandidate(bad),/PROJECT_SOURCE_INVALID/);
 }
});
test("F3.4a1b operator review guard, exclusive write and existing server verification",async()=>{
 const candidate=await createProjectSourceCandidate(fixture(),true);
 const {digest}=await inspectProjectSourceCandidate(candidate);
 const dir=await mkdtemp(join(tmpdir(),"visual-source-"));
 const input=join(dir,"candidate.json"), output=join(dir,"approval.json");
 try {
  await writeFile(input,JSON.stringify(candidate));
  await assert.rejects(approveProjectSourceFile(input,output,"0".repeat(64)),/PROJECT_REVIEW_DIGEST_MISMATCH/);
  await assert.rejects(readFile(output),{code:"ENOENT"});
  const receipt=await approveProjectSourceFile(input,output,digest);
  assert.equal(receipt.executionAuthorized,false);
  assert.equal(receipt.providerCallCount,0);
  const plan=planProjectVisualReferences(candidate.project,candidate.packageDigest,true).references;
  assert.equal(await checkServerProjectPlan(plan,output),"PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED");
  await assert.rejects(approveProjectSourceFile(input,output,digest),{code:"EEXIST"});
  assert.equal(await checkServerProjectPlan(plan,input),"PROJECT_SOURCE_INVALID");
 } finally {await rm(dir,{recursive:true,force:true});}
});
