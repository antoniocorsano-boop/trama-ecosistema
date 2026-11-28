import {test} from "node:test";
import assert from "node:assert/strict";
import {DIAGRAM_STEM,DIAGRAM_VARIANTS,parseEducationReceipt,educationFiles,verifyEducationFile} from "./education-diagram";
const sha="a".repeat(64);
function receipt(){
 return {schema:"trama.diagram-education-receipt/v0.1",status:"GENERATED_TEACHER_REVIEW_REQUIRED",runtimeAuthorized:false,publicationAuthorized:false,sourceSha256:sha,profilesSha256:sha,guideSha256:sha,outputs:DIAGRAM_VARIANTS.map(variant=>({id:DIAGRAM_STEM+"-"+variant,diagram:DIAGRAM_STEM,variant,htmlSha256:sha,svgSha256:sha}))};
}
test("F3.3b: qualified educational receipt admits exactly six bound files",()=>{
 const files=educationFiles(parseEducationReceipt(receipt()));
 assert.equal(files.length,6);assert.equal(new Set(files.map(f=>f.name)).size,6);
 assert.ok(files.every(f=>f.sha256===sha && !f.name.includes("/")));
});
test("F3.3b: reject authority, foreign file names, missing variants and invalid digests",()=>{
 const r=receipt();
 for(const invalid of [{...r,runtimeAuthorized:true},{...r,publicationAuthorized:true},{...r,status:"PUBLISHED"},{...r,sourceSha256:"bad"},{...r,outputs:r.outputs.slice(0,1)},{...r,outputs:[{...r.outputs[0],id:"../other"},r.outputs[1]]}])assert.throws(()=>parseEducationReceipt(invalid),/DIAGRAM_RECEIPT_INVALID/);
});
test("F3.3b: modified file fails integrity",async()=>{
 const bytes=new TextEncoder().encode("abc").buffer;
 await verifyEducationFile(bytes,"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
 await assert.rejects(verifyEducationFile(bytes,sha),/DIAGRAM_FILE_INTEGRITY/);
});

import {authoredSource,importAuthoredSource} from "./education-diagram";
test("F3.3d-R1: optional teaching activity roundtrips and keeps old sources compatible",()=>{
 const base=authoredSource("Titolo","Finalità",[{id:"n1",label:"Nodo",detail:"Dettaglio"}],[]);
 const activity={question:"Quale fase?",criterion:"Identifica la fase."};
 assert.deepEqual(importAuthoredSource(base),base);
 assert.deepEqual(importAuthoredSource({...base,activity}),{...base,activity});
 for(const invalid of [{question:"<script>",criterion:"Risposta"},{question:"Domanda",criterion:"a".repeat(161)},{question:"Domanda",criterion:"Risposta",extra:true}])assert.throws(()=>importAuthoredSource({...base,activity:invalid}));
});
