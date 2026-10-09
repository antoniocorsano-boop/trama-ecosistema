import { expect, test } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';

test.beforeEach(async ({ page }) => {
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');
});

test('S/M/L/LIM preserve the public threshold without horizontal overflow', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.screenshot({
    path: testInfo.outputPath(`gateway-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test('primary access destination remains explicit', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveAttribute('href', '/ecosistema');
});
