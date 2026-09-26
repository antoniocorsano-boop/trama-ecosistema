#!/usr/bin/env node
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'policies/design-system/trama-design-system.v1.json'),'utf8'));
const clone=()=>JSON.parse(JSON.stringify(base));
const cases=[
 ['valid',()=>clone(),null],
 ['missing-pvip',()=>{const x=clone();delete x.products.ATLAS;return x},'missing PVIP ATLAS'],
 ['missing-dimension',()=>{const x=clone();delete x.products.ARENA.identity.motionCharacter;return x},'missing PVIP dimension ARENA.motionCharacter'],
 ['bad-target',()=>{const x=clone();x.products.ATLAS.aliases.primaryAction='missing.token';return x},'missing alias target ATLAS.primaryAction'],
 ['cross-layer',()=>{const x=clone();x.tokens['product.bad']={type:'color',role:'bad',layer:'product-alias'};x.products.ATLAS.aliases.primaryAction='product.bad';return x},'unauthorized product alias layer ATLAS.primaryAction'],
 ['duplicate-identity',()=>{const x=clone();x.products.ATLAS.identity=JSON.parse(JSON.stringify(x.products.ARENA.identity));return x},'PVIPs must be substantively differentiated'],
 ['non-scalable',()=>{const x=clone();x.tokens['type.body'].scalable=false;return x},'non-scalable text/reflow token type.body'],
 ['missing-mode',()=>{const x=clone();x.presentationModes=x.presentationModes.filter(v=>v!=='forced-colors');return x},'missing presentation mode forced-colors'],
 ['missing-state',()=>{const x=clone();x.interactionStates=x.interactionStates.filter(v=>v!=='focus-visible');return x},'missing interaction state focus-visible'],
 ['boundary',()=>{const x=clone();x.boundaries.runtimeImpact='WRITE';return x},'runtime boundary changed'],
 ['owner',()=>{const x=clone();x.products.ARENA.owner='UNKNOWN';return x},'untrusted PVIP owner ARENA'],
 ['responsive-gap',()=>{const x=clone();x.responsivePolicy.conditions.M.minWidth=601;return x},'responsive S/M gap or overlap'],
 ['lim',()=>{const x=clone();x.responsivePolicy.conditions.LIM.evidenceDimensionsRequired=false;return x},'invalid LIM verification context'],
 ['cycle',()=>{const x=clone();x.tokens['a']={type:'color',role:'a',layer:'primitive',aliasOf:'b'};x.tokens['b']={type:'color',role:'b',layer:'primitive',aliasOf:'a'};return x},'alias cycle a']
];
let failed=0; const dir=fs.mkdtempSync(path.join(os.tmpdir(),'trama-ds-'));
for(const [name,make,reason] of cases){const f=path.join(dir,`${name}.json`);fs.writeFileSync(f,JSON.stringify(make(),null,2));const r=spawnSync(process.execPath,[path.join(root,'scripts/validate-design-system.mjs'),f],{encoding:'utf8'});const text=(r.stdout||'')+(r.stderr||'');const ok=reason?r.status!==0&&text.includes(reason):r.status===0;if(!ok){failed++;console.error(`FAIL ${name}: expected ${reason||'PASS'}; status=${r.status}; ${text}`)}else console.log(`PASS ${name}${reason?` -> ${reason}`:''}`)}
fs.rmSync(dir,{recursive:true,force:true}); process.exit(failed?1:0);
