import { expect, test } from "@playwright/test";

const STUDIO = "http://127.0.0.1:3100";
const ATLAS_REPO = "antoniocorsano-boop/" + ["Curri", "culum-Atlas"].join("");
const INTAKE_URL = "https://github.com/" + ATLAS_REPO + "/pull/84";
const EXACT_SOURCE_SHA = "f0c29655632a7edc6d78c78d48d006aa8da020a2";

test("Missione 118: live intake, eight original illustrations, three environments and retained draft", async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ viewport: { width: 393, height: 873 } });
  const page = await context.newPage();
  const browserErrors: string[] = [];
  page.on("pageerror", error => browserErrors.push(error.message));

  await page.goto(STUDIO + "/attivita");
  await expect(page.getByRole("heading", { name: "Attività da utilizzare e sviluppare." })).toBeVisible();
  await expect(page.getByLabel("Collegamento alla revisione che contiene il materiale")).toHaveValue(INTAKE_URL);

  await page.getByRole("button", { name: "Importa", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("10 risorse verificate e conservate", { timeout: 90_000 });
  await expect(page.getByRole("heading", { name: "Missione 118 — Il futuro è da riprogettare" })).toBeVisible();
  await expect(page.locator(".activity-gallery figure")).toHaveCount(8);
  for (const image of await page.locator(".activity-gallery img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth), {
      timeout: 15_000,
    }).toBeGreaterThan(0);
  }

  const archived = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("studio-atlas.activity-drafts.v0.1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const records = await new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction("activities", "readonly");
        const request = tx.objectStore("activities").getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return records.map(draft => ({
        activityId: draft.activityId,
        sourceSha: draft.source.commitSha,
        files: draft.files.map((file: { path: string; sha256: string; base64: string }) => ({
          path: file.path,
          signature: file.sha256,
          size: file.base64.length,
        })),
        state: draft.status,
      }));
    } finally { db.close(); }
  });
  expect(archived).toHaveLength(1);
  expect(archived[0].activityId).toBe("trama-missione-118-2026");
  expect(archived[0].sourceSha).toBe(EXACT_SOURCE_SHA);
  expect(archived[0].files).toHaveLength(10);
  expect(archived[0].files.every((file: { signature: string; size: number }) =>
    /^[0-9a-f]{64}$/.test(file.signature) && file.size > 0)).toBe(true);
  expect(archived[0].state).toBe("DRAFT_PENDING_HUMAN_REVIEW");

  await page.getByRole("button", { name: "Leggi guida docente" }).click();
  const guideFrame = page.frameLocator("iframe[title='Guida docente']");
  await expect(guideFrame.getByRole("heading", { name: "Missione 118", exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Chiudi guida" }).click();

  await page.getByRole("button", { name: "Prova l'attività in ambiente isolato" }).click();
  const iframe = page.locator(".activity-preview iframe");
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-forms");
  const experience = page.frameLocator(".activity-preview iframe");
  await expect(experience.getByText("Scena 1 di 5")).toBeVisible({ timeout: 20_000 });
  // Forms may dispatch a local submit event, but the policy denies network submission.
  const csp = await experience.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("form-action 'none'");
  expect(csp).toContain("connect-src 'none'");
  expect(await experience.locator("body").evaluate(() => {
    try { localStorage.getItem("loi-01-probe"); return true; }
    catch { return false; }
  })).toBe(false);

  for (let scene = 2; scene <= 5; scene++) {
    await experience.locator("button[data-action='storynext']").click();
    await expect(experience.getByText("Scena " + scene + " di 5")).toBeVisible();
  }
  await experience.locator("button[data-action='enterMission']").first().click();

  async function beginRoom(room: number, title: string) {
    await expect(experience.locator("[data-room='" + room + "']")).toBeVisible();
    await expect(experience.getByRole("heading", { name: title })).toBeVisible();
    await experience.locator("button[data-action='begin']").click();
  }
  async function answer(index: number) {
    await experience.locator("button[data-action='answer'][data-choice='" + index + "']").click();
    await expect(experience.getByRole("heading", { name: "Funziona. Prosegui." })).toBeVisible();
    await experience.locator("button[data-action='advance']").click();
  }
  async function completeRoom(room: number) {
    await expect(experience.getByRole("heading", { name: "Sistema ripristinato." })).toBeVisible();
    await expect(experience.getByText("Ambiente " + room + " recuperato")).toBeVisible();
    await experience.locator("button[data-action='nextstage']").click();
  }

  await beginRoom(1, "La città che non dorme");
  for (const index of [0, 0, 0, 1, 1]) await answer(index);
  await completeRoom(1);

  await beginRoom(2, "Il tutor impeccabile");
  for (const index of [0, 1, 0, 1, 0, 0]) await answer(index);
  await completeRoom(2);

  await beginRoom(3, "L’incrocio nel buio");
  for (const index of [1, 0, 0, 1]) await answer(index);
  await completeRoom(3);

  await beginRoom(4, "La porta del futuro");
  await experience.locator("button[data-action='select-principle'][data-choice='verifica']").click();
  await expect(experience.getByRole("heading", { name: "Ricostruisci il codice finale." })).toBeVisible();
  await experience.locator("#code").fill("324");
  await experience.locator("#codeForm button[type='submit']").click();
  await expect(experience.getByRole("heading", { name: "Il futuro è cambiato." })).toBeVisible();
  expect(browserErrors).toEqual([]);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Missione 118 — Il futuro è da riprogettare" })).toBeVisible();
  await expect(page.locator(".activity-gallery figure")).toHaveCount(8);
  await page.getByRole("button", { name: "Importa", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("già presente: nessuna modifica agli originali", { timeout: 90_000 });
  await expect(page.locator(".activity-list-item")).toHaveCount(1);

  // Simulate a real v1 archive created before the media budget existed.
  const legacy=await page.evaluate(async ()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try {
      return await new Promise<any>((resolve,reject)=>{
        const tx=db.transaction("activities","readwrite"),s=tx.objectStore("activities");
        let original:any;
        const r=s.getAll();
        r.onsuccess=()=>{
          original=r.result[0];
          delete original.galleryValidation;
          original.files=original.files.map(({pixelWidth,pixelHeight,...f}:any)=>f);
          s.put(original);
        };
        tx.oncomplete=()=>resolve(original);tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error);
      });
    }finally{db.close();}
  });
  let networkImports=0;
  await page.route("**/api/attivita/importa",async r=>{networkImports++;await r.abort();});
  await page.reload();
  await expect(page.locator(".activity-gallery figure")).toHaveCount(8);
  const migrated=await page.evaluate(async ()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{return await new Promise<any>((resolve,reject)=>{const r=db.transaction("activities").objectStore("activities").getAll();r.onsuccess=()=>resolve(r.result[0]);r.onerror=()=>reject(r.error);});}
    finally{db.close();}
  });
  expect(migrated.galleryValidation).toBe("WEBP_HEADER_V1");
  expect(migrated.files.filter((f:any)=>f.type==="IMAGE").every((f:any)=>f.pixelWidth>0&&f.pixelHeight>0)).toBe(true);
  const {galleryValidation,...rest}=migrated;
  expect({...rest,files:rest.files.map(({pixelWidth,pixelHeight,...f}:any)=>f)}).toEqual(legacy);
  expect(networkImports).toBe(0);
  await page.unroute("**/api/attivita/importa");

  await context.close();
});


