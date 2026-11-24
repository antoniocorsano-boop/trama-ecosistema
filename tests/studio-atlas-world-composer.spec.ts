import { chromium, expect, test } from "@playwright/test";

const STUDIO = "http://127.0.0.1:3100";
const MUSEO = "pw-strategy-selection-01-museo-zero";
const SCENE = "MZ4_TEST_MAPPING";
const CHOICE = "switch-b";
const VARIATION = "La sala e il nuovo ingresso sono sincronizzati dopo la prova.";

async function openMuseo(page: import("@playwright/test").Page) {
  await page.goto(STUDIO);
  await page.getByRole("button", { name: "Apri MUSEO ZERO" }).click();
  await expect(page).toHaveURL(new RegExp(`/percorso/${MUSEO}$`));
}

async function openSceneComparison(page: import("@playwright/test").Page) {
  await page.getByRole("navigation", { name: "Fasi del Percorso" })
    .getByRole("button", { name: "Scene" }).click();
  await expect(page.getByRole("heading", { name: "Tavola della scena" })).toBeVisible();
  await page.locator(".world-composer-selector select").selectOption(SCENE);
  const panel = page.locator(".world-composer-panel").filter({
    has: page.getByRole("heading", { name: "Tavola della scena" }),
  });
  await panel.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
  await expect(panel.getByRole("heading", { name: "Situazione originale" })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Dopo la scelta" })).toBeVisible();
  return panel;
}

test("AWC S2: visualizza, modifica e riapre la conseguenza senza alterare la scena originale", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openMuseo(page);

  await page.getByRole("navigation", { name: "Fasi del Percorso" })
    .getByRole("button", { name: "Mondo" }).click();
  await expect(page.getByRole("heading", { name: "Il mondo, a partire dalle scene" })).toBeVisible();
  await expect(page.getByText("Cabina regia", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /Ambiente 3-D/ }).click();
  await expect(page.getByText(/la produzione 3-D non è ancora collegata/)).toBeVisible();

  const panel = await openSceneComparison(page);
  await expect(panel.locator(".world-composer-comparison").getByText("Trigger regia")).toBeVisible();

  const before = await page.evaluate(({ projectId, sceneId }) => {
    const all = JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]");
    const project = all.find((p: { projectId: string }) => p.projectId === projectId);
    return {
      revision: project.revision as number,
      original: project.scenes.find((s: { sceneId: string }) => s.sceneId === sceneId).world,
    };
  }, { projectId: MUSEO, sceneId: SCENE });

  await panel.locator(".world-composer-variation-editor textarea").fill(VARIATION);
  await expect(panel.locator(".world-composer-comparison .world-composer-state > p").filter({ hasText: VARIATION })).toBeVisible();
  await panel.getByRole("button", { name: "Scarta la modifica" }).click();
  await expect(panel.locator(".world-composer-variation-editor textarea")).not.toHaveValue(VARIATION);
  await panel.locator(".world-composer-variation-editor textarea").fill(VARIATION);
  await panel.getByRole("button", { name: "Conserva variazione nella scena" }).click();
  await expect(page.getByRole("status", { name: "" }).first()).toContainText("Salvato su questo dispositivo");

  const after = await page.evaluate(({ projectId, sceneId, choiceId }) => {
    const all = JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]");
    const project = all.find((p: { projectId: string }) => p.projectId === projectId);
    const scene = project.scenes.find((s: { sceneId: string }) => s.sceneId === sceneId);
    return {
      revision: project.revision as number,
      original: scene.world,
      variation: scene.choices.find((c: { choiceId: string }) => c.choiceId === choiceId).worldAfter.status,
      review: project.productReview.decision,
      storyboardReady: project.storyboardReady,
    };
  }, { projectId: MUSEO, sceneId: SCENE, choiceId: CHOICE });

  expect(after.revision).toBe(before.revision + 1);
  expect(after.original).toEqual(before.original);
  expect(after.variation).toBe(VARIATION);
  // Studio Atlas invalida il PASS attraverso il proprio stato DRAFT.
  expect(after.review).toBe("DRAFT");
  expect(after.storyboardReady).toBe(false);

  await panel.getByRole("button", { name: "Ripristina la vista originale" }).click();
  await expect(panel.getByRole("heading", { name: "Conseguenza prevista" })).toBeVisible();
  await page.reload();
  const reopened = await openSceneComparison(page);
  await expect(reopened.locator(".world-composer-variation-editor textarea")).toHaveValue(VARIATION);
  expect(errors).toEqual([]);
  await context.close();
});

