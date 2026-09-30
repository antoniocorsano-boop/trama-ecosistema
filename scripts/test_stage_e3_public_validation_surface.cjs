const fs=require('fs');
const assert=require('assert');

const home=fs.readFileSync('control-center/index.html','utf8');
const e3=fs.readFileSync('control-center/e3/index.html','utf8');
const sw=fs.readFileSync('control-center/sw.js','utf8');

assert.match(home,/E3_ALLOWED_SCENARIOS/);
for(const s of ['normal','loading','empty','partial','review','blocked','noaccess','offline','unavailable']){
  assert(home.includes("'"+s+"'"),'missing scenario '+s);
}
assert.match(home,/Modalità validazione E3/);
assert.match(home,/Non rappresenta lo stato reale del progetto/);
assert.match(home,/if\(E3_SCENARIO==='loading'\)return/);
assert.match(home,/accessStatus:'NO_ACCESS'/);
assert.match(home,/details\.hidden=Boolean\(t\.restricted\)/);

assert.match(e3,/Pannello moderatore/);
assert.match(e3,/Nessun dato è stato inviato/);
assert.match(e3,/containsDirectIdentifiers:false/);
assert.match(e3,/containsUngovernedRecording:false/);
assert.match(e3,/testedExactHead:head/);
assert.match(e3,/target="_blank" rel="noopener"/);

for(const forbidden of ['api.github.com','raw.githubusercontent.com','Authorization:','Bearer ','ghp_','github_pat_','fetch(','XMLHttpRequest','WebSocket','EventSource']){
  assert.equal(e3.includes(forbidden),false,'forbidden public E3 capability: '+forbidden);
}

assert.match(sw,/trama-control-center-v16/);
assert.match(sw,/\.\/e3\/index\.html/);

const inline=[...e3.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert(inline.length,'E3 inline script missing');
for(const [,src] of inline)new Function(src);

console.log('TRAMA Stage E3 public validation surface: PASS');
