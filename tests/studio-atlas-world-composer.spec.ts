import { expect, test } from "@playwright/test";

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
  expect(after.review).toBe("REVISE");
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