test("unknown HTML cannot create a preview or issue external requests; concurrent version conflict is atomic", async ({browser})=>{
  const context=await browser.newContext({viewport:{width:393,height:873}});
  const a=await context.newPage(),b=await context.newPage();
  const outside:string[]=[];
  await context.route("https://example.invalid/**",async r=>{outside.push(r.request().url());await r.abort();});
  const make=(digest:string,body:string)=>{
    const html=Buffer.from(body).toString("base64");
    return {draft:{key:"unsafe-test@0.1.0-draft#"+digest,activityId:"unsafe-test",version:"0.1.0-draft",manifestDigest:digest,
      manifest:{title:"Bozza isolata",kind:"INTERACTIVE_HTML",assets:[{id:"experience",path:"experience.html",type:"INTERACTIVE_HTML",sha256:digest}],experience:{entrypoint:"experience.html"}},
      source:{repository:ATLAS_REPO,pullRequest:999,commitSha:"a".repeat(40),manifestPath:"intake.json"},
      files:[{path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",sha256:digest,base64:html}],
      status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-11-13T00:00:00Z"},verified:1};
  };
  const bad1=make("1".repeat(64),'<!-- <head> --><script>location.href="https://example.invalid/probe"</script><html><head></head></html>');
  const bad2=make("2".repeat(64),'<!doctype html><html><head><meta http-equiv="refresh" content="0;url=https://example.invalid/probe"></head><body><a href="https://example.invalid/probe">Link</a></body></html>');
  await a.route("**/api/attivita/importa",r=>r.fulfill({json:bad1}));
  await b.route("**/api/attivita/importa",r=>r.fulfill({json:bad2}));
  await Promise.all([a.goto(STUDIO+"/attivita"),b.goto(STUDIO+"/attivita")]);
  await Promise.all([a.getByRole("button",{name:"Importa",exact:true}).click(),b.getByRole("button",{name:"Importa",exact:true}).click()]);
  await Promise.all([a.locator(".activity-message").first().waitFor(),b.locator(".activity-message").first().waitFor()]);
  const outcomes=await Promise.all([a.locator(".activity-message").first().innerText(),b.locator(".activity-message").first().innerText()]);
  expect(outcomes.filter(t=>t.includes("risorse verificate"))).toHaveLength(1);
  expect(outcomes.filter(t=>t.includes("contenuti diversi"))).toHaveLength(1);
  await a.reload();
  await expect(a.locator(".activity-list-item")).toHaveCount(1);
  await expect(a.getByText("Anteprima in attesa di verifica del codice.",{exact:false})).toBeVisible();
  await expect(a.getByRole("button",{name:"Prova l'attività in ambiente isolato"})).toHaveCount(0);
  await expect(a.locator(".activity-preview iframe")).toHaveCount(0);
  expect(outside).toEqual([]);
  await context.close();
});

test("legacy invalid gallery stays archived and is not decoded",async({browser})=>{
  const context=await browser.newContext({viewport:{width:393,height:873}});
  const page=await context.newPage();
  await page.goto(STUDIO+"/attivita");
  await expect(page.getByRole("heading",{name:"Attività da utilizzare e sviluppare."})).toBeVisible();
  const stored=await page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    const raw={key:"old-invalid",activityId:"old-invalid",version:"0.1.0-draft",manifestDigest:"old",
      manifest:{title:"Archivio precedente",kind:"TEST",assets:[{id:"image",path:"bad.webp",type:"IMAGE",sha256:"a".repeat(64)}]},
      source:{repository:"test/repo",pullRequest:1,commitSha:"old",manifestPath:"intake.json"},
      files:[{path:"bad.webp",type:"IMAGE",format:"image/webp",sha256:"a".repeat(64),base64:btoa("not a webp")}],
      status:"DRAFT_PENDING_HUMAN_REVIEW",importedAt:"2026-01-01T00:00:00Z"};
    try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction("activities","readwrite");tx.objectStore("activities").add(raw);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);});return raw;}
    finally{db.close();}
  });
  await page.reload();
  await expect(page.getByText("La verifica delle dimensioni non è riuscita",{exact:false})).toBeVisible();
  await expect(page.locator(".activity-gallery img")).toHaveCount(0);
  const after=await page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{return await new Promise<any>((resolve,reject)=>{const r=db.transaction("activities").objectStore("activities").get("old-invalid");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
    finally{db.close();}
  });
  expect(after).toEqual(stored);
  await context.close();
});
