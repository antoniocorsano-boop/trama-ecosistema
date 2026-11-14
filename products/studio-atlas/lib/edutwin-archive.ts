import {compileConversationRevision,type ConversationRevision} from "./edutwin-conversation";

// Local handoff envelope, not a publication package. The actual authoring package
// remains the existing atlas.pathway-authoring-package/v0.1 produced by S2a.
export const MAX_HANDOFF_BYTES=512*1024;
const MAX_REVISIONS=30;
export type Handoff={projectId:string;expectedParentDigest:string|null;input:unknown};
type Entry={handoff:Handoff;now:string;digest:string};
export type Archive={projectId:string;entries:Entry[]};
const error=(code:string):never=>{throw new Error(code);};
const validDigest=(x:unknown):x is string=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
export function parseHandoff(raw:string):Handoff{
 if(new TextEncoder().encode(raw).length>MAX_HANDOFF_BYTES)return error("HANDOFF_TOO_LARGE");
 const x:unknown=JSON.parse(raw);
 if(!x||typeof x!=="object"||Array.isArray(x))return error("INVALID_HANDOFF");
 const o=x as Record<string,unknown>;
 if(Object.keys(o).length!==3||!Object.hasOwn(o,"input")||!Object.hasOwn(o,"expectedParentDigest")||
 typeof o.projectId!=="string"||!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,99}$/.test(o.projectId)||
 (o.expectedParentDigest!==null&&!validDigest(o.expectedParentDigest)))return error("INVALID_HANDOFF");
 return {projectId:o.projectId,expectedParentDigest:o.expectedParentDigest as string|null,input:o.input};
}

// Recompile the full bounded history from original inputs: persisted results
// and approval flags are never trusted. Hashes detect accidental changes, not
// malicious same-origin rewriting of an entire chain.
export async function replayHistory(archive:Archive):Promise<ConversationRevision[]>{
 if(!archive||!Array.isArray(archive.entries)||!archive.entries.length||archive.entries.length>MAX_REVISIONS)
  return error("INVALID_ARCHIVE");
 const history:ConversationRevision[]=[];
 let revision:ConversationRevision|undefined;
 for(const entry of archive.entries){
  const h=parseHandoff(JSON.stringify(entry.handoff));
  if(h.projectId!==archive.projectId||h.expectedParentDigest!==(revision?.digest??null))return error("INVALID_CHAIN");
  revision=await compileConversationRevision(h.input,{projectId:h.projectId,now:entry.now},revision,revision?.digest);
  if(revision.digest!==entry.digest)return error("INVALID_CHAIN");
  history.push(revision);
 }
 return history;
}
export async function replayArchive(archive:Archive):Promise<ConversationRevision>{
 return (await replayHistory(archive)).at(-1)!;
}
export async function prepareHandoff(handoff:Handoff,now:string,previous?:Archive){
 const h=parseHandoff(JSON.stringify(handoff));
 const parent=previous?await replayArchive(previous):undefined;
 if((previous&&previous.projectId!==h.projectId)||h.expectedParentDigest!==(parent?.digest??null))
  return error("STALE_HANDOFF");
 if((previous?.entries.length??0)>=MAX_REVISIONS)return error("ARCHIVE_LIMIT");
 const revision=await compileConversationRevision(h.input,{projectId:h.projectId,now},parent,parent?.digest);
 const archive:Archive={projectId:h.projectId,entries:[...structuredClone(previous?.entries??[]),{handoff:h,now,digest:revision.digest}]};
 return {archive,revision};
}
const DB="studio-atlas.edutwin-authoring.v1";
const STORE="revisions";
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==="undefined"){reject(new Error("LOCAL_ARCHIVE_UNAVAILABLE"));return;}
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"projectId"});};
  req.onerror=()=>reject(req.error??new Error("LOCAL_ARCHIVE_UNAVAILABLE"));
  req.onblocked=()=>reject(new Error("LOCAL_ARCHIVE_BLOCKED"));
  req.onsuccess=()=>resolve(req.result);
 });
}
async function read(db:IDBDatabase,id:string):Promise<Archive|undefined>{
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(id);
  tx.oncomplete=()=>resolve(req.result as Archive|undefined);
  tx.onerror=tx.onabort=()=>reject(tx.error??new Error("ARCHIVE_READ_FAILED"));
 });
}
export async function loadEduTwin(projectId:string){
 const db=await openDb();try{const archive=await read(db,projectId);return archive?await replayArchive(archive):undefined;}finally{db.close();}
}
export async function loadEduTwinHistory(projectId:string):Promise<ConversationRevision[]>{
 const db=await openDb();try{const archive=await read(db,projectId);return archive?await replayHistory(archive):[];}finally{db.close();}
}
export async function listEduTwins():Promise<ConversationRevision[]>{
 const db=await openDb();
 try{
  const rows=await new Promise<Archive[]>((resolve,reject)=>{
   const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).getAll();
   tx.oncomplete=()=>resolve(req.result as Archive[]);
   tx.onerror=tx.onabort=()=>reject(tx.error??new Error("ARCHIVE_READ_FAILED"));
  });
  const result=[];for(const row of rows)result.push(await replayArchive(row));return result;
 }finally{db.close();}
}
export async function importEduTwin(raw:string,now:string):Promise<ConversationRevision>{
 const h=parseHandoff(raw),db=await openDb();
 try{
  const prior=await read(db,h.projectId);
  const prepared=await prepareHandoff(h,now,prior);
  // Crypto/validation happens before the transaction. Compare the entire prior
  // serialized record inside the write transaction to prevent concurrent forks.
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE),req=store.get(h.projectId);
   let failure:Error|undefined;
   req.onsuccess=()=>{
    if(JSON.stringify(req.result)!==JSON.stringify(prior)){failure=new Error("STALE_HANDOFF");tx.abort();return;}
    store.put(prepared.archive);
   };
   tx.oncomplete=()=>resolve();
   tx.onerror=tx.onabort=()=>reject(failure??tx.error??new Error("ARCHIVE_WRITE_FAILED"));
  });
  const saved=await read(db,h.projectId);
  if(!saved)return error("ARCHIVE_READBACK_FAILED");
  const verified=(await replayHistory(saved)).find(v=>v.digest===prepared.revision.digest);
  if(!verified)return error("ARCHIVE_READBACK_FAILED");
  return verified;
 }finally{db.close();}
}
