const fs=require('fs');
const assert=require('assert');
const path=require('path');

const api=require('../control-center/component-maturity.js');
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'../control-center/data/ecosystem-snapshot.json'),'utf8'));
const home=fs.readFileSync(path.join(__dirname,'../control-center/index.html'),'utf8');
const maturity=fs.readFileSync(path.join(__dirname,'../control-center/maturity.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'../control-center/sw.js'),'utf8');

assert.match(home,/Apri la vista Maturità/);
assert.doesNotMatch(home,/id="componentMaturityMap"/);
assert.match(maturity,/id="componentMaturityMap"/);
assert.match(maturity,/aria-label="Elenco equivalente della maturità dei componenti"/);
assert.match(maturity,/\.\/component-maturity\.js/);
assert.match(maturity,/senza score o percentuali/);
assert.match(maturity,/aria-live="polite"/);
assert.match(maturity,/grid-template-areas:"list" "detail" "map"/);
assert.match(maturity,/deferSelection:window\.matchMedia/);
assert.match(maturity,/Un livello basso può indicare prove non ancora bound/);
assert.match(maturity,/Prove bound/);
assert.match(maturity,/nextRequiredEvidenceTypes/);
assert.match(sw,/trama-control-center-v15/);
assert.match(sw,/\.\/maturity\.html/);
assert.match(sw,/\.\/component-maturity\.js/);

assert.deepEqual(api.STAGES,['REGISTERED','ISOLATED','BEHAVIOURAL','RESPONSIVE_VISUAL','ACCESSIBILITY']);
assert(Array.isArray(snapshot.components),'snapshot components missing');
assert.equal(snapshot.components.length,11,'snapshot component count mismatch');

const model=api.buildModel(snapshot.components);
assert.equal(model.nodes.length,snapshot.components.length);
assert(model.products.includes('ARENA'),'Arena lane missing');
assert(model.products.includes('ATLAS'),'Atlas lane missing');
assert(model.products.includes('DOCENTE_OS'),'Docente OS lane missing');
assert(model.products.includes('TRAMA_CONTROL_CENTER'),'Control Center lane missing');

for(const node of model.nodes){
  assert(api.STAGES.includes(node.confirmed),'invalid confirmed stage');
  assert(api.STAGES.includes(node.candidate),'invalid candidate stage');
  assert(node.candidateX>=node.x,'candidate must not render behind confirmed stage');
  const description=api.componentDescription(node.component);
  assert.match(description,/Maturità confermata:/);
  assert.match(description,/Ciclo di vita:/);
  assert(!/%/.test(description),'percentage leaked into maturity description');
  assert(!/score/i.test(description),'score leaked into maturity description');
}

const arena=api.buildModel(snapshot.components,'ARENA');
assert(arena.nodes.length>0,'Arena filter empty');
assert(arena.nodes.every(n=>n.product==='ARENA'),'Arena filter leaked other products');

const governed=snapshot.components.find(c=>c.componentId==='ARENA.DIALOG_CONFIRM.GOVERNED');
assert(governed,'governed dialog missing');
const governedNode=model.nodes.find(n=>n.component.componentId===governed.componentId);
assert.equal(governedNode.confirmed,'ACCESSIBILITY');
assert.equal(governed.maturity.qualificationStatus,'QUALIFIED');

const governedTabs=snapshot.components.find(c=>c.componentId==='ARENA.TABS.GOVERNED');
assert(governedTabs,'governed tabs missing');
assert.equal(governedTabs.maturity.confirmedStage,'ACCESSIBILITY');
assert.equal(governedTabs.maturity.qualificationStatus,'QUALIFIED');

const relation=snapshot.components.find(c=>c.componentId==='ATLAS.RELATION_EXPLORER.FAMILY');
assert(relation,'Atlas RelationExplorer missing');
assert.equal(relation.maturity.confirmedStage,'REGISTERED');
assert.equal(relation.maturity.candidateStage,'ACCESSIBILITY');

const appshell=snapshot.components.find(c=>c.componentId==='DOCENTE_OS.APPSHELL.FAMILY');
assert(appshell,'Docente OS AppShell missing');
assert.equal(appshell.maturity.confirmedStage,'REGISTERED');
assert.equal(appshell.maturity.candidateStage,'ACCESSIBILITY');

const legacy=snapshot.components.find(c=>c.componentId==='ARENA.DIALOG_CONFIRM.LEGACY');
assert(legacy,'legacy dialog missing');
const legacyNode=model.nodes.find(n=>n.component.componentId===legacy.componentId);
assert.equal(legacyNode.confirmed,'REGISTERED');
assert.equal(legacyNode.candidate,'BEHAVIOURAL');
assert(legacyNode.candidateX>legacyNode.x,'candidate connector should be visible');

const source=fs.readFileSync(path.join(__dirname,'../control-center/component-maturity.js'),'utf8');
for(const forbidden of ['api.github.com','raw.githubusercontent.com','Authorization:','Bearer ','fetch(']){
  assert.equal(source.includes(forbidden),false,'forbidden capability in component maturity module: '+forbidden);
}

assert.equal(api.lifecycleLabel('TRIAL'),'In prova');
assert.equal(api.sourceLabel('PRODUCT_OWNED'),'Componente del prodotto');
assert.equal(api.evidenceStatusLabel('NOT_OBSERVED'),'Non osservata');

console.log('TRAMA_CC_MAT_VIZ_01_ORIENTATION_PASS');
