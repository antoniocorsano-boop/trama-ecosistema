import fs from 'node:fs';
const q=JSON.parse(fs.readFileSync('governance/component-pattern/error-recovery-qualification.stage-a2.json','utf8'));
const r=JSON.parse(fs.readFileSync(q.evidenceReceiptRef,'utf8'));
const products=['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
const sha=/^[0-9a-f]{40}$/; const repo=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/; const clone=x=>structuredClone(x);
function validate(q,r){const e=[];
 if(q.contractId!=='TRAMA-COMPONENT-PATTERN-01'||q.stage!=='A.2'||q.candidateId!=='TRAMA.ERROR_RECOVERY')e.push('identity');
 if(q.baseline!=='0b88eaf0d56a31ceb6e10b3825f4b9508c5cae92')e.push('baseline');
 if(q.runtimeMigration!==false||q.dosA1!=='RUNTIME_DEFERRED')e.push('runtime-boundary');
 if(q.model!=='CAPABILITY_BASED')e.push('model');
 if(!Array.isArray(q.semanticCore?.sequence)||q.semanticCore.sequence.join('>')!=='DETECT>COMMUNICATE>PRESERVE_WHEN_POSSIBLE>RECOVER_WHEN_AVAILABLE>NEVER_REPORT_FALSE_SUCCESS')e.push('semantic-sequence');
 if(!q.semanticCore?.optionalCapabilities?.includes('CONTAIN'))e.push('contain-must-be-optional');
 if(q.decision==='QUALIFIED'&&q.qualificationGates?.humanIndependentReview!=='PASS')e.push('qualified-without-review');
 if(!['QUALIFICATION_CANDIDATE','QUALIFIED'].includes(q.decision))e.push('decision');
 if(r.digestKind!=='GIT_BLOB_SHA1'||r.baseline!==q.baseline||r.candidateId!==q.candidateId)e.push('receipt-header');
 const receipts=new Map(); for(const x of r.receipts||[]){if(receipts.has(x.receiptId))e.push('duplicate-receipt'); receipts.set(x.receiptId,x); if(!products.includes(x.product)||!repo.test(x.repository||'')||!sha.test(x.commit||'')||!sha.test(x.gitBlobSha||'')||!x.path||x.path.startsWith('/')||x.path.includes('..'))e.push(`invalid-receipt:${x.receiptId}`)}
 for(const p of products){const c=q.coverage?.[p];if(!c)e.push(`missing-coverage:${p}`);else{const x=receipts.get(c.receiptId);if(!x||x.product!==p)e.push(`receipt-binding:${p}`)}}
 if(receipts.size!==products.length)e.push('orphan-or-missing-receipts');
 if(q.qualificationGates?.immutableEvidenceReceipts!=='PASS')e.push('receipt-gate');
 if(q.qualificationGates?.frameworkNeutral!=='PASS')e.push('framework-neutral');
 if(q.qualificationGates?.crossProductCapabilityEvidence!=='PASS_WITH_PARTIAL_CELLS')e.push('coverage-gate');
 if(q.qualificationGates?.validator!=='PENDING'&&q.qualificationGates?.validator!=='PASS')e.push('validator-gate');
 if(!String(q.promotionRule||'').includes('Stage B'))e.push('promotion-rule'); return e;}
const mutations={
 'ERR-NEG-001':(q,r)=>q.runtimeMigration=true,
 'ERR-NEG-002':(q,r)=>q.dosA1='ACTIVE',
 'ERR-NEG-003':(q,r)=>q.semanticCore.optionalCapabilities=[],
 'ERR-NEG-004':(q,r)=>q.semanticCore.sequence[4]='REPORT_SUCCESS',
 'ERR-NEG-005':(q,r)=>q.coverage.ARENA.receiptId='missing',
 'ERR-NEG-006':(q,r)=>r.receipts[0].commit='main',
 'ERR-NEG-007':(q,r)=>r.receipts[0].gitBlobSha='bad',
 'ERR-NEG-008':(q,r)=>r.receipts.push({...r.receipts[0],receiptId:'orphan'}),
 'ERR-NEG-009':(q,r)=>q.decision='STABLE',
 'ERR-NEG-010':(q,r)=>{q.decision='QUALIFIED';q.qualificationGates.humanIndependentReview='PENDING'},
 'ERR-NEG-011':(q,r)=>q.qualificationGates.frameworkNeutral='FAIL',
 'ERR-NEG-012':(q,r)=>q.qualificationGates.immutableEvidenceReceipts='PENDING'
};
const errors=validate(q,r); for(const [id,m] of Object.entries(mutations)){const qq=clone(q),rr=clone(r);m(qq,rr);if(!validate(qq,rr).length)errors.push(`${id}: accepted`)}
if(errors.length){console.error('TRAMA.ERROR_RECOVERY Stage A.2: FAIL');for(const x of errors)console.error('- '+x);process.exit(1)}
console.log(`TRAMA.ERROR_RECOVERY Stage A.2: PASS (${r.receipts.length} receipt-bound product records; ${Object.keys(mutations).length} negative cases executed)`);
