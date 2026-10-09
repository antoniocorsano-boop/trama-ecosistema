import { expect, test } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';
const FONT_HOST = 'https://fonts.googleapis.com/**';
const FONT_STATIC_HOST = 'https://fonts.gstatic.com/**';

test('reduced motion uses static poster and suppresses entrance animation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'L', 'Motion preference behavior is viewport-independent.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.getByTestId('trama-media-poster')).toBeVisible();
  await expect(page.getByTestId('trama-media-video')).toHaveCount(0);
  const animation = await page.getByRole('heading', { level: 1 }).evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe('none');
});

test('video request failure leaves poster, copy and CTA usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'L', 'Media failure evidence is viewport-independent.');
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');

  await expect(page.getByTestId('trama-media-poster')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/Un ecosistema per progettare/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toBeVisible();
});

test('font network failure preserves readable fallback typography', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'L', 'Font fallback evidence is viewport-independent.');
  await page.route(FONT_HOST, (route) => route.abort());
  await page.route(FONT_STATIC_HOST, (route) => route.abort());
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');

  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
  const metrics = await heading.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { fontFamily: style.fontFamily, width: rect.width, height: rect.height };
  });
  expect(metrics.fontFamily).toContain('Instrument Serif');
  expect(metrics.width).toBeGreaterThan(0);
  expect(metrics.height).toBeGreaterThan(0);
});
