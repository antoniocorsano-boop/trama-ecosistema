import type { EcosystemSnapshot } from "../snapshot/types";

export type OperationalItem={ref:string;kind?:string;label?:string;status?:string;area?:string;decisionAuthority?:string;dependencyRefs?:string[];state?:string;runtimeState?:string;subjectRef?:string;dependencyRef?:string;dependencyKind?:string;dependencyStatus?:string};
export type OperationalPath={currentActivities:OperationalItem[];nextGates:OperationalItem[];nextIncrements:OperationalItem[];explicitDefers:OperationalItem[];unmetDependencies:OperationalItem[]};
export type TimelineEvent={id:string;eventType?:string;occurredAt?:string;label?:string;subjectRef?:string;sourceRef?:string;authority?:string;versionRef?:string;details?:string[]};
export type OperationsModel={generatedAt:string;operationalPath:OperationalPath;timelineEvents:TimelineEvent[]};

export function toOperationsModel(snapshot:EcosystemSnapshot):OperationsModel{
 const p=(snapshot.operationalPath && typeof snapshot.operationalPath==="object" ? snapshot.operationalPath : {}) as Partial<OperationalPath>;
 return {
  generatedAt:snapshot.generatedAt,
  operationalPath:{
   currentActivities:Array.isArray(p.currentActivities)?p.currentActivities:[],
   nextGates:Array.isArray(p.nextGates)?p.nextGates:[],
   nextIncrements:Array.isArray(p.nextIncrements)?p.nextIncrements:[],
   explicitDefers:Array.isArray(p.explicitDefers)?p.explicitDefers:[],
   unmetDependencies:Array.isArray(p.unmetDependencies)?p.unmetDependencies:[],
  },
  timelineEvents:Array.isArray(snapshot.timelineEvents)?snapshot.timelineEvents as TimelineEvent[]:[]
 };
}

export function eventTime(value?:string){const n=value?new Date(value).getTime():NaN;return Number.isNaN(n)?0:n;}
export function sortTimeline(events:TimelineEvent[]){return [...events].sort((a,b)=>eventTime(b.occurredAt)-eventTime(a.occurredAt));}
