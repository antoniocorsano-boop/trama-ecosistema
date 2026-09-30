import { expect, test } from "@playwright/test";

test("A1 candidate loads governed snapshot without replacing legacy production", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Control Center" })).toBeVisible();
  await expect(page.getByLabel("Modalità sola lettura")).toHaveText("READ_ONLY");
  await expect(page.getByText("Snapshot validato")).toBeVisible();
  await expect(page.getByText("Legacy invariato")).toBeVisible();
});
