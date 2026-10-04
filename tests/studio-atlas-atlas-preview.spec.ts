import { test, expect } from "@playwright/test";
const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";
// MUSEO ZERO transfer contract: the recovery-comparison phase carries transfer inside the approved story arc.

const STUDIO = "http://127.0.0.1:3100";
const ATLAS = "http://127.0.0.1:3200";

const project = {
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
    ending: "La strategia viene provata in un sistema diverso."
  },
  storyReview: { decision: "PASS", reviewedAt: "2026-10-04T15:00:00Z" },
  world: {
    learnerRole: "Tecnico che verifica una relazione causale.",
    canObserve: "Segnali e reazioni del sistema.",
    canChange: "Una relazione alla volta.",
    unknown: "Quale relazione produce il ritardo.",
    consequence: "Il comportamento cambia immediatamente o resta incoerente.",
    motivation: "Rendere il sistema coerente prima della prova finale."
  },
  worldReview: { decision: "PASS", reviewedAt: "2026-10-04T15:02:00Z" },
  experience: {
    grammar: "SIMULATION_MICROWORLD",
    rationale: "La comprensione nasce dal confronto fra intervento e conseguenza."
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
      choices: []
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
          feedback: "Il ritardo si ripete: il sistema continua ad ascoltare il punto sbagliato."
        },
        {
          choiceId: "use-new",
          targetSceneId: "S3_TRANSFER",
          label: "Collego il sistema al segnale del nuovo ingresso",
          feedback: "La risposta parte nel momento atteso: questa modifica spiega il ritardo."
        },
        {
          choiceId: "manual",
          targetSceneId: "S2",
          label: "Uso un comando manuale",
          feedback: "Può funzionare una volta, ma il risultato dipende dal tempismo dell’operatore."
        }
      ]
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
      choices: []
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
      choices: []
    }
  ],
  storyboardReady: true,
  archived: false,
  createdAt: "2026-10-04T14:00:00Z",
  updatedAt: "2026-10-04T15:03:00Z",
  revision: 9
};

test("Studio Atlas opens exact learner preview in Atlas across origins", async ({ browser }) => {
  const context = await browser.newContext();
  const diagnostics: string[] = [];
  context.on("page", (candidate) => {
    candidate.on("pageerror", (error) => {
      diagnostics.push(`pageerror:${error.name}:${error.message}`);
    });
    candidate.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        diagnostics.push(`console:${message.type()}:${message.text()}`);
      }
    });
    candidate.on("requestfailed", (request) => {
      diagnostics.push(
        `requestfailed:${request.url()}:${request.failure()?.errorText ?? "unknown"}`,
      );
    });
  });
  const page = await context.newPage();

  await page.addInitScript((seed) => {
    localStorage.setItem("studio-atlas.projects.v0.1", JSON.stringify([seed]));
  }, project);

  await page.goto(`${STUDIO}/percorso/${project.projectId}`);

  await page.evaluate(() => {
    const target = window as Window & { __bridgeEvents?: unknown[] };
    target.__bridgeEvents = [];
    window.addEventListener("message", (event) => {
      target.__bridgeEvents?.push({
        origin: event.origin,
        type:
          event.data && typeof event.data === "object"
            ? (event.data as { type?: unknown }).type
            : typeof event.data,
        channel:
          event.data && typeof event.data === "object"
            ? (event.data as { channel?: unknown }).channel
            : undefined,
      });
    });
  });

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
  expect(popup.url()).not.toContain("E2E%20Percorso");
  expect(popup.url()).not.toContain("snapshot");

  await popup.evaluate(() => {
    const target = window as Window & { __bridgeEvents?: unknown[] };
    target.__bridgeEvents = [];
    window.addEventListener("message", (event) => {
      target.__bridgeEvents?.push({
        origin: event.origin,
        type:
          event.data && typeof event.data === "object"
            ? (event.data as { type?: unknown }).type
            : typeof event.data,
        channel:
          event.data && typeof event.data === "object"
            ? (event.data as { channel?: unknown }).channel
            : undefined,
        sourceMatchesOpener: event.source === window.opener,
      });
    });
  });

  await popup.waitForTimeout(1500);
  const bridgeDebug = {
    studio: await page.evaluate(
      () => (window as Window & { __bridgeEvents?: unknown[] }).__bridgeEvents ?? [],
    ),
    atlas: await popup.evaluate(
      () => (window as Window & { __bridgeEvents?: unknown[] }).__bridgeEvents ?? [],
    ),
    atlasHasOpener: await popup.evaluate(() => Boolean(window.opener)),
    studioOrigin: await page.evaluate(() => window.location.origin),
    atlasOrigin: await popup.evaluate(() => window.location.origin),
  };
  console.log("STUDIO_ATLAS_BRIDGE_DEBUG", JSON.stringify(bridgeDebug));
  console.log("STUDIO_ATLAS_BROWSER_DIAGNOSTICS", JSON.stringify(diagnostics));

  await expect(
    popup.getByText("ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    popup.getByRole("heading", { name: "E2E Percorso Studio Atlas" }),
  ).toBeVisible();
  await expect(
    popup.getByRole("heading", { name: "Qualcosa non torna" }),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(
    popup.getByRole("heading", { name: "Prova una modifica" }),
  ).toBeVisible();

  const supportedChoice = popup.getByRole("radio", {
    name: "Collego il sistema al segnale del nuovo ingresso",
  });
  await expect(supportedChoice).toBeVisible();
  await supportedChoice.check();
  await expect(
    popup.getByText("La risposta parte nel momento atteso: questa modifica spiega il ritardo."),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(
    popup.getByRole("heading", { name: "Un sistema diverso" }),
  ).toBeVisible();

  await expect.poll(async () => {
    return await page.evaluate(() => {
      const raw = localStorage.getItem("studio-atlas.projects.v0.1");
      const items = raw ? JSON.parse(raw) : [];
      return items[0]?.lastPreviewSnapshot?.studentAuthorized;
    });
  }).toBe(false);

  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem("studio-atlas.projects.v0.1");
    const items = raw ? JSON.parse(raw) : [];
    return items[0]?.lastPreviewSnapshot;
  });

  expect(stored.runtimeAuthorized).toBe(false);
  expect(stored.scenes.some((scene) => scene.kind === "TRANSFER")).toBe(true);

  await context.close();
});


