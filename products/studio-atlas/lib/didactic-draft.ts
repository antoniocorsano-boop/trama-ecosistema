/** EC03-S2 — Pure candidate. No storage, network, provider or publication access. */
export const SCHEMA = 'studio-atlas.didactic-draft/v0.1' as const;
const KINDS = ['STUDENT_SHEET','EXIT_TICKET','TASK_BRIEF','RUBRIC','ASSESSMENT_GUIDE','DIAGRAM','IMAGE','ANIMATION','SIMULATION','MODEL_3D','AUDIO','COMIC','PRESENTATION'] as const;
export type ResourceKind = typeof KINDS[number];
export type Config = {subjectRef:string;schoolOrder:string;grade:string;durationMinutes:number;teachingMethodId:string;differentiationMode:string;requestedResourceKinds:ResourceKind[]};
export type Outcome = {id:string;text:string};
export type Step = {id:string;title:string;minutes:number;content:string;instruction:string;outcomeRefs:string[];resourceRefs:string[]};
export type Resource = {id:string;kind:ResourceKind;spec:string;accessibleAlternative:string};
export type Assessment = {id:string;kind:'OPEN_RESPONSE';outcomeRefs:string[];instruction:string;criterion:string;feedback:string};
export type ContentPack = {id:string;revision:string;topic:string;subjectRef:string;grade:string;sourceRef:string;outcomes:Outcome[];steps:Step[];resources:Resource[];assessmentItems:Assessment[]};
export type Draft = {schemaVersion:typeof SCHEMA;draftId:string;projectId:string;revision:number;sourceProjectRevision:number;config:Config;curricolo:{status:'UNBOUND';objectiveRefs:[]};sources:{id:string;kind:'CONTEXT_REFERENCE';ref:string;revision:string;verification:'CONTEXT_ONLY'}[];outcomes:(Outcome&{sourceRefs:string[]})[];steps:(Step&{sourceRefs:string[]})[];resources:(Resource&{status:'REQUESTED'|'BLOCKED';sourceRefs:string[]})[];assessmentItems:(Assessment&{sourceRefs:string[]})[];review:{status:'REVIEW_REQUIRED';lockedSectionIds:string[];diagnostics:string[]};governance:{costClass:'FREE_ONLY';paidComputeAuthorized:false;publicationAuthorized:false;studentAuthorized:false}};
export type ComposeInput = {project:{projectId:string;revision:number;idea:string;grammar:string};config:Config;pack?:ContentPack;draftId:string};
const isRecord=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=4000&&!/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)&&!/(?:javascript|data):/i.test(v);
const positive=(v:unknown,max=Number.MAX_SAFE_INTEGER):v is number=>Number.isSafeInteger(v)&&Number(v)>0&&Number(v)<=max;
const normalized=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('it');
const resourceKind=(v:unknown):v is ResourceKind=>KINDS.includes(v as ResourceKind);
const diagnosticsAllowed=new Set(['CURRICOLO_UNBOUND','CONTENT_REVIEW_REQUIRED','CONTENT_SOURCE_MISSING','CONTENT_SOURCE_MISMATCH']);
const arr=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
export function validateDidacticDraft(value:unknown):string[] {
 const errors=new Set<string>(); const add=(s:string)=>errors.add(s);
 const record=(v:unknown,keys:string[]):v is Record<string,unknown>=>{if(!isRecord(v)){add('INVALID_STRUCTURE');return false;} if(Object.keys(v).some(k=>!keys.includes(k)))add('UNKNOWN_FIELD');if(keys.some(k=>!Object.hasOwn(v,k)))add('MISSING_FIELD');return true;};
 const list=(v:unknown,max=100):unknown[]=>{if(!Array.isArray(v)||v.length>max){add('INVALID_LIST');return [];}return v;};
 const refs=(v:unknown,known:Set<string>,err:string,required=false)=>{const items=list(v);if(required&&!items.length)add(err);if(new Set(items).size!==items.length||items.some(x=>!id(x)||!known.has(x)))add(err);};
 const str=(v:unknown)=>{if(!text(v))add('UNSAFE_TEXT');};
 const uid=(v:unknown,known:Set<string>)=>{if(!id(v)){add('INVALID_ID');return;}if(known.has(v))add('DUPLICATE_ID');known.add(v);};
 if(!record(value,['schemaVersion','draftId','projectId','revision','sourceProjectRevision','config','curricolo','sources','outcomes','steps','resources','assessmentItems','review','governance']))return [...errors];
 if(value.schemaVersion!==SCHEMA)add('INVALID_SCHEMA');if(!id(value.draftId)||!id(value.projectId))add('INVALID_ID');if(!positive(value.revision)||!positive(value.sourceProjectRevision))add('INVALID_REVISION');
 let duration=0;const requested=new Set<unknown>();
 if(record(value.config,['subjectRef','schoolOrder','grade','durationMinutes','teachingMethodId','differentiationMode','requestedResourceKinds'])){const c=value.config;for(const k of ['subjectRef','schoolOrder','grade','teachingMethodId','differentiationMode'])if(!id(c[k]))add('INVALID_CONFIG');if(!positive(c.durationMinutes,240))add('INVALID_MINUTES');else duration=c.durationMinutes;for(const k of list(c.requestedResourceKinds,20)){if(!resourceKind(k)||requested.has(k))add('INVALID_RESOURCE_KIND');requested.add(k);}}
 if(record(value.curricolo,['status','objectiveRefs'])){if(value.curricolo.status!=='UNBOUND'||!Array.isArray(value.curricolo.objectiveRefs)||value.curricolo.objectiveRefs.length)add('UNVERIFIED_CURRICOLO');}
 if(record(value.governance,['costClass','paidComputeAuthorized','publicationAuthorized','studentAuthorized'])){const g=value.governance;if(g.costClass!=='FREE_ONLY'||g.paidComputeAuthorized!==false||g.publicationAuthorized!==false||g.studentAuthorized!==false)add('AUTHORITY_ESCALATION');}
 const sourceIds=new Set<string>(),outcomeIds=new Set<string>(),resourceIds=new Set<string>(),stepIds=new Set<string>(),assessmentIds=new Set<string>();
 for(const x of list(value.sources,20))if(record(x,['id','kind','ref','revision','verification'])){uid(x.id,sourceIds);if(x.kind!=='CONTEXT_REFERENCE'||x.verification!=='CONTEXT_ONLY'||!id(x.ref)||!id(x.revision))add('UNVERIFIED_SOURCE');}
 // Context references never constitute evidence for specific content claims.
 const sourceRefs=(v:unknown)=>{refs(v,sourceIds,'BROKEN_SOURCE_REF');if(arr(v).length)add('UNVERIFIED_CONTENT_PROVENANCE');};
 for(const x of list(value.outcomes))if(record(x,['id','text','sourceRefs'])){uid(x.id,outcomeIds);str(x.text);sourceRefs(x.sourceRefs);}
 for(const x of list(value.resources))if(record(x,['id','kind','spec','accessibleAlternative','status','sourceRefs'])){uid(x.id,resourceIds);if(!resourceKind(x.kind)||!requested.has(x.kind))add('INVALID_RESOURCE_KIND');str(x.spec);str(x.accessibleAlternative);sourceRefs(x.sourceRefs);if(x.status!=='REQUESTED'&&x.status!=='BLOCKED')add('UNVERIFIED_RESOURCE');}
 let sum=0;const teachingCovered=new Set<unknown>(),assessmentCovered=new Set<unknown>();
 for(const x of list(value.steps))if(record(x,['id','title','minutes','content','instruction','outcomeRefs','resourceRefs','sourceRefs'])){uid(x.id,stepIds);str(x.title);str(x.content);str(x.instruction);if(!positive(x.minutes,240))add('INVALID_MINUTES');else sum+=x.minutes;refs(x.outcomeRefs,outcomeIds,'BROKEN_OUTCOME_REF',true);arr(x.outcomeRefs).forEach(y=>teachingCovered.add(y));refs(x.resourceRefs,resourceIds,'BROKEN_RESOURCE_REF');sourceRefs(x.sourceRefs);}
 for(const x of list(value.assessmentItems))if(record(x,['id','kind','outcomeRefs','instruction','criterion','feedback','sourceRefs'])){uid(x.id,assessmentIds);if(x.kind!=='OPEN_RESPONSE')add('INVALID_ASSESSMENT');refs(x.outcomeRefs,outcomeIds,'BROKEN_OUTCOME_REF',true);arr(x.outcomeRefs).forEach(y=>assessmentCovered.add(y));str(x.instruction);str(x.criterion);str(x.feedback);sourceRefs(x.sourceRefs);}
 if(record(value.review,['status','lockedSectionIds','diagnostics'])){const r=value.review;if(r.status!=='REVIEW_REQUIRED')add('UNVERIFIED_APPROVAL');refs(r.lockedSectionIds,stepIds,'BROKEN_SECTION_REF');const ds=list(r.diagnostics,20);if(ds.some(x=>typeof x!=='string'||!diagnosticsAllowed.has(x)))add('INVALID_DIAGNOSTIC');if(!ds.includes('CURRICOLO_UNBOUND')||!ds.includes('CONTENT_REVIEW_REQUIRED'))add('MISSING_DIAGNOSTIC');const missing=ds.includes('CONTENT_SOURCE_MISSING')||ds.includes('CONTENT_SOURCE_MISMATCH');if(missing){if(stepIds.size||outcomeIds.size||assessmentIds.size||resourceIds.size||sourceIds.size)add('CONTENT_WITHOUT_SOURCE');}else{if(!stepIds.size||!outcomeIds.size||!assessmentIds.size||!sourceIds.size)add('INCOMPLETE_CONTENT');if(sum!==duration)add('TIMING_MISMATCH');if([...outcomeIds].some(x=>!teachingCovered.has(x)))add('UNCOVERED_TEACHING_OUTCOME');if([...outcomeIds].some(x=>!assessmentCovered.has(x)))add('UNCOVERED_OUTCOME');}}
 return [...errors].sort();
}
function assertDraft(v:unknown):asserts v is Draft {const e=validateDidacticDraft(v);if(e.length)throw Error(e.join(','));}
export function composeDidacticDraft(input:ComposeInput):Draft {
 const {project,config,pack,draftId}=input;
 if(!text(project.idea)||!id(project.projectId)||!positive(project.revision)||!id(draftId))throw Error('INVALID_PROJECT');
 const matched=pack&&normalized(project.idea)===normalized(pack.topic)&&pack.subjectRef===config.subjectRef&&pack.grade===config.grade;
 const selected=matched?pack:undefined;
 const d:Draft={schemaVersion:SCHEMA,draftId,projectId:project.projectId,revision:1,sourceProjectRevision:project.revision,config:structuredClone(config),curricolo:{status:'UNBOUND',objectiveRefs:[]},sources:[],outcomes:[],steps:[],resources:[],assessmentItems:[],review:{status:'REVIEW_REQUIRED',lockedSectionIds:[],diagnostics:['CURRICOLO_UNBOUND','CONTENT_REVIEW_REQUIRED']},governance:{costClass:'FREE_ONLY',paidComputeAuthorized:false,publicationAuthorized:false,studentAuthorized:false}};
 if(!selected){d.review.diagnostics.push(pack?'CONTENT_SOURCE_MISMATCH':'CONTENT_SOURCE_MISSING');assertDraft(d);return d;}
 // Explicitly reconstruct allowed fields: no arbitrary pack properties or authority copied.
 d.sources=[{id:selected.id,kind:'CONTEXT_REFERENCE',ref:selected.sourceRef,revision:selected.revision,verification:'CONTEXT_ONLY'}];
 d.outcomes=selected.outcomes.map(x=>({id:x.id,text:x.text,sourceRefs:[]}));
 d.resources=selected.resources.filter(x=>config.requestedResourceKinds.includes(x.kind)).map(x=>({id:x.id,kind:x.kind,spec:x.spec,accessibleAlternative:x.accessibleAlternative,status:'REQUESTED',sourceRefs:[]}));
 const selectedIds=new Set(d.resources.map(x=>x.id));const knownIds=new Set(selected.resources.map(x=>x.id));
 d.steps=selected.steps.map(x=>({id:x.id,title:x.title,minutes:x.minutes,content:x.content,instruction:x.instruction,outcomeRefs:[...x.outcomeRefs],resourceRefs:x.resourceRefs.filter(r=>selectedIds.has(r)||!knownIds.has(r)),sourceRefs:[]}));
 d.assessmentItems=selected.assessmentItems.map(x=>({id:x.id,kind:x.kind,outcomeRefs:[...x.outcomeRefs],instruction:x.instruction,criterion:x.criterion,feedback:x.feedback,sourceRefs:[]}));
 assertDraft(d);return d;
}
export function reviseSection(draft:Draft,sectionId:string,content:string,expectedRevision:number):Draft {
 assertDraft(draft);if(expectedRevision!==draft.revision)throw Error('REVISION_CONFLICT');if(draft.review.lockedSectionIds.includes(sectionId))throw Error('SECTION_LOCKED');if(!draft.steps.some(x=>x.id===sectionId))throw Error('SECTION_NOT_FOUND');
 const next=structuredClone(draft);next.steps=next.steps.map(x=>x.id===sectionId?{...x,content,sourceRefs:[]}:x);next.revision++;next.review.status='REVIEW_REQUIRED';assertDraft(next);return next;
}
function ordered(v:unknown):unknown {if(Array.isArray(v))return v.map(ordered);if(isRecord(v))return Object.fromEntries(Object.keys(v).sort().map(k=>[k,ordered(v[k])]));return v;}
export function canonicalDraft(value:unknown):string {assertDraft(value);return JSON.stringify(ordered(value));}
