import type {EduTwinDraftInput} from "./edutwin-draft";
import {compileEduTwinDraft} from "./edutwin-draft";
import type {PathwayProject} from "./model";

// Internal, minimised authoring input, not a new interchange format or a transcript.
const categories=["CONTEXT","MOTIVATION","ACTION","AGENCY","CLOSURE","CRAFT","LEARNING","ACCESSIBILITY"] as const;
type Category=typeof categories[number];
type Decision={id:string;category:Category;requirement:string};
type Feedback={id:string;category:Category;observation:string;requestedChange:string};
type AssetRef={id:string;kind:"IMAGE"|"AUDIO"|"VIDEO"|"DOCUMENT";sha256:string};
type Response={feedbackId:string;proposedChange:string};
type Brief={theme:string;ageBand:EduTwinDraftInput["ageBand"];objective:string;durationMinutes:number;constraints:string[]};
type Input={brief:Brief;authoring:EduTwinDraftInput;decisions:Decision[];feedback:Feedback[];assets:AssetRef[];responses:Response[]};
type Identity={projectId:string;now:string};
type Body={
 project:PathwayProject;brief:Brief;decisions:Decision[];
 feedback:Array<Feedback&{targetRevision:number;targetDigest:string}>;
 assets:AssetRef[];
 responses:Array<Response&{revision:number}>;
 parentDigest:string|null;
 authoringPackage:object;
 reviewRequired:true;assetBytesVerified:false;runtimeAuthorized:false;studentAuthorized:false;publicationAuthorized:false;
};
export type ConversationRevision=Body&{digest:string};

