import test from "node:test";
import assert from "node:assert/strict";
import {propose,makeReview} from "./review-guard.mjs";
test("only exact bounded intents; negation, ambiguity and mutations rejected",()=>{
  assert.equal(propose("Apri il calendario.")?.target,"Calendario");
  for(const s of ["non aprire il calendario","apri il calendario e mostra l'orario","cancella il calendario","calendario","registra un voto","apri calendario [unk]",""]) assert.equal(propose(s),null,s);
});
test("loss of negation cannot trigger an automatic action",()=>{
  const g=makeReview(), p=g.review("apri calendario");
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:p.target}),null);
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:p.target,explicit:true}).status,"SIMULATED");
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:p.target,explicit:true}),null);
});
test("transcript edit, wrong target, new session and stale approval fail closed",()=>{
  const g=makeReview(), p=g.review("apri calendario");
  assert.equal(g.confirm({revision:p.revision,text:"non aprire il calendario",target:p.target,explicit:true}),null);
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:"Orario",explicit:true}),null);
  g.invalidate();
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:p.target,explicit:true}),null);
  const q=g.review("mostra orario");
  assert.equal(g.confirm({revision:p.revision,text:p.transcript,target:p.target,explicit:true}),null);
  assert.equal(g.confirm({revision:q.revision,text:q.transcript,target:q.target,explicit:true}).target,"Orario");
});
