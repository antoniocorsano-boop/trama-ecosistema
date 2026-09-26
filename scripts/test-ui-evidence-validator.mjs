#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const validator='scripts/validate-ui-evidence.mjs';
const exact='2222222222222222222222222222222222222222';
const cases=[
 ['fixtures/ui-evidence/valid-minimal.json',0,null],
 ['fixtures/ui-evidence/invalid-hidden-blocker.json',1,'open blocking accessibility finding'],
 ['fixtures/ui-evidence/invalid-aggregate-mismatch.json',1,'aggregateUiImpact=NONE but derived=CHANGED'],
 ['fixtures/ui-evidence/invalid-stale-head.json',1,'stale-head evidence stale'],
 ['fixtures/ui-evidence/invalid-untrusted-producer.json',1,'untrusted producer self-certified'],
 ['fixtures/ui-evidence/invalid-missing-responsive.json',1,'missing evidence for applicable S'],
 ['fixtures/ui-evidence/invalid-accepted-exception.json',1,'requires exceptionId'],
 ['fixtures/ui-evidence/invalid-boundary-mutation.json',1,'runtimeImpact must remain NONE']
];
let failed=0;
for(const [file,code,needle] of cases){ const r=spawnSync(process.execPath,[validator,file,exact],{encoding:'utf8'}); const ok=r.status===code && (!needle || r.stdout.includes(needle)); console.log(`${ok?'PASS':'FAIL'} ${file} expected=${code}${needle?` reason=${needle}`:''}`); if(!ok){failed++; console.error(r.stdout,r.stderr);} }
// Same zero-SHA payload outside the governed fixture root must fail.
const tmp=path.join(os.tmpdir(),'trama-ui-evidence-zero-sha.json'); fs.copyFileSync('fixtures/ui-evidence/valid-minimal.json',tmp);
const zr=spawnSync(process.execPath,[validator,tmp,exact],{encoding:'utf8'}); const zok=zr.status===1 && zr.stdout.includes('zero-sha forbidden outside governed fixture');
console.log(`${zok?'PASS':'FAIL'} zero-SHA outside fixture root rejected`); if(!zok){failed++; console.error(zr.stdout,zr.stderr);} fs.rmSync(tmp,{force:true});
process.exit(failed?1:0);
