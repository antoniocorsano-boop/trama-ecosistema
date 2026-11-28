import { chromium, expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve(process.cwd(), "../products/studio-atlas/.artifacts");
const html = join(output, "awc-sala-zero-live-webgl-offline.html");
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

test("AWC S3b offline: actual local 3-D, touch, light A/B and reset, with no network", async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const network: string[] = [], errors: string[] = [], consoleErrors: string[] = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("request", request => {
      if (/^https?:/i.test(request.url())) network.push(request.url());
    });
    page.on("pageerror", error => errors.push(error.message));
    expect(readFileSync(html).length).toBeGreaterThan(400_000);
    await page.goto(pathToFileURL(html).href);
    try {
      await page.waitForFunction(() => (window as any).__awcTrial !== undefined, null, { timeout: 12_000 });
    } catch {
      throw new Error("Offline 3-D script did not start: " + consoleErrors.join(" | "));
    }
    const status = page.getByRole("status");
    await expect(status).toContainText("WebGL attivo", { timeout: 30_000 });
    const canvas = page.locator("#viewport canvas");
    await expect(canvas).toBeVisible();
    const original = await canvas.screenshot({ path: join(output, "awc-s3b-original.png") });
    const material = page.getByLabel("Superficie di riferimento");
    const materialDigests = new Set([sha(original)]);
    for (const [id,label] of [["stone","Pietra"],["bronze","Bronzo"],["obsidian","Ossidiana"],["frame","Cornice"]]) {
      await material.selectOption(id);
      await expect(status).toContainText("superficie "+label);
      await expect(canvas).toHaveAttribute("data-optical-profile",id);
      const alternate = await canvas.screenshot({path:join(output,"awc-s3b-material-"+id+".png")});
      expect(materialDigests.has(sha(alternate))).toBe(false);
      materialDigests.add(sha(alternate));
    }
    await material.selectOption("original");
    await expect(status).toContainText("superficie Originale");
    const restored = await canvas.screenshot({path:join(output,"awc-s3b-material-restored.png")});
    expect(sha(restored)).toBe(sha(original));
    await page.getByRole("button", { name: "Luce originale AWC-F" }).click();
    await expect(status).toContainText("luce originale");
    const old = await canvas.screenshot({ path: join(output, "awc-s3b-luce-originale.png") });
    expect(sha(original)).not.toBe(sha(old));
    await page.getByRole("button", { name: "Luce equilibrata · prova" }).click();
    await expect(status).toContainText("luce equilibrata");

    const bounds = await canvas.boundingBox();
    if (!bounds) throw Error("Canvas missing");
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 30, bounds.y + bounds.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(status).toContainText("rotazione 0.12 rad");
    await page.getByRole("button", { name: "Cambia segnale A/B" }).click();
    await expect(status).toContainText("segnale B");
    const signal = await canvas.screenshot({ path: join(output, "awc-s3b-segnale-b.png") });
    expect(sha(original)).not.toBe(sha(signal));
    await page.getByRole("button", { name: "Ripristina inquadratura" }).click();
    await expect(status).toContainText("rotazione 0.00 rad");
    await expect(status).toContainText("segnale A");
    const state = await page.evaluate(() => (window as any).__awcTrial?.getState());
    expect(state.objects).toBe(16);
    expect(state.material).toBe("original");
    expect(consoleErrors).toEqual([]);
    expect(state.studentAuthorized).toBe(false);
    expect(state.publishable).toBe(false);
    expect(network).toEqual([]);
    expect(errors).toEqual([]);
    const width = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth,
    }));
    expect(width.page).toBeLessThanOrEqual(width.viewport + 1);
    await context.close();
  } finally { await browser.close(); }
});