const fail=(code:string):never=>{throw new Error(code);};
const obj=(x:unknown,required:readonly string[],optional:readonly string[]=[])=>{
 if(x===null||typeof x!=="object"||Array.isArray(x)||![Object.prototype,null].includes(Object.getPrototypeOf(x)))return fail("INVALID_INPUT_OBJECT");
 const o=x as Record<string,unknown>,allowed=new Set([...required,...optional]);
 if(Object.keys(o).some(k=>!allowed.has(k))||required.some(k=>!Object.hasOwn(o,k)))return fail("INVALID_INPUT_FIELDS");
 return o;
};
const str=(x:unknown,max=4000):string=>{
 if(typeof x!=="string"||!x.trim()||x.length>max)return fail("INVALID_INPUT_TEXT");
 return x.trim();
};
const id=(x:unknown):string=>{
 const s=str(x,100);if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(s))return fail("INVALID_ID");return s;
};
const digestText=(x:unknown):string=>{
 const s=str(x,64);if(!/^[a-f0-9]{64}$/.test(s))return fail("INVALID_DIGEST");return s;
};
const oneOf=<T extends string>(x:unknown,values:readonly T[]):T=>{
 if(typeof x!=="string"||!values.includes(x as T))return fail("INVALID_ENUM");return x as T;
};
const arr=(x:unknown,max:number):unknown[]=>{if(!Array.isArray(x)||x.length>max)return fail("INVALID_ARRAY");return x;};
const texts=(x:unknown,keys:readonly string[])=>{
 const o=obj(x,keys);return Object.fromEntries(keys.map(k=>[k,str(o[k])]));
};
function world(x:unknown){
 const o=obj(x,["place","status","signals"]);
 return {place:str(o.place),status:str(o.status),signals:arr(o.signals,40).map(x=>{
  const s=obj(x,["id","label","state"],["detail"]);
  return {id:id(s.id),label:str(s.label),state:oneOf(s.state,["OFF","READY","ACTIVE","DELAYED","MISMATCH","STABLE","MANUAL"] as const),...(s.detail===undefined?{}:{detail:str(s.detail)})};
 })};
}
function parseAuthoring(x:unknown):EduTwinDraftInput{
 const a=obj(x,["title","idea","ageBand","opening","story","world","experience","scenes"]);
 const experience=obj(a.experience,["grammar","rationale"]);
 const scenes=arr(a.scenes,100).map(x=>{
  // Stage/workbench support needs explicit validation in a later slice. Never silently drop it.
  const s=obj(x,["sceneId","kind","interaction","title","visibleSituation","learnerAction","consequence","reveal","choices"],["world"]);
  return {
   sceneId:id(s.sceneId),kind:oneOf(s.kind,["SCENE","TRANSFER"] as const),interaction:oneOf(s.interaction,["SUMMARY","CHOICE"] as const),
   title:str(s.title),visibleSituation:str(s.visibleSituation),learnerAction:str(s.learnerAction),consequence:str(s.consequence),reveal:str(s.reveal),
   ...(s.world===undefined?{}:{world:world(s.world)}),
   choices:arr(s.choices,20).map(x=>{const c=obj(x,["choiceId","label","feedback","targetSceneId"],["worldAfter"]);return {
    choiceId:id(c.choiceId),label:str(c.label),feedback:str(c.feedback),targetSceneId:id(c.targetSceneId),
    ...(c.worldAfter===undefined?{}:{worldAfter:world(c.worldAfter)})
   };})
  };
 });
 return {
  title:str(a.title,200),idea:str(a.idea),ageBand:oneOf(a.ageBand,["later-primary","lower-secondary","mixed-first-cycle"] as const),
  opening:texts(a.opening,["theme","setting","characters","disruption","role","mission","firstAction"]) as EduTwinDraftInput["opening"],
  story:texts(a.story,["hook","setting","characters","characterGoal","disruption","unknown","learnerRole","turningPoint","ending"]) as EduTwinDraftInput["story"],
  world:texts(a.world,["learnerRole","canObserve","canChange","unknown","consequence","motivation"]) as EduTwinDraftInput["world"],
  experience:{grammar:oneOf(experience.grammar,["INQUIRY_EVIDENCE","BRANCHING_CONSEQUENCE","WORKSHOP_CONSTRUCTION","SIMULATION_MICROWORLD","VISUAL_NARRATIVE","ENVIRONMENTAL_STORYTELLING"] as const),rationale:str(experience.rationale)},
  scenes
 };
}
function parseInput(x:unknown):Input{
 const o=obj(x,["brief","authoring","decisions","feedback","assets","responses"]);
 const b=obj(o.brief,["theme","ageBand","objective","durationMinutes","constraints"]);
 if(typeof b.durationMinutes!=="number"||!Number.isInteger(b.durationMinutes)||b.durationMinutes<1||b.durationMinutes>240)return fail("INVALID_DURATION");
 return {
  brief:{theme:str(b.theme),ageBand:oneOf(b.ageBand,["later-primary","lower-secondary","mixed-first-cycle"] as const),objective:str(b.objective),durationMinutes:b.durationMinutes,constraints:arr(b.constraints,20).map(x=>str(x))},
  authoring:parseAuthoring(o.authoring),
  decisions:arr(o.decisions,100).map(x=>{const d=obj(x,["id","category","requirement"]);return {id:id(d.id),category:oneOf(d.category,categories),requirement:str(d.requirement)};}),
  feedback:arr(o.feedback,100).map(x=>{const f=obj(x,["id","category","observation","requestedChange"]);return {id:id(f.id),category:oneOf(f.category,categories),observation:str(f.observation),requestedChange:str(f.requestedChange)};}),
  assets:arr(o.assets,100).map(x=>{const a=obj(x,["id","kind","sha256"]);return {id:id(a.id),kind:oneOf(a.kind,["IMAGE","AUDIO","VIDEO","DOCUMENT"] as const),sha256:digestText(a.sha256)};}),
  responses:arr(o.responses,100).map(x=>{const a=obj(x,["feedbackId","proposedChange"]);return {feedbackId:id(a.feedbackId),proposedChange:str(a.proposedChange)};})
 };
}
function appendUnique<T extends {id:string}>(previous:T[],next:T[],error:string):T[]{
 const all=[...previous,...next];if(new Set(all.map(x=>x.id)).size!==all.length)return fail(error);
 if(all.length>1000)return fail("REVISION_LIMIT");
 return all;
}
// Stable internal revision hash; integrity only, not reviewer authentication.
function canonical(x:unknown):string{
 if(x===null||typeof x!=="object")return JSON.stringify(x);
 if(Array.isArray(x))return "["+x.map(canonical).join(",")+"]";
 const o=x as Record<string,unknown>;
 return "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canonical(o[k])).join(",")+"}";
}
async function hash(x:unknown){
 const bytes=new TextEncoder().encode(canonical(x));
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function packageDraft(project:PathwayProject){
 return {
  schemaVersion:"atlas.pathway-authoring-package/v0.1",
  packageId:"pkg-"+project.projectId,packageVersion:project.revision,pathwayId:project.projectId,
  title:project.title,authoringState:"AUTHORING",sourceSeed:{kind:"PLAIN_IDEA",minimised:true},
  createdAt:project.createdAt,updatedAt:project.updatedAt,
  scenes:project.scenes.map((s,i)=>({
   sceneId:s.sceneId,order:i+1,purpose:s.title,learnerVisibleSituation:s.visibleSituation,
   learnerActions:[s.learnerAction],consequences:[s.consequence],informationRevealed:[s.reveal],
   interaction:s.interaction,
   nextSceneRefs:s.interaction==="CHOICE"?s.choices.map(c=>c.targetSceneId):i+1<project.scenes.length?[project.scenes[i+1].sceneId]:[],
   ...(s.world?{world:s.world}:{}),...(s.interaction==="CHOICE"?{choices:s.choices}:{})
  })),
  publicationCandidate:{decision:"DRAFT"},runtimeAuthorized:false
 };
}
// previous and expectedParentDigest must come from the trusted local caller, never a claimed human approval.
// Input text still requires privacy and semantic review. No raw transcript storage or external calls.
export async function compileConversationRevision(raw:unknown,identity:Identity,previous?:ConversationRevision,expectedParentDigest?:string):Promise<ConversationRevision>{
 const input=parseInput(raw);
 const projectId=id(identity.projectId);
 const now=str(identity.now,40);
 if(!Number.isFinite(Date.parse(now))||new Date(now).toISOString()!==now)return fail("INVALID_TIME");
 if(input.brief.ageBand!==input.authoring.ageBand)return fail("AUDIENCE_MISMATCH");
 if(previous){
  const {digest,...body}=previous;
  if(digest!==expectedParentDigest||digest!==await hash(body)||previous.project.projectId!==projectId)return fail("STALE_OR_CHANGED_PARENT");
  if(now<previous.project.updatedAt)return fail("INVALID_TIME");
 }else if(expectedParentDigest!==undefined||input.feedback.length||input.responses.length)return fail("PARENT_REQUIRED");
 const project=compileEduTwinDraft(input.authoring,{projectId,now});
 project.revision=previous?previous.project.revision+1:1;
 if(previous)project.createdAt=previous.project.createdAt;
 const decisions=appendUnique(previous?.decisions??[],input.decisions,"DUPLICATE_DECISION");
 const assets=appendUnique(previous?.assets??[],input.assets,"ASSET_ID_ALREADY_RECORDED");
 const feedback=appendUnique(previous?.feedback??[],input.feedback.map(f=>({...f,targetRevision:previous!.project.revision,targetDigest:previous!.digest})),"DUPLICATE_FEEDBACK");
 if(new Set(input.responses.map(x=>x.feedbackId)).size!==input.responses.length||
    input.responses.some(x=>!feedback.some(f=>f.id===x.feedbackId)))return fail("INVALID_RESPONSE_REFERENCE");
 const responses=[...(previous?.responses??[]),...input.responses.map(r=>({...r,revision:project.revision}))];
 if(responses.length>1000)return fail("REVISION_LIMIT");
 const body:Body={
  project,brief:input.brief,decisions:structuredClone(decisions),feedback:structuredClone(feedback),
  assets:structuredClone(assets),responses:structuredClone(responses),parentDigest:previous?.digest??null,
  authoringPackage:packageDraft(project),
  reviewRequired:true,assetBytesVerified:false,runtimeAuthorized:false,studentAuthorized:false,publicationAuthorized:false
 };
 return {...body,digest:await hash(body)};
}
