import test from "node:test";
import assert from "node:assert/strict";
import {composeDidacticDraft,reviseSection} from "./didactic-draft";
import {defaultDidacticConfig,sourceForIdea} from "./didactic-content-candidates";
import {planDidacticProduction} from "./didactic-production";
import {authoredSource,AUTHORED_STEM,DIAGRAM_VARIANTS} from "./education-diagram";
import {bindMaterial,inspectMaterial,makeGearSheet,materialKey} from "./didactic-materials";
const project={projectId:"project-gear",revision:2,idea:"Ingranaggi",grammar:"INQUIRY_EVIDENCE"};
const config=defaultDidacticConfig(project.idea);
const source=sourceForIdea(project.idea)!;
const make=()=>composeDidacticDraft({project,config,pack:source,draftId:"draft-gear"});
const hash=async (text:string)=>Buffer.from(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text))).toString("hex");
// Synthetic packages test real verifiers; they are not generated or qualified lab artifacts.
async function lab(id="gear",html="<!doctype html><title>Synthetic fixture</title>"){
 return {html,receipt:{schema:"atlas.simulation-lab/v0.1",id,engine:id==="gear"?"three-r128":"native-svg",status:"TEACHER_REVIEW_REQUIRED",costPolicy:"FREE_ONLY",studentAuthorized:false,publicationAuthorized:false,sourceKind:"editable-teaching-model",sourceBlob:"a".repeat(40),templateBlob:"b".repeat(40),engineBlob:id==="gear"?"b14f47c0908bab15e890b468d53bb07db0be3a18":null,htmlSha256:await hash(html),bytes:Buffer.byteLength(html),objective:"Fixture",question:"Fixture"}};
}
async function diagram(wrong=false):Promise<{files:Record<string,string>}>{
 const seed=planDidacticProduction(make(),project,source).diagram!;
 const input=authoredSource(wrong?"Altra fonte":seed.title,seed.description,seed.nodes,seed.edges,seed.activity);
 const files:Record<string,string>={"education-source.json":JSON.stringify(input),"guida-docente.md":"Fixture"};
 for(const v of DIAGRAM_VARIANTS){files[`${AUTHORED_STEM}-${v}.html`]="<html><title>Fixture</title></html>";files[`${AUTHORED_STEM}-${v}.svg`]="<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";}
 const receipt={schema:"trama.diagram-education-receipt/v0.2",status:"GENERATED_TEACHER_REVIEW_REQUIRED",runtimeAuthorized:false,publicationAuthorized:false,sourceOrigin:"teacher-authored",profilesSha256:"a".repeat(64),rendererSha256:"b".repeat(64),files:Object.fromEntries(await Promise.all(Object.entries(files).map(async([n,v])=>[n,await hash(v)])))};
 return {files:{...files,"education-receipt.json":JSON.stringify(receipt)}};
}
const ids={sheet:"r1",diagram:"r2",lab:"r3"};
test("vertical: all three requested packages bind to the exact draft, no authority or mutation",async()=>{
 const d=make(),before=JSON.stringify(d),packages=[await makeGearSheet(d,project,ids.sheet),await diagram(),await lab()];
 const records=await Promise.all([ids.sheet,ids.diagram,ids.lab].map((id,i)=>bindMaterial(d,project,id,packages[i])));
 assert.deepEqual(records.map(x=>x.kind),["STUDENT_SHEET","DIAGRAM","SIMULATION"]);
 assert.equal(new Set(records.map(materialKey)).size,3);
 for(const row of records){assert.equal(await inspectMaterial(JSON.parse(JSON.stringify(row)),d,project),"CURRENT");assert.equal(row.studentAuthorized,false);assert.equal(row.publicationAuthorized,false);assert.equal(row.paidComputeAuthorized,false);assert.equal(row.status,"TEACHER_REVIEW_REQUIRED");}
 assert.equal(JSON.stringify(d),before);assert.ok(d.resources.every(r=>r.status==="REQUESTED"));
});
test("same revision with different content, new revision, recomposition and project change make material obsolete",async()=>{
 const d=make(),row=await bindMaterial(d,project,ids.lab,await lab());
 const changed=structuredClone(d);changed.steps[0].content="Nuovo testo";
 for(const current of [changed,reviseSection(d,"s1","Rivisto",1),{...d,draftId:"new-draft"},null])assert.equal(await inspectMaterial(row,current,project),"OBSOLETE");
 assert.equal(await inspectMaterial(row,d,{...project,revision:3}),"OBSOLETE");
 assert.equal(await inspectMaterial(row,d,{...project,projectId:"other"}),"INVALID");
});
test("wrong diagram source with all hashes recalculated is refused",async()=>{await assert.rejects(bindMaterial(make(),project,ids.diagram,await diagram(true)),/MATERIAL_DIAGRAM_MISMATCH/);});
test("corrupt diagram and lab packages are refused before binding",async()=>{
 const d=make(),a=await diagram(),b=await lab();a.files[`${AUTHORED_STEM}-mobile-vertical.svg`]+="changed";b.html+="changed";
 await assert.rejects(bindMaterial(d,project,ids.diagram,a),/DIAGRAM_FILE_INTEGRITY/);await assert.rejects(bindMaterial(d,project,ids.lab,b),/SIMULATION_PACKAGE_SIZE/);
 await assert.rejects(bindMaterial(d,project,ids.lab,await lab("slider-crank")),/SIMULATION_PACKAGE_INVALID/);
});
test("receipt without bytes, wrong resource, stale project and blocked resource are refused",async()=>{
 const d=make(),p=await lab();await assert.rejects(bindMaterial(d,project,ids.lab,{receipt:p.receipt}));await assert.rejects(bindMaterial(d,project,ids.sheet,p));await assert.rejects(bindMaterial(d,{...project,revision:3},ids.lab,p),/MATERIAL_REQUEST_NOT_CURRENT/);
 d.resources.find(x=>x.id===ids.lab)!.status="BLOCKED";await assert.rejects(bindMaterial(d,project,ids.lab,p),/MATERIAL_REQUEST_NOT_CURRENT/);
});
test("sheet and guide separated, deterministic, no network or publication, tamper refused",async()=>{
 const d=make(),a=await makeGearSheet(d,project,ids.sheet),b=await makeGearSheet(d,project,ids.sheet);
 assert.deepEqual(a,b);assert.ok(a.files["scheda-studente.html"].includes("Tabella delle previsioni"));assert.ok(a.files["scheda-studente.html"].includes("<td></td><td></td>"));
 for(const item of d.assessmentItems){assert.ok(!a.files["scheda-studente.html"].includes(item.criterion));assert.ok(!a.files["scheda-studente.html"].includes(item.feedback));assert.ok(a.files["guida-docente.html"].includes(item.criterion));}
 assert.ok(a.files["scheda-studente.html"].includes("default-src 'none'"));assert.equal(JSON.parse(a.files["sheet-receipt.json"]).studentAuthorized,false);
 a.files["scheda-studente.html"]+="changed";await assert.rejects(bindMaterial(d,project,ids.sheet,a),/MATERIAL_SHEET_MISMATCH/);
});
test("stored envelope tampering, altered digest and changed authorization fail closed",async()=>{
 const d=make(),row=await bindMaterial(d,project,ids.lab,await lab());
 for(const mutation of [{...row,studentAuthorized:true},{...row,receiptSha256:"0".repeat(64)},{...row,resourceId:ids.diagram},{...row,payload:{receipt:(row.payload as any).receipt}},{...row,unknownField:true}])assert.equal(await inspectMaterial(mutation,d,project),"INVALID");
});
