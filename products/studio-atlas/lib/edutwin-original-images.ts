import type {ActivityDraft} from "./activity-drafts";
import type {ConversationRevision} from "./edutwin-conversation";
import {verifyArchivedGallery} from "./activity-gallery";

export type OriginalImageMatch={
 id:string;sha256:string;state:"VERIFIED_LOCAL"|"MISSING"|"UNSUPPORTED";
 source?:{activityId:string;version:string;manifestDigest:string;path:string};
};

// Read-only binding to the existing activity archive. Rehash actual image bytes
// every time; a gallery marker or a declared digest alone is not proof.
export async function resolveOriginalImages(
 refs:ConversationRevision["assets"], drafts:readonly ActivityDraft[]
):Promise<OriginalImageMatch[]>{
 const wanted=new Set(refs.filter(r=>r.kind==="IMAGE").map(r=>r.sha256));
 const matches=new Map<string,NonNullable<OriginalImageMatch["source"]>>();
 for(const draft of drafts){
  try{
   if(draft?.status!=="DRAFT_PENDING_HUMAN_REVIEW"||!Array.isArray(draft.manifest?.assets)||
    !draft.manifest.assets.every(a=>a&&typeof a==="object")||
    !draft.manifest.assets.some(a=>a.type==="IMAGE"&&wanted.has(a.sha256)&&!matches.has(a.sha256)))continue;
   const verified=await verifyArchivedGallery(draft);
   for(const {file} of verified.images){
    if(wanted.has(file.sha256)&&!matches.has(file.sha256)){
     matches.set(file.sha256,{activityId:draft.activityId,version:draft.version,manifestDigest:draft.manifestDigest,path:file.path});
    }
   }
  }catch{
   // A corrupt source cannot satisfy a reference. Keep all originals untouched.
  }
 }
 return refs.map(ref=>{
  if(ref.kind!=="IMAGE")return {id:ref.id,sha256:ref.sha256,state:"UNSUPPORTED"};
  const source=matches.get(ref.sha256);
  return source?{id:ref.id,sha256:ref.sha256,state:"VERIFIED_LOCAL",source}:{id:ref.id,sha256:ref.sha256,state:"MISSING"};
 });
}
