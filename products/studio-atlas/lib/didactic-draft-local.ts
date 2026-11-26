/** Teacher-only drafts are separate from learner preview and project payloads. */
import {canonicalDraft,validateDidacticDraft,type Draft} from "./didactic-draft";
type StoragePort=Pick<Storage,"getItem"|"setItem">;
const key=(id:string)=>"studio-atlas.didactic-draft.v0.1:"+id;
export function readDidacticDraft(storage:StoragePort,projectId:string):Draft|null{
 const raw=storage.getItem(key(projectId));if(raw===null)return null;
 if(raw.length>1024*1024)throw Error("DRAFT_TOO_LARGE");
 const draft:unknown=JSON.parse(raw);
 if(validateDidacticDraft(draft).length||(draft as Draft).projectId!==projectId)throw Error("INVALID_STORED_DRAFT");
 return draft as Draft;
}
export function saveDidacticDraft(storage:StoragePort,draft:Draft,project:{projectId:string;revision:number},expected:Draft|null){
 const serialized=canonicalDraft(draft);
 if(serialized.length>1024*1024)throw Error("DRAFT_TOO_LARGE");
 if(draft.projectId!==project.projectId||draft.sourceProjectRevision!==project.revision)throw Error("PROJECT_REVISION_CONFLICT");
 const current=readDidacticDraft(storage,project.projectId);
 if((current?canonicalDraft(current):null)!==(expected?canonicalDraft(expected):null))throw Error("DRAFT_REVISION_CONFLICT");
 if(expected&&draft.draftId===expected.draftId&&draft.revision!==expected.revision+1)throw Error("DRAFT_REVISION_CONFLICT");
 if((!expected||draft.draftId!==expected.draftId)&&draft.revision!==1)throw Error("DRAFT_REVISION_CONFLICT");
 storage.setItem(key(project.projectId),serialized);
}
