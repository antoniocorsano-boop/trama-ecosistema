import {canonicalDraft,type Draft} from "./didactic-draft";
import {sourceForIdea} from "./didactic-content-candidates";
import {planDidacticProduction} from "./didactic-production";
import {authoredSource,importAuthoredSource,generateAuthoredPackage,AUTHORED_STEM} from "./education-diagram";
import {loadLabPackage} from "./simulation-lab-package";
import {bindMaterial,makeGearSheet,type MaterialBinding} from "./didactic-materials";
import type {MaterialContext,ArchivedMaterial} from "./didactic-material-archive";

export type WorkflowContext = {draft:Draft;project:MaterialContext["project"]};
export type MaterialPorts={diagram:(source:ReturnType<typeof authoredSource>,signal?:AbortSignal)=>Promise<Record<string,string>>;gear:(signal?:AbortSignal)=>Promise<unknown>};
const ports:MaterialPorts={diagram:generateAuthoredPackage,gear:async signal=>(await loadLabPackage("gear-ec07b",signal)).package};
export function isGearWorkflow(context:MaterialContext):context is WorkflowContext{
 return !!context.draft&&sourceForIdea(context.project.idea,context.draft.config.durationMinutes,context.draft.config.differentiationMode)?.id==="pack-gear";
}
export function contextKey(context:MaterialContext){return JSON.stringify([context.project.projectId,context.project.revision,context.project.idea,context.draft?canonicalDraft(context.draft):null]);}
export function currentMaterialRequests(context:MaterialContext){
 if(!isGearWorkflow(context))return [];
 const source=sourceForIdea(context.project.idea,context.draft.config.durationMinutes,context.draft.config.differentiationMode);
 const plan=planDidacticProduction(context.draft,context.project,source);
 return plan.status==="READY"?plan.requests:[];
}
export function workflowState(context:MaterialContext,archive:ArchivedMaterial[]){
 return currentMaterialRequests(context).map(request=>({...request,available:!request.blocked&&archive.some(row=>row.status==="CURRENT"&&row.binding.resourceId===request.id)}));
}
export async function prepareDidacticMaterial(expected:WorkflowContext,resourceId:string,getCurrent:()=>MaterialContext,signal?:AbortSignal,adapter:MaterialPorts=ports):Promise<MaterialBinding>{
 const context=structuredClone(expected),key=contextKey(context);
 function guard(){if(signal?.aborted)throw Error("MATERIAL_CANCELLED");if(contextKey(getCurrent())!==key)throw Error("MATERIAL_REVISION_CONFLICT");}
 guard();const request=currentMaterialRequests(context).find(r=>r.id===resourceId);
 if(!request||request.blocked)throw Error("MATERIAL_REQUEST_NOT_CURRENT");
 let payload:unknown;
 if(request.target==="DIAGRAM"){
  const source=sourceForIdea(context.project.idea,context.draft.config.durationMinutes,context.draft.config.differentiationMode);
  const seed=planDidacticProduction(context.draft,context.project,source).diagram;
  if(!seed)throw Error("MATERIAL_DIAGRAM_MISMATCH");
  payload={files:await adapter.diagram(importAuthoredSource(authoredSource(seed.title,seed.description,seed.nodes,seed.edges,seed.activity,seed.transmission)),signal)};
 }else if(request.target==="GEAR")payload=await adapter.gear(signal);
 else if(request.kind==="STUDENT_SHEET")payload=await makeGearSheet(context.draft,context.project,resourceId);
 else throw Error("MATERIAL_UNSUPPORTED");
 guard();const binding=await bindMaterial(context.draft,context.project,resourceId,payload);guard();return binding;
}
export type MaterialFile={labId?:"gear"|"gear-ec07b";name:string;label:string;body:string;mime:string;preview?:"static"|"interactive"};
// Called only for an envelope that has passed inspectMaterial/readMaterialArchive.
export function materialFiles(binding:MaterialBinding):MaterialFile[]{
 if(binding.kind==="SIMULATION"){
  const p=binding.payload as {html:string;receipt:{id:"gear"|"gear-ec07b"}};
  return [{labId:p.receipt.id,name:"vf-simulation-gear.html",label:"Simulatore",body:p.html,mime:"text/html",preview:"interactive"},{name:"simulation-receipt.json",label:"Ricevuta",body:JSON.stringify(p.receipt,null,2),mime:"application/json"}];
 }
 const p=(binding.payload as {files:Record<string,string>}).files;
 if(binding.kind==="STUDENT_SHEET")return [
  {name:"scheda-studente.html",label:"Scheda di lavoro",body:p["scheda-studente.html"],mime:"text/html",preview:"static"},
  {name:"guida-docente.html",label:"Guida riservata al docente",body:p["guida-docente.html"],mime:"text/html",preview:"static"},
  {name:"sheet-receipt.json",label:"Ricevuta",body:p["sheet-receipt.json"],mime:"application/json"}];
 return [
  {name:AUTHORED_STEM+"-mobile-vertical.html",label:"Diagramma",body:p[AUTHORED_STEM+"-mobile-vertical.html"],mime:"text/html",preview:"static"},
  {name:AUTHORED_STEM+"-desktop-lim-horizontal.html",label:"Diagramma LIM",body:p[AUTHORED_STEM+"-desktop-lim-horizontal.html"],mime:"text/html",preview:"static"},
  ...["education-source.json","guida-docente.md",AUTHORED_STEM+"-mobile-vertical.svg",AUTHORED_STEM+"-desktop-lim-horizontal.svg","education-receipt.json"].map(name=>({name,label:name,body:p[name],mime:name.endsWith(".svg")?"image/svg+xml":name.endsWith(".md")?"text/markdown":"application/json"}))];
}
// Executable archived content must still match the closed, trusted same-origin lab.
export async function verifyInteractivePreview(file:MaterialFile,load=loadLabPackage){
 if(file.preview!=="interactive")return;
 const fresh=await load(file.labId??"gear");
 if(fresh.package.html!==file.body)throw Error("MATERIAL_LAB_VERSION_UNAVAILABLE");
}
// Preview is isolated, while export preserves exact verified bytes.
export function isolatedPreview(file:MaterialFile){
 if(!file.preview)throw Error("MATERIAL_PREVIEW_UNSUPPORTED");
 const policy="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; script-src "+(file.preview==="interactive"?"'unsafe-inline'":"'none'")+"; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
 const meta='<meta http-equiv="Content-Security-Policy" content="'+policy+'">';
 return {html:/^\s*<!doctype[^>]*>/i.test(file.body)?file.body.replace(/^\s*<!doctype[^>]*>/i,match=>match+meta):meta+file.body,sandbox:file.preview==="interactive"?"allow-scripts":""};
}
