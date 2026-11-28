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
  await expect(page.getByRole("button",{name:"Importa bozza EduTwin"})).toBeEnabled();
  const imageDigest="f4a7d9385caf217305218bf2215f88b78a4b43f42c30c0373ea50523b8549794";
  first.input.assets=[{id:"original-city",kind:"IMAGE",sha256:imageDigest}];
  first.input.sceneIllustrations=[{sceneId:"edutwin-opening",assetId:"original-city",alt:"Illustrazione sintetica della città",role:"SETTING"}];
  first.input.authoring.scenes.push({sceneId:"transfer",kind:"TRANSFER",interaction:"SUMMARY",title:"Un nuovo avviso",visibleSituation:"In biblioteca un avviso parziale indica soltanto l’orario di chiusura.",learnerAction:"Confronta l’avviso con il documento completo.",consequence:"Puoi distinguere le fasce di apertura.",reveal:"La strategia vale anche per altre fonti.",choices:[]});
  await page.evaluate(async digest=>{
   const db=await new Promise<IDBDatabase>((resolve,reject)=>{
    const req=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);
    req.onupgradeneeded=()=>req.result.createObjectStore("activities",{keyPath:"key"});
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
   });
   try{await new Promise<void>((resolve,reject)=>{
    const path="art/city.webp",tx=db.transaction("activities","readwrite");
    tx.objectStore("activities").put({key:"synthetic@0.1.0-draft#"+digest,activityId:"synthetic",version:"0.1.0-draft",manifestDigest:digest,
     manifest:{title:"Originale sintetico",kind:"EDUTWIN",assets:[{id:"city",path,type:"IMAGE",sha256:digest}]},
     files:[{path,type:"IMAGE",format:"image/webp",sha256:digest,base64:"UklGRh4AAABXRUJQVlA4TBEAAAAvH8AHAAdQoMIUqv+BiOh/AAA="}],
     source:{kind:"LOCAL_ZIP",archiveDigest:digest,manifestPath:"intake.json"},status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-14T17:00:00.000Z"});
    tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error);
   });}finally{db.close();}
  },imageDigest);
  await receive(first);
  await expect(page.getByRole("status")).toContainText("Bozza salvata e riletta");
  await expect(page.getByRole("heading",{name:first.input.authoring.title,exact:true})).toBeVisible();
  await expect(page.getByText("1 di 1 risorse verificate nell’archivio locale.")).toBeVisible();
  const image=page.getByRole("img",{name:"Illustrazione sintetica della città"});
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText("Ambientazione di riferimento · Originale verificato")).toBeVisible();
  const openPreview=page.getByRole("button",{name:"Apri anteprima illustrata"});
  await expect(openPreview).toBeDisabled();
  await page.getByRole("checkbox",{name:/Ho esaminato questa storia/}).check();
  await expect(openPreview).toBeEnabled();
  const [preview]=await Promise.all([page.waitForEvent("popup"),openPreview.click()]);
  const runtime=preview.locator(".experience-runtime");
  await expect(runtime).toBeVisible({timeout:20000});
  await expect(preview.getByText(/NON AUTORIZZATA AGLI STUDENTI/)).toBeVisible();
  await expect(runtime.getByRole("img",{name:"Illustrazione sintetica della città"})).toBeVisible();
  await expect.poll(()=>runtime.getByRole("img").evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(32);
  await runtime.getByRole("button",{name:first.input.authoring.opening.firstAction,exact:true}).click();
  await expect(runtime.locator(".experience-feedback")).not.toBeEmpty();
  await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
  await expect(runtime.getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Anteprima illustrata di revisione aperta");
  await preview.close();
  await expect(openPreview).toBeDisabled();
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Prepara prossima revisione"}).click();
  const download=await downloadPromise;
  const path=await download.path();expect(path).toBeTruthy();
  const saved=JSON.parse(await readFile(path!,"utf8"));
  expect(saved.expectedParentDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(saved.project.storyReview.decision).toBe("DRAFT");
  expect(saved.sceneIllustrations).toEqual(first.input.sceneIllustrations);
  const next=structuredClone(first);
  next.expectedParentDigest=saved.expectedParentDigest;
  next.input.decisions=[];next.input.assets=[];delete next.input.sceneIllustrations;
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
  await expect(image).toBeVisible();
  await expect(page.getByText("1 di 1 risorse verificate nell’archivio locale.")).toBeVisible();
  await page.getByLabel("Versione da consultare").selectOption({label:"Versione 1"});
  await expect(page.getByText(first.input.authoring.opening.firstAction,{exact:false})).toBeVisible();
  await expect(page.getByRole("button",{name:"Prepara prossima revisione"})).toHaveCount(0);
  await receive(next);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("già presente o è stato aggiornato");
  await expect(page.getByText("Versione 2 · Da rivedere")).toBeVisible();
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
