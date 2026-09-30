import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type ControlResult = {
  id: string;
  status: "PASS" | "FAIL";
  evidence: unknown;
  error?: string;
};

const baseURL = process.env.TRAMA_PUBLIC_BASE_URL ?? "https://trama-control-center.onrender.com";
const target = new URL(baseURL);
const evidenceDir = path.resolve("public-certification-evidence");

const routes = [
  "/#/",
  "/#/maturity",
  "/#/ecosystem",
  "/#/evidence",
  "/#/operations",
  "/#/assurance",
];

test("TRAMA public browser certification", async ({ page, context, browserName }) => {
  expect(browserName).toBe("chromium");

  fs.rmSync(evidenceDir, { recursive: true, force: true });
  fs.mkdirSync(evidenceDir, { recursive: true });

  const results: ControlResult[] = [];
  const network: Array<Record<string, unknown>> = [];
  const consoleErrors: string[] = [];
  const blockedMutations: Array<{ method: string; url: string }> = [];

  await context.route("**/*", async (route) => {
    const req = route.request();
    const method = req.method().toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      blockedMutations.push({ method, url: req.url() });
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  page.on("response", async (response) => {
    const request = response.request();
    const headers = request.headers();
    network.push({
      method: request.method(),
      url: request.url(),
      status: response.status(),
      resourceType: request.resourceType(),
      redirectedFrom: request.redirectedFrom()?.url() ?? null,
      authorization: Boolean(headers.authorization),
      cookie: Boolean(headers.cookie),
    });
  });

  const run = async (id: string, fn: () => Promise<unknown>) => {
    try {
      const evidence = await fn();
      results.push({ id, status: "PASS", evidence });
    } catch (error) {
      results.push({
        id,
        status: "FAIL",
        evidence: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  await run("BC-01_PUBLIC_IDENTITY", async () => {
    const response = await page.goto("/#/", { waitUntil: "networkidle" });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    expect(new URL(page.url()).origin).toBe(target.origin);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/TRAMA/i);
    expect(body).toMatch(/READ_ONLY|READ ONLY/i);
    return { status: response!.status(), url: page.url() };
  });

  await run("BC-02_PRIMARY_NAVIGATION", async () => {
    const visited: string[] = [];
    await page.goto("/#/", { waitUntil: "networkidle" });
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#main-content")).toBeVisible();
      expect(page.url()).toContain(route.slice(1));
      visited.push(page.url());
    }
    return { visited };
  });

  await run("BC-03_LEGACY_FALLBACK", async () => {
    const response = await page.goto("/legacy/", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    const text = await page.locator("body").innerText();
    expect(text.trim().length).toBeGreaterThan(50);
    return { status: response!.status(), url: page.url() };
  });

  await run("BC-04_GOVERNANCE_INVARIANTS", async () => {
    await page.goto("/#/ecosystem", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/DOS-A1/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/RUNTIME_DEFERRED|DEFERRED/i, { timeout: 15_000 });
    await page.goto("/#/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/READ_ONLY|READ ONLY/i);
    return { readOnly: true, dosA1Deferred: true };
  });

  await run("BC-05_MANIFEST", async () => {
    await page.goto("/#/", { waitUntil: "domcontentloaded" });
    const manifest = await page.evaluate(async () => {
      const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (!link) throw new Error("manifest link missing");
      const response = await fetch(link.href, { cache: "no-store", credentials: "omit" });
      const contentType = response.headers.get("content-type") ?? "";
      const text = await response.text();
      return {
        url: link.href,
        status: response.status,
        contentType,
        data: JSON.parse(text),
      };
    });
    expect(manifest.status).toBe(200);
    expect(manifest.contentType).toMatch(/application\/(manifest\+json|json)|text\/json/i);
    expect(manifest.data.name).toBeTruthy();
    expect(manifest.data.display).toBeTruthy();
    expect(Array.isArray(manifest.data.icons)).toBe(true);
    expect(manifest.data.icons.length).toBeGreaterThanOrEqual(1);
    return manifest;
  });

  await run("BC-06_SERVICE_WORKER", async () => {
    await page.goto("/#/", { waitUntil: "domcontentloaded" });
    const ready = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) throw new Error("service worker API unavailable");
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("service worker ready timeout")), 15_000)),
      ]);
      return {
        active: Boolean(registration.active),
        scope: registration.scope,
        controlled: Boolean(navigator.serviceWorker.controller),
      };
    });
    if (!ready.controlled) {
      await page.reload({ waitUntil: "domcontentloaded" });
    }
    const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
    expect(ready.active).toBe(true);
    expect(new URL(ready.scope).origin).toBe(target.origin);
    expect(controlled).toBe(true);
    return { ...ready, controlledAfterReload: controlled };
  });

  await run("BC-07_INSTALLABILITY", async () => {
    await page.goto("/#/", { waitUntil: "domcontentloaded" });
    const session = await context.newCDPSession(page);
    await session.send("Page.enable");
    const manifest = await session.send("Page.getAppManifest");
    const installability = await session.send("Page.getInstallabilityErrors");
    await session.detach();
    expect((manifest as { url?: string }).url).toBeTruthy();
    const errors = (installability as { installabilityErrors?: unknown[] }).installabilityErrors ?? [];
    expect(errors).toEqual([]);
    return { manifestUrl: (manifest as { url?: string }).url, installabilityErrors: errors };
  });

  await run("BC-08_OFFLINE", async () => {
    await page.goto("/#/", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      await fetch("/#/", { cache: "reload", credentials: "omit" }).catch(() => undefined);
    });

    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
      const text = await page.locator("body").innerText();
      expect(text).toMatch(/TRAMA/i);
      return { shellAvailable: true, url: page.url() };
    } finally {
      await context.setOffline(false);
    }
  });

  await run("BC-09_RESPONSIVE_MATRIX", async () => {
    const widths = [320, 390, 768, 1440];
    const matrix: Array<{ width: number; route: string; scrollWidth: number; innerWidth: number }> = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const dims = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(dims.scrollWidth, `${route} overflow at ${width}px`).toBeLessThanOrEqual(dims.innerWidth + 1);
        matrix.push({ width, route, ...dims });
      }
    }
    return matrix;
  });

  await run("BC-10_NETWORK_AND_READ_ONLY_GUARD", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/", { waitUntil: "networkidle" });

    const httpRecords = network.filter((entry) => {
      const url = String(entry.url ?? "");
      return url.startsWith("http://") || url.startsWith("https://");
    });

    const failed = httpRecords.filter((entry) => Number(entry.status) >= 400);
    const mixed = target.protocol === "https:"
      ? httpRecords.filter((entry) => String(entry.url).startsWith("http://"))
      : [];
    const foreignOrigins = httpRecords.filter((entry) => new URL(String(entry.url)).origin !== target.origin);
    const credentialed = httpRecords.filter((entry) => Boolean(entry.authorization) || Boolean(entry.cookie));
    const disallowedMethods = httpRecords.filter((entry) => !["GET", "HEAD", "OPTIONS"].includes(String(entry.method)));

    expect(blockedMutations).toEqual([]);
    expect(disallowedMethods).toEqual([]);
    expect(failed).toEqual([]);
    expect(mixed).toEqual([]);
    expect(foreignOrigins).toEqual([]);
    expect(credentialed).toEqual([]);

    return {
      totalResponses: httpRecords.length,
      methods: [...new Set(httpRecords.map((entry) => String(entry.method)))],
      origins: [...new Set(httpRecords.map((entry) => new URL(String(entry.url)).origin))],
      redirects: httpRecords.filter((entry) => entry.redirectedFrom),
      blockedMutations,
    };
  });

  await run("BC-11_CONSOLE", async () => {
    consoleErrors.length = 0;
    await page.goto("/#/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
    return { errors: consoleErrors };
  });

  const failedControls = results.filter((result) => result.status === "FAIL");
  const report = {
    schemaVersion: "1.0",
    certification: "TRAMA_PUBLIC_BROWSER_CERTIFICATION",
    target: baseURL,
    generatedAt: new Date().toISOString(),
    runner: {
      browser: browserName,
      playwright: process.env.npm_package_devDependencies__playwright_test ?? "repository-lockfile",
      githubSha: process.env.GITHUB_SHA ?? null,
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
    },
    verdict: failedControls.length === 0
      ? "PUBLIC_BROWSER_CERTIFICATION_PASS"
      : "PUBLIC_BROWSER_CERTIFICATION_FAIL",
    controls: results,
    network,
    consoleErrors,
  };

  fs.writeFileSync(
    path.join(evidenceDir, "public-browser-certification.json"),
    JSON.stringify(report, null, 2),
    "utf-8",
  );

  await test.info().attach("public-browser-certification.json", {
    body: Buffer.from(JSON.stringify(report, null, 2)),
    contentType: "application/json",
  });

  expect(
    failedControls,
    failedControls.map((item) => `${item.id}: ${item.error ?? "failed"}`).join("\n"),
  ).toEqual([]);
});
