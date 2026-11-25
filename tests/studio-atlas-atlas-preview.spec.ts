import { expect, test } from "@playwright/test";

const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";
const STUDIO = "http://127.0.0.1:3100";
const ATLAS = "http://127.0.0.1:3200";

const approvedProject = {
  projectId: "e2e-studio-atlas-preview",
  title: "E2E Percorso Studio Atlas",
  idea: "Capire una relazione osservando che cosa cambia quando si interviene.",
  ageBand: "lower-secondary",
  humanState: "SCENES",
  productionState: "NOT_REQUESTED",
  story: {
    hook: "Qualcosa reagisce nel momento sbagliato.",
    setting: "Uno spazio tecnico dopo la chiusura.",
    characters: "Una piccola squadra deve capire cosa non torna.",
    characterGoal: "Far funzionare il sistema nel momento corretto.",
    disruption: "Il comportamento osservato non coincide con la situazione reale.",
    unknown: "Quale relazione è rimasta collegata al segnale sbagliato?",
    learnerRole: "Osservare, intervenire e verificare.",
    turningPoint: "Una modifica produce finalmente la conseguenza attesa.",
    ending: "La strategia viene provata in un sistema diverso.",
  },
  storyReview: { decision: "PASS", reviewedAt: "2026-10-04T15:00:00Z" },
  world: {
    learnerRole: "Tecnico che verifica una relazione causale.",
    canObserve: "Segnali e reazioni del sistema.",
    canChange: "Una relazione alla volta.",
    unknown: "Quale relazione produce il ritardo.",
    consequence: "Il comportamento cambia immediatamente o resta incoerente.",
    motivation: "Rendere il sistema coerente prima della prova finale.",
  },
  worldReview: { decision: "PASS", reviewedAt: "2026-10-04T15:02:00Z" },
  productReview: {
    decision: "PASS",
    reviewedAt: "2026-10-04T15:02:30Z",
    evidenceRef: "e2e://human-product-review-pass",
  },
  experience: {
    grammar: "SIMULATION_MICROWORLD",
    rationale: "La comprensione nasce dal confronto fra intervento e conseguenza.",
  },
  scenes: [
    {
      sceneId: "S1",
      kind: "SCENE",
      interaction: "SUMMARY",
      title: "Qualcosa non torna",
      visibleSituation: "Il sistema reagisce in ritardo rispetto a ciò che osservi.",
      learnerAction: "Individua quale relazione potrebbe essere fuori posto.",
      consequence: "Hai isolato il punto da verificare.",
      reveal: "Una relazione può restare valida tecnicamente ma non più nel contesto.",
      choices: [],
    },
    {
      sceneId: "S2",
      kind: "SCENE",
      interaction: "CHOICE",
      title: "Prova una modifica",
      visibleSituation: "Puoi cambiare una sola relazione e ripetere la stessa prova.",
      learnerAction: "Quale modifica vuoi provare?",
      consequence: "La nuova prova rende visibile se la relazione scelta era davvero rilevante.",
      reveal: "La conseguenza rende visibile la relazione causale.",
      choices: [
        {
          choiceId: "keep-old",
          targetSceneId: "S2",
          label: "Mantengo il collegamento al vecchio segnale",
          feedback: "Il ritardo si ripete: il sistema continua ad ascoltare il punto sbagliato.",
        },
        {
          choiceId: "use-new",
          targetSceneId: "S3_TRANSFER",
          label: "Collego il sistema al segnale del nuovo ingresso",
          feedback: "La risposta parte nel momento atteso: questa modifica spiega il ritardo.",
        },
        {
          choiceId: "manual",
          targetSceneId: "S2",
          label: "Uso un comando manuale",
          feedback: "Può funzionare una volta, ma il risultato dipende dal tempismo dell’operatore.",
        },
      ],
    },
    {
      sceneId: "S3_TRANSFER",
      kind: "TRANSFER",
      interaction: "SUMMARY",
      title: "Un sistema diverso",
      visibleSituation: "Un altro dispositivo reagisce ancora a un’informazione non aggiornata.",
      learnerAction: "Riusa la strategia: osserva, individua la relazione e verifica la conseguenza.",
      consequence: "La strategia funziona anche quando cambia il contesto.",
      reveal: "Il metodo è trasferibile, non dipende dal primo sistema.",
      choices: [],
    },
    {
      sceneId: "S4_CLOSE",
      kind: "SCENE",
      interaction: "SUMMARY",
      title: "La strategia resta tua",
      visibleSituation: "Il secondo sistema ora risponde in modo coerente.",
      learnerAction: "Chiudi la prova quando hai riconosciuto che cosa hai riutilizzato.",
      consequence: "Il percorso si chiude senza trasformare la prova in un punteggio.",
      reveal: "Hai trasferito un modo di ragionare, non una risposta da ricordare.",
      choices: [],
    },
  ],
  storyboardReady: true,
  archived: false,
  createdAt: "2026-10-04T14:00:00Z",
  updatedAt: "2026-10-04T15:03:00Z",
  revision: 9,
};

