import { expect, test } from "@playwright/test";

const routes = [
  ["overview", "/#/"],
  ["maturity", "/#/maturity"],
  ["ecosystem", "/#/ecosystem"],
  ["evidence", "/#/evidence"],
  ["operations", "/#/operations"],
  ["assurance", "/#/assurance"],
] as const;

for (const [name, route] of routes) {
  test(`visual parity: ${name}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("#main-content")).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    });
  });
}
