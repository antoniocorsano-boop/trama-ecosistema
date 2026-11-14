import {expect,test} from "@playwright/test";
import {readFile} from "node:fs/promises";

const origin="http://127.0.0.1:3100";
test("EduTwin local handoff preserves revision history, rejects stale imports and reopens after reload",async({browser})=>{
 const context=await browser.newContext({viewport:{width:393,height:873},acceptDownloads:true});
 try{
  const page=await context.newPage(),errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  const first=JSON.parse(await readFile("/tmp/edutwin-handoff-fixture.json","utf8"));
  await page.goto(origin+"/edutwin");
  await expect(page.getByRole("heading",{name:"Continua da ChatGPT"})).toBeVisible();
  async function receive(value:unknown){
   await page.locator("input[type=file]").setInputFiles({name:"edutwin.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(value))});
  }
  await receive(first);
  await expect(page.getByRole("status")).toContainText("Bozza salvata e riletta");
  await expect(page.getByRole("heading",{name:first.input.authoring.title,exact:true})).toBeVisible();
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Prepara prossima revisione"}).click();
  const download=await downloadPromise;
  const path=await download.path();expect(path).toBeTruthy();
  const saved=JSON.parse(await readFile(path!,"utf8"));
  expect(saved.expectedParentDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(saved.project.storyReview.decision).toBe("DRAFT");
  const next=structuredClone(first);
  next.expectedParentDigest=saved.expectedParentDigest;
  next.input.decisions=[];next.input.assets=[];
  next.input.authoring.opening.firstAction="Osserva il primo display per confrontare gli avvisi.";
  next.input.feedback=[{id:"clarity",category:"ACTION",observation:"Serve una prima azione più concreta.",requestedChange:"Indicare il display."}];
  next.input.responses=[{feedbackId:"clarity",proposedChange:"Esplicitato il display."}];
  await receive(next);
  await expect(page.getByRole("status")).toContainText("Bozza salvata e riletta");
  await expect(page.getByText("Versione 2 · Da rivedere")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Versione 2 · Da rivedere")).toBeVisible();
  await page.getByRole("button",{name:"Apri",exact:true}).click();
  await expect(page.getByText(next.input.authoring.opening.firstAction,{exact:false})).toBeVisible();
  await page.getByLabel("Versione da consultare").selectOption({label:"Versione 1"});
  await expect(page.getByText(first.input.authoring.opening.firstAction,{exact:false})).toBeVisible();
  await expect(page.getByRole("button",{name:"Prepara prossima revisione"})).toHaveCount(0);
  await receive(next);
  await expect(page.getByRole("alert")).toContainText("già presente o è stato aggiornato");
  await expect(page.getByText("Versione 2 · Da rivedere")).toBeVisible();
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