test("Studio Atlas opens an exact learner preview only after explicit Product Review PASS", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript((seed) => {
    localStorage.setItem("studio-atlas.projects.v0.1", JSON.stringify([seed]));
  }, approvedProject);

  await page.goto(`${STUDIO}/percorso/${approvedProject.projectId}`);

  const previewButton = page.getByRole("button", { name: "Vedi come studente" });
  await expect(previewButton).toBeEnabled();

  const popupPromise = context.waitForEvent("page");
  await previewButton.click();
  const popup = await popupPromise;

  await popup.waitForURL(
    new RegExp("^http://127\\.0\\.0\\.1:3200/percorsi/lab/studio-atlas-preview/\\?channel=[0-9a-f]{48}$"),
    { timeout: 15_000 },
  );

  const url = new URL(popup.url());
  expect([...url.searchParams.keys()]).toEqual(["channel"]);
  expect(url.searchParams.get("channel")).toMatch(/^[0-9a-f]{48}$/);
  expect(popup.url()).not.toContain("snapshot");
  expect(popup.url()).not.toContain("E2E%20Percorso");

  await expect(
    popup.getByText("ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(popup.getByRole("heading", { name: approvedProject.title })).toBeVisible();
  await expect(popup.getByRole("heading", { name: "Qualcosa non torna" })).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(popup.getByRole("heading", { name: "Prova una modifica" })).toBeVisible();

  const supportedChoice = popup.getByRole("radio", {
    name: "Collego il sistema al segnale del nuovo ingresso",
  });
  await supportedChoice.check();
  await expect(
    popup.getByText("La risposta parte nel momento atteso: questa modifica spiega il ritardo."),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(popup.getByRole("heading", { name: "Un sistema diverso" })).toBeVisible();

  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem("studio-atlas.projects.v0.1");
    const items = raw ? JSON.parse(raw) : [];
    return items[0]?.lastPreviewSnapshot;
  });

  expect(stored.studentAuthorized).toBe(false);
  expect(stored.runtimeAuthorized).toBe(false);
  expect(stored.scenes.some((scene: { kind?: string }) => scene.kind === "TRANSFER")).toBe(true);

  await context.close();
});

