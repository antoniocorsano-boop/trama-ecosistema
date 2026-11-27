import gearTeachingProfile from "./gear-teaching-profile.json";
import {canonicalDraft,type Draft} from "./didactic-draft";
import {planDidacticProduction} from "./didactic-production";
import {sourceForIdea} from "./didactic-content-candidates";
import {authoredSource,importAuthoredSource,verifyAuthoredPackage} from "./education-diagram";
import {verifyLabPackage} from "./simulation-lab-package";

// Teacher-only candidate packages. Integrity checks do not attest authorship or approval.
export type MaterialProject={projectId:string;revision:number;idea:string};
export type MaterialKind="DIAGRAM"|"SIMULATION"|"STUDENT_SHEET";
type Files=Record<string,string>;
const SCHEMA="studio-atlas.didactic-material-binding/v0.1" as const;
const MAX_PACKAGE=3*1024*1024;
const MAX_DRAFT=1024*1024;
const encoder=new TextEncoder();
const hash=async (text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(text))),b=>b.toString(16).padStart(2,"0")).join("");
function ordered(value:unknown):unknown{
 if(Array.isArray(value))return value.map(ordered);
 if(value!==null&&typeof value==="object")return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,ordered(v)]));
 return value;
}
const canonical=(value:unknown)=>JSON.stringify(ordered(value));
const size=(value:string)=>encoder.encode(value).byteLength;
function asRecord(value:unknown):Record<string,unknown>{
 if(!value||typeof value!=="object"||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error("MATERIAL_INVALID");
 return value as Record<string,unknown>;
}
function exact(value:Record<string,unknown>,keys:string[]){if(Object.keys(value).sort().join(",")!==keys.sort().join(","))throw Error("MATERIAL_INVALID");}
function request(draft:Draft,project:MaterialProject,resourceId:string){
 const snapshot=canonicalDraft(draft);
 if(size(snapshot)>MAX_DRAFT)throw Error("MATERIAL_DRAFT_TOO_LARGE");
 const source=sourceForIdea(project.idea,draft.config.durationMinutes,draft.config.differentiationMode);
 const plan=planDidacticProduction(draft,project,source);
 const res=plan.requests.find(r=>r.id===resourceId);
 // The first complete vertical is intentionally limited to the gear candidate.
 if(plan.status!=="READY"||source?.id!=="pack-gear"||!res||res.blocked||!draft.steps.length)throw Error("MATERIAL_REQUEST_NOT_CURRENT");
 const kind:MaterialKind=res.target==="DIAGRAM"?"DIAGRAM":res.target==="GEAR"?"SIMULATION":res.kind==="STUDENT_SHEET"?"STUDENT_SHEET":(()=>{throw Error("MATERIAL_UNSUPPORTED");})();
 return {snapshot,kind,plan,res};
}
function escaped(text:string){return text.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
const e=escaped;
// Reuses the printable HTML/teacher-guide separation of the ESS-02 fascicle.
const STYLE="body{font:1rem/1.6 system-ui,sans-serif;color:#25332c;margin:0}main{max-width:760px;margin:auto;padding:clamp(16px,4vw,36px)}h1,h2{line-height:1.2}section{border:1px solid #c5d0c9;border-radius:12px;padding:12px;margin:12px 0;break-inside:avoid}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #aebdb4;padding:clamp(4px,1.2vw,8px);overflow-wrap:anywhere}th{font-size:.875rem;line-height:1.35}caption{text-align:left;font-weight:600;margin:8px 0}td{height:36px}small{color:#4d6257}.answer{border-bottom:1px solid #aebdb4;min-height:44px}@media print{main{padding:0}h2{break-after:avoid}}";
function page(title:string,body:string){return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${e(title)}</title><style>${STYLE}</style></head><body><main>${body}</main></body></html>`;}
const LEGACY_SHEET="studio-atlas.didactic-sheet-receipt/v0.1";
const SIGNED_SHEET="studio-atlas.didactic-sheet-receipt/v0.2";
export async function makeGearSheet(draft:Draft,project:MaterialProject,resourceId:string,schema:typeof LEGACY_SHEET|typeof SIGNED_SHEET=SIGNED_SHEET):Promise<{files:Files}>{
 const req=request(draft,project,resourceId);if(req.kind!=="STUDENT_SHEET")throw Error("MATERIAL_KIND_MISMATCH");
 const context=`<small>Studio Atlas · Bozza per revisione docente · Tecnologia, classe ${e(draft.config.grade)} · ${draft.config.durationMinutes} minuti</small>`;
 // Only instructions and questions, not teaching explanations, criteria or feedback.
 const signed=schema===SIGNED_SHEET;
 const {driverTeeth,drivenTeeth}=gearTeachingProfile;
 const pairs=signed?[[driverTeeth,drivenTeeth],[drivenTeeth,driverTeeth],[drivenTeeth,drivenTeeth]]:[[24,48],[48,24],[48,48]];
 const initial=signed?`La motrice ha ${driverTeeth} denti, la condotta ${drivenTeeth}.`:"La motrice ha 24 denti, la condotta 48.";
 const instructions=signed?" Indica separatamente il verso e il rapporto tra velocità della condotta e della motrice. Usa il segno meno se i versi sono opposti.":"";
 const ratios=pairs.map(([driver,driven])=>new Intl.NumberFormat("it-IT").format(-driver/driven));
 const convention=signed?`<p>Nel modello ideale: n condotta / n motrice = −Z motrice / Z condotta. Il segno meno indica versi opposti. Per ${pairs.map(pair=>pair.join("/")).join(", ")} i rapporti sono rispettivamente ${ratios.join(", ")}.</p>`:"";
 const table=`<table><caption>Tabella delle previsioni</caption><thead><tr><th scope="col">Denti motrice</th><th scope="col">Denti condotta</th><th scope="col">Versi</th><th scope="col">Rapporto</th></tr></thead><tbody>${pairs.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td><td></td><td></td></tr>`).join("")}</tbody></table>`;
 const student=page("Ingranaggi — scheda di lavoro",`${context}<h1>Ingranaggi: prevedi e confronta</h1><section><h2>Situazione iniziale</h2><p>Due ruote dentate esterne sono in presa. ${initial} Prima di aprire il laboratorio, formula una previsione. Considera un modello ideale.${instructions}</p></section><h2>Obiettivi</h2><ul>${draft.outcomes.map(o=>`<li>${e(o.text)}</li>`).join("")}</ul><h2>Attività</h2>${draft.steps.map(s=>`<section><h3>${e(s.title)}</h3><p>${e(s.instruction)}</p>${s.id==="s3"?table:""}<div class="answer"></div></section>`).join("")}<h2>Quesito finale</h2>${draft.assessmentItems.map(a=>`<section><p>${e(a.instruction)}</p><div class="answer"></div></section>`).join("")}`);
 const guide=page("Ingranaggi — guida docente",`${context}<h1>Guida riservata al docente</h1><p>Proposta non approvata. Verificare contenuti, adeguatezza e riferimenti prima dell’uso.</p>${convention}${draft.steps.map(s=>`<section><h2>${e(s.title)} · ${s.minutes} min</h2><p>${e(s.content)}</p><p><strong>Consegna:</strong> ${e(s.instruction)}</p></section>`).join("")}<h2>Criteri e riscontri</h2>${draft.assessmentItems.map(a=>`<section><p>${e(a.instruction)}</p><p><strong>Criterio:</strong> ${e(a.criterion)}</p><p><strong>Riscontro:</strong> ${e(a.feedback)}</p></section>`).join("")}`);
 const files:Files={"scheda-studente.html":student,"guida-docente.html":guide};
 const receipt={schema,status:"TEACHER_REVIEW_REQUIRED",costClass:"FREE_ONLY",studentAuthorized:false,publicationAuthorized:false,draftSha256:await hash(req.snapshot),resourceId,files:Object.fromEntries(await Promise.all(Object.entries(files).map(async([name,body])=>[name,await hash(body)])))};
 return {files:{...files,"sheet-receipt.json":canonical(receipt)}};
}
async function verifyPayload(draft:Draft,project:MaterialProject,resourceId:string,payload:unknown){
 const req=request(draft,project,resourceId),raw=asRecord(payload);
 if(size(canonical(raw))>MAX_PACKAGE)throw Error("MATERIAL_PACKAGE_TOO_LARGE");
 if(req.kind==="DIAGRAM"){
  exact(raw,["files"]);const files=await verifyAuthoredPackage(raw);
  const seed=req.plan.diagram;if(!seed)throw Error("MATERIAL_DIAGRAM_MISMATCH");
  const expected=importAuthoredSource(authoredSource(seed.title,seed.description,seed.nodes,seed.edges,seed.activity));
  const actual=importAuthoredSource(JSON.parse(files["education-source.json"]));
  const mechanical=authoredSource(seed.title,seed.description,seed.nodes,seed.edges,seed.activity,seed.transmission);
  if(canonical(actual)!==canonical(expected)&&canonical(actual)!==canonical(mechanical))throw Error("MATERIAL_DIAGRAM_MISMATCH");
  return {kind:req.kind,payload:{files},receipt:files["education-receipt.json"],snapshot:req.snapshot};
 }
 if(req.kind==="SIMULATION"){
  const labId=asRecord(raw.receipt).id==="gear-ec07b"?"gear-ec07b":"gear";
  const verified=await verifyLabPackage(raw,labId);
  return {kind:req.kind,payload:{html:raw.html,receipt:verified.receipt},receipt:canonical(verified.receipt),snapshot:req.snapshot};
 }
 const files=asRecord(raw.files);
 if(typeof files["sheet-receipt.json"]!=="string")throw Error("MATERIAL_SHEET_MISMATCH");
 const schema=asRecord(JSON.parse(files["sheet-receipt.json"])).schema;
 if(schema!==LEGACY_SHEET&&schema!==SIGNED_SHEET)throw Error("MATERIAL_SHEET_MISMATCH");
 const expected=await makeGearSheet(draft,project,resourceId,schema);
 if(canonical(raw)!==canonical(expected))throw Error("MATERIAL_SHEET_MISMATCH");
 return {kind:req.kind,payload:expected,receipt:expected.files["sheet-receipt.json"],snapshot:req.snapshot};
}
export type MaterialBinding={schema:typeof SCHEMA;project:MaterialProject;draftId:string;draftRevision:number;draftSha256:string;resourceId:string;kind:MaterialKind;receiptSha256:string;packageSha256:string;draftSnapshot:string;payload:unknown;status:"TEACHER_REVIEW_REQUIRED";studentAuthorized:false;publicationAuthorized:false;paidComputeAuthorized:false};
export async function bindMaterial(draft:Draft,project:MaterialProject,resourceId:string,payload:unknown):Promise<MaterialBinding>{
 const verified=await verifyPayload(draft,project,resourceId,payload);
 return {schema:SCHEMA,project:{projectId:project.projectId,revision:project.revision,idea:project.idea},draftId:draft.draftId,draftRevision:draft.revision,draftSha256:await hash(verified.snapshot),resourceId,kind:verified.kind,receiptSha256:await hash(verified.receipt),packageSha256:await hash(canonical(verified.payload)),draftSnapshot:verified.snapshot,payload:verified.payload,status:"TEACHER_REVIEW_REQUIRED",studentAuthorized:false,publicationAuthorized:false,paidComputeAuthorized:false};
}
// Do not use the digest alone as proof. Verify the original package and exact historical draft again.
export async function inspectMaterial(input:unknown,currentDraft:Draft|null,currentProject:MaterialProject):Promise<"CURRENT"|"OBSOLETE"|"INVALID">{
 try{
  const row=asRecord(input);exact(row,["schema","project","draftId","draftRevision","draftSha256","resourceId","kind","receiptSha256","packageSha256","draftSnapshot","payload","status","studentAuthorized","publicationAuthorized","paidComputeAuthorized"]);
  if(typeof row.draftSnapshot!=="string"||size(row.draftSnapshot)>MAX_DRAFT||typeof row.resourceId!=="string")return "INVALID";
  const project=asRecord(row.project);exact(project,["projectId","revision","idea"]);
  if(typeof project.projectId!=="string"||typeof project.idea!=="string"||typeof project.revision!=="number"||project.projectId!==currentProject.projectId)return "INVALID";
  const original=JSON.parse(row.draftSnapshot) as Draft;
  const recreated=await bindMaterial(original,{projectId:project.projectId,revision:project.revision,idea:project.idea},row.resourceId,row.payload);
  if(canonical(recreated)!==canonical(row))return "INVALID";
  if(!currentDraft||currentProject.revision!==project.revision||currentProject.idea!==project.idea||canonicalDraft(currentDraft)!==row.draftSnapshot)return "OBSOLETE";
  return "CURRENT";
 }catch{return "INVALID";}
}
export function materialKey(binding:MaterialBinding){return JSON.stringify([binding.project.projectId,binding.project.revision,binding.draftId,binding.draftRevision,binding.draftSha256,binding.resourceId,binding.packageSha256]);}