test("VF-SIMULATION-01 P2 gear laboratory: real offline WebGL, prediction and reset",async()=>{
  test.setTimeout(90_000);
  const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  try{
    for(const width of [360,390,1280]){
      const context=await browser.newContext({viewport:{width,height:900},offline:true});
      const page=await context.newPage(), errors:string[]=[], network:string[]=[];
      page.on("pageerror",e=>errors.push(e.message));
      page.on("request",r=>{if(/^https?:/i.test(r.url()))network.push(r.url());});
      await page.goto(pathToFileURL(join(output,"vf-simulation-gear.html")).href);
      await expect(page.locator("#graphics")).toContainText("WebGL attivo");
      const state=()=>page.evaluate(()=>(window as any).__vfSimulation.getState());
      expect((await state()).outputRpm).toBe(-30);
      await page.getByLabel("Come ruoterà il condotto?").selectOption("slow");
      await page.getByRole("button",{name:"Verifica la previsione"}).click();
      await expect(page.locator("#feedback")).toContainText("Previsione corretta");
      const original=await page.locator("canvas").screenshot();
      await page.getByRole("button",{name:"Avanza di 90°"}).click();
      expect((await state()).outputAngle).toBe(-45);
      expect(sha(await page.locator("canvas").screenshot())).not.toBe(sha(original));
      await page.getByLabel("Denti del conduttore").selectOption("48");
      expect((await state()).outputRpm).toBe(-120);
      await page.getByRole("button",{name:"Avvia"}).click();
      await expect.poll(async()=>(await state()).inputAngle).toBeGreaterThan(0);
      await page.getByRole("button",{name:"Pausa"}).click();
      const stopped=(await state()).inputAngle;
      await page.getByRole("button",{name:"Ripristina"}).click();
      expect(stopped).toBeGreaterThan(0);
      expect((await state()).inputAngle).toBe(0);
      expect((await state()).studentAuthorized).toBe(false);
      expect((await state()).publicationAuthorized).toBe(false);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
      expect(errors).toEqual([]);expect(network).toEqual([]);
      await page.screenshot({path:join(output,"vf-simulation-gear-"+width+".png"),fullPage:true});
      await context.close();
    }
  }finally{await browser.close();}
});

test("VF-SIMULATION-01 P2-R1: all 16 pairs fit at three widths throughout sampled rotation; legacy camera clips",async()=>{
  test.setTimeout(120_000);
  const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const records:any[]=[];
  try{
    const context=await browser.newContext({viewport:{width:360,height:900},offline:true});
    const page=await context.newPage(),errors:string[]=[],network:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("request",r=>{if(/^https?:/i.test(r.url()))network.push(r.url());});
    await page.goto(pathToFileURL(join(output,"vf-simulation-gear.html")).href);
    await expect(page.locator("#graphics")).toContainText("WebGL attivo");
    const sample=()=>page.evaluate(()=>(window as any).__vfSimulation.getFrameEvidence());
    const teeth=[12,24,36,48];
    for(const width of [360,390,1280]){
      await page.setViewportSize({width,height:900});
      for(const a of teeth)for(const b of teeth){
        await page.getByLabel("Denti del conduttore").selectOption(String(a));
        await page.getByLabel("Denti del condotto").selectOption(String(b));
        const poses:any[]=[];let fixed:any=null;
        for(let i=0;i<4;i++){
          const e=await sample();expect(e).not.toBeNull();expect(e.objects).toBe(4);expect(e.vertices).toBeGreaterThan(0);
          const values=Object.values(e.bounds);expect(values.every(v=>typeof v==="number"&&Number.isFinite(v))).toBe(true);
          for(const axis of ["X","Y"]){expect(e.bounds["min"+axis]).toBeGreaterThanOrEqual(-.9);expect(e.bounds["max"+axis]).toBeLessThanOrEqual(.9);}
          expect(e.bounds.minZ).toBeGreaterThanOrEqual(-1);expect(e.bounds.maxZ).toBeLessThanOrEqual(1);
          if(fixed)expect(e.frustum).toEqual(fixed);else fixed=e.frustum;
          // RED counterfactual: apply the exact previous centered frustum to
          // measured vertices in camera coordinates, without changing the product.
          const span=Math.max(4.4,(a+b)/24+1.2),half=span/2,vertical=half*e.height/e.width;
          const oldClips=e.viewBounds.minX < -half||e.viewBounds.maxX>half||e.viewBounds.minY < -vertical||e.viewBounds.maxY>vertical;
          poses.push({bounds:e.bounds,oldClips});
          await page.getByRole("button",{name:"Avanza di 90°"}).click();
        }
        if(a===48&&b===48)expect(poses.every(p=>p.oldClips)).toBe(true);
        records.push({width,a,b,poses});
      }
      await page.locator("canvas").screenshot({path:join(output,"vf-simulation-gear-framing-"+width+".png")});
    }
    expect(records.length).toBe(48);
    expect(records.reduce((sum,r)=>sum+r.poses.length,0)).toBe(192);
    // Test resizing the largest gears without changing inputs.
    await page.setViewportSize({width:360,height:900});
    await expect.poll(async()=>{const e=await sample();return Math.abs((e.frustum.right-e.frustum.left)/(e.frustum.top-e.frustum.bottom)-e.width/e.height);}).toBeLessThan(1e-6);
    const e=await sample();expect(e.bounds.minX).toBeGreaterThanOrEqual(-.9);expect(e.bounds.maxX).toBeLessThanOrEqual(.9);expect(e.bounds.minY).toBeGreaterThanOrEqual(-.9);expect(e.bounds.maxY).toBeLessThanOrEqual(.9);
    expect(errors).toEqual([]);expect(network).toEqual([]);
    const {writeFileSync}=await import("node:fs");writeFileSync(join(output,"vf-simulation-gear-framing.json"),JSON.stringify({status:"PASS",records},null,2));
    await context.close();
  }finally{await browser.close();}
});

