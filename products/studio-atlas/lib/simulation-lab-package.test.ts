import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {verifyLabPackage,parseLabPackage} from "./simulation-lab-package";
const html="<!doctype html><title>Laboratorio</title>";
const fixture={html,receipt:{schema:"atlas.simulation-lab/v0.1",id:"gear",status:"TEACHER_REVIEW_REQUIRED",engine:"three-r128",objective:"Obiettivo",question:"Domanda",sourceKind:"editable-teaching-model",sourceBlob:"a".repeat(40),templateBlob:"b".repeat(40),engineBlob:"b14f47c0908bab15e890b468d53bb07db0be3a18",htmlSha256:createHash("sha256").update(html).digest("hex"),bytes:Buffer.byteLength(html),costPolicy:"FREE_ONLY",studentAuthorized:false,publicationAuthorized:false}};
test("VF-SIMULATION-01 P4 verified package rejects changed bytes and authority",async()=>{
 assert.equal((await verifyLabPackage(fixture,"gear")).receipt.htmlSha256,fixture.receipt.htmlSha256);
 await assert.rejects(verifyLabPackage({...fixture,html:html.replace("Laboratorio","Laboratorix")},"gear"),/INTEGRITY/);
 for(const patch of [{studentAuthorized:true},{publicationAuthorized:true},{costPolicy:"PAID"},{id:"slider-crank"},{engineBlob:"a".repeat(40)},{bytes:1},{extra:true}])
  assert.throws(()=>parseLabPackage({...fixture,receipt:{...fixture.receipt,...patch}},"gear"));
 assert.throws(()=>parseLabPackage(fixture,"slider-crank"));
});
