import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const governedSnapshot = JSON.parse(
  readFileSync(new URL("../../../control-center/data/ecosystem-snapshot.json", import.meta.url), "utf-8"),
);

test("Maturity candidate preserves governed semantics across canonical viewports", async ({ page }, testInfo) => {
  await page.goto("/#/maturity");

  await expect(page.getByRole("heading", { name: "Maturità" })).toBeVisible();
  await expect(page.getByText("Aree di maturità")).toBeVisible();
  await expect(page.getByText("Componenti", { exact: true })).toBeVisible();
  await expect(page.getByText("READ_ONLY")).toBeVisible();

  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`maturity-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test("Maturity candidate renders LIVE_VERIFIED evidence without lifecycle promotion", async ({ page }) => {
  const effective = structuredClone(governedSnapshot);
  const relation = effective.components.find(
    (component) => component.componentId === "ATLAS.RELATION_EXPLORER.FAMILY",
  );

  if (!relation) throw new Error("ATLAS_RELATION_EXPLORER_MISSING");

  relation.evidenceStatus.ISOLATED = {
    ...relation.evidenceStatus.ISOLATED,
    status: "PRESENT",
    sourcePlane: "LIVE_VERIFIED",
  };

  await page.route("**/data/ecosystem-snapshot.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(effective),
    });
  });

  await page.goto("/#/maturity");
  await page.getByRole("button", { name: "Atlas" }).click();
  await page.getByRole("button", { name: /relation-explorer/i }).click();

  await expect(page.getByText("Presente · live verificata")).toBeVisible();
  const detail = page.locator(".component-detail");
  await expect(detail.getByText("Proposto", { exact: true })).toBeVisible();
  await expect(detail.getByText("Registrato", { exact: true })).toBeVisible();
  await expect(detail.getByText("Accessibilità", { exact: true })).toBeVisible();
});
