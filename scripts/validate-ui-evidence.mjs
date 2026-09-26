#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = process.argv[2];
if (!manifestPath) { console.error('usage: node scripts/validate-ui-evidence.mjs <manifest.json> [exactHead]'); process.exit(2); }
const exactHead = process.argv[3] || process.env.GITHUB_SHA || null;
const m = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const policy = JSON.parse(fs.readFileSync(new URL('../policies/ui-evidence-producers.v1.json', import.meta.url),'utf8'));
const errors=[]; const warnings=[]; const ZERO='0'.repeat(40);
const normalized=path.normalize(manifestPath).replaceAll('\\','/');
const fixtureMode=normalized.startsWith(policy.fixtureRoot) || normalized.includes(`/${policy.fixtureRoot}`);
const allowedProducers=new Set(policy.producers);
const rank={NONE:0,CHANGED:1,NEW:2,LEGACY_TOUCHED:3};
const obj=(v)=>v && typeof v==='object' && !Array.isArray(v);
const req=(o,keys,where)=>{ if(!obj(o)){errors.push(`schema: ${where} must be object`);return false;} for(const k of keys) if(!(k in o)) errors.push(`schema: ${where}.${k} required`); return true; };
const closed=(o,keys,where)=>{ if(obj(o)) for(const k of Object.keys(o)) if(!keys.includes(k)) errors.push(`schema: unexpected ${where}.${k}`); };

// Stage A dependency-free structural validator equivalent to the governed JSON Schema.
req(m,['schemaVersion','contract','product','change','responsive','accessibility','perceptibleWrite','designSystem','boundaries','exceptions'],'manifest');
closed(m,['schemaVersion','contract','product','change','responsive','accessibility','perceptibleWrite','designSystem','boundaries','exceptions'],'manifest');
if(m.schemaVersion!=='1.0.0') errors.push('schema: schemaVersion must be 1.0.0');
if(req(m.contract,['id','version'],'contract')) { if(m.contract.id!=='TRAMA-UI-EVIDENCE-01'||m.contract.version!=='1') errors.push('schema: contract identity/version invalid'); }
req(m.product,['id','profile','profileVersion'],'product'); req(m.change,['aggregateUiImpact','surfaces'],'change');
if(!Array.isArray(m?.change?.surfaces)||!m.change.surfaces.length) errors.push('schema: change.surfaces must be non-empty array');
for(const [i,s] of (m?.change?.surfaces||[]).entries()){ req(s,['id','uiImpact'],`change.surfaces[${i}]`); if(!(s.uiImpact in rank)) errors.push(`schema: invalid uiImpact at surface ${i}`); }
req(m.responsive,['conditions','evidence'],'responsive'); req(m?.responsive?.conditions,['S','M','L','LIM'],'responsive.conditions');
for(const c of ['S','M','L','LIM']) { const v=m?.responsive?.conditions?.[c]; if(req(v,['applicable'],`responsive.conditions.${c}`)){ if(typeof v.applicable!=='boolean') errors.push(`schema: ${c}.applicable must be boolean`); if(v.applicable===false && !(typeof v.reason==='string'&&v.reason)) errors.push(`schema: ${c}.reason required when not applicable`); } }
req(m.accessibility,['evidence','findings'],'accessibility'); req(m.perceptibleWrite,['classification','evidence'],'perceptibleWrite'); req(m.designSystem,['tokens','components','newComponents'],'designSystem'); req(m.boundaries,['authorityImpact','privacyImpact','runtimeImpact','dosA1'],'boundaries');
if(!Array.isArray(m.exceptions)) errors.push('schema: exceptions must be array');

const responsiveEvidence=m?.responsive?.evidence||[];
const genericEvidence=[...(m?.accessibility?.evidence||[]),...(m?.perceptibleWrite?.evidence||[])];
for(const [i,e] of responsiveEvidence.entries()) { req(e,['evidenceId','type','result','commitSha','producer','reference','condition','policyId','policyVersion','width','height'],`responsive.evidence[${i}]`); closed(e,['evidenceId','type','result','commitSha','producer','reference','digest','immutableRunId','condition','policyId','policyVersion','width','height'],`responsive.evidence[${i}]`); if(e.type!=='responsive') errors.push(`schema: responsive evidence ${e.evidenceId} type must be responsive`); }
for(const [i,e] of genericEvidence.entries()) { req(e,['evidenceId','type','result','commitSha','producer','reference'],`evidence[${i}]`); closed(e,['evidenceId','type','result','commitSha','producer','reference','digest','immutableRunId'],`evidence[${i}]`); }
const allEvidence=[...responsiveEvidence,...genericEvidence];
for(const e of allEvidence){
  if(!/^[0-9a-f]{40}$/.test(e.commitSha||'')) errors.push(`schema: invalid commitSha for ${e.evidenceId}`);
  if(!e.digest&&!e.immutableRunId) errors.push(`schema: immutable binding required for ${e.evidenceId}`);
  if(!allowedProducers.has(e.producer)) errors.push(`untrusted producer ${e.producer} for ${e.evidenceId}`);
  if(e.commitSha===ZERO && (!fixtureMode || e.producer!==policy.fixtureProducer)) errors.push(`zero-sha forbidden outside governed fixture for ${e.evidenceId}`);
  if(exactHead && e.commitSha!==exactHead && !(fixtureMode && e.commitSha===ZERO && e.producer===policy.fixtureProducer)) errors.push(`stale-head evidence ${e.evidenceId}`);
}
const surfaces=m?.change?.surfaces||[]; const derived=surfaces.reduce((a,s)=>rank[s.uiImpact]>rank[a]?s.uiImpact:a,'NONE');
if(m?.change?.aggregateUiImpact!==derived) errors.push(`aggregateUiImpact=${m?.change?.aggregateUiImpact} but derived=${derived}`);
for(const condition of ['S','M','L','LIM']) { const c=m?.responsive?.conditions?.[condition]; if(c?.applicable===true && !responsiveEvidence.some(e=>e.condition===condition)) errors.push(`missing evidence for applicable ${condition}`); }
for(const [i,f] of (m?.accessibility?.findings||[]).entries()) { req(f,['findingId','criterion','blockingClass','status','surfaceId','evidenceRef'],`accessibility.findings[${i}]`); closed(f,['findingId','criterion','blockingClass','status','surfaceId','evidenceRef','exceptionId'],`accessibility.findings[${i}]`); if(f.status==='ACCEPTED_EXCEPTION'&&!f.exceptionId) errors.push(`schema: accepted finding ${f.findingId} requires exceptionId`); if(f.blockingClass==='BLOCKING'&&f.status==='OPEN') errors.push(`open blocking accessibility finding ${f.findingId}`); }
if(m?.boundaries?.runtimeImpact!=='NONE') errors.push('runtimeImpact must remain NONE in this Stage A slice');
if(m?.boundaries?.dosA1!=='RUNTIME_DEFERRED') errors.push('DOS-A1 boundary changed');
const report={contract:'TRAMA-UI-EVIDENCE-01',mode:'STAGE_A_OBSERVE',schema:'schemas/ui-evidence.manifest.schema.json',producerPolicy:`${policy.policyId}@${policy.version}`,fixtureMode,manifest:normalized,result:errors.length?'FAIL':'PASS',errors,warnings};
console.log(JSON.stringify(report,null,2)); process.exit(errors.length?1:0);
