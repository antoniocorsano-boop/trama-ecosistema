import fs from 'node:fs';

const path='governance/component-pattern/catalog-coverage.stage-a1.json';
const source=JSON.parse(fs.readFileSync(path,'utf8'));
const allowedStatuses=new Set(['PRESENT','PARTIAL','ABSENT_EVIDENCE','PRODUCT_SPECIFIC']);
const products=['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
const repoPattern=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const clone=x=>structuredClone(x);

function validate(x){
  const errors=[];
  if(x.contractId!=='TRAMA-COMPONENT-PATTERN-01') errors.push('wrong contractId');
  if(x.stage!=='A.1') errors.push('stage must be A.1');
  if(x.baseline!=='301e16c5086b936865972f25bbe4668002ca9696') errors.push('baseline mismatch');
  if(x.runtimeMigration!==false) errors.push('runtimeMigration must be false');
  if(typeof x.evidencePolicy!=='string'||!x.evidencePolicy.includes('ABSENT_EVIDENCE')) errors.push('evidence policy must protect absence semantics');
  if(!Array.isArray(x.statuses)||x.statuses.length!==allowedStatuses.size||x.statuses.some(s=>!allowedStatuses.has(s))) errors.push('status vocabulary mismatch');
  for(const product of products){if(typeof x.repositories?.[product]!=='string'||!repoPattern.test(x.repositories[product])) errors.push(`invalid repository binding: ${product}`)}
  if(!Array.isArray(x.families)||!x.families.length) errors.push('families required');
  const ids=new Set();
  for(const [i,f] of (x.families||[]).entries()){
    const p=`families[${i}]`;
    if(typeof f.id!=='string'||!f.id.startsWith('TRAMA.')) errors.push(`${p}: invalid id`);
    if(ids.has(f.id)) errors.push(`${p}: duplicate id`); else ids.add(f.id);
    if(!['PROPOSED','CANDIDATE'].includes(f.catalogStatus)) errors.push(`${p}: invalid catalogStatus`);
    for(const product of products){
      const cell=f.coverage?.[product];
      if(!cell) {errors.push(`${p}: missing coverage ${product}`);continue}
      if(!allowedStatuses.has(cell.status)) errors.push(`${p}/${product}: invalid status`);
      if(!Array.isArray(cell.evidence)) errors.push(`${p}/${product}: evidence must be array`);
      if(typeof cell.note!=='string'||!cell.note.trim()) errors.push(`${p}/${product}: note required`);
      if(['PRESENT','PARTIAL'].includes(cell.status)&&(!Array.isArray(cell.evidence)||cell.evidence.length===0)) errors.push(`${p}/${product}: ${cell.status} requires evidence`);
      if(cell.status==='ABSENT_EVIDENCE'&&Array.isArray(cell.evidence)&&cell.evidence.length!==0) errors.push(`${p}/${product}: ABSENT_EVIDENCE must have empty evidence`);
      if(cell.status==='PRODUCT_SPECIFIC'&&Array.isArray(cell.evidence)&&cell.evidence.length!==0) errors.push(`${p}/${product}: PRODUCT_SPECIFIC must not masquerade as implementation evidence`);
      for(const ref of cell.evidence||[]) if(typeof ref!=='string'||!ref.trim()||ref.startsWith('/')||ref.includes('..')) errors.push(`${p}/${product}: invalid evidence ref`);
    }
  }
  return errors;
}

const mutations={
  'A1-NEG-001':x=>{x.runtimeMigration=true},
  'A1-NEG-002':x=>{x.families[0].coverage.ARENA.status='MISSING'},
  'A1-NEG-003':x=>{x.families[0].coverage.ARENA.evidence=[]},
  'A1-NEG-004':x=>{x.families[1].coverage.ATLAS.status='PRESENT'},
  'A1-NEG-005':x=>{delete x.families[0].coverage.DOCENTE_OS},
  'A1-NEG-006':x=>{x.repositories.ARENA='guessed-repository'},
  'A1-NEG-007':x=>{x.families[0].catalogStatus='STABLE'},
  'A1-NEG-008':x=>{x.families[0].coverage.ARENA.evidence=['../outside']}
};

const errors=validate(source);
for(const [id,mutate] of Object.entries(mutations)){
  const x=clone(source); mutate(x);
  if(validate(x).length===0) errors.push(`${id}: negative mutation accepted`);
}
if(errors.length){
  console.error('TRAMA-COMPONENT-PATTERN-01 Stage A.1: FAIL');
  for(const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`TRAMA-COMPONENT-PATTERN-01 Stage A.1: PASS (${source.families.length} families; ${Object.keys(mutations).length} negative cases executed)`);
