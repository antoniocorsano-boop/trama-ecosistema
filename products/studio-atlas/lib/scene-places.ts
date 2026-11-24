import type { SceneStage } from "./model";
import { validHotspot } from "./scene-media";
type Location=NonNullable<SceneStage["locations"]>[number];
type Evidence=NonNullable<SceneStage["evidence"]>[number];
const POSITIONS=["ENTRY","ROOM","CONTROL","LAB"] as const;
const KINDS=["TRACE","OBJECT","PERSON","SYSTEM"] as const;

export function stagePlaceErrors(stage:SceneStage|undefined):string[]{
  if(!stage)return [];
  const errors:string[]=[];
  const nonempty=(v:unknown)=>typeof v==="string"&&v.trim().length>0;
  if(stage.visualMode!=="CINEMATIC_EDITORIAL")errors.push("VISUAL_MODE");
  if(stage.locations!==undefined&&!Array.isArray(stage.locations))return [...errors,"LOCATIONS"];
  if(stage.evidence!==undefined&&!Array.isArray(stage.evidence))return [...errors,"EVIDENCE"];
  const ids=new Set<string>();
  for(const l of stage.locations??[]){
    if(!l||!nonempty(l.id)||ids.has(l.id)||!nonempty(l.label)||!nonempty(l.detail)||!POSITIONS.includes(l.position))errors.push("LOCATION");
    if(l&&nonempty(l.id))ids.add(l.id);
  }
  if(stage.focusLocationId!==undefined&&!ids.has(stage.focusLocationId))errors.push("FOCUS");
  const evidenceIds=new Set<string>();
  for(const e of stage.evidence??[]){
    if(!e||!nonempty(e.id)||evidenceIds.has(e.id)||!nonempty(e.label)||!nonempty(e.detail)||!ids.has(e.locationId)||!KINDS.includes(e.kind)||(e.character!==undefined&&!nonempty(e.character)))errors.push("EVIDENCE");
    if(e&&nonempty(e.id))evidenceIds.add(e.id);
    if(e?.hotspot!==undefined&&!validHotspot(e.hotspot))errors.push("HOTSPOT");
  }
  return [...new Set(errors)];
}

export function addStageLocation(stage:SceneStage|undefined,id:string):SceneStage{
  const current=stage??{visualMode:"CINEMATIC_EDITORIAL" as const};
  if(!id.trim()||current.locations?.some(l=>l.id===id))throw Error("LOCATION_ID");
  const location:Location={id,label:"",detail:"",position:"ROOM"};
  return {...current,locations:[...(current.locations??[]),location],focusLocationId:current.focusLocationId??id};
}
export function removeStageLocation(stage:SceneStage,id:string):SceneStage{
  if(stage.evidence?.some(e=>e.locationId===id))throw Error("LOCATION_HAS_EVIDENCE");
  const locations=(stage.locations??[]).filter(l=>l.id!==id);
  return {...stage,locations,focusLocationId:stage.focusLocationId===id?locations[0]?.id:stage.focusLocationId};
}
export function addStageEvidence(stage:SceneStage,id:string,locationId:string):SceneStage{
  if(!stage.locations?.some(l=>l.id===locationId)||!id.trim()||stage.evidence?.some(e=>e.id===id))throw Error("EVIDENCE_REFERENCE");
  const evidence:Evidence={id,locationId,label:"",detail:"",kind:"OBJECT"};
  return {...stage,evidence:[...(stage.evidence??[]),evidence]};
}
