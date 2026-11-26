import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { POST } from "../app/api/visual-factory/execute/route";
import { createAgricultureDraft } from "./canonical/agriculture";
import manifest from "../public/design/ess-02/r2b/manifest.json";
import type { SceneIllustration } from "./model";
import { digestAuthoringState } from "./production";
import { canonicalDigest } from "./visual-preflight";
import { planProjectVisualReferences } from "./visual-project-profile";
import { PROJECT_APPROVAL_SCHEMA, verifyApprovedProjectPlan, checkServerProjectPlan } from "./visual-project-admission-node";

async function fixture() {
  const images: Record<string, SceneIllustration> = Object.fromEntries(manifest.scenes.map(item =>
    [item.sceneId, {sha256:item.sha256,pixelWidth:item.width,pixelHeight:item.height,base64:"",alt:item.alt}]));
  const project = createAgricultureDraft(images);
  const packageDigest = await digestAuthoringState(project);
  const plan = planProjectVisualReferences(project, packageDigest, true).references;
  assert.equal(plan.decision, "REFERENCE_GENERATION_READY");
  const approval = {schemaVersion:PROJECT_APPROVAL_SCHEMA,
    decision:"APPROVED_FOR_REFERENCE_PLAN_QUALIFICATION", project,
    projectDigest:canonicalDigest(project), packageDigest, planDigest:canonicalDigest(plan)};
  return {plan,approval};
}
test("F3.4a1 server-approved agriculture snapshot reconstructs exact plan but grants no execution", async () => {
  const {plan,approval} = await fixture();
  assert.equal(plan.jobs.length,5);
  assert.equal(await verifyApprovedProjectPlan(plan,approval),"PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED");
  assert.equal(plan.paidComputeAuthorized,false);
  assert.equal(plan.runtimeAuthorized,false);
  assert.equal(plan.publicationAuthorityGranted,false);
});
test("F3.4a1 modified request, profile, prompt, revision, approval and authorities fail closed", async () => {
  const {plan,approval} = await fixture();
  for (const mutation of [
    {...plan,profileDigest:"b".repeat(64)},
    {...plan,packageDigest:"b".repeat(64)},
    {...plan,jobs:plan.jobs.slice(0,1)},
    {...plan,paidComputeAuthorized:true},
    {...plan,jobs:plan.jobs.map(job=>({...job,prompt:job.prompt+" changed"}))},
  ]) assert.equal(await verifyApprovedProjectPlan(mutation as typeof plan,approval),"PROJECT_PLAN_MISMATCH");
  for (const mutation of [
    {...approval,decision:"PENDING"},
    {...approval,project:{...approval.project,revision:approval.project.revision+1}},
    {...approval,planDigest:"b".repeat(64)},
    {...approval,executionAuthorized:true},
  ]) assert.equal(await verifyApprovedProjectPlan(plan,mutation),"PROJECT_SOURCE_INVALID");
  assert.equal(await verifyApprovedProjectPlan({...plan,planType:"SHOT_GENERATION"},approval),"PROJECT_PLAN_MISMATCH");
  assert.equal(await verifyApprovedProjectPlan({...plan,pathwayId:"pw-strategy-selection-01-museo-zero"},approval),"PROJECT_SOURCE_INVALID");
});
test("F3.4a1 generic HTTP route cannot reach providers even with exact persisted approval", async () => {
  const {plan,approval}=await fixture();
  const dir=await mkdtemp(join(tmpdir(),"visual-project-admission-"));
  const file=join(dir,"approval.json");
  const previous=process.env.VISUAL_FACTORY_PROJECT_APPROVAL_FILE;
  const request=(body:unknown)=>POST(new Request("http://localhost/api/visual-factory/execute",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}));
  try {
    delete process.env.VISUAL_FACTORY_PROJECT_APPROVAL_FILE;
    const missing=await request(plan);
    assert.equal(missing.status,409);
    assert.deepEqual(await missing.json(),{error:"PROJECT_SOURCE_UNAVAILABLE",executionAuthorized:false,providerCallCount:0});
    assert.equal(await checkServerProjectPlan(plan,file),"PROJECT_SOURCE_UNAVAILABLE");
    await writeFile(file,JSON.stringify(approval));
    process.env.VISUAL_FACTORY_PROJECT_APPROVAL_FILE=file;
    const exact=await request(plan);
    assert.equal(exact.status,409);
    assert.deepEqual(await exact.json(),{error:"PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED",executionAuthorized:false,providerCallCount:0});
    const forged=await request({...plan,jobs:plan.jobs.map(job=>({...job,prompt:job.prompt+" changed"}))});
    assert.equal(forged.status,400);
    assert.equal((await forged.json()).error,"PROJECT_PLAN_MISMATCH");
    await writeFile(file,"not json");
    assert.equal(await checkServerProjectPlan(plan,file),"PROJECT_SOURCE_INVALID");
  } finally {
    if(previous===undefined) delete process.env.VISUAL_FACTORY_PROJECT_APPROVAL_FILE;
    else process.env.VISUAL_FACTORY_PROJECT_APPROVAL_FILE=previous;
    await rm(dir,{recursive:true,force:true});
  }
});
