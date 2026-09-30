import {describe,expect,it} from "vitest";
import {sortTimeline,toOperationsModel} from "./model";

describe("operations domain",()=>{
 it("preserves explicit defer and governed operational path",()=>{
  const model=toOperationsModel({
   schemaVersion:"1.6.0",generatedAt:"2026-09-30T09:00:00Z",
   operationalPath:{currentActivities:[],nextGates:[],nextIncrements:[],explicitDefers:[{ref:"DOS-A1",state:"DEFERRED",runtimeState:"DEFERRED"}],unmetDependencies:[]},
   timelineEvents:[]
  });
  expect(model.operationalPath.explicitDefers[0].ref).toBe("DOS-A1");
  expect(model.operationalPath.explicitDefers[0].runtimeState).toBe("DEFERRED");
 });
 it("sorts governed timeline newest first",()=>{
  const events=sortTimeline([
   {id:"old",occurredAt:"2026-09-25T00:00:00Z"},
   {id:"new",occurredAt:"2026-09-26T00:00:00Z"}
  ]);
  expect(events.map(e=>e.id)).toEqual(["new","old"]);
 });
});
