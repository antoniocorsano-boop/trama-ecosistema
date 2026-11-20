import { chromium, expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve(process.cwd(), "../products/studio-atlas/.artifacts");
const html = join(output, "awc-sala-zero-live-webgl-offline.html");
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

test("AWC S3b offline: actual local 3-D, touch, light A/B and reset, with no network", async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const network: string[] = [], errors: string[] = [], consoleErrors: string[] = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("request", request => {
      if (/^https?:/i.test(request.url())) network.push(request.url());
    });
    page.on("pageerror", error => errors.push(error.message));
    expect(readFileSync(html).length).toBeGreaterThan(400_000);
    await page.goto(pathToFileURL(html).href);
    try {
      await page.waitForFunction(() => (window as any).__awcTrial !== undefined, null, { timeout: 12_000 });
    } catch {
      throw new Error("Offline 3-D script did not start: " + consoleErrors.join(" | "));
    }
    const status = page.getByRole("status");
    await expect(status).toContainText("WebGL attivo", { timeout: 30_000 });
    const canvas = page.locator("#viewport canvas");
    await expect(canvas).toBeVisible();
    const original = await canvas.screenshot({ path: join(output, "awc-s3b-original.png") });
    await page.getByRole("button", { name: "Luce originale AWC-F" }).click();
    await expect(status).toContainText("luce originale");
    const old = await canvas.screenshot({ path: join(output, "awc-s3b-luce-originale.png") });
    expect(sha(original)).not.toBe(sha(old));
    await page.getByRole("button", { name: "Luce equilibrata · prova" }).click();
    await expect(status).toContainText("luce equilibrata");

    const bounds = await canvas.boundingBox();
    if (!bounds) throw Error("Canvas missing");
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 30, bounds.y + bounds.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(status).toContainText("rotazione 0.12 rad");
    await page.getByRole("button", { name: "Cambia segnale A/B" }).click();
    await expect(status).toContainText("segnale B");
    const signal = await canvas.screenshot({ path: join(output, "awc-s3b-segnale-b.png") });
    expect(sha(original)).not.toBe(sha(signal));
    await page.getByRole("button", { name: "Ripristina inquadratura" }).click();
    await expect(status).toContainText("rotazione 0.00 rad");
    await expect(status).toContainText("segnale A");
    const state = await page.evaluate(() => (window as any).__awcTrial?.getState());
    expect(state.objects).toBe(16);
    expect(state.studentAuthorized).toBe(false);
    expect(state.publishable).toBe(false);
    expect(network).toEqual([]);
    expect(errors).toEqual([]);
    const width = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth,
    }));
    expect(width.page).toBeLessThanOrEqual(width.viewport + 1);
    await context.close();
  } finally { await browser.close(); }
});
