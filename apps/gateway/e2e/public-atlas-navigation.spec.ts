import { expect, test } from '@playwright/test';

const atlas = 'https://antoniocorsano-boop.github.io/Curriculum-Atlas/curricolo/';

// Deterministic destination fixture: not a claim about the live Atlas deployment.
for (const profile of ['atelier', 'studio-classico', 'orizzonte'] as const) {
  test(`public Atlas navigation and native return preserve ${profile}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let visits = 0;
    await page.route(atlas, route => {
      visits++;
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="it"><title>Atlas fixture</title><h1>Curricolo di prova</h1></html>' });
    });
    await page.goto(`/?ambiente=${profile}#curricolo`);
    const start = page.url();
    const link = page.getByRole('link', { name: 'Consulta il curricolo in Atlas' });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', atlas);
    expect(await link.getAttribute('target')).toBeNull();
    expect(visits).toBe(0);
    await link.focus();
    await expect(link).toBeFocused();
    const fits = await link.evaluate(el => el.scrollWidth <= el.clientWidth + 1);
    expect(fits).toBe(true);
    await link.press('Enter');
    await expect(page).toHaveURL(atlas);
    await expect(page.getByRole('heading', { name: 'Curricolo di prova' })).toBeVisible();
    expect(visits).toBe(1);
    await page.goBack();
    await expect(page).toHaveURL(start);
    await expect(page.locator('.trama-gateway-stage')).toHaveAttribute('data-visual-profile', profile);
    await expect(link).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveAttribute('href', '/ecosistema');
  });
}
