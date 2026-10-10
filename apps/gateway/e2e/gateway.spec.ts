import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';
const EVIDENCE_DIR = path.resolve(process.cwd(), 'test-results/evidence');
const EXPECTED_POSTER: Record<string, string> = {
  S: 'trama-gateway-poster-s.webp',
  M: 'trama-gateway-poster-m.webp',
  L: 'trama-gateway-poster-l.webp',
  LIM: 'trama-gateway-poster-s.webp',
};

test.beforeEach(async ({ page }) => {
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');
});

test('S/M/L/LIM preserve the public threshold without horizontal overflow', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toBeVisible();

  const poster = page.getByTestId('trama-media-poster');
  const expectedPoster = EXPECTED_POSTER[testInfo.project.name];
  await expect.poll(async () => poster.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    expectedPoster,
  );

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
  });
  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready;
  });

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, `gateway-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test('primary access destination remains explicit', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveAttribute('href', '/ecosistema');
});
