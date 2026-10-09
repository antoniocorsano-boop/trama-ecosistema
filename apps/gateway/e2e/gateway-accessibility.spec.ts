import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';
const EVIDENCE_DIR = path.resolve(process.cwd(), 'test-results/evidence');

function writeEvidence(name: string, data: unknown) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

function hasVisibleFocus(style: { outlineStyle: string; outlineWidth: string; boxShadow: string }): boolean {
  const outlineVisible = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
  const shadowVisible = style.boxShadow !== 'none';
  return outlineVisible || shadowVisible;
}

test.beforeEach(async ({ page }) => {
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');
});

test('gateway has no serious or critical automated accessibility violations', async ({ page }, testInfo) => {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  if (testInfo.project.name === 'L') {
    writeEvidence('axe-L.json', {
      result: blocking.length ? 'FAIL' : 'PASS',
      seriousOrCritical: blocking.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
    });
  }
  expect(blocking).toEqual([]);
});

test('keyboard focus is visibly perceivable on gateway controls', async ({ page }, testInfo) => {
  test.skip(!['S', 'L'].includes(testInfo.project.name), 'Keyboard evidence is sampled on compact and desktop compositions.');

  await page.keyboard.press('Tab');
  const first = page.locator(':focus');
  await expect(first).toBeVisible();
  const firstStyle = await first.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  });
  expect(hasVisibleFocus(firstStyle)).toBe(true);

  let reachedPrimaryAccess = false;
  let primaryFocusVisible = false;
  for (let index = 0; index < 8; index += 1) {
    const focusedText = await page.locator(':focus').textContent();
    if (focusedText?.includes('Accedi')) {
      reachedPrimaryAccess = true;
      const style = await page.locator(':focus').evaluate((element) => {
        const computed = getComputedStyle(element);
        return { outlineStyle: computed.outlineStyle, outlineWidth: computed.outlineWidth, boxShadow: computed.boxShadow };
      });
      primaryFocusVisible = hasVisibleFocus(style);
      expect(primaryFocusVisible).toBe(true);
      break;
    }
    await page.keyboard.press('Tab');
  }
  expect(reachedPrimaryAccess).toBe(true);
  if (testInfo.project.name === 'L') {
    writeEvidence('keyboard-focus-L.json', {
      result: reachedPrimaryAccess && primaryFocusVisible ? 'PASS' : 'FAIL',
      reachedPrimaryAccess,
      visibleFocus: primaryFocusVisible,
    });
  }
});

test('200% text resize reflows without horizontal page overflow or loss of primary action', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'LIM', 'Text-resize evidence uses the governed 320 CSS px reflow condition.');
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const overflow = dimensions.scrollWidth > dimensions.clientWidth;
  writeEvidence('text-resize-LIM.json', {
    result: overflow ? 'FAIL' : 'PASS',
    percent: 200,
    scrollWidth: dimensions.scrollWidth,
    clientWidth: dimensions.clientWidth,
    overflow,
  });
  expect(overflow).toBe(false);
});
