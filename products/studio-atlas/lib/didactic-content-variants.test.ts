import test from "node:test";
import assert from "node:assert/strict";
import {composeDidacticDraft,validateDidacticDraft,canonicalDraft} from "./didactic-draft";
import {sourceForIdea,defaultDidacticConfig} from "./didactic-content-candidates";
import {DURATION_CHOICES,SUPPORT_CHOICES} from "./didactic-content-variants";
const make=(idea:string,duration:number,support:string)=>{
 const config={...defaultDidacticConfig(idea),durationMinutes:duration,differentiationMode:support};
 return composeDidacticDraft({project:{projectId:"p",revision:1,idea,grammar:"INQUIRY_EVIDENCE"},config,pack:sourceForIdea(idea,duration,support),draftId:"d"});
};
for(const idea of ["Agricoltura","Energia","Ingranaggi"])test("EC04b: variants, references and authority for "+idea,()=>{
 const revisions=new Set<string>();
 for(const duration of DURATION_CHOICES)for(const mode of SUPPORT_CHOICES){
  const d=make(idea,duration,mode.id);
  assert.deepEqual(validateDidacticDraft(d),[]);
  assert.equal(d.steps.length,5);assert.equal(d.steps.reduce((n,s)=>n+s.minutes,0),duration);
  assert.equal(d.steps[2].instruction.includes("Supporto:"),mode.id==="COMMON_WITH_SUPPORT");
  assert.equal(d.curricolo.status,"UNBOUND");assert.equal(d.governance.publicationAuthorized,false);assert.equal(d.governance.studentAuthorized,false);
  assert.ok(d.resources.every(r=>r.status==="REQUESTED"));
  assert.equal(canonicalDraft(d),canonicalDraft(make(idea,duration,mode.id)));
  revisions.add(d.sources[0].revision);
 }
 assert.equal(revisions.size,6);
 assert.notEqual(make(idea,45,"COMMON").steps[2].instruction,make(idea,90,"COMMON").steps[2].instruction);
});
test("EC04b: source bounds and simulation remains a request",()=>{
 assert.equal(sourceForIdea("Altro",60),undefined);assert.equal(sourceForIdea("Energia",30),undefined);assert.equal(sourceForIdea("Energia",60,"OTHER"),undefined);
 const d=make("Ingranaggi",90,"COMMON");assert.equal(d.resources.find(r=>r.kind==="SIMULATION")?.status,"REQUESTED");
 assert.ok(!make("Energia",90,"COMMON").resources.some(r=>r.kind==="SIMULATION"));
 const a=sourceForIdea("Ingranaggi",45)!;a.steps[0].content="mutated";assert.notEqual(sourceForIdea("Ingranaggi",45)!.steps[0].content,"mutated");
 const wrong={...defaultDidacticConfig("Ingranaggi"),grade:"terza"};
 const mismatch=composeDidacticDraft({project:{projectId:"p",revision:1,idea:"Ingranaggi",grammar:"INQUIRY_EVIDENCE"},config:wrong,pack:sourceForIdea("Ingranaggi"),draftId:"d"});
 assert.equal(mismatch.steps.length,0);assert.ok(mismatch.review.diagnostics.includes("CONTENT_SOURCE_MISMATCH"));
});
