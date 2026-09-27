import fs from 'node:fs';
const q=JSON.parse(fs.readFileSync('governance/component-pattern/loading-pending-progress-qualification.stage-a2.json','utf8'));
const r=JSON.parse(fs.readFileSync('governance/component-pattern/loading-pending-progress-evidence-receipts.stage-a2.json','utf8'));
const products=['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
const caps=['PENDING','INDETERMINATE_LOADING','DETERMINATE_PROGRESS','CONTEXT_PRESERVATION','PERCEPTIBLE_STATE'];
const sha=/^[0-9a-f]{40}$/; const clone=x=>structuredClone(x);
function validate(x,y){const e=[];
 if(x.contractId!=='TRAMA-COMPONENT-PATTERN-01'||x.stage!=='A.2'||x.candidateId!=='TRAMA.LOADING_PENDING_PROGRESS')e.push('identity');
 if(x.baseline!=='24be69c2dfbb8bb7bcb75b15cefb6d650e164a7a')e.push('baseline');
 if(!['QUALIFICATION_CANDIDATE','QUALIFIED'].includes(x.decision))e.push('decision');
 if(x.runtimeMigration!==false||x.dosA1!=='RUNTIME_DEFERRED')e.push('runtime-boundary');
 if(x.model!=='CAPABILITY_BASED')e.push('model');
 for(const c of caps)if(!x.semanticCore?.capabilities?.includes(c))e.push('capability:'+c);
 for(const p of products)if(!x.coverage?.[p])e.push('coverage:'+p);
 if(!x.semanticCore?.forbidden?.some(v=>v.includes('spinner')))e.push('spinner-guard');
 if(!x.semanticCore?.forbidden?.some(v=>v.includes('percentage')))e.push('precision-guard');
 if(!x.semanticCore?.forbidden?.some(v=>v.includes('didactic journey progress')))e.push('domain-separation');
 if(y.contractId!==x.contractId||y.stage!=='A.2'||y.candidateId!==x.candidateId)e.push('receipt-identity');
 if(!Array.isArray(y.receipts)||y.receipts.length!==4)e.push('receipts');
 const seen=new Set(); for(const z of y.receipts||[]){if(!products.includes(z.product))e.push('receipt-product');else seen.add(z.product);if(!sha.test(z.commit||'')||!sha.test(z.gitBlobSha||''))e.push('receipt-sha');if(!z.repository?.includes('/')||!z.path||z.path.startsWith('/')||z.path.includes('..'))e.push('receipt-location');if(!Array.isArray(z.supports)||!z.supports.length||z.supports.some(c=>!caps.includes(c)))e.push('receipt-supports')}
 for(const p of products)if(!seen.has(p))e.push('missing-receipt:'+p);
 if(x.decision==='QUALIFIED'&&x.qualificationGates?.humanIndependentReview!=='PASS')e.push('qualified-without-review');
 if(x.qualificationGates?.loadingVsProgressSeparated!=='PASS')e.push('separation-gate');
 if(x.qualificationGates?.immutableEvidenceReceipts!=='PASS')e.push('receipt-gate');
 if(x.qualificationGates?.validator!=='PASS')e.push('validator-gate');
 return e;}
const mutations={
 'LPP-NEG-001':(x,y)=>x.runtimeMigration=true,
 'LPP-NEG-002':(x,y)=>x.dosA1='ACTIVE',
 'LPP-NEG-003':(x,y)=>x.decision='STABLE',
 'LPP-NEG-004':(x,y)=>x.semanticCore.capabilities=x.semanticCore.capabilities.filter(v=>v!=='DETERMINATE_PROGRESS'),
 'LPP-NEG-005':(x,y)=>x.semanticCore.forbidden=x.semanticCore.forbidden.filter(v=>!v.includes('spinner')),
 'LPP-NEG-006':(x,y)=>x.semanticCore.forbidden=x.semanticCore.forbidden.filter(v=>!v.includes('percentage')),
 'LPP-NEG-007':(x,y)=>x.semanticCore.forbidden=x.semanticCore.forbidden.filter(v=>!v.includes('didactic journey progress')),
 'LPP-NEG-008':(x,y)=>y.receipts.pop(),
 'LPP-NEG-009':(x,y)=>y.receipts[0].commit='main',
 'LPP-NEG-010':(x,y)=>y.receipts[0].gitBlobSha='bad',
 'LPP-NEG-011':(x,y)=>y.receipts[0].path='../mutable',
 'LPP-NEG-012':(x,y)=>{x.decision='QUALIFIED';x.qualificationGates.humanIndependentReview='PENDING'}
};
const errors=validate(q,r);for(const [id,m] of Object.entries(mutations)){const x=clone(q),y=clone(r);m(x,y);if(!validate(x,y).length)errors.push(id+': accepted')}
if(errors.length){console.error('TRAMA.LOADING_PENDING_PROGRESS Stage A.2: FAIL');errors.forEach(v=>console.error('- '+v));process.exit(1)}
console.log(`TRAMA.LOADING_PENDING_PROGRESS Stage A.2: PASS (${r.receipts.length} receipt-bound product records; ${Object.keys(mutations).length} negative cases executed)`);
