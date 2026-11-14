import type { PathwayProject, PathwayScene, SceneWorldState } from "./model";

// Internal authoring adapter: existing Studio Atlas model, not a public format.
// Accepts already-authored, minimised content; does not generate text with an LLM.
export type EduTwinDraftInput = Pick<PathwayProject,
 "title"|"idea"|"ageBand"|"story"|"world"|"experience"|"scenes"> & {
 opening: {
  theme: string; setting: string; characters: string; disruption: string;
  role: string; mission: string; firstAction: string;
 };
};
type Identity={projectId:string;now:string};
const OPENING_ID="edutwin-opening";
const text=(value:unknown):value is string=>typeof value==="string"&&value.trim().length>0;
const requireText=(values:unknown[],error:string)=>{
 if(!values.every(text))throw new Error(error);
};
const worldStates=new Set(["OFF","READY","ACTIVE","DELAYED","MISMATCH","STABLE","MANUAL"]);
function validateWorld(world:SceneWorldState|undefined,error:string){
 if(!world||!text(world.place)||!text(world.status)||!Array.isArray(world.signals)||!world.signals.length)
  throw new Error(error);
 const ids=new Set<string>();
 for(const signal of world.signals){
  if(!text(signal.id)||!text(signal.label)||!worldStates.has(signal.state)||ids.has(signal.id))throw new Error(error);
  ids.add(signal.id);
 }
}
// Cosmetic wording alone does not count as a changed world signal.
const signature=(world:SceneWorldState)=>JSON.stringify(world.signals.map(s=>[s.id,s.state]).sort((a,b)=>a[0].localeCompare(b[0])));

export function compileEduTwinDraft(input:EduTwinDraftInput,identity:Identity):PathwayProject{
 requireText([input.title,input.idea,identity.projectId,identity.now],"MISSING_DRAFT_IDENTITY");
 if(!["later-primary","lower-secondary","mixed-first-cycle"].includes(input.ageBand))throw new Error("UNSUPPORTED_AGE_BAND");
 const o=input.opening;
 requireText([o.theme,o.setting,o.characters,o.disruption,o.role,o.mission,o.firstAction],"OPENING_INCOMPLETE");
 if(/^(continua|avanti|inizia|procedi|prosegui|esplora|scopri)[.! ]*$/i.test(o.firstAction.trim()))throw new Error("GENERIC_FIRST_ACTION");
 const {story,world,experience}=input;
 requireText([story.hook,story.setting,story.characters,story.characterGoal,story.disruption,story.unknown,story.learnerRole,story.turningPoint,story.ending],"STORY_INCOMPLETE");
 requireText([world.learnerRole,world.canObserve,world.canChange,world.unknown,world.consequence,world.motivation,experience.grammar,experience.rationale],"WORLD_INCOMPLETE");
 if(!Array.isArray(input.scenes)||input.scenes.length<3||input.scenes.length>100)throw new Error("SCENE_COUNT");
 const scenes=structuredClone(input.scenes);
 const ids=new Set<string>([OPENING_ID]);
 for(const scene of scenes){
  requireText([scene.sceneId,scene.title,scene.visibleSituation,scene.learnerAction,scene.consequence,scene.reveal],"INCOMPLETE_SCENE");
  if(ids.has(scene.sceneId))throw new Error("DUPLICATE_SCENE");
  ids.add(scene.sceneId);
  if(!["SCENE","TRANSFER"].includes(scene.kind)||!["SUMMARY","CHOICE"].includes(scene.interaction)||!Array.isArray(scene.choices))throw new Error("UNSUPPORTED_SCENE");
  if(scene.world)validateWorld(scene.world,"INVALID_WORLD_STATE");
 }
 if(scenes.at(-1)!.interaction!=="SUMMARY")throw new Error("MISSING_NARRATIVE_CLOSURE");
 const edges=new Map<string,string[]>();
 let hasChoice=false;
 for(const [i,scene] of scenes.entries()){
  if(scene.interaction==="SUMMARY"){
   if(scene.choices.length)throw new Error("UNEXPECTED_CHOICES");
   edges.set(scene.sceneId,i+1<scenes.length?[scenes[i+1].sceneId]:[]);
   continue;
  }
  hasChoice=true;
  if(scene.choices.length<2)throw new Error("MISSING_CHOICES");
  const targets=new Set<string>(),choiceIds=new Set<string>(),states=new Set<string>(),labels=new Set<string>();
  for(const c of scene.choices){
   requireText([c.choiceId,c.label,c.feedback,c.targetSceneId],"INCOMPLETE_CHOICE");
   if(c.targetSceneId===OPENING_ID||!ids.has(c.targetSceneId))throw new Error("INVALID_TARGET");
   if(choiceIds.has(c.choiceId)||labels.has(c.label.trim()))throw new Error("DUPLICATE_CHOICE");
   choiceIds.add(c.choiceId);labels.add(c.label.trim());targets.add(c.targetSceneId);
   validateWorld(c.worldAfter,"MISSING_WORLD_CONSEQUENCE");
   states.add(signature(c.worldAfter!));
  }
  if(targets.size!==scene.choices.length)throw new Error("INDISTINGUISHABLE_BRANCHES");
  if(states.size!==scene.choices.length)throw new Error("INDISTINGUISHABLE_CONSEQUENCES");
  edges.set(scene.sceneId,[...targets]);
 }
 if(!hasChoice)throw new Error("MEANINGFUL_CHOICE_REQUIRED");
 const visited=new Set<string>();
 const visit=(id:string)=>{if(visited.has(id))return;visited.add(id);for(const next of edges.get(id)??[])visit(next);};
 visit(scenes[0].sceneId);
 if(visited.size!==scenes.length)throw new Error("UNREACHABLE_SCENE");
 const reachesEnd=new Set([scenes.at(-1)!.sceneId]);
 let changed=true;
 while(changed){changed=false;for(const [id,targets] of edges)if(!reachesEnd.has(id)&&targets.some(t=>reachesEnd.has(t))){reachesEnd.add(id);changed=true;}}
 if(reachesEnd.size!==scenes.length)throw new Error("UNRESOLVABLE_SCENE");
 const opening:PathwayScene={sceneId:OPENING_ID,kind:"SCENE",interaction:"SUMMARY",title:input.title,
  visibleSituation:[o.theme,o.setting,o.characters,o.disruption,o.role,o.mission].join("\n\n"),
  learnerAction:o.firstAction,consequence:"Entri nella prima situazione della storia.",reveal:"La missione comincia.",choices:[]};
 return {
  projectId:identity.projectId,title:input.title,idea:input.idea,ageBand:input.ageBand,
  humanState:"STORY_DRAFT",productionState:"NOT_REQUESTED",
  story:structuredClone(story),storyReview:{decision:"DRAFT"},
  world:structuredClone(world),worldReview:{decision:"DRAFT"},productReview:{decision:"DRAFT"},
  experience:structuredClone(experience),scenes:[opening,...scenes],storyboardReady:false,
  archived:false,createdAt:identity.now,updatedAt:identity.now,revision:1,
 };
}
