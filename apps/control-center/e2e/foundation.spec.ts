import { expect, test } from "@playwright/test";

test("A1 candidate loads governed snapshot without external runtime requests", async ({ page }) => {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") {
      externalRequests.push(request.url());
    }
  });

  await page.goto("/#/foundation");

  await expect(page.getByRole("heading", { name: "Control Center" })).toBeVisible();
  await expect(page.getByLabel("Modalità sola lettura")).toHaveText("READ_ONLY");
  await expect(page.getByText("Snapshot validato")).toBeVisible();
  await expect(page.getByText("Legacy invariato")).toBeVisible();
  expect(externalRequests).toEqual([]);
});
