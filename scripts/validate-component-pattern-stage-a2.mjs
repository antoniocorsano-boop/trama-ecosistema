import fs from 'node:fs';
const p='governance/component-pattern/status-feedback-qualification.stage-a2.json';
const q=JSON.parse(fs.readFileSync(p,'utf8'));
const products=new Set(['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER']);
const sha=/^[0-9a-f]{40}$/;
const repo=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const clone=x=>structuredClone(x);
function validate(x){const e=[];
 if(x.contractId!=='TRAMA-COMPONENT-PATTERN-01')e.push('contractId');
 if(x.stage!=='A.2')e.push('stage');
 if(x.baseline!=='e3e40de1c6e7575309140d786cab047f4f0caaf0')e.push('baseline');
 if(x.candidateId!=='TRAMA.STATUS_MESSAGE')e.push('candidate');
 if(x.runtimeMigration!==false)e.push('runtimeMigration');
 if(x.dosA1!=='RUNTIME_DEFERRED')e.push('dosA1');
 if(!['QUALIFICATION_CANDIDATE','QUALIFIED'].includes(x.decision))e.push('decision');
 if(x.decision==='QUALIFIED'&&x.qualificationGates?.humanIndependentReview!=='PASS')e.push('qualified-without-review');
 for(const k of ['purpose','required','allowedVariation','forbiddenVariation'])if(!x.semanticCore?.[k]||(Array.isArray(x.semanticCore[k])&&!x.semanticCore[k].length))e.push(`semanticCore.${k}`);
 if(!Array.isArray(x.evidence)||x.evidence.length<4)e.push('evidence');
 const covered=new Set();
 for(const [i,v] of (x.evidence||[]).entries()){if(!products.has(v.product))e.push(`evidence[${i}].product`);else covered.add(v.product);if(!repo.test(v.repository||''))e.push(`evidence[${i}].repository`);if(!sha.test(v.commit||''))e.push(`evidence[${i}].commit`);if(typeof v.path!=='string'||!v.path||v.path.startsWith('/')||v.path.includes('..'))e.push(`evidence[${i}].path`);if(!['GOVERNANCE_ENFORCEMENT_EVIDENCE','RUNTIME_IMPLEMENTATION_EVIDENCE'].includes(v.classification))e.push(`evidence[${i}].classification`);if(!Array.isArray(v.supports)||!v.supports.length)e.push(`evidence[${i}].supports`)}
 for(const p of products)if(!covered.has(p))e.push(`missing product ${p}`);
 if(x.qualificationGates?.immutableEvidenceBinding!=='PASS')e.push('immutableEvidenceBinding');
 if(x.qualificationGates?.semanticCoreExtractableWithoutPVIPOverride!=='PASS')e.push('PVIP gate');
 if(x.qualificationGates?.runtimeMigrationRequiredForQualification!=='NO')e.push('runtime gate');
 if(typeof x.promotionRule!=='string'||!x.promotionRule.includes('Stage B'))e.push('promotionRule'); return e;}
const mutations={
 'A2-NEG-001':x=>x.runtimeMigration=true,
 'A2-NEG-002':x=>x.dosA1='ACTIVE',
 'A2-NEG-003':x=>x.evidence[0].commit='main',
 'A2-NEG-004':x=>x.evidence.pop(),
 'A2-NEG-005':x=>x.evidence[0].path='../mutable',
 'A2-NEG-006':x=>x.decision='STABLE',
 'A2-NEG-007':x=>{x.decision='QUALIFIED';x.qualificationGates.humanIndependentReview='PENDING'},
 'A2-NEG-008':x=>x.qualificationGates.semanticCoreExtractableWithoutPVIPOverride='FAIL'
};
const errors=validate(q);for(const [id,m] of Object.entries(mutations)){const x=clone(q);m(x);if(!validate(x).length)errors.push(`${id}: accepted`)}
if(errors.length){console.error('TRAMA-COMPONENT-PATTERN-01 Stage A.2: FAIL');for(const x of errors)console.error('- '+x);process.exit(1)}
console.log(`TRAMA-COMPONENT-PATTERN-01 Stage A.2: PASS (${q.evidence.length} immutable evidence records; ${Object.keys(mutations).length} negative cases executed)`);