test("AWC S2: due finestre non possono sovrascriversi con una revisione obsoleta", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const first = await context.newPage();
  await openMuseo(first);
  const second = await context.newPage();
  await second.goto(`${STUDIO}/percorso/${MUSEO}`);
  const panel = await openSceneComparison(first);
  await openSceneComparison(second);

  await panel.locator(".world-composer-variation-editor textarea").fill(VARIATION);
  await panel.getByRole("button", { name: "Conserva variazione nella scena" }).click();
  await expect(first.locator(".save-state")).toContainText("Salvato su questo dispositivo");

  const stale = second.locator(".world-composer-variation-editor textarea");
  await stale.fill("Proposta non più aggiornata");
  await second.getByRole("button", { name: "Conserva variazione nella scena" }).click();
  await expect(second.locator(".save-state")).toContainText("Non salvato");
  await expect(stale).toHaveValue("Proposta non più aggiornata");

  const stored = await second.evaluate(({ projectId, sceneId, choiceId }) => {
    const all = JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]");
    const project = all.find((p: { projectId: string }) => p.projectId === projectId);
    return project.scenes.find((s: { sceneId: string }) => s.sceneId === sceneId)
      .choices.find((c: { choiceId: string }) => c.choiceId === choiceId).worldAfter.status;
  }, { projectId: MUSEO, sceneId: SCENE, choiceId: CHOICE });
  expect(stored).toBe(VARIATION);
  await context.close();
});

