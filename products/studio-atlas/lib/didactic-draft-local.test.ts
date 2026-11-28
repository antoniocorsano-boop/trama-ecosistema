import test from "node:test";
import assert from "node:assert/strict";
import {composeDidacticDraft,reviseSection} from "./didactic-draft";
import {defaultDidacticConfig,sourceForIdea} from "./didactic-content-candidates";
import {readDidacticDraft,saveDidacticDraft} from "./didactic-draft-local";
const project={projectId:"p",revision:1,idea:"Agricoltura",grammar:"INQUIRY_EVIDENCE"};
const compose=(idea:string,id="d")=>composeDidacticDraft({project:{...project,idea},config:defaultDidacticConfig(idea),pack:sourceForIdea(idea),draftId:id});
function memory(){const m=new Map<string,string>();return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);}};}
test("EC04a composes two distinct contextual source candidates and refuses unknown idea",()=>{
 const a=compose("Agricoltura"),b=compose("Energia");assert.equal(a.steps.length,5);assert.equal(b.steps.length,5);assert.notEqual(a.steps[0].content,b.steps[0].content);assert.equal(compose("Altro").steps.length,0);assert.equal(a.governance.publicationAuthorized,false);
 const p=sourceForIdea("Agricoltura")!;p.steps[0].content="modified";assert.notEqual(sourceForIdea("Agricoltura")!.steps[0].content,"modified");
});
test("EC04a local save reload revision conflicts and project revision conflicts",()=>{
 const storage=memory(),a=compose("Agricoltura");saveDidacticDraft(storage,a,project,null);assert.deepEqual(readDidacticDraft(storage,"p"),a);assert.equal(readDidacticDraft(storage,"other"),null);
 const b=reviseSection(a,"s1","Contenuto riveduto",1);saveDidacticDraft(storage,b,project,a);assert.throws(()=>saveDidacticDraft(storage,b,project,a),/DRAFT_REVISION_CONFLICT/);assert.throws(()=>saveDidacticDraft(storage,b,{...project,revision:2},b),/PROJECT_REVISION_CONFLICT/);
 assert.deepEqual(readDidacticDraft(storage,"p"),b);
});
