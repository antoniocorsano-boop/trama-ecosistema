import {test} from "node:test";
import assert from "node:assert/strict";
import {addStageLocation,addStageEvidence,removeStageLocation,stagePlaceErrors} from "./scene-places";
import {createMuseoZeroPilotProject} from "./canonical/museo-zero";
test("ESS-01A: blank place is blocked, evidence must reference an existing location",()=>{
 const a=addStageLocation(undefined,"field");
 assert.equal(a.focusLocationId,"field");
 assert.deepEqual(stagePlaceErrors(a),["LOCATION"]);
 assert.throws(()=>addStageEvidence(a,"e","missing"),/EVIDENCE_REFERENCE/);
 const b={...a,locations:a.locations!.map(l=>({...l,label:"Campo",detail:"Terreno coltivato"}))};
 const c=addStageEvidence(b,"e","field");
 assert.deepEqual(stagePlaceErrors(c),["EVIDENCE"]);
 const d={...c,evidence:c.evidence!.map(e=>({...e,label:"Suolo",detail:"Il suolo trattiene acqua"}))};
 assert.deepEqual(stagePlaceErrors(d),[]);
 assert.throws(()=>removeStageLocation(d,"field"),/LOCATION_HAS_EVIDENCE/);
 assert.deepEqual(stagePlaceErrors({...d,focusLocationId:"missing"}),["FOCUS"]);
 assert.deepEqual(stagePlaceErrors({...d,evidence:d.evidence!.map(e=>({...e,locationId:"missing"}))}),["EVIDENCE"]);
 assert.deepEqual(stagePlaceErrors({...d,evidence:[...d.evidence!,...d.evidence!]}),["EVIDENCE"]);
 const next=removeStageLocation({...d,evidence:[]},"field");
 assert.equal(next.focusLocationId,undefined);
 assert.deepEqual(stagePlaceErrors(next),[]);
 assert.equal(d.locations!.length,1);
});
test("ESS-01A: existing canonical locations and evidence remain valid",()=>{
 for(const scene of createMuseoZeroPilotProject().scenes) assert.deepEqual(stagePlaceErrors(scene.stage),[],scene.title);
});
