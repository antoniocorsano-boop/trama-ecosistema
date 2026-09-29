const fs=require('fs');
const assert=require('assert');

const home=fs.readFileSync('control-center/index.html','utf8');
const maturity=fs.readFileSync('control-center/maturity.html','utf8');

assert.match(home,/Apri la vista Maturità →/);
assert.match(home,/maturityAreaSummary/);
assert.match(home,/maturityComponentSummary/);
assert.doesNotMatch(home,/id="componentMaturityMap"/);
assert.doesNotMatch(home,/id="componentMaturityEquivalent"/);
assert.match(home,/href="\.\/maturity\.html">Maturità<\/a>/);

assert.match(home,/phase-mobile-empty/);
assert.match(home,/Nessuna fase attiva in questo momento/);

assert.match(home,/AUTHORITY:'Autorità'/);
assert.match(home,/DATA_FLOW:'Flusso dati'/);
assert.match(home,/FUTURE_NOT_AUTHORIZED:'Futuro non autorizzato'/);
assert.match(home,/DOCUMENT_CANONICAL:'Documento canonico'/);
assert.match(home,/UNTIL_CHANGE:'Valido fino a modifica'/);
assert.match(home,/uiLabel\(d\.kind\)/);
assert.match(home,/uiLabel\(d\.status/);
assert.match(home,/uiLabel\(e\.type\)/);
assert.match(home,/uiLabel\(e\.freshness/);

assert.match(maturity,/VISTA SPECIALISTICA/);
assert.match(maturity,/grid-template-areas:"list" "detail" "map"/);
assert.match(maturity,/componentMapDisclosure\.removeAttribute\('open'\)/);
assert.match(maturity,/deferSelection:window\.matchMedia/);
assert.match(maturity,/Torna alla sintesi/);

console.log('TRAMA_CONTROL_CENTER_ORIENTATION_REMEDIATION_PASS');
