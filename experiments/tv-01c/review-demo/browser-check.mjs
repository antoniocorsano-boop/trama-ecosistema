import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true});
try {
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(()=>{Object.defineProperty(window,"SpeechRecognition",{value:undefined,configurable:true});});
  await page.goto("http://127.0.0.1:8765/experiments/tv-01c/review-demo/");
  await page.getByRole("button",{name:"Parla con TRAMA"}).click();
  assert.match(await page.locator("#status").innerText(),/scrivere/);
  await page.getByRole("button",{name:"Calendario",exact:true}).click();
  await page.getByRole("button",{name:"Continua"}).click();
  assert.equal(await page.locator("#proposal").innerText(),"Calendario");
  assert.equal(await page.locator("#receipt").innerText(),"");
  await page.getByRole("button",{name:"Conferma",exact:true}).click();
  assert.match(await page.locator("#receipt").innerText(),/Richiesta confermata/);
  assert.equal(await page.locator("#confirm").isDisabled(),true);
  await page.locator("#transcript").fill("non aprire il calendario");
  await page.getByRole("button",{name:"Continua"}).click();
  assert.equal(await page.locator("#review-panel").isVisible(),false);
  await page.getByRole("button",{name:"Orario",exact:true}).click();
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByRole("button",{name:"Modifica"}).click();
  assert.equal(await page.locator("#review-panel").isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole("button",{name:"Annulla",exact:true}).click();
  await page.screenshot({path:"tv01c-ui-evidence/"+width+"-home.png",fullPage:true});
  await page.getByRole("button",{name:"Calendario",exact:true}).click();
  await page.getByRole("button",{name:"Continua"}).click();
  await page.screenshot({path:"tv01c-ui-evidence/"+width+"-review.png",fullPage:true});
  assert.deepEqual(errors,[]);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{
  window.__speechStarts=0;
  class MockSpeech {
   static async available(options){if(options.processLocally!==true||options.langs[0]!=="it-IT")throw Error("not local");return "available";}
   get processLocally(){return this.local;} set processLocally(v){this.local=v;}
   start(){if(this.local!==true)throw Error("not local");window.__speechStarts++;window.__mock=this;}
   abort(){}
  }
  Object.defineProperty(window,"SpeechRecognition",{value:MockSpeech,configurable:true});
 });
 await page.goto("http://127.0.0.1:8765/experiments/tv-01c/review-demo/");
 await page.getByRole("button",{name:"Parla con TRAMA"}).click();
 await page.getByRole("button",{name:"Interrompi ascolto"}).waitFor();
 await page.evaluate(()=>{let r=[{transcript:"apri il calendario"}];r.isFinal=true;window.__mock.onresult({results:[r]});window.__mock.onend();});
 assert.equal(await page.locator("#transcript").inputValue(),"apri il calendario");
 assert.equal(await page.locator("#review-panel").isVisible(),false);
 await page.getByRole("button",{name:"Continua"}).click();
 assert.equal(await page.locator("#receipt").innerText(),"");
 await page.getByRole("button",{name:"Parla con TRAMA"}).click();
 await page.getByRole("button",{name:"Interrompi ascolto"}).waitFor();
 assert.equal(await page.locator("#review-panel").isVisible(),false);
 await page.getByRole("button",{name:"Interrompi ascolto"}).click();
 assert.equal(await page.locator("#transcript").inputValue(),"");
 assert.equal(await page.evaluate(()=>window.__speechStarts),2);
 console.log("UI browser checks PASS (mock speech; no real microphone qualification)");
} finally {await browser.close();}
