#!/usr/bin/env node
import fs from 'node:fs';
const file = process.argv[2];
if (!file) process.exit(2);
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const requiredProducts = ['ARENA','ATLAS','DOCENTE_OS','TRAMA_CONTROL_CENTER'];
if (p.contract !== 'TRAMA-DESIGN-TOKENS-01') errors.push('wrong contract');
if (p.mode !== 'STAGE_A_OBSERVE') errors.push('mode must be STAGE_A_OBSERVE');
if (!p.owner) errors.push('missing policy owner');
for (const c of ['S','M','L','LIM']) if (!p.responsivePolicy?.conditions?.[c]) errors.push(`missing responsive condition ${c}`);
const tokenNames = new Set(Object.keys(p.tokens || {}));
for (const [name,t] of Object.entries(p.tokens || {})) {
  if (!t.type || !t.role) errors.push(`incomplete token ${name}`);
  if ((t.type === 'typography' || name.startsWith('space.')) && t.scalable !== true) errors.push(`non-scalable text/reflow token ${name}`);
}
const seenOwners = new Set();
for (const product of requiredProducts) {
  const x = p.products?.[product];
  if (!x) { errors.push(`missing PVIP ${product}`); continue; }
  if (!x.owner || !x.pvipVersion) errors.push(`missing PVIP governance ${product}`);
  if (!x.identity?.voice || !x.identity?.density || !x.identity?.composition || !x.identity?.navigation) errors.push(`incomplete PVIP identity ${product}`);
  for (const [alias,target] of Object.entries(x.aliases || {})) {
    if (!tokenNames.has(target)) errors.push(`missing alias target ${product}.${alias} -> ${target}`);
    if (target.startsWith('products.')) errors.push(`cross-product alias ${product}.${alias}`);
  }
  seenOwners.add(x.owner);
}
for (const state of ['default','focus-visible','active','selected','disabled','pending']) if (!p.interactionStates?.includes(state)) errors.push(`missing interaction state ${state}`);
for (const mode of ['light','dark','system','forced-colors']) if (!p.presentationModes?.includes(mode)) errors.push(`missing presentation mode ${mode}`);
if (p.boundaries?.runtimeImpact !== 'NONE') errors.push('runtime boundary changed');
if (p.boundaries?.persistence !== 'NONE') errors.push('persistence boundary changed');
if (p.boundaries?.studentAccountTracking !== 'NONE') errors.push('student tracking boundary changed');
if (p.boundaries?.dosA1 !== 'RUNTIME_DEFERRED') errors.push('DOS-A1 boundary changed');
const identities = requiredProducts.map(x => JSON.stringify(p.products?.[x]?.identity || {}));
if (new Set(identities).size !== requiredProducts.length) errors.push('PVIPs must be substantively differentiated');
console.log(JSON.stringify({contract:'TRAMA-DESIGN-TOKENS-01',mode:'STAGE_A_OBSERVE',result:errors.length?'FAIL':'PASS',errors},null,2));
process.exit(errors.length ? 1 : 0);
