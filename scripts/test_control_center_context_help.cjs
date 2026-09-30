const fs=require('fs');
const assert=require('assert');

const home=fs.readFileSync('control-center/index.html','utf8');
const help=fs.readFileSync('control-center/context-help.js','utf8');
const fixture=fs.readFileSync('control-center/fixtures/context-help.html','utf8');
const sw=fs.readFileSync('control-center/sw.js','utf8');

assert.match(home,/id="helpPopover"/);
assert.match(home,/role="tooltip"/);
assert.match(home,/popover="manual"/);
assert.match(home,/aria-hidden="true"/);
assert.match(home,/\.\/context-help\.js/);
assert.match(home,/TRAMAContextHelp\.initContextHelp\(document\)/);
assert.doesNotMatch(home,/id="helpClose"/);
assert.doesNotMatch(home,/function showHelp\(/);
assert.doesNotMatch(home,/function hideHelp\(/);

assert.match(help,/supportsNativePopover/);
assert.match(help,/showPopover/);
assert.match(help,/hidePopover/);
assert.match(help,/aria-describedby/);
assert.match(help,/event\.key === 'Escape'/);
assert.match(help,/mouseover/);
assert.match(help,/focusin/);
assert.match(help,/pointerdown/);
assert.match(help,/popover\.classList\.add\('open'\)/);
assert.doesNotMatch(help,/api\.github\.com|raw\.githubusercontent\.com|Authorization:|Bearer /);

assert.match(fixture,/Context Help isolated fixture/);
assert.match(fixture,/role="tooltip"/);
assert.match(fixture,/popover="manual"/);
assert.match(fixture,/\.\.\/context-help\.js/);
assert.match(fixture,/@media\(max-width:700px\)/);

assert.match(sw,/trama-control-center-v16/);
assert.match(sw,/\.\/context-help\.js/);

console.log('TRAMA_CC_CONTEXT_HELP_CS_S1_STATIC_PASS');
