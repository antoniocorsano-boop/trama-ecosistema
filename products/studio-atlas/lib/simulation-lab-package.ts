export const LABS=[
  {id:"gear",title:"Laboratorio delle trasmissioni",engine:"three-r128"},
  {id:"slider-crank",title:"Laboratorio biella-manovella",engine:"native-svg"},
] as const;
export type LabId=typeof LABS[number]["id"];
export const MAX_LAB_BYTES=1024*1024;
const digest=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const blob=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{40}$/.test(v);
function record(v:unknown):Record<string,unknown>{
 if(!v||typeof v!=="object"||Array.isArray(v))throw Error("SIMULATION_PACKAGE_INVALID");
 return v as Record<string,unknown>;
}
export function parseLabPackage(input:unknown,id:LabId){
 const p=record(input),r=record(p.receipt),lab=LABS.find(x=>x.id===id);
 if(!lab||Object.keys(p).sort().join(",")!=="html,receipt"||
    Object.keys(r).sort().join(",")!=="bytes,costPolicy,engine,engineBlob,htmlSha256,id,objective,publicationAuthorized,question,schema,sourceBlob,sourceKind,status,studentAuthorized,templateBlob"||
    r.schema!=="atlas.simulation-lab/v0.1"||r.id!==id||r.engine!==lab.engine||
    r.status!=="TEACHER_REVIEW_REQUIRED"||r.costPolicy!=="FREE_ONLY"||
    r.studentAuthorized!==false||r.publicationAuthorized!==false||
    r.sourceKind!=="editable-teaching-model"||!blob(r.sourceBlob)||!blob(r.templateBlob)||
    (id==="gear"?r.engineBlob!=="b14f47c0908bab15e890b468d53bb07db0be3a18":r.engineBlob!==null)||
    !digest(r.htmlSha256)||typeof r.bytes!=="number"||!Number.isSafeInteger(r.bytes)||r.bytes<1||r.bytes>MAX_LAB_BYTES||
    typeof r.objective!=="string"||!r.objective.trim()||r.objective.length>200||
    typeof r.question!=="string"||!r.question.trim()||r.question.length>200||
    typeof p.html!=="string"||p.html.length>MAX_LAB_BYTES)throw Error("SIMULATION_PACKAGE_INVALID");
 const bytes=new TextEncoder().encode(p.html);
 if(bytes.byteLength!==r.bytes)throw Error("SIMULATION_PACKAGE_SIZE");
 return {receipt:{...r,htmlSha256:r.htmlSha256,objective:r.objective,question:r.question},bytes};
}
export async function verifyLabPackage(input:unknown,id:LabId){
 const p=parseLabPackage(input,id);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",p.bytes)),n=>n.toString(16).padStart(2,"0")).join("");
 if(hash!==p.receipt.htmlSha256)throw Error("SIMULATION_PACKAGE_INTEGRITY");
 return p;
}