test("MUSEO ZERO pilot stays gated until human review then opens meaningful Atlas choices", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(STUDIO);
  await page.getByRole("button", { name: "Apri MUSEO ZERO" }).click();
  await expect(page).toHaveURL(new RegExp(`/percorso/${MUSEO_ZERO_PROJECT_ID}$`));

  const previewButton = page.getByRole("button", { name: "Vedi come studente" });
  await expect(previewButton).toBeDisabled();

  await page.getByRole("button", { name: "Mondo" }).click();
  await expect(page.getByRole("heading", { name: "Fai esistere il mondo." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approva mondo" })).toHaveCount(0);

  await page.getByRole("button", { name: "Scene" }).click();
  await expect(page.getByRole("heading", { name: "Metti in sequenza ciò che accade." })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Titolo scena 5" }),
  ).toHaveValue("Quale soluzione regge davvero?");
  await expect(page.getByRole("button", { name: "Storyboard pronto" })).toHaveCount(0);

  await page.getByRole("button", { name: "Revisione" }).click();
  await expect(page.getByRole("heading", { name: "Human Product Review" })).toBeVisible();
  await expect(previewButton).toBeDisabled();
  await page.getByRole("button", { name: "Approva pacchetto" }).click();

  await expect(previewButton).toBeEnabled();

  const popupPromise = context.waitForEvent("page");
  await previewButton.click();
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
  await expect(
    popup.getByRole("heading", { name: "Qualcosa non torna" }),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();

  await expect(
    popup.getByRole("heading", { name: "Tutti hanno cambiato qualcosa" }),
  ).toBeVisible();
  const connectionsChoice = popup.getByRole("radio", {
    name: "Collego subito percorso, sensore e regia",
  });
  await expect(connectionsChoice).toBeVisible();
  await connectionsChoice.check();
  await expect(
    popup.getByText(
      "Le relazioni sono promettenti, ma senza ordinare alcune modifiche rischi di attribuire importanza a coincidenze.",
    ),
  ).toBeVisible();

  await popup.getByRole("button", { name: "Continua" }).click();
  await expect(
    popup.getByRole("heading", { name: "Prova il collegamento" }),
  ).toBeVisible();

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

  expect(stored.productReview.decision).toBe("PASS");
  expect(stored.productReview.evidenceRef).toContain("PRODUCT-REVIEW-PACK-v0.1.md");
  expect(stored.worldReview.decision).toBe("PASS");
  expect(stored.worldReview.evidenceRef).toContain("PRODUCT-REVIEW-PACK-v0.1.md");
  expect(stored.storyboardReady).toBe(true);
  expect(stored.lastPreviewSnapshot.runtimeAuthorized).toBe(false);
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
