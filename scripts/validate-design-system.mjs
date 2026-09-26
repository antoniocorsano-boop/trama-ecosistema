#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const file=process.argv[2]; if(!file) process.exit(2);
const p=JSON.parse(fs.readFileSync(file,'utf8')); const errors=[];
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const registry=JSON.parse(fs.readFileSync(path.join(root,'policies/design-system/authority-registry.v1.json'),'utf8'));
const products=['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
const dimensions=['voice','paletteTonalCharacter','typographicVoice','densitySpatialRhythm','shapeElevation','composition','navigation','dataVisualisation','motionCharacter','iconographyIllustration'];
const authority=(id,scope)=>Boolean(registry.authorities?.[id]?.scope?.includes(scope));
if(p.contract!=='TRAMA-DESIGN-TOKENS-01') errors.push('wrong contract');
if(p.mode!=='STAGE_A_OBSERVE') errors.push('mode must be STAGE_A_OBSERVE');
if(p.authorityRegistry?.registryId!==registry.registryId||p.authorityRegistry?.version!==registry.version) errors.push('authority registry binding mismatch');
if(!authority(p.owner,'ecosystem-policy')) errors.push('untrusted policy owner');
const c=p.responsivePolicy?.conditions||{};
for(const x of ['S','M','L','LIM']) if(!c[x]) errors.push(`missing responsive condition ${x}`);
if(c.S&&c.M&&c.S.maxWidth+1!==c.M.minWidth) errors.push('responsive S/M gap or overlap');
if(c.M&&c.L&&c.M.maxWidth+1!==c.L.minWidth) errors.push('responsive M/L gap or overlap');
if(c.LIM&&(c.LIM.kind!=='LIMITED_REFLOW'||c.LIM.requiresReflow!==true||c.LIM.evidenceDimensionsRequired!==true||!(c.LIM.zoom>=1)||!(c.LIM.maxInlineSize>0))) errors.push('invalid LIM verification context');
const names=Object.keys(p.tokens||{}); if(new Set(names).size!==names.length) errors.push('duplicate canonical token id');
const tokenNames=new Set(names);
const graph=new Map();
for(const [name,t] of Object.entries(p.tokens||{})){
 if(!t.type||!t.role||!t.layer) errors.push(`incomplete token ${name}`);
 if((t.type==='typography'||name.startsWith('space.'))&&t.scalable!==true) errors.push(`non-scalable text/reflow token ${name}`);
 if(t.aliasOf){ if(!tokenNames.has(t.aliasOf)) errors.push(`missing token alias target ${name} -> ${t.aliasOf}`); graph.set(name,t.aliasOf); if(t.layer==='ecosystem-semantic'&&p.tokens[t.aliasOf]?.layer==='product-alias') errors.push(`unauthorized layer transition ${name}`); }
}
for(const start of graph.keys()){ const seen=new Set(); let n=start; while(graph.has(n)){ if(seen.has(n)){errors.push(`alias cycle ${start}`);break;} seen.add(n); n=graph.get(n); } }
for(const product of products){
 const x=p.products?.[product]; if(!x){errors.push(`missing PVIP ${product}`);continue;}
 if(!authority(x.owner,product)) errors.push(`untrusted PVIP owner ${product}`);
 if(!x.pvipVersion) errors.push(`missing PVIP version ${product}`);
 for(const d of dimensions){const v=x.identity?.[d]; if(!v) errors.push(`missing PVIP dimension ${product}.${d}`); else if(v.applicable===true&&!v.value) errors.push(`missing applicable PVIP value ${product}.${d}`); else if(v.applicable===false&&!v.reason) errors.push(`missing PVIP non-applicable reason ${product}.${d}`);}
 for(const [alias,target] of Object.entries(x.aliases||{})){ if(!tokenNames.has(target)) errors.push(`missing alias target ${product}.${alias} -> ${target}`); if(p.tokens[target]?.layer!=='ecosystem-semantic') errors.push(`unauthorized product alias layer ${product}.${alias}`); if(target.startsWith('products.')||target.startsWith('ARENA.')||target.startsWith('ATLAS.')||target.startsWith('DOCENTE_OS.')||target.startsWith('TRAMA_CONTROL_CENTER.')) errors.push(`cross-product alias ${product}.${alias}`); }
}
for(const state of ['default','hover','focus-visible','active','pressed','selected','disabled','pending','loading']) if(!p.interactionStates?.includes(state)) errors.push(`missing interaction state ${state}`);
for(const mode of ['light','dark','system','forced-colors']) if(!p.presentationModes?.includes(mode)) errors.push(`missing presentation mode ${mode}`);
if(p.boundaries?.runtimeImpact!=='NONE') errors.push('runtime boundary changed');
if(p.boundaries?.persistence!=='NONE') errors.push('persistence boundary changed');
if(p.boundaries?.studentAccountTracking!=='NONE') errors.push('student tracking boundary changed');
if(p.boundaries?.dosA1!=='RUNTIME_DEFERRED') errors.push('DOS-A1 boundary changed');
const identities=products.map(x=>JSON.stringify(p.products?.[x]?.identity||{})); if(new Set(identities).size!==products.length) errors.push('PVIPs must be substantively differentiated');
console.log(JSON.stringify({contract:'TRAMA-DESIGN-TOKENS-01',policyVersion:p.version,responsivePolicyVersion:p.responsivePolicy?.version,authorityRegistryVersion:registry.version,mode:'STAGE_A_OBSERVE',result:errors.length?'FAIL':'PASS',errors},null,2)); process.exit(errors.length?1:0);
