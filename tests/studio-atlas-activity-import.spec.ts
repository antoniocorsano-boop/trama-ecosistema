import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { crc32 } from "node:zlib";

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
  await context.close();
});


function storedZip(entries: [string, Buffer][]) {
  const locals: Buffer[] = [], central: Buffer[] = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const n = Buffer.from(name), crc = crc32(data);
    const l = Buffer.alloc(30), c = Buffer.alloc(46);
    l.writeUInt32LE(0x04034b50); l.writeUInt16LE(20,4);
    l.writeUInt32LE(crc,14); l.writeUInt32LE(data.length,18); l.writeUInt32LE(data.length,22); l.writeUInt16LE(n.length,26);
    c.writeUInt32LE(0x02014b50); c.writeUInt16LE(20,4); c.writeUInt16LE(20,6);
    c.writeUInt32LE(crc,16); c.writeUInt32LE(data.length,20); c.writeUInt32LE(data.length,24); c.writeUInt16LE(n.length,28); c.writeUInt32LE(offset,42);
    locals.push(l,n,data); central.push(c,n); offset += l.length+n.length+data.length;
  }
  const dir=Buffer.concat(central), end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(dir.length,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,dir,end]);
}

test("EduTwin ZIP: upload, isolated interaction, original master, persistence and rejection", async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:393,height:873}});
  const page=await context.newPage();
  const html=Buffer.from('<!doctype html><html lang="it"><head><title>Prova</title></head><body><h1>Laboratorio ZIP</h1><button id="change">Regola</button><output id="out">0</output><script>document.querySelector("#change").onclick=()=>document.querySelector("#out").textContent="1"</script></body></html>');
  const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHn0AAAAASUVORK5CYII=","base64");
  const sha=(b:Buffer)=>createHash("sha256").update(b).digest("hex");
  const m={contract:"trama.activity-intake/v0.1",activityId:"edutwin-zip-browser",version:"0.1.1-draft",
    title:"EduTwin ZIP di verifica",kind:"INTERACTIVE_SIMULATION",
    assets:[
      {id:"experience",path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",sha256:sha(html),bytes:html.length},
      {id:"master",path:"media/master.png",type:"SOURCE_MASTER",format:"image/png",sha256:sha(png),bytes:png.length}
    ],
    experience:{entrypoint:"experience.html",entrypointSha256:sha(html),embeddedImagesCount:0,learnerPersonalData:false,telemetry:false,trustPolicy:"ISOLATED_HTML_SANDBOX_REQUIRED"},
    learning:{arenaObjectiveRefs:[],udaRefs:[],arenaCurricoloVersionRef:null},
    review:{status:"DRAFT_PENDING_HUMAN_REVIEW",rights:"PENDING"},
    authorization:{atlasPublished:false,studentRuntimeAllowed:false,docenteOsWriteAllowed:false,autoMergeAllowed:false}};
  const root="content/staging/edutwin-zip-browser/";
  const archive=storedZip([[root+"intake.json",Buffer.from(JSON.stringify(m))],[root+"experience.html",html],[root+"media/master.png",png]]);
  await page.goto(STUDIO+"/attivita");
  const input=page.getByLabel("Pacchetto di attività (.zip)");
  await input.setInputFiles({name:"edutwin.zip",mimeType:"application/zip",buffer:archive});
  await page.getByRole("button",{name:"Carica pacchetto"}).click();
  await expect(page.getByRole("status")).toContainText("2 risorse verificate e conservate");
  await expect(page.getByRole("heading",{name:"EduTwin ZIP di verifica"})).toBeVisible();
  await page.getByRole("button",{name:"Prova l'attività in ambiente isolato"}).click();
  const frame=page.frameLocator(".activity-preview iframe");
  await expect(frame.getByRole("heading",{name:"Laboratorio ZIP"})).toBeVisible();
  await frame.getByRole("button",{name:"Regola"}).click();
  await expect(frame.locator("#out")).toHaveText("1");
  await page.reload();
  await expect(page.getByRole("heading",{name:"EduTwin ZIP di verifica"})).toBeVisible();
  const master=await page.evaluate(async ()=>{
    const db=await new Promise<IDBDatabase>((res,rej)=>{const q=indexedDB.open("studio-atlas.activity-drafts.v0.1",1);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});
    try{return await new Promise<any>((res,rej)=>{const q=db.transaction("activities").objectStore("activities").getAll();q.onsuccess=()=>res(q.result[0]);q.onerror=()=>rej(q.error);});}
    finally{db.close();}
  });
  expect(master.source.kind).toBe("LOCAL_ZIP");
  expect(master.files.find((f:any)=>f.type==="SOURCE_MASTER").base64).toBe(png.toString("base64"));
  await input.setInputFiles({name:"edutwin.zip",mimeType:"application/zip",buffer:archive});
  await page.getByRole("button",{name:"Carica pacchetto"}).click();
  await expect(page.getByRole("status")).toContainText("già presente");
  await input.setInputFiles({name:"corrotto.zip",mimeType:"application/zip",buffer:Buffer.from("not zip")});
  await page.getByRole("button",{name:"Carica pacchetto"}).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator(".activity-list-item")).toHaveCount(1);
  await context.close();
});