test("MUSEO ZERO stays REVISE while review preview exercises investigation, representations and world consequence", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(STUDIO);
  await page.getByRole("button", { name: "Apri MUSEO ZERO" }).click();
  await expect(page).toHaveURL(new RegExp(`/percorso/${MUSEO_ZERO_PROJECT_ID}$`));

  const reviewPreviewButton = page.getByRole("button", { name: "Anteprima di revisione" });
  await expect(reviewPreviewButton).toBeEnabled();
  await expect(page.getByRole("button", { name: "Vedi come studente" })).toHaveCount(0);

  await page.getByRole("button", { name: "Mondo" }).click();
  await expect(page.getByRole("heading", { name: "Fai esistere il mondo." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approva mondo" })).toHaveCount(0);

  await page.getByRole("button", { name: "Scene" }).click();
  await expect(page.getByRole("heading", { name: "Metti in sequenza ciò che accade." })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Titolo scena 5" })).toHaveValue(
    "Quale soluzione regge davvero?",
  );
  await expect(page.getByRole("button", { name: "Storyboard pronto" })).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Fasi del Percorso" })
    .getByRole("button", { name: "Revisione" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Il pacchetto richiede una nuova revisione." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Approva pacchetto" })).toHaveCount(0);

  const popupPromise = context.waitForEvent("page");
  await reviewPreviewButton.click();
  const popup = await popupPromise;

  await popup.waitForURL(
    new RegExp("^http://127\\.0\\.0\\.1:3200/percorsi/lab/studio-atlas-preview/\\?channel=[0-9a-f]{48}$"),
    { timeout: 15_000 },
  );

  await expect(
    popup.getByText("ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    popup.getByRole("heading", { name: "MUSEO ZERO · La sala che non torna" }),
  ).toBeVisible();
  await expect(popup.getByRole("heading", { name: "Qualcosa non torna" })).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(
    popup.getByRole("heading", { name: "Tutti hanno cambiato qualcosa" }),
  ).toBeVisible();

  async function pinEvidence(label: string) {
    const card = popup.locator("article.experience-evidence").filter({ hasText: label });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Porta sul banco" }).click();
  }

  await pinEvidence("Percorso invertito");
  await pinEvidence("Perché il percorso è cambiato");

  const locations = popup.getByRole("navigation", { name: "Luoghi del percorso" });
  await locations.getByRole("button", { name: "Sala Zero" }).click();
  await pinEvidence("Sensor B spostato");

  const representation = popup.getByRole("group", { name: "Rappresentazione" });
  const connectMode = representation.getByRole("button", { name: "Collega", exact: true });
  await expect(connectMode).toBeEnabled();
  await connectMode.click();
  await expect(
    popup.getByText(
      "Le relazioni sono promettenti, ma senza ordinare alcune modifiche rischi di attribuire importanza a coincidenze.",
    ),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(popup.getByRole("heading", { name: "Prova il collegamento" })).toBeVisible();
  await expect(popup.getByText("Trigger regia", { exact: true })).toBeVisible();
  await expect(popup.getByText("È ancora associato a Sensor A.", { exact: true })).toBeVisible();

  const switchSensorChoice = popup.getByRole("button", {
    name: "Provo il trigger su Sensor B",
    exact: true,
  });
  await switchSensorChoice.click();

  await expect(popup.getByText("Trigger su Sensor B", { exact: true })).toBeVisible();
  await expect(popup.getByText("Suono e luce", { exact: true })).toBeVisible();
  await expect(popup.getByRole("button", { name: "Continua dalla conseguenza" })).toBeEnabled();

  await expect.poll(async () => {
    return await page.evaluate((projectId) => {
      const raw = localStorage.getItem("studio-atlas.projects.v0.1");
      const items = raw ? JSON.parse(raw) : [];
      return items.find((item: { projectId?: string }) => item.projectId === projectId)
        ?.lastPreviewSnapshot?.studentAuthorized;
    }, MUSEO_ZERO_PROJECT_ID);
  }).toBe(false);

  const stored = await page.evaluate((projectId) => {
    const raw = localStorage.getItem("studio-atlas.projects.v0.1");
    const items = raw ? JSON.parse(raw) : [];
    return items.find((item: { projectId?: string }) => item.projectId === projectId);
  }, MUSEO_ZERO_PROJECT_ID);

  expect(stored.productReview.decision).toBe("REVISE");
  expect(stored.productReview.evidenceRef).toContain("HUMAN-PRODUCT-REVIEW-v0.1.md");
  expect(stored.worldReview.decision).toBe("REVISE");
  expect(stored.worldReview.evidenceRef).toContain("HUMAN-PRODUCT-REVIEW-v0.1.md");
  expect(stored.storyboardReady).toBe(false);
  expect(stored.lastPreviewSnapshot.runtimeAuthorized).toBe(false);
  expect(stored.lastPreviewSnapshot.studentAuthorized).toBe(false);
  expect(
    stored.lastPreviewSnapshot.scenes.some(
      (scene: { sceneId?: string; kind?: string }) =>
        scene.sceneId === "MZ5_COMPARE_RECOVERY" && scene.kind === "TRANSFER",
    ),
  ).toBe(true);
  expect(
    stored.lastPreviewSnapshot.scenes.some(
      (scene: { sceneId?: string }) => scene.sceneId === "MZ7_TRANSFER_CANDIDATE",
    ),
  ).toBe(false);

  await context.close();
});


for(const illustrated of [false,true]) test(illustrated?"ESS-01B agriculture: import original image, position points, explore in Atlas":"ESS-01A agriculture: empty project to interactive places in real Atlas without imported approvals",async({page,context},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(STUDIO+"/nuovo");
  await page.getByRole("textbox",{name:"L’idea",exact:true}).fill("Esplorare l’agricoltura come sistema di suolo, acqua e lavoro umano.");
  await page.getByRole("textbox",{name:/Titolo di lavoro/}).fill("Dal campo al raccolto");
  await page.getByRole("button",{name:"Esplora le possibilità"}).click();
  await page.getByRole("radio",{name:/^Esplorazione/}).check();
  await page.getByLabel("Complessità del progetto").selectOption("ESSENTIAL");
  await page.getByRole("button",{name:"Ambiente naturale e rurale",exact:true}).click();
  await page.getByRole("checkbox",{name:/Punti interattivi/}).check();
  await page.getByRole("button",{name:"Crea il Percorso"}).click();
  await expect(page).toHaveURL(/\/percorso\/[^/]+$/);
  const nav=page.getByRole("navigation",{name:"Fasi del Percorso"});
  await expect(page.getByRole("button",{name:"Anteprima di revisione",exact:true})).toBeDisabled();
  await nav.getByRole("button",{name:"Storia"}).click();
  const story=["Il terreno non riceve acqua allo stesso modo.","Un orto scolastico.","Una coltivatrice e un osservatore.","Far crescere le piante senza sprechi.","Una parte del terreno resta asciutta.","Quali risorse e operazioni sono collegate?","Osservare le parti del sistema.","Confrontare suolo e irrigazione.","Riutilizzare la strategia in un frutteto."];
  const storyFields=page.locator(".story-sequence textarea");
  await expect(storyFields).toHaveCount(story.length);
  for(let i=0;i<story.length;i++)await storyFields.nth(i).fill(story[i]);
  await page.getByRole("button",{name:"Pronta per revisione"}).click();
  await page.getByRole("button",{name:"Approva storia"}).click();
  await nav.getByRole("button",{name:"Mondo"}).click();
  const world=["Osservatore dell’orto.","Suolo, acqua e attività umane.","Confronta gli indizi e decide un intervento.","Come le parti dipendono tra loro.","L’acqua arriva dove serve.","Capire come ridurre gli sprechi."];
  const worldFields=page.locator(".world-grid textarea");
  await expect(worldFields).toHaveCount(world.length);
  for(let i=0;i<world.length;i++)await worldFields.nth(i).fill(world[i]);
  await page.getByRole("button",{name:"Approva mondo"}).click();
  await nav.getByRole("button",{name:"Scene"}).click();
  await page.getByRole("button",{name:"Aggiungi scena"}).click();
  await page.getByRole("button",{name:"Aggiungi scena"}).click();
  const rows=page.locator(".scene-timeline .scene-row");
  await expect(rows).toHaveCount(2);
  const contents=[["L’orto come sistema","Alcune piante sono asciutte, altre ben irrigate.","Esplora il suolo e la distribuzione dell’acqua.","Collega le risorse alle attività umane."],["Un frutteto diverso","Un frutteto riceve acqua in modo irregolare.","Indica quali parti del sistema osserveresti.","Applica lo stesso metodo in un altro contesto."]];
  for(let i=0;i<contents.length;i++){
    const row=rows.nth(i);
    await row.getByRole("textbox",{name:"Titolo scena "+(i+1)}).fill(contents[i][0]);
    await row.getByLabel("Cosa vede",{exact:true}).fill(contents[i][1]);
    await row.getByLabel("Cosa può fare",{exact:true}).fill(contents[i][2]);
    await row.getByLabel("Cosa cambia",{exact:true}).fill(contents[i][3]);
  }
  await page.getByLabel("Tipo scena 2").selectOption("TRANSFER");
  const first=rows.first();
  await first.locator("summary").filter({hasText:"Luoghi e indizi"}).click();
  await first.getByRole("button",{name:"Aggiungi luogo"}).click();
  await expect(page.getByRole("button",{name:"Anteprima di revisione",exact:true})).toBeDisabled();
  const field=first.getByRole("region",{name:"Luogo 1",exact:true});
  await field.getByLabel("Nome del luogo").fill("Campo coltivato");
  await field.getByLabel("Descrizione del luogo").fill("Il terreno è più umido vicino alla fonte d’acqua.");
  await field.getByRole("button",{name:"Aggiungi indizio"}).click();
  await field.getByLabel("Nome dell’indizio").fill("Umidità del suolo");
  await field.getByLabel("Che cosa rivela").fill("Il terreno trattiene parte dell’acqua disponibile alle radici.");
  await expect(field.getByRole("button",{name:"Rimuovi luogo"})).toBeDisabled();
  await first.getByRole("button",{name:"Aggiungi luogo"}).click();
  const water=first.getByRole("region",{name:"Luogo 2",exact:true});
  await water.getByLabel("Nome del luogo").fill("Irrigazione");
  await water.getByLabel("Descrizione del luogo").fill("L’acqua viene distribuita lungo i filari.");
  await water.getByRole("button",{name:"Aggiungi indizio"}).click();
  await water.getByLabel("Nome dell’indizio").fill("Distribuzione dell’acqua");
  await water.getByLabel("Che cosa rivela").fill("La distribuzione dipende dalla posizione dei tubi e dalle operazioni di irrigazione.");
  if(illustrated){
    const imageEditor=first.getByRole("region",{name:"Immagine interattiva"});
    // Render a repository-owned rural illustration into a local WebP test file.
    const base64=await page.evaluate(async()=>{
      const image=new Image();image.src="/design/atelier/catalog/nature.svg";await image.decode();
      const canvas=document.createElement("canvas");canvas.width=640;canvas.height=360;
      canvas.getContext("2d")!.drawImage(image,0,0,640,360);
      return canvas.toDataURL("image/webp",0.9).split(",")[1];
    });
    await imageEditor.getByLabel("Carica immagine WebP").setInputFiles({name:"orto.webp",mimeType:"image/webp",buffer:Buffer.from(base64,"base64")});
    await expect(imageEditor.getByRole("img")).toBeVisible();
    await expect(page.getByRole("button",{name:"Anteprima di revisione",exact:true})).toBeDisabled();
    await imageEditor.getByLabel("Descrizione alternativa dell’immagine").fill("Orto illustrato con campi e filari");
    await imageEditor.getByLabel("Indizio da posizionare").selectOption({label:"1. Umidità del suolo"});
    await imageEditor.getByRole("button",{name:"Posiziona sull’immagine"}).click({position:{x:35,y:35}});
    await imageEditor.getByLabel("Indizio da posizionare").selectOption({label:"2. Distribuzione dell’acqua"});
    await imageEditor.getByLabel("Posizione orizzontale (%)").fill("75");
    await imageEditor.getByLabel("Posizione verticale (%)").fill("60");
    await imageEditor.getByRole("button",{name:"Conferma posizione"}).click();
    await expect(imageEditor.locator(".scene-image-marker")).toHaveCount(2);
    await imageEditor.screenshot({path:testInfo.outputPath("ess-01b-teacher-image.png")});
    await page.reload();
    await nav.getByRole("button",{name:"Scene"}).click();
    await expect(first.getByRole("region",{name:"Immagine interattiva"}).locator(".scene-image-marker")).toHaveCount(2);
  }
  await page.getByRole("button",{name:"Storyboard pronto",exact:true}).click();
  await page.reload();
  await expect(page.getByRole("button",{name:"Anteprima di revisione",exact:true})).toBeEnabled();
  const popupPromise=context.waitForEvent("page");
  await page.getByRole("button",{name:"Anteprima di revisione",exact:true}).click();
  const popup=await popupPromise;
  await expect(popup.getByText("ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI")).toBeVisible({timeout:15000});
  const locations=popup.getByRole("navigation",{name:"Luoghi del percorso"});
  await expect(locations.getByRole("button",{name:/Campo coltivato/})).toBeVisible();
  if(illustrated){
    const figure=popup.locator(".experience-hotspot-figure");
    await expect(figure.getByRole("img",{name:"Orto illustrato con campi e filari"})).toBeVisible();
    await figure.getByRole("button",{name:"Esplora Distribuzione dell’acqua",exact:true}).click();
    await expect(figure).toContainText("La distribuzione dipende dalla posizione dei tubi");
    await figure.getByRole("button",{name:"Esplora Umidità del suolo",exact:true}).click();
    await expect(figure).toContainText("Il terreno trattiene parte dell’acqua");
    await figure.screenshot({path:testInfo.outputPath("ess-01b-learner-image.png")});
  }
  await popup.locator(".experience-evidence-grid").getByRole("button",{name:/Umidità del suolo/}).click();
  await expect(popup.locator(".experience-evidence-detail").getByText("Il terreno trattiene parte dell’acqua disponibile alle radici.",{exact:true})).toBeVisible();
  await locations.getByRole("button",{name:/Irrigazione/}).click();
  await popup.locator(".experience-evidence-grid").getByRole("button",{name:/Distribuzione dell’acqua/}).click();
  await expect(popup.locator(".experience-evidence-detail").getByText("La distribuzione dipende dalla posizione dei tubi e dalle operazioni di irrigazione.",{exact:true})).toBeVisible();
  await popup.getByRole("button",{name:"Continua",exact:true}).click();
  await expect(popup.getByRole("heading",{name:"Un frutteto diverso"})).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1")??"[]")[0]);
  expect(stored.lastPreviewSnapshot.studentAuthorized).toBe(false);
  expect(stored.lastPreviewSnapshot.runtimeAuthorized).toBe(false);
  expect(stored.productReview?.decision).not.toBe("PASS");
  expect(stored.scenes[0].stage.locations).toHaveLength(2);
  if(illustrated){expect(stored.lastPreviewSnapshot.sceneMedia.images[0].sha256).toBe(stored.scenes[0].illustration.sha256);expect(stored.lastPreviewSnapshot.scenes[0].illustration).toBeUndefined();}
});


for(const viewport of [{width:390,height:844},{width:1280,height:900}])test("ESS-02 agriculture: real editable draft, guarded review, five scenes "+viewport.width,async({page,context},testInfo)=>{
 await page.setViewportSize(viewport);
 await page.goto(STUDIO);
 await page.getByRole("link",{name:"Fascicolo educativo-didattico · v0.2"}).click();
 await expect(page.getByRole("heading",{name:"Verifica e valutazione formativa"})).toBeVisible();
 await page.goto(STUDIO);
 await page.getByRole("button",{name:"Apri Dal campo al raccolto"}).click();
 await expect(page).toHaveURL(/\/percorso\/ess-02-dal-campo-al-raccolto$/);
 const nav=page.getByRole("navigation",{name:"Fasi del Percorso"});
 const preview=page.getByRole("button",{name:"Anteprima di revisione",exact:true});
 await expect(preview).toBeDisabled();
 const readDraft=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1")??"[]").find((p:{projectId:string})=>p.projectId==="ess-02-dal-campo-al-raccolto"));
 const initial=await readDraft();
 expect(initial.storyReview.decision).toBe("READY");expect(initial.productReview.decision).toBe("READY");expect(initial.storyboardReady).toBe(false);
 expect(initial.scenes).toHaveLength(5);expect(initial.scenes.filter((s:{illustration?:unknown})=>s.illustration)).toHaveLength(5);
 await nav.getByRole("button",{name:"Storia"}).click();
 // Explicit reviewer action in disposable test context, not a seeded approval.
 await page.getByRole("button",{name:"Approva storia"}).click();
 await nav.getByRole("button",{name:"Scene"}).click();
 await expect(page.getByRole("textbox",{name:"Titolo scena 5"})).toHaveValue("Un nuovo problema nel frutteto");
 await page.screenshot({path:testInfo.outputPath("ess-02-teacher-"+viewport.width+".png"),fullPage:true});
 await page.goto(STUDIO);
 await page.getByRole("button",{name:"Apri Dal campo al raccolto"}).click();
 await expect(preview).toBeEnabled();
 expect((await readDraft()).storyReview.decision).toBe("PASS");
 const popupPromise=context.waitForEvent("page");await preview.click();const popup=await popupPromise;
 await popup.setViewportSize(viewport);
 await expect(popup.getByText("ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI")).toBeVisible({timeout:15000});
 const snap=async(name:string)=>popup.screenshot({path:testInfo.outputPath("ess-02-"+name+"-"+viewport.width+".png"),fullPage:true});
 const figure=popup.locator(".experience-hotspot-figure");
 await expect(popup.getByRole("heading",{name:"La chiamata nell’orto"})).toBeVisible();
 await figure.getByRole("button",{name:"Esplora Sara",exact:true}).click();
 await expect(figure).toContainText("Ci aiuti?");
 await expect(popup.locator(".experience-compact-task")).toContainText("consulente");
 await expect(popup.locator(".experience-compact-evidence")).not.toHaveAttribute("open","");
 await popup.getByText("Indizi in formato testuale",{exact:true}).click();
 await expect(popup.locator(".experience-compact-evidence")).toContainText("Ho osservato");
 await popup.getByText("Indizi in formato testuale",{exact:true}).click();
 await snap("opening");
 await popup.getByRole("button",{name:"Continua",exact:true}).click();
 await expect(popup.getByRole("heading",{name:"L’indagine sul campo"})).toBeVisible();
 for(const label of ["Riserva d’acqua","Misura a monte","Tratto della linea","Misura a valle","Terreno","Colture e lavoro"])await figure.getByRole("button",{name:"Esplora "+label,exact:true}).click();
 await figure.getByRole("button",{name:"Esplora Misura a valle",exact:true}).click();await expect(figure).toContainText("50 mL");
 await snap("investigation");
 await popup.getByRole("button",{name:"Continua",exact:true}).click();
 await expect(popup.getByRole("heading",{name:"Quale intervento scegli?"})).toBeVisible();
 await popup.getByRole("button",{name:"Prolungo l’irrigazione di tutti i filari",exact:true}).click();
 await expect(popup.getByRole("status").filter({hasText:"resta la differenza"})).toBeVisible();
 await popup.getByRole("button",{name:"Compenso soltanto il filare asciutto con un annaffiatoio",exact:true}).click();
 await expect(popup.getByRole("status").filter({hasText:"rimedio temporaneo"})).toBeVisible();
 await popup.getByRole("button",{name:"Chiedo di ripristinare la distribuzione e ripeto la misura",exact:true}).click();
 await expect(popup.getByRole("status").filter({hasText:"190 mL"})).toBeVisible();
 await expect(figure.getByRole("img")).toBeVisible();
 await snap("decision");
 await popup.getByRole("button",{name:"Continua dalla conseguenza",exact:true}).click();
 await expect(popup.getByRole("heading",{name:"Ricostruisci il sistema"})).toBeVisible();
 await figure.getByRole("button",{name:"Esplora Impatti e controllo",exact:true}).click();await expect(figure).toContainText("prossime scelte");
 await snap("system");
 await popup.getByRole("button",{name:"Continua",exact:true}).click();
 await expect(popup.getByRole("heading",{name:"Un nuovo problema nel frutteto"})).toBeVisible();
 await figure.getByRole("button",{name:"Esplora Suoli diversi",exact:true}).click();await expect(figure).toContainText("umidità e drenaggio");
 await snap("transfer");
 const stored=await readDraft();expect(stored.productReview.decision).toBe("READY");
 expect(stored.lastPreviewSnapshot.studentAuthorized).toBe(false);expect(stored.lastPreviewSnapshot.runtimeAuthorized).toBe(false);
 expect(stored.lastPreviewSnapshot.sceneMedia.images).toHaveLength(5);
 expect(stored.lastPreviewSnapshot.scenes.map((s:{sceneId:string})=>s.sceneId)).toEqual(["AG1","AG2","AG3","AG4","AG5"]);
});


test("ESS-02-R1: delayed image import retains intervening unrelated scene edit",async({page})=>{
 await page.goto(STUDIO);
 await page.getByRole("button",{name:"Apri Dal campo al raccolto"}).click();
 await expect(page).toHaveURL(/\/percorso\/ess-02-dal-campo-al-raccolto$/);
 await page.getByRole("navigation",{name:"Fasi del Percorso"}).getByRole("button",{name:"Scene"}).click();
 const first=page.locator(".scene-timeline .scene-row").first();
 const editor=first.getByRole("region",{name:"Immagine interattiva"});
 const base64=await page.evaluate(async()=>{
  const img=new Image();img.src="/design/atelier/catalog/nature.svg";await img.decode();
  const canvas=document.createElement("canvas");canvas.width=320;canvas.height=180;canvas.getContext("2d")!.drawImage(img,0,0,320,180);
  return canvas.toDataURL("image/webp",0.8).split(",")[1];
 });
 await page.evaluate(()=>{
  const original=File.prototype.arrayBuffer;
  const state=window as unknown as {releaseImage?:()=>void};
  File.prototype.arrayBuffer=async function(){await new Promise<void>(resolve=>{state.releaseImage=resolve});return original.call(this);};
 });
 await editor.getByLabel("Carica immagine WebP").setInputFiles({name:"delayed.webp",mimeType:"image/webp",buffer:Buffer.from(base64,"base64")});
 await expect(editor.getByText("Verifica dell’immagine…")).toBeVisible();
 await page.getByRole("textbox",{name:"Titolo scena 2"}).fill("Indagine aggiornata durante importazione");
 await page.evaluate(()=>{(window as unknown as {releaseImage:()=>void}).releaseImage()});
 await expect(editor.getByText("Verifica dell’immagine…")).toHaveCount(0);
 await expect(editor.getByRole("alert")).toHaveCount(0);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("studio-atlas.projects.v0.1")??"[]").find((p:{projectId:string})=>p.projectId==="ess-02-dal-campo-al-raccolto"));
 expect(stored.scenes[0].illustration.pixelWidth).toBe(320);
 expect(stored.scenes[0].stage.evidence.every((item:{hotspot?:unknown})=>!item.hotspot)).toBe(true);
 expect(stored.scenes[0].stage.evidence).toHaveLength(3);
 expect(stored.scenes[1].title).toBe("Indagine aggiornata durante importazione");
 expect(stored.productReview.decision).toBe("DRAFT");
 expect(stored.lastPreviewSnapshot).toBeUndefined();
});
