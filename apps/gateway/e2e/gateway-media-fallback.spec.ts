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

test('canonical L background is viewport-sufficient for large displays', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'L', 'Background viewport-sufficiency evidence is verified on the L resource.');
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');

  const poster = page.getByTestId('trama-media-poster');
  await expect(poster).toBeVisible();
  await expect.poll(async () => poster.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    'trama-gateway-bg-l.webp',
  );
  const dimensions = await poster.evaluate((element) => {
    const image = element as HTMLImageElement;
    return { width: image.naturalWidth, height: image.naturalHeight, currentSrc: image.currentSrc };
  });
  expect(dimensions.currentSrc).toContain('trama-gateway-poster-l.webp');
  expect(dimensions.width).toBeGreaterThanOrEqual(1440);
  expect(dimensions.height).toBeGreaterThanOrEqual(900);
});

test('hero copy retains contrast reinforcement over changing media', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'L', 'Media-independent copy contrast is verified on the desktop composition.');
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');

  const heading = page.getByRole('heading', { level: 1 });
  const supportingCopy = page.getByText(/Un ecosistema per progettare/);
  const styles = await Promise.all([
    heading.evaluate((element) => getComputedStyle(element).textShadow),
    supportingCopy.evaluate((element) => getComputedStyle(element).textShadow),
  ]);
  expect(styles[0]).not.toBe('none');
  expect(styles[1]).not.toBe('none');
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
