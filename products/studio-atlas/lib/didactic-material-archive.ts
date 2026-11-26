import {canonicalDraft,type Draft} from "./didactic-draft";
import {inspectMaterial,materialKey,type MaterialBinding,type MaterialProject} from "./didactic-materials";

// Separate teacher-only archive. Large material bytes do not enter localStorage or the project payload.
const DB_NAME="studio-atlas.didactic-materials.v0.1";
const STORE="bindings";
const PROJECT_INDEX="projectId";
const MAX_BINDINGS=24; // Explicit limit, no silent eviction.
export type MaterialContext={draft:Draft|null;project:MaterialProject};
type Stored={key:string;projectId:string;binding:MaterialBinding};
export type ArchivedMaterial={key:string;status:"CURRENT"|"OBSOLETE";binding:MaterialBinding}|{key:string;status:"INVALID"};
function openArchive():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{const store=req.result.createObjectStore(STORE,{keyPath:"key"});store.createIndex(PROJECT_INDEX,"projectId",{unique:false});};
  req.onerror=()=>reject(Error("MATERIAL_ARCHIVE_UNAVAILABLE"));
  req.onblocked=()=>reject(Error("MATERIAL_ARCHIVE_BLOCKED"));
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
 });
}
function assertCurrent(binding:MaterialBinding,context:MaterialContext){
 if(!context.draft||context.project.projectId!==binding.project.projectId||context.project.revision!==binding.project.revision||context.project.idea!==binding.project.idea||canonicalDraft(context.draft)!==binding.draftSnapshot)throw Error("MATERIAL_REVISION_CONFLICT");
}
export async function saveMaterialBinding(binding:MaterialBinding,getCurrent:()=>MaterialContext):Promise<string>{
 const candidate=structuredClone(binding);
 const context=getCurrent();assertCurrent(candidate,context);
 if(await inspectMaterial(candidate,context.draft,context.project)!=="CURRENT")throw Error("MATERIAL_INVALID");
 const key=materialKey(candidate),projectId=candidate.project.projectId;
 const db=await openArchive();
 try{return await new Promise<string>((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);let error="MATERIAL_ARCHIVE_WRITE_FAILED";
  const fail=(cause:unknown)=>{error=cause instanceof Error?cause.message:error;try{tx.abort();}catch{reject(Error(error));}};
  tx.onabort=()=>reject(Error(error));tx.onerror=()=>{error=tx.error?.name??error;};tx.oncomplete=()=>resolve(key);
  const existing=store.get(key);
  existing.onsuccess=()=>{
   try{
    assertCurrent(candidate,getCurrent());
    if(existing.result!==undefined){const stored=existing.result as Stored;if(stored.projectId!==projectId||stored.key!==key||JSON.stringify(stored.binding)!==JSON.stringify(candidate))throw Error("MATERIAL_ARCHIVE_CONFLICT");return;}
    const count=store.index(PROJECT_INDEX).count(projectId);
    count.onsuccess=()=>{try{assertCurrent(candidate,getCurrent());if(count.result>=MAX_BINDINGS)throw Error("MATERIAL_ARCHIVE_LIMIT");store.add({key,projectId,binding:candidate} satisfies Stored);}catch(e){fail(e);}};
   }catch(e){fail(e);}
  };
 });}finally{db.close();}
}
export async function readMaterialArchive(context:MaterialContext):Promise<ArchivedMaterial[]>{
 const db=await openArchive();let rows:unknown[];
 try{rows=await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).index(PROJECT_INDEX).getAll(context.project.projectId,MAX_BINDINGS+1);
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(Error("MATERIAL_ARCHIVE_READ_FAILED"));tx.onabort=()=>reject(Error("MATERIAL_ARCHIVE_READ_FAILED"));
 });}finally{db.close();}
 if(rows.length>MAX_BINDINGS)throw Error("MATERIAL_ARCHIVE_LIMIT");
 const results:ArchivedMaterial[]=[];
 for(const row of rows){
  const entry=row as Partial<Stored>|null,key=typeof entry?.key==="string"?entry.key:"invalid-"+results.length;
  try{
   if(!entry||Object.keys(entry).sort().join(",")!=="binding,key,projectId"||entry.projectId!==context.project.projectId||!entry.binding||materialKey(entry.binding)!==key)throw Error("MATERIAL_INVALID");
   const status=await inspectMaterial(entry.binding,context.draft,context.project);
   results.push(status==="INVALID"?{key,status}:{key,status,binding:entry.binding});
  }catch{results.push({key,status:"INVALID"});}
 }
 return results;
}