test("VF-SIMULATION-01 P3a: shared production contract and second offline mechanism",async()=>{
  test.setTimeout(90_000);
  const receipts=["gear","slider-crank"].map(id=>{
    const receipt=JSON.parse(readFileSync(join(output,"vf-simulation-"+id+"-receipt.json"),"utf8"));
    const bytes=readFileSync(join(output,"vf-simulation-"+id+".html"));
    expect(receipt.id).toBe(id);expect(receipt.schema).toBe("atlas.simulation-lab/v0.1");
    expect(receipt.htmlSha256).toBe(sha(bytes));expect(receipt.bytes).toBe(bytes.length);
    expect(receipt.costPolicy).toBe("FREE_ONLY");expect(receipt.studentAuthorized).toBe(false);expect(receipt.publicationAuthorized).toBe(false);
    expect(receipt.status).toBe("TEACHER_REVIEW_REQUIRED");expect(receipt.objective).toBeTruthy();expect(receipt.question).toBeTruthy();
    return receipt;
  });
  expect(receipts[0].engine).toBe("three-r128");expect(receipts[1].engine).toBe("native-svg");
  expect(receipts[1].engineBlob).toBeNull();expect(receipts[1].bytes).toBeLessThan(30_000);
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [360,390,1280]){
      const context=await browser.newContext({viewport:{width,height:900},offline:true,reducedMotion:"reduce"});
      const page=await context.newPage(),errors:string[]=[],network:string[]=[];
      page.on("pageerror",e=>errors.push(e.message));
      page.on("request",r=>{if(/^https?:/i.test(r.url()))network.push(r.url());});
      await page.goto(pathToFileURL(join(output,"vf-simulation-slider-crank.html")).href);
      await expect(page.getByRole("img",{name:"Biella e manovella con cursore"})).toBeVisible();
      const state=()=>page.evaluate(()=>(window as any).__vfSimulation.getState());
      expect((await state()).sliderX).toBe(120);expect((await state()).playing).toBe(false);
      await page.getByRole("button",{name:"Avanza di 90°"}).click();
      await page.getByRole("button",{name:"Avanza di 90°"}).click();
      expect((await state()).sliderX).toBe(80);
      expect((await state()).displacement).toBe(40);
      await expect(page.locator("#readout")).toContainText("40.0 mm");
      await page.getByLabel("Raggio manovella (mm)").selectOption("40");
      await page.getByLabel("Lunghezza biella (mm)").selectOption("140");
      expect((await state()).stroke).toBe(80);
      await page.getByLabel("Quanto misura la corsa del cursore?").selectOption("2r");
      await page.getByRole("button",{name:"Verifica la previsione"}).click();
      await expect(page.locator("#feedback")).toContainText("Previsione corretta. La corsa misura 80 mm");
      await page.getByRole("button",{name:"Avvia"}).click();
      await expect.poll(async()=>(await state()).angle).toBeGreaterThan(0);
      await page.getByRole("button",{name:"Pausa"}).click();
      await page.getByRole("button",{name:"Ripristina"}).click();
      expect((await state()).angle).toBe(0);expect((await state()).radius).toBe(20);expect((await state()).rod).toBe(100);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
      expect(errors).toEqual([]);expect(network).toEqual([]);
      await page.screenshot({path:join(output,"vf-simulation-slider-crank-"+width+".png"),fullPage:true});
      await context.close();
    }
  }finally{await browser.close();}
});
