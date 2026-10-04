import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Overview orients without inventing blocking decisions", async ({ page }, testInfo) => {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.push(request.url());
  });

  await page.goto("/#/");

  await expect(page.getByRole("heading", { name: "Dove siamo e cosa richiede attenzione." })).toBeVisible();
  await expect(page.getByText("Nessun gate bloccante aperto.")).toBeVisible();
  await expect(page.getByText(/Prossimo fronte pianificato: R4/)).toBeVisible();
  const specialistNav = page.getByRole("navigation", { name: "Viste specialistiche" });
  await expect(specialistNav.getByRole("link", { name: /Maturità/ })).toBeVisible();
  await expect(page.getByText("Aggiornata", { exact: true })).toBeVisible();
  await expect(page.getByText(/Stato parziale: informazione utilizzabile con contesto/i)).toHaveCount(0);

  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  expect(externalRequests).toEqual([]);

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`overview-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test("mobile navigation keeps only migrated destinations actionable", async ({ page }) => {
  await page.goto("/#/");

  const primaryNav = page.getByRole("navigation", { name: "Navigazione principale candidate" });
  await expect(primaryNav.getByRole("link", { name: "Overview" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Maturità" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Ecosistema" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Evidenze" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Operazioni" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Assurance" })).toBeVisible();
});
