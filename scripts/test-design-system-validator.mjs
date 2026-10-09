#!/usr/bin/env node
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'policies/design-system/trama-design-system.v1.json'),'utf8'));
const studioIdentity={
 voice:{applicable:true,value:'creative-authoring'},
 paletteTonalCharacter:{applicable:true,value:'media-forward-controlled'},
 typographicVoice:{applicable:true,value:'editorial-creative-authoring'},
 densitySpatialRhythm:{applicable:true,value:'medium-creative-workspace'},
 shapeElevation:{applicable:true,value:'layered-scene-authoring'},
 composition:{applicable:true,value:'scene-and-review-oriented'},
 navigation:{applicable:true,value:'authoring-flow-led'},
 dataVisualisation:{applicable:true,value:'production-status-explanatory'},
 motionCharacter:{applicable:true,value:'deliberate-preview-oriented'},
 iconographyIllustration:{applicable:true,value:'creative-production-functional'}
};
const withStudio=()=>{const x=JSON.parse(JSON.stringify(base)); if(!x.products.STUDIO_ATLAS)x.products.STUDIO_ATLAS={owner:'STUDIO_ATLAS',pvipVersion:'1.0.0',identity:studioIdentity,aliases:{primarySurface:'surface.primary',primaryAction:'action.primary',bodyText:'text.primary'}}; return x;};
const cases=[
 ['valid',()=>withStudio(),null],
 ['missing-pvip',()=>{const x=withStudio();delete x.products.ATLAS;return x},'missing PVIP ATLAS'],
 ['missing-studio-atlas',()=>{const x=withStudio();delete x.products.STUDIO_ATLAS;return x},'missing PVIP STUDIO_ATLAS'],
 ['missing-dimension',()=>{const x=withStudio();delete x.products.ARENA.identity.motionCharacter;return x},'missing PVIP dimension ARENA.motionCharacter'],
 ['bad-target',()=>{const x=withStudio();x.products.ATLAS.aliases.primaryAction='missing.token';return x},'missing alias target ATLAS.primaryAction'],
 ['cross-layer',()=>{const x=withStudio();x.tokens['product.bad']={type:'color',role:'bad',layer:'product-alias'};x.products.ATLAS.aliases.primaryAction='product.bad';return x},'unauthorized product alias layer ATLAS.primaryAction'],
 ['duplicate-identity',()=>{const x=withStudio();x.products.ATLAS.identity=JSON.parse(JSON.stringify(x.products.ARENA.identity));return x},'PVIPs must be substantively differentiated'],
 ['non-scalable',()=>{const x=withStudio();x.tokens['type.body'].scalable=false;return x},'non-scalable text/reflow token type.body'],
 ['missing-mode',()=>{const x=withStudio();x.presentationModes=x.presentationModes.filter(v=>v!=='forced-colors');return x},'missing presentation mode forced-colors'],
 ['missing-state',()=>{const x=withStudio();x.interactionStates=x.interactionStates.filter(v=>v!=='focus-visible');return x},'missing interaction state focus-visible'],
 ['boundary',()=>{const x=withStudio();x.boundaries.runtimeImpact='WRITE';return x},'runtime boundary changed'],
 ['owner',()=>{const x=withStudio();x.products.ARENA.owner='UNKNOWN';return x},'untrusted PVIP owner ARENA'],
 ['responsive-gap',()=>{const x=withStudio();x.responsivePolicy.conditions.M.minWidth=601;return x},'responsive S/M gap or overlap'],
 ['lim',()=>{const x=withStudio();x.responsivePolicy.conditions.LIM.evidenceDimensionsRequired=false;return x},'invalid LIM verification context'],
 ['cycle',()=>{const x=withStudio();x.tokens['a']={type:'color',role:'a',layer:'primitive',aliasOf:'b'};x.tokens['b']={type:'color',role:'b',layer:'primitive',aliasOf:'a'};return x},'alias cycle a']
];
let failed=0; const dir=fs.mkdtempSync(path.join(os.tmpdir(),'trama-ds-'));
for(const [name,make,reason] of cases){const f=path.join(dir,`${name}.json`);fs.writeFileSync(f,JSON.stringify(make(),null,2));const r=spawnSync(process.execPath,[path.join(root,'scripts/validate-design-system.mjs'),f],{encoding:'utf8'});const text=(r.stdout||'')+(r.stderr||'');const ok=reason?r.status!==0&&text.includes(reason):r.status===0;if(!ok){failed++;console.error(`FAIL ${name}: expected ${reason||'PASS'}; status=${r.status}; ${text}`)}else console.log(`PASS ${name}${reason?` -> ${reason}`:''}`)}
fs.rmSync(dir,{recursive:true,force:true}); process.exit(failed?1:0);
