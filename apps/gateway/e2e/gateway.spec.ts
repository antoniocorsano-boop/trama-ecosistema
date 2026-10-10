import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';
const EVIDENCE_DIR = path.resolve(process.cwd(), 'test-results/evidence');
const EXPECTED_BACKGROUND: Record<string, string> = {
  S: 'trama-gateway-bg-s.webp',
  M: 'trama-gateway-bg-m.webp',
  L: 'trama-gateway-bg-l.webp',
  LIM: 'trama-gateway-bg-lim.webp',
};

async function openGateway(page: Page) {
  await page.goto('/');
}

async function openBackgroundOnly(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addStyleTag({
    content: `
      header, main, [data-testid="trama-segno-vivo"] { display: none !important; }
      .trama-gateway-stage::before { display: none !important; content: none !important; background: none !important; }
      .trama-media-visual { filter: none !important; transform: none !important; object-position: 50% 50% !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  });
}

test.beforeEach(async ({ page }) => {
  await page.route(VIDEO_HOST, (route) => route.abort());
});

test('background-only S/M/L/LIM evidence resolves exactly one native static scene', async ({ page }, testInfo) => {
  await openBackgroundOnly(page);

  const visual = page.locator('img.trama-media-visual');
  await expect(visual).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('header')).toBeHidden();
  await expect(page.locator('main')).toBeHidden();
  await expect(page.getByTestId('trama-segno-vivo')).toBeHidden();

  const expectedBackground = EXPECTED_BACKGROUND[testInfo.project.name];
  await expect.poll(async () => visual.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    expectedBackground,
  );
  await expect.poll(async () => visual.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const mediaState = await page.evaluate(() => {
    const stage = document.querySelector('.trama-gateway-stage');
    const image = document.querySelector('img.trama-media-visual');
    return {
      stageBackgroundImage: stage ? getComputedStyle(stage).backgroundImage : null,
      stageBeforeBackgroundImage: stage ? getComputedStyle(stage, '::before').backgroundImage : null,
      imageFilter: image ? getComputedStyle(image).filter : null,
      imageTransform: image ? getComputedStyle(image).transform : null,
    };
  });
  expect(mediaState.stageBackgroundImage).toBe('none');
  expect(mediaState.stageBeforeBackgroundImage).toBe('none');
  expect(mediaState.imageFilter).toBe('none');
  expect(mediaState.imageTransform).toBe('none');

  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready;
  });
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, `background-${testInfo.project.name}.png`),
    fullPage: false,
  });
});

test('complete gateway S/M/L/LIM evidence renders the production UI over the approved background', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGateway(page);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveAttribute('href', '/ecosistema');
  await expect(page.locator('img.trama-media-visual')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(0);

  const accent = page.getByTestId('trama-experience-accent');
  await expect(accent).toHaveCSS('color', 'rgb(243, 166, 106)');
  const accentState = await accent.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      strokeWidth: Number.parseFloat(style.getPropertyValue('-webkit-text-stroke-width')),
      backgroundImage: style.backgroundImage,
    };
  });
  expect(accentState.strokeWidth).toBeGreaterThanOrEqual(1);
  expect(accentState.backgroundImage).toContain('radial-gradient');

  const quietZone = page.getByTestId('trama-hero-quiet-zone');
  await expect(quietZone).toBeVisible();
  const quietZoneState = await quietZone.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      maskImage: style.maskImage || style.getPropertyValue('-webkit-mask-image'),
    };
  });
  expect(quietZoneState.backgroundImage).toContain('radial-gradient');
  expect(quietZoneState.maskImage).toContain('radial-gradient');

  if (testInfo.project.name !== 'L') {
    await expect(accent).toHaveCSS('display', 'block');
    const heroOffsetY = await page.locator('.trama-hero-composition').evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      return new DOMMatrixReadOnly(transform).m42;
    });
    expect(heroOffsetY).toBeLessThanOrEqual(-32);
  }

  const expectedBackground = EXPECTED_BACKGROUND[testInfo.project.name];
  const visual = page.locator('img.trama-media-visual');
  await expect.poll(async () => visual.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    expectedBackground,
  );
  await expect.poll(async () => visual.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready;
  });
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
  });

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, `gateway-complete-${testInfo.project.name}.png`),
    fullPage: false,
  });
});