for (const width of [320, 390]) {
  test(`AWC S2: tavole Mondo e Scene su schermo ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 790 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await openMuseo(page);
    for (const stage of ["Mondo", "Scene"]) {
      await page.getByRole("navigation", { name: "Fasi del Percorso" })
        .getByRole("button", { name: stage }).click();
      await expect(page.getByRole("heading", {
        name: stage === "Mondo" ? "Il mondo, a partire dalle scene" : "Tavola della scena",
      })).toBeVisible();
      const measures = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(measures.scrollWidth, `overflow in ${stage} at ${width}px`).toBeLessThanOrEqual(measures.viewport + 1);
    }
    await context.close();
  });
}


test("AWC S2: testo ingrandito al 200%, controlli accessibili e nessuno scorrimento orizzontale di pagina", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await openMuseo(page);
  await page.evaluate(() => { document.body.style.fontSize = "200%"; });
  for (const stage of ["Mondo", "Scene"]) {
    await page.getByRole("navigation", { name: "Fasi del Percorso" })
      .getByRole("button", { name: stage }).click();
    const heading = page.getByRole("heading", {
      name: stage === "Mondo" ? "Il mondo, a partire dalle scene" : "Tavola della scena",
    });
    await expect(heading).toBeVisible();
    const measures = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(measures.scrollWidth, `overflow with enlarged text in ${stage}`)
      .toBeLessThanOrEqual(measures.viewport + 1);
  }
  await page.locator(".world-composer-selector select").selectOption(SCENE);
  const choice = page.getByRole("button", { name: "Originale", exact: true });
  await choice.focus();
  await expect(choice).toBeFocused();
  await context.close();
});


test("AWC S3a: archive gate rejects non-qualified files and never changes the learner path", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 790 } });
  const page = await context.newPage();
  await openMuseo(page);
  await openSceneComparison(page);
  const heading = page.getByRole("heading", { name: "Sala Zero · Confronto della prova 3-D" });
  await expect(heading).toBeVisible();
  await expect(page.getByText("Nessun archivio selezionato. La scena narrativa rimane disponibile.")).toBeVisible();
  await page.getByLabel("Archivio tecnico AWC-F Sala Zero").setInputFiles({
    name: "prova-non-autorizzata.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("Archivio non qualificato"),
  });
  await expect(page.locator(".awc-evidence-error")).toContainText("L\u0027archivio non coincide con la prova AWC-F qualificata");
  await expect(page.getByText("Archivio non accettato.")).toBeVisible();
  await expect(page.locator(".awc-evidence-views img")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Vedi come studente" })).toHaveCount(0);

  await page.locator(".world-composer-selector select").selectOption({ index: 0 });
  await expect(heading).toHaveCount(0);
  await context.close();
});


test("AWC S3b: native WebGL touch orbit, exact camera reset and isolated signal change", async () => {
  test.setTimeout(90_000);
  const glBrowser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const context = await glBrowser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await openMuseo(page);
    await openSceneComparison(page);
    await page.getByRole("button", { name: "Apri la Sala Zero navigabile" }).click();
    const canvas = page.locator("canvas.awc-live-canvas");
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const live = page.locator(".awc-live-panel");
    const status = live.getByRole("status");
    await expect(status).toContainText("3-D attivo", { timeout: 30_000 });
    await expect(status).toContainText("rotazione 0.00 radianti");
    const gl = await canvas.evaluate(el => {
      const context = (el as HTMLCanvasElement).getContext("webgl");
      return { available: Boolean(context), error: context?.getError() };
    });
    expect(gl.available).toBe(true);
    expect(gl.error).toBe(0);

    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("Area WebGL non disponibile");
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 30, bounds.y + bounds.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(status).toContainText("rotazione 0.12 radianti");
    await live.getByRole("button", { name: "Simula segnale B" }).click();
    await expect(status).toContainText("segnale B");
    await live.getByRole("button", { name: "Luce originale AWC-F" }).click();
    await expect(status).toContainText("luce originale");

    await live.getByRole("button", { name: "Ripristina inquadratura" }).click();
    await expect(status).toContainText("rotazione 0.00 radianti");
    await expect(status).toContainText("segnale A");
    await live.getByRole("button", { name: "Luce equilibrata · prova" }).click();
    await expect(status).toContainText("luce equilibrata");
    await live.getByRole("button", { name: "Chiudi ambiente 3-D" }).click();
    await expect(canvas).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Vedi come studente" })).toHaveCount(0);
    expect(errors).toEqual([]);
    await context.close();
  } finally { await glBrowser.close(); }
});

test("AWC S3b: gracefully reports WebGL absence without changing student authorization", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 720 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...rest) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return original.call(this, type, ...rest);
    } as typeof original;
  });
  await openMuseo(page);
  await openSceneComparison(page);
  await page.getByRole("button", { name: "Apri la Sala Zero navigabile" }).click();
  await expect(page.locator(".awc-live-panel [role=alert]")).toContainText("WebGL non disponibile");
  await expect(page.locator(".awc-live-panel [role=status]")).toContainText("Prova sospesa");
  await page.getByRole("button", { name: "Chiudi ambiente 3-D" }).click();
  await expect(page.locator("canvas.awc-live-canvas")).toHaveCount(0);
  await context.close();
});


test("UX1: idea, motivated suggestions, free selection and persisted existing project", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(STUDIO + "/nuovo");
  await page.getByRole("textbox", {name:"L’idea",exact:true}).fill("Indagine: indizi e cause di un guasto del sensore");
  await page.getByRole("textbox", {name:/Titolo di lavoro/}).fill("Indagine prova");
  await page.getByRole("button", {name:"Esplora le possibilità"}).click();
  await expect(page.getByRole("heading", {name:"Come vuoi sviluppare l’argomento?"})).toBeVisible();
  await expect(page.getByText(/Suggerita · indizi/)).toBeVisible();
  await expect(page.getByRole("radio", {name:/Deciderò più avanti/})).toBeChecked();
  await page.getByRole("button", {name:"Modifica l’idea"}).click();
  await expect(page.getByRole("textbox", {name:"L’idea",exact:true})).toHaveValue("Indagine: indizi e cause di un guasto del sensore");
  await page.getByRole("button", {name:"Esplora le possibilità"}).click();
  await page.getByRole("radio", {name:/Officina/}).check();
  await page.getByLabel("Complessità del progetto").selectOption("ESSENTIAL");
  await expect(page.getByTestId("authoring-focus-stages")).not.toContainText("Produzione");
  await page.getByRole("button", {name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  const projectUrl = page.url();
  await page.reload();
  await expect(page.getByRole("textbox", {name:"Titolo del Percorso"})).toHaveValue("Indagine prova");
  await expect(page.getByLabel("Complessità del progetto")).toHaveValue("ESSENTIAL");
  await page.getByRole("navigation", {name:"Fasi del Percorso"}).getByRole("button",{name:"Esperienza"}).click();
  await expect(page.getByRole("button",{name:/Officina/})).toHaveClass(/active/);
  await expect.poll(() => page.evaluate(() => {
    const project = JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]")
      .find((item: {title:string}) => item.title === "Indagine prova");
    return {grammar:project.experience.grammar, state:project.humanState, story:project.storyReview.decision, scenes:project.scenes.length};
  })).toEqual({grammar:"WORKSHOP_CONSTRUCTION",state:"IDEA",story:"DRAFT",scenes:0});
  expect(page.url()).toBe(projectUrl);
});

test("UX1: non-narrative topic, no forced choice, readable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto(STUDIO + "/nuovo");
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Simulazione dell’energia con variabili e parametri");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await expect(page.getByRole("radio",{name:/Laboratorio e simulazione/})).toBeVisible();
  await expect(page.getByText(/Suggerita · .*variabili/)).toBeVisible();
  await expect(page.getByRole("radio",{name:/Deciderò più avanti/})).toBeChecked();
  async function assertReflow() {
    const geometry = await page.evaluate(() => ({
      viewport: window.innerWidth,
      width: document.documentElement.scrollWidth,
      overflowing: Array.from(document.querySelectorAll(".studio-intent, .studio-intent *"))
        .map(element => ({ element: element.tagName, className: element.getAttribute("class"), right: Math.round(element.getBoundingClientRect().right) }))
        .filter(item => item.right > window.innerWidth + 1).slice(0, 15),
    }));
    expect(geometry.width, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.overflowing, JSON.stringify(geometry)).toEqual([]);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await assertReflow();
  await page.getByRole("button",{name:"Modifica l’idea"}).click();
  await expect(page.getByRole("heading",{name:"Che cosa vuoi far scoprire?"})).toBeVisible();
  await assertReflow();
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await expect(page.getByRole("radio",{name:/Deciderò più avanti/})).toBeChecked();
  await assertReflow();
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]")[0].experience.grammar)).toBe("");
});

test("UX1b: profile is reversible on an existing project without changing its content or approvals", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await openMuseo(page);
  const snapshot = () => page.evaluate(projectId => {
    const p = JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1") ?? "[]")
      .find((item:{projectId:string}) => item.projectId === projectId);
    const {authoringComplexity, revision, updatedAt, ...content} = p;
    return {authoringComplexity, content};
  }, MUSEO);
  const before = await snapshot();
  await page.getByLabel("Complessità del progetto").selectOption("ADVANCED");
  await expect(page.getByTestId("authoring-focus-stages")).toContainText("Produzione");
  await page.reload();
  await expect(page.getByLabel("Complessità del progetto")).toHaveValue("ADVANCED");
  expect((await snapshot()).content).toEqual(before.content);
  await page.getByLabel("Complessità del progetto").selectOption("ESSENTIAL");
  await page.getByText("Controlli da prevedere", {exact:true}).click();
  await expect(page.getByText("Scelte: destinazioni, conseguenze e chiusure", {exact:true})).toBeVisible();
  await expect(page.getByText("Sistema: condizioni iniziali, segnali ed effetti osservabili", {exact:true})).toBeVisible();
  await expect(page.getByRole("navigation", {name:"Fasi del Percorso"}).getByRole("button",{name:"Revisione"})).toBeEnabled();
  await expect(page.getByRole("navigation", {name:"Fasi del Percorso"}).getByRole("button",{name:"Produzione"})).toBeEnabled();
  await page.reload();
  await expect(page.getByLabel("Complessità del progetto")).toHaveValue("ESSENTIAL");
  expect((await snapshot()).content).toEqual(before.content);
  await page.getByLabel("Complessità del progetto").selectOption("");
  await expect.poll(async () => (await snapshot()).authoringComplexity).toBeUndefined();
  expect((await snapshot()).content).toEqual(before.content);
});


test("UX-DESIGN: two themes, persistence and the same project data", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await openMuseo(page);
  const selector=page.getByLabel("Stile dello Studio");
  const before=await page.evaluate(()=>localStorage.getItem("studio-atlas.projects.v0.1"));
  await expect(selector).toHaveValue("contemporary");
  await selector.selectOption("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  await expect(page.getByRole("textbox",{name:"Titolo del Percorso"})).toBeVisible();
  const ink=await page.locator("html").evaluate(el=>getComputedStyle(el).getPropertyValue("--paper").trim());
  await page.reload();
  await expect(selector).toHaveValue("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  expect(await page.evaluate(()=>localStorage.getItem("studio-atlas.projects.v0.1"))).toBe(before);
  await selector.selectOption("contemporary");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","contemporary");
  expect(await page.locator("html").evaluate(el=>getComputedStyle(el).getPropertyValue("--paper").trim())).not.toBe(ink);
  expect(await page.evaluate(()=>localStorage.getItem("studio-atlas.projects.v0.1"))).toBe(before);
  await page.reload();
  await expect(selector).toHaveValue("contemporary");
});

test("UX-DESIGN: Atelier assets decode locally, accessible choices and 320px reflow", async ({page}) => {
  await page.setViewportSize({width:320,height:780});
  await page.goto(STUDIO+"/nuovo");
  await page.getByLabel("Stile dello Studio").selectOption("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  const assets=await page.evaluate(async ()=>{
    return Promise.all(["compass","idea"].map(async name=>{
      const img=new Image(); img.src="/design/atelier/"+name+".webp"; await img.decode();
      return [img.naturalWidth,img.naturalHeight];
    }));
  });
  expect(assets).toEqual([[200,116],[120,104]]);
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Indagine sui sensori");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await expect(page.getByRole("radio",{name:/Indagine/})).toBeVisible();
  await page.getByRole("radio",{name:/Indagine/}).check();
  await page.getByLabel("Complessità del progetto").selectOption("ARTICULATED");
  await page.evaluate(()=>{document.documentElement.style.fontSize="200%";});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  await expect(page.getByLabel("Stile dello Studio")).toHaveValue("atelier");
  await expect(page.getByLabel("Complessità del progetto")).toHaveValue("ARTICULATED");
});

test("UX2a: suggested environment, reversible toolbox and actual editor access",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(STUDIO+"/nuovo");
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Agricoltura, colture e paesaggio");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await page.getByRole("button",{name:"Ambiente naturale e rurale",exact:true}).click();
  await expect(page.getByLabel("Ambientazione di progetto")).toHaveValue("NATURE");
  await page.getByLabel("Complessità del progetto").selectOption("ESSENTIAL");
  await page.getByRole("checkbox",{name:/Scelte e conseguenze/}).check();
  await page.getByRole("checkbox",{name:/Simulazione e stati/}).check();
  await expect(page.getByTestId("authoring-focus-stages")).toContainText("Mondo");
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  await page.reload();
  await expect(page.getByLabel("Ambientazione di progetto")).toHaveValue("NATURE");
  await expect(page.getByRole("checkbox",{name:/Scelte e conseguenze/})).toBeChecked();
  await page.getByRole("button",{name:"Apri scelte e conseguenze",exact:true}).click();
  await expect(page.getByRole("button",{name:"Aggiungi scena"})).toBeVisible();
  await page.getByRole("button",{name:"Aggiungi scena"}).click();
  await page.getByRole("textbox",{name:"Titolo scena 1"}).fill("Il campo");
  await page.getByRole("navigation",{name:"Fasi del Percorso"}).getByRole("button",{name:"Idea"}).click();
  await page.getByRole("checkbox",{name:/Scelte e conseguenze/}).uncheck();
  await page.getByLabel("Ambientazione di progetto").selectOption("LAB");
  await page.reload();
  await expect(page.getByLabel("Ambientazione di progetto")).toHaveValue("LAB");
  await expect(page.getByRole("checkbox",{name:/Scelte e conseguenze/})).not.toBeChecked();
  await page.getByRole("navigation",{name:"Fasi del Percorso"}).getByRole("button",{name:"Scene"}).click();
  await expect(page.getByRole("textbox",{name:"Titolo scena 1"})).toHaveValue("Il campo");
  await expect(page.getByRole("button",{name:"Anteprima di revisione"})).toBeDisabled();
});

test("UX2b: composizione visuale reale nei due temi, senza luoghi inventati", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await openMuseo(page);
  await page.getByRole("navigation",{name:"Fasi del Percorso"}).getByRole("button",{name:"Scene"}).click();
  const board=page.getByRole("region",{name:"Composizione visuale"});
  await expect(board).toBeVisible();
  await expect(board.getByRole("complementary",{name:"Sequenza educativa"})).toBeVisible();
  const map=board.getByRole("group",{name:"Mappa schematica dei luoghi"});
  await expect(map).toBeVisible();
  const choices=map.getByRole("button");
  expect(await choices.count()).toBeGreaterThan(0);
  await choices.first().click();
  await expect(choices.first()).toHaveAttribute("aria-pressed","true");
  await page.getByLabel("Stile dello Studio").selectOption("atelier");
  await expect(board).toBeVisible();
  await expect(choices.first()).toHaveAttribute("aria-pressed","true");
  await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});


test("UX-DESIGN-02: illustrated teacher workflow opens real editors, same assets in both themes", async ({page},testInfo)=>{
  await page.setViewportSize({width:1366,height:1000});
  await page.goto(STUDIO);
  const home=page.getByRole("region",{name:"Atelier digitale del docente"});
  await expect(home.getByText("Lato docente",{exact:true})).toBeVisible();
  await expect(home.getByText("Lato studente",{exact:true})).toBeVisible();
  await expect(home.locator("img")).toHaveCount(4);
  for(const img of await home.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  }
  await home.scrollIntoViewIfNeeded();
  await home.screenshot({path:testInfo.outputPath("studio-atelier-contemporary-desktop.png")});
  await page.getByLabel("Stile dello Studio").selectOption("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  await home.screenshot({path:testInfo.outputPath("studio-atelier-artistic-desktop.png")});
  await page.getByRole("button",{name:"Apri MUSEO ZERO"}).click();
  await expect(page).toHaveURL(new RegExp("/percorso/"+MUSEO+"$"));
  const board=page.getByRole("region",{name:"Atelier digitale del docente"});
  const nav=page.getByRole("navigation",{name:"Fasi del Percorso"});
  const routes=[
    ["Progetta gli ambienti","Fai esistere il mondo."],
    ["Progetta i personaggi","Costruisci la storia."],
    ["Progetta le interazioni","Che cosa farà davvero lo studente?"],
    ["Componi le scene","Metti in sequenza ciò che accade."],
  ];
  for(const [action,heading] of routes){
    await board.getByRole("button",{name:action,exact:true}).click();
    await expect(page.getByRole("heading",{name:heading,exact:true})).toBeVisible();
    await nav.getByRole("button",{name:"Idea"}).click();
  }
  const before=await page.evaluate(()=>localStorage.getItem("studio-atlas.projects.v0.1"));
  await page.setViewportSize({width:320,height:800});
  await expect(board).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await board.screenshot({path:testInfo.outputPath("studio-atelier-artistic-mobile.png")});
  await board.getByRole("button",{name:"Vai alla prova dell’esperienza",exact:true}).click();
  await expect(nav.getByRole("button",{name:"Prova"})).toHaveClass(/active/);
  expect(await page.evaluate(()=>localStorage.getItem("studio-atlas.projects.v0.1"))).toBe(before);
});


test("DESIGN-03: six illustrated experience cards, same choice persisted and editable",async({page},testInfo)=>{
  await page.setViewportSize({width:1366,height:1000});
  await page.goto(STUDIO+"/nuovo");
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Indagine sui sensori, variabili e automazione");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  const gallery=page.locator(".experience-gallery");
  await expect(gallery.locator(".experience-card")).toHaveCount(6);
  await expect(gallery.locator("img")).toHaveCount(6);
  for(const img of await gallery.locator("img").all()){
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  }
  await gallery.getByRole("radio",{name:/Laboratorio e simulazione/}).check();
  await expect(gallery.getByRole("radio",{name:/Laboratorio e simulazione/})).toBeChecked();
  await gallery.screenshot({path:testInfo.outputPath("studio-atelier-experience-contemporary.png")});
  await page.getByLabel("Stile dello Studio").selectOption("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  await gallery.screenshot({path:testInfo.outputPath("studio-atelier-experience-artistic.png")});
  await page.getByRole("button",{name:"Modifica l’idea"}).click();
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await expect(gallery.getByRole("radio",{name:/Laboratorio e simulazione/})).toBeChecked();
  await page.setViewportSize({width:320,height:800});
  await page.evaluate(()=>{document.documentElement.style.fontSize="200%"});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.evaluate(()=>{document.documentElement.style.fontSize=""});
  await gallery.screenshot({path:testInfo.outputPath("studio-atelier-experience-mobile.png")});
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  await page.reload();
  const board=page.getByRole("region",{name:"Atelier digitale del docente"});
  await expect(board.locator(".atelier-chosen-type")).toContainText("Laboratorio e simulazione");
  await board.getByRole("button",{name:"Modifica il tipo di esperienza"}).click();
  await expect(gallery.getByRole("button",{name:/Laboratorio e simulazione/})).toHaveAttribute("aria-pressed","true");
  await gallery.getByRole("button",{name:/Narrazione visuale/}).click();
  await page.getByRole("navigation",{name:"Fasi del Percorso"}).getByRole("button",{name:"Idea"}).click();
  await expect(board.locator(".atelier-chosen-type")).toContainText("Narrazione visuale");
  await page.reload();
  await expect(board.locator(".atelier-chosen-type")).toContainText("Narrazione visuale");
  await expect(page.getByRole("button",{name:"Anteprima di revisione"})).toBeDisabled();
});

test("DESIGN-04: illustrated environments, tools and profiles share real saved choices", async ({page},testInfo)=>{
  await page.setViewportSize({width:1366,height:1000});
  await page.goto(STUDIO+"/nuovo");
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Agricoltura, colture e paesaggio");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  const profiles=page.getByRole("group",{name:"Profili illustrati"});
  const environments=page.locator(".catalog-gallery");
  const toolsPanel=page.locator(".catalog-tools");
  await expect(profiles.locator("img")).toHaveCount(3);
  await expect(environments.locator("img")).toHaveCount(7);
  await expect(toolsPanel.locator("img")).toHaveCount(9);
  for(const img of await page.locator(".catalog-artwork").all()){
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  }
  await profiles.getByRole("button",{name:"Profilo Essenziale",exact:true}).click();
  await expect(page.getByLabel("Complessità del progetto")).toHaveValue("ESSENTIAL");
  await environments.getByRole("button",{name:"Ambiente naturale e rurale",exact:true}).click();
  await expect(page.getByLabel("Ambientazione di progetto")).toHaveValue("NATURE");
  await expect(environments.getByRole("button",{name:"Ambiente naturale e rurale",exact:true})).toHaveAttribute("aria-pressed","true");
  await toolsPanel.getByRole("checkbox",{name:/Simulazione e stati/}).check();
  await expect(toolsPanel.getByText(/^Solo progettazione/).first()).toBeVisible();
  await profiles.screenshot({path:testInfo.outputPath("studio-atelier-profiles-desktop.png")});
  await environments.screenshot({path:testInfo.outputPath("studio-atelier-environments-desktop.png")});
  await page.getByLabel("Stile dello Studio").selectOption("atelier");
  await expect(page.locator("html")).toHaveAttribute("data-studio-theme","atelier");
  await environments.screenshot({path:testInfo.outputPath("studio-atelier-environments-artistic.png")});
  await toolsPanel.screenshot({path:testInfo.outputPath("studio-atelier-tools-artistic.png")});
  await page.setViewportSize({width:320,height:800});
  await page.evaluate(()=>{document.documentElement.style.fontSize="200%"});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.evaluate(()=>{document.documentElement.style.fontSize=""});
  await environments.screenshot({path:testInfo.outputPath("studio-atelier-environments-mobile.png")});
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  await page.reload();
  await expect(profiles.getByRole("button",{name:"Profilo Essenziale",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(environments.getByRole("button",{name:"Ambiente naturale e rurale",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(toolsPanel.getByRole("checkbox",{name:/Simulazione e stati/})).toBeChecked();
  await expect(page.getByRole("button",{name:"Anteprima di revisione"})).toBeDisabled();
});
