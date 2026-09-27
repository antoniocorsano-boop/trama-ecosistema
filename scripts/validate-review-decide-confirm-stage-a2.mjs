import fs from 'node:fs';
const q=JSON.parse(fs.readFileSync('governance/component-pattern/review-decide-confirm-qualification.stage-a2.json','utf8'));
const r=JSON.parse(fs.readFileSync(q.evidenceReceiptRef,'utf8'));
const products=['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
const sha=/^[0-9a-f]{40}$/; const repo=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/; const clone=x=>structuredClone(x);
function validate(q,r){const e=[];
 if(q.contractId!=='TRAMA-COMPONENT-PATTERN-01'||q.stage!=='A.2'||q.candidateId!=='TRAMA.REVIEW_DECIDE_CONFIRM')e.push('identity');
 if(q.baseline!=='220629e0dfec5ba0683574b099242dc5230b887d')e.push('baseline');
 if(q.risk!=='HIGH'||q.runtimeMigration!==false||q.stablePromotionAllowed!==false||q.dosA1!=='RUNTIME_DEFERRED')e.push('runtime-boundary');
 if(q.model!=='HUMAN_AGENCY_CAPABILITY_BASED')e.push('model');
 const forbidden=['automatic approval','hidden confirmation','double submission that can create duplicate consequential effects','carrying an exact-head PASS across a changed head without governed non-impact classification','silent conflict overwrite','false success confirmation'];
 for(const x of forbidden)if(!q.semanticCore?.forbidden?.includes(x))e.push(`missing-forbidden:${x}`);
 const caps=['REVIEW_CONTEXT','EXPLICIT_DECISION','PENDING_AND_DUPLICATE_GUARD','DECISION_BINDING_AND_STALE_PROTECTION','PERCEPTIBLE_OUTCOME','ERROR_CONFLICT_RECOVERY'];
 for(const x of caps)if(!q.semanticCore?.capabilities?.includes(x))e.push(`missing-capability:${x}`);
 if(q.decision==='QUALIFIED'&&q.qualificationGates?.humanIndependentReview!=='PASS')e.push('qualified-without-review');
 if(!['QUALIFICATION_CANDIDATE','QUALIFIED'].includes(q.decision)||q.decision==='STABLE')e.push('decision');
 if(r.contractId!==q.contractId||r.stage!=='A.2'||r.candidateId!==q.candidateId||r.status!=='RECEIPT_BOUND'||r.failClosed!==true)e.push('receipt-header');
 const receipts=new Map(); for(const x of r.receipts||[]){if(receipts.has(x.receiptId))e.push('duplicate-receipt');receipts.set(x.receiptId,x);if(!products.includes(x.product)||!repo.test(x.repository||'')||!sha.test(x.commit||'')||!sha.test(x.blobSha||'')||!x.path||x.path.startsWith('/')||x.path.includes('..'))e.push(`invalid-receipt:${x.receiptId}`)}
 for(const p of products){const c=q.coverage?.[p];if(!c)e.push(`missing-coverage:${p}`);else{const x=receipts.get(c.receiptId);if(!x||x.product!==p)e.push(`receipt-binding:${p}`)}}
 if(receipts.size!==products.length)e.push('orphan-or-missing-receipts');
 if(q.evidenceStatus!=='RECEIPT_BOUND'||q.qualificationGates?.immutableEvidenceReceipts!=='PASS')e.push('receipt-gate');
 if(q.qualificationGates?.negativeHighRiskCases!=='PASS'||q.qualificationGates?.validator!=='PASS')e.push('validator-gate');
 if(q.qualificationGates?.crossProductCapabilityEvidence!=='PASS_WITH_PARTIAL_CELLS')e.push('coverage-gate');
 if(!['PARTIAL_EVIDENCE','UNQUALIFIED','GOVERNANCE_EVIDENCED','EVIDENCED'].includes(q.coverage?.ARENA?.PENDING_AND_DUPLICATE_GUARD))e.push('arena-cell');
 if(q.coverage?.ARENA?.PENDING_AND_DUPLICATE_GUARD!=='UNQUALIFIED')e.push('arena-duplicate-guard-must-remain-unqualified');
 if(q.coverage?.ARENA?.ERROR_CONFLICT_RECOVERY!=='UNQUALIFIED')e.push('arena-recovery-must-remain-unqualified');
 if(!String(q.promotionRule||'').includes('Stage B')||!String(q.promotionRule||'').includes('STABLE remains forbidden'))e.push('promotion-rule'); return e;}
const mutations={
 'RDC-NEG-001-AUTO-APPROVAL':(q,r)=>q.semanticCore.forbidden=q.semanticCore.forbidden.filter(x=>x!=='automatic approval'),
 'RDC-NEG-002-HIDDEN-CONFIRM':(q,r)=>q.semanticCore.forbidden=q.semanticCore.forbidden.filter(x=>x!=='hidden confirmation'),
 'RDC-NEG-003-DUPLICATE-ACTIVATION':(q,r)=>q.coverage.ARENA.PENDING_AND_DUPLICATE_GUARD='EVIDENCED',
 'RDC-NEG-004-HEAD-PASS-TRANSFER':(q,r)=>q.semanticCore.forbidden=q.semanticCore.forbidden.filter(x=>!x.startsWith('carrying an exact-head PASS')),
 'RDC-NEG-005-CONFLICT-OVERWRITE':(q,r)=>q.semanticCore.forbidden=q.semanticCore.forbidden.filter(x=>x!=='silent conflict overwrite'),
 'RDC-NEG-006-FALSE-SUCCESS':(q,r)=>q.semanticCore.forbidden=q.semanticCore.forbidden.filter(x=>x!=='false success confirmation'),
 'RDC-NEG-007-MISSING-RECEIPT':(q,r)=>r.receipts.pop(),
 'RDC-NEG-008-TAMPERED-RECEIPT':(q,r)=>r.receipts[0].blobSha='bad',
 'RDC-NEG-009-PREMATURE-QUALIFICATION':(q,r)=>q.decision='QUALIFIED',
 'RDC-NEG-010-PREMATURE-STABLE':(q,r)=>q.decision='STABLE',
 'RDC-NEG-011-RUNTIME-MIGRATION':(q,r)=>q.runtimeMigration=true,
 'RDC-NEG-012-DOS-A1':(q,r)=>q.dosA1='ACTIVE',
 'RDC-NEG-013-RECOVERY-UPGRADE':(q,r)=>q.coverage.ARENA.ERROR_CONFLICT_RECOVERY='EVIDENCED'
};
const errors=validate(q,r);for(const [id,m] of Object.entries(mutations)){const qq=clone(q),rr=clone(r);m(qq,rr);if(!validate(qq,rr).length)errors.push(`${id}: accepted`)}
if(errors.length){console.error('TRAMA.REVIEW_DECIDE_CONFIRM Stage A.2: FAIL');for(const x of errors)console.error('- '+x);process.exit(1)}
console.log(`TRAMA.REVIEW_DECIDE_CONFIRM Stage A.2: PASS (${r.receipts.length} immutable receipts; ${Object.keys(mutations).length} HIGH-risk negative cases rejected)`);
