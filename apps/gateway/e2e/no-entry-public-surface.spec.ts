import { expect, test } from '@playwright/test';

test('public Gateway stays visible and professional entry fails closed without a destination', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const unavailableEntries = page.getByRole('button', { name: 'Accesso in preparazione' });
  await expect(unavailableEntries).toHaveCount(2);
  await expect(unavailableEntries.first()).toBeVisible();
  await expect(unavailableEntries.first()).toBeDisabled();
  await expect(unavailableEntries.first()).toHaveAttribute('aria-disabled', 'true');
  await expect(unavailableEntries.nth(1)).toBeVisible();
  await expect(unavailableEntries.nth(1)).toBeDisabled();
  await expect(unavailableEntries.nth(1)).toHaveAttribute('aria-disabled', 'true');

  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Accedi' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Entra in TRAMA' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accedi' })).toHaveCount(0);

  await expect(page.getByRole('link', { name: 'Ecosistema' })).toHaveAttribute('href', '#ecosistema');
  await expect(page.getByRole('link', { name: 'Curricolo' })).toHaveAttribute('href', '#curricolo');
  await expect(page.getByRole('link', { name: 'Guida' })).toHaveAttribute('href', '#guida');
  await expect(page.locator('#ecosistema')).toHaveCount(1);
  await expect(page.locator('#curricolo')).toHaveCount(1);
  await expect(page.locator('#guida')).toHaveCount(1);

  await page.screenshot({
    path: 'test-results/evidence/gateway-no-entry-L.png',
    fullPage: true,
  });

  expect(pageErrors).toEqual([]);
});
