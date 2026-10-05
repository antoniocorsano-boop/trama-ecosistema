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

  const locations = popup.getByRole("navigation", { name: "Luoghi di Museo Zero" });
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
  await expect(
    popup.getByText("Il nuovo ingresso usa Sensor B, ma la regia ascolta ancora Sensor A"),
  ).toBeVisible();

  const switchSensorChoice = popup.getByRole("button", {
    name: "Provo il trigger su Sensor B",
    exact: true,
  });
  await switchSensorChoice.click();

  await expect(
    popup.getByText(
      "La sala risponde nel momento previsto: la mappatura aggiornata spiega il problema",
    ),
  ).toBeVisible();
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
