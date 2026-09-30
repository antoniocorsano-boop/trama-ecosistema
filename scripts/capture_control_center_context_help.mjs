import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import axe from 'axe-core';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const outDir=path.join(root,'artifacts','cc-context-help-cs-s1');
await fs.mkdir(outDir,{recursive:true});

const exactHead=process.env.TRAMA_EXACT_HEAD || 'LOCAL';
const runId=process.env.TRAMA_RUN_ID || 'LOCAL';

const mime={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml'
};

const server=http.createServer(async (req,res)=>{
  try{
    const raw=(req.url||'/').split('?')[0];
    const rel=raw==='/'?'control-center/index.html':raw.replace(/^\//,'');
    const candidate=path.normalize(path.join(root,rel));
    if(!candidate.startsWith(root)){res.writeHead(403);res.end();return}
    const body=await fs.readFile(candidate);
    res.writeHead(200,{'content-type':mime[path.extname(candidate)]||'application/octet-stream','cache-control':'no-store'});
    res.end(body);
  }catch(err){
    res.writeHead(404,{'content-type':'text/plain'});res.end('not found');
  }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});

const results=[];

async function auditFixture(page){
  await page.addScriptTag({content:axe.source});
  const result=await page.evaluate(async()=>{
    return await window.axe.run(document,{
      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}
    });
  });
  const blocking=result.violations.filter(v=>['critical','serious'].includes(v.impact));
  assert.equal(blocking.length,0,blocking.map(v=>v.id+': '+v.help).join('\n'));
  return result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help}));
}

async function qualifyIsolated(viewport,label){
  const page=await browser.newPage({viewport});
  await page.goto(`http://127.0.0.1:${port}/control-center/fixtures/context-help.html`,{waitUntil:'networkidle'});

  const first=page.locator('.helpable').nth(0);
  const second=page.locator('.helpable').nth(1);
  const tip=page.locator('#helpPopover');

  await first.focus();
  await assert.doesNotReject(async()=>await tip.waitFor({state:'visible'}));
  assert.equal(await tip.getAttribute('role'),'tooltip');
  assert.equal(await tip.getAttribute('aria-hidden'),'false');
  assert.equal(await first.getAttribute('aria-describedby'),'helpPopover');
  assert.equal(await page.locator('#helpTitle').textContent(),'Gate aperti');

  const support=await page.evaluate(()=>window.__contextHelp.supportsNativePopover);
  assert.equal(support,true,'Current qualification Chromium must exercise native Popover');

  const metrics=await tip.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {
      left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      width:r.width,height:r.height,
      viewportWidth:innerWidth,viewportHeight:innerHeight,
      docClientWidth:document.documentElement.clientWidth,
      docScrollWidth:document.documentElement.scrollWidth
    };
  });
  assert.ok(metrics.left>=-1 && metrics.right<=metrics.viewportWidth+1,'Tooltip must fit horizontally');
  assert.ok(metrics.top>=-1 && metrics.bottom<=metrics.viewportHeight+1,'Tooltip must fit vertically');
  assert.ok(metrics.docScrollWidth<=metrics.docClientWidth+1,'Context Help must not create page overflow');

  await page.keyboard.press('Escape');
  assert.equal(await tip.getAttribute('aria-hidden'),'true');
  assert.equal(await first.getAttribute('aria-describedby'),null);
  assert.equal(await first.evaluate(el=>document.activeElement===el),true,'Escape must preserve/restore trigger focus');

  await second.hover();
  await tip.waitFor({state:'visible'});
  assert.equal(await page.locator('#helpTitle').textContent(),'Maturità');
  assert.equal(await second.getAttribute('aria-describedby'),'helpPopover');

  await page.mouse.move(1,1);
  await page.waitForTimeout(30);
  assert.equal(await tip.getAttribute('aria-hidden'),'true','Pointer leave must dismiss non-pinned help');

  await first.focus();
  const violations=await auditFixture(page);

  const screenshot=path.join(outDir,`context-help-${label}.png`);
  await page.screenshot({path:screenshot,fullPage:true});

  results.push({
    surface:'isolated',
    viewport,
    nativePopover:support,
    axeViolations:violations,
    screenshot:path.relative(root,screenshot),
    metrics
  });
  await page.close();
}

async function qualifyIntegrated(){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(`http://127.0.0.1:${port}/control-center/index.html`,{waitUntil:'networkidle'});
  const trigger=page.getByRole('heading',{name:'Stakeholder Assurance'});
  await trigger.focus();
  const tip=page.locator('#helpPopover');
  await tip.waitFor({state:'visible'});
  assert.equal(await tip.getAttribute('role'),'tooltip');
  assert.equal(await trigger.getAttribute('aria-describedby'),'helpPopover');
  assert.match((await page.locator('#helpText').textContent())||'',/target/i);
  await page.keyboard.press('Escape');
  assert.equal(await tip.getAttribute('aria-hidden'),'true');
  assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
  results.push({surface:'home-integration',viewport:{width:390,height:844},status:'PASS'});
  await page.close();
}

try{
  for(const [viewport,label] of [
    [{width:390,height:844},'390x844'],
    [{width:1024,height:768},'1024x768']
  ]){
    await qualifyIsolated(viewport,label);
  }
  await qualifyIntegrated();

  const evidence={
    schemaVersion:'trama.control-center-context-help-evidence/v1',
    componentId:'CONTROL_CENTER.CONTEXT_HELP.FAMILY',
    candidate:'NATIVE_POPOVER_TOOLTIP_PROGRESSIVE',
    exactHead,
    runId,
    generatedAt:new Date().toISOString(),
    status:'PASS',
    boundaries:{
      runtimeDependencyAdded:false,
      externalPrimitiveAdopted:false,
      lifecyclePromotion:false
    },
    results
  };
  await fs.writeFile(path.join(outDir,'evidence.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
  process.stdout.write('TRAMA_CC_CONTEXT_HELP_CS_S1_BROWSER_PASS\n');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
