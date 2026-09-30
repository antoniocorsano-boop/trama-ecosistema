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
  await expect(page.getByRole("link", { name: /Maturità/ })).toBeVisible();
  await expect(page.getByText("Parziale", { exact: true })).toBeVisible();
  await expect(page.getByText(/informazione utilizzabile con contesto/i)).toBeVisible();

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

  await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Maturità" })).toBeVisible();
  await expect(page.getByText("Ecosistema")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("Evidenze")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("Operazioni")).toHaveAttribute("aria-disabled", "true");
});
