import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  ["overview", "/#/"],
  ["maturity", "/#/maturity"],
  ["ecosystem", "/#/ecosystem"],
  ["evidence", "/#/evidence"],
  ["operations", "/#/operations"],
  ["assurance", "/#/assurance"],
] as const;

test("A6 CSP, manifest and route parity are present without inline executable scripts", async ({ page }, testInfo) => {
  const response = await page.goto("/#/");
  expect(response).not.toBeNull();

  const csp = (await response!.allHeaders())["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");

  expect(await page.locator("script:not([src])").count()).toBe(0);

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!link) return null;
    const response = await fetch(link.href);
    return response.json();
  });
  expect(manifest).not.toBeNull();
  expect(manifest.name).toBe("TRAMA Control Center");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

  const nav = page.getByRole("navigation", { name: "Navigazione principale candidate" });
  for (const label of ["Overview", "Maturità", "Ecosistema", "Evidenze", "Operazioni", "Assurance"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }

  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath(`a6-shell-${testInfo.project.name}.png`), fullPage: true });
});

test("A6 all primary routes reflow and retain focusable main content", async ({ page }, testInfo) => {
  for (const [name, route] of routes) {
    await page.goto(route);
    await expect(page.locator("#main-content")).toBeFocused();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth, `${name} horizontal overflow`).toBeLessThanOrEqual(viewportWidth + 1);

    await page.screenshot({
      path: testInfo.outputPath(`a6-${name}-${testInfo.project.name}.png`),
      fullPage: true,
    });
  }
});

test("A6 service worker serves governed data offline only with explicit stale marker", async ({ page, context }) => {
  test.skip(test.info().project.name !== "desktop", "offline service-worker proof runs once on desktop");

  await page.goto("/#/maturity");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  if (!controlled) {
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await expect.poll(
    () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    { message: "service worker should control the candidate page" },
  ).toBe(true);

  await expect(page.getByRole("heading", { name: "Maturità", exact: true })).toBeVisible();

  const warm = await page.evaluate(async () => {
    const response = await fetch("./data/ecosystem-snapshot.json", { cache: "no-store" });
    return { ok: response.ok, marker: response.headers.get("X-TRAMA-Data-Source") };
  });
  expect(warm.ok).toBe(true);
  expect(warm.marker).toBeNull();

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Maturità", exact: true })).toBeVisible();
  await expect(page.getByText(/Offline · copia cached, potenzialmente non aggiornata/i)).toBeVisible();

  const cached = await page.evaluate(async () => {
    const response = await fetch("./data/ecosystem-snapshot.json", { cache: "no-store" });
    return {
      ok: response.ok,
      source: response.headers.get("X-TRAMA-Data-Source"),
      policy: response.headers.get("X-TRAMA-Cache-Policy"),
    };
  });
  expect(cached.ok).toBe(true);
  expect(cached.source).toBe("CACHE_OFFLINE");
  expect(cached.policy).toBe("NETWORK_FIRST");

  await context.setOffline(false);
});

test("A6 generated service worker controls the candidate", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "service-worker registration proof runs once on desktop");

  await page.goto("/#/");
  const state = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return {
      active: Boolean(registration.active),
      scope: registration.scope,
    };
  });
  expect(state.active).toBe(true);
  expect(state.scope).toContain("127.0.0.1:4173");
});
