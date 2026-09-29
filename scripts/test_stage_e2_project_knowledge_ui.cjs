const assert=require('assert');
const api=require('../control-center/project-knowledge-state.js');

function pack(effective){
  const base={
    schemaVersion:'1.0.0',
    subject:'project-knowledge',
    asOf:'2026-09-29T06:42:00Z',
    status:'PARTIAL',
    facts:[],decisions:[],activeInvariants:[],evidence:[],exactHeads:[],
    blockingGates:[],dependencies:[],knownConflicts:[],knownRejectedApproaches:[],
    nextCandidateActions:[],sourceRefs:[{repository:'example/repo',ref:'docs/example.md'}]
  };
  if(effective)base.effectiveContext=effective;
  return base;
}

const current=api.derive(pack());
assert.equal(current.kind,'unavailable');
assert.match(current.title,/informazioni di riferimento/i);
assert.match(current.summary,/aggiornamenti recenti non sono ancora disponibili/i);

const normal=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:58:00Z',
  governedKnowledgeStatus:'CURRENT',
  liveObservationStatus:'FRESH',
  semanticDriftStatus:'NONE',
  effectiveContextStatus:'USABLE',
  promotionRequired:false,
  liveFacts:[{class:'VOLATILE',kind:'repository-head'}],
  sourceRefs:[]
}));
assert.equal(normal.kind,'normal');
assert.equal(normal.actionRequired,false);

const empty=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:58:00Z',
  governedKnowledgeStatus:'CURRENT',
  liveObservationStatus:'FRESH',
  semanticDriftStatus:'NONE',
  effectiveContextStatus:'USABLE',
  promotionRequired:false,
  liveFacts:[],
  sourceRefs:[]
}));
assert.equal(empty.kind,'empty');

const partial=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:54:00Z',
  governedKnowledgeStatus:'CURRENT',
  liveObservationStatus:'PARTIAL',
  semanticDriftStatus:'DETECTED',
  effectiveContextStatus:'DEGRADED',
  promotionRequired:false,
  liveFacts:[],
  sourceRefs:[]
}));
assert.equal(partial.kind,'partial');
assert.match(partial.summary,/continuare a consultare/i);

const review=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:56:00Z',
  governedKnowledgeStatus:'CURRENT',
  liveObservationStatus:'FRESH',
  semanticDriftStatus:'REVIEW_REQUIRED',
  effectiveContextStatus:'USABLE',
  promotionRequired:false,
  liveFacts:[],
  sourceRefs:[]
}));
assert.equal(review.kind,'review');
assert.equal(review.actionRequired,true);

const blocked=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:57:00Z',
  governedKnowledgeStatus:'UNKNOWN',
  liveObservationStatus:'FRESH',
  semanticDriftStatus:'REVIEW_REQUIRED',
  effectiveContextStatus:'BLOCKED',
  promotionRequired:false,
  liveFacts:[],
  sourceRefs:[]
}));
assert.equal(blocked.kind,'blocked');
assert.equal(blocked.actionRequired,true);

const noaccess=api.derive(pack({
  governedAsOf:'2026-09-29T06:42:00Z',
  liveObservedAt:'2026-09-29T06:58:00Z',
  governedKnowledgeStatus:'CURRENT',
  liveObservationStatus:'FRESH',
  semanticDriftStatus:'NONE',
  effectiveContextStatus:'USABLE',
  accessStatus:'NO_ACCESS',
  promotionRequired:false,
  liveFacts:[],
  sourceRefs:[]
}));
assert.equal(noaccess.kind,'noaccess');
assert.equal(noaccess.actionRequired,false);
assert.equal(noaccess.technical.restricted,true);

const offline=api.derive(pack(),'offline-cache');
assert.equal(offline.kind,'offline');
assert.match(offline.title,/ultimo stato disponibile/i);

const invalid=api.derive({subject:'other'});
assert.equal(invalid.kind,'error');

for(const view of [current,normal,empty,partial,review,blocked,noaccess,offline]){
  const primary=[view.title,view.summary,view.verifiedTitle,view.verifiedText,view.updatesTitle,view.updatesText,view.notice||''].join(' ').toLowerCase();
  for(const forbidden of ['semantic drift','repository head mismatch','promotionrequired']){
    assert.equal(primary.includes(forbidden),false,forbidden+' leaked to primary copy');
  }
}

console.log('TRAMA Stage E2 project knowledge UI mapping: PASS');
