import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIDEO_HOST = 'https://d8j0ntlcm91z4.cloudfront.net/**';

function hasVisibleFocus(style: { outlineStyle: string; outlineWidth: string; boxShadow: string }): boolean {
  const outlineVisible = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
  const shadowVisible = style.boxShadow !== 'none';
  return outlineVisible || shadowVisible;
}

test.beforeEach(async ({ page }) => {
  await page.route(VIDEO_HOST, (route) => route.abort());
  await page.goto('/');
});

test('gateway has no serious or critical automated accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
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
  for (let index = 0; index < 8; index += 1) {
    const focusedText = await page.locator(':focus').textContent();
    if (focusedText?.includes('Accedi')) {
      reachedPrimaryAccess = true;
      const style = await page.locator(':focus').evaluate((element) => {
        const computed = getComputedStyle(element);
        return { outlineStyle: computed.outlineStyle, outlineWidth: computed.outlineWidth, boxShadow: computed.boxShadow };
      });
      expect(hasVisibleFocus(style)).toBe(true);
      break;
    }
    await page.keyboard.press('Tab');
  }
  expect(reachedPrimaryAccess).toBe(true);
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
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
