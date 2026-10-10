import { expect, test } from '@playwright/test';

test('public Gateway stays visible and professional entry fails closed without a destination', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const heroEntry = page.getByRole('button', { name: 'Entra in TRAMA' });
  await expect(heroEntry).toBeVisible();
  await expect(heroEntry).toBeDisabled();
  await expect(heroEntry).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('link', { name: 'Entra in TRAMA' })).toHaveCount(0);

  const navEntry = page.getByRole('button', { name: 'Accedi' });
  await expect(navEntry).toBeVisible();
  await expect(navEntry).toBeDisabled();
  await expect(navEntry).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('link', { name: 'Accedi' })).toHaveCount(0);

  await expect(page.getByRole('link', { name: 'Ecosistema' })).toHaveAttribute('href', '#ecosistema');
  await expect(page.getByRole('link', { name: 'Curricolo' })).toHaveAttribute('href', '#curricolo');
  await expect(page.getByRole('link', { name: 'Guida' })).toHaveAttribute('href', '#guida');
  await expect(page.locator('#ecosistema')).toHaveCount(1);
  await expect(page.locator('#curricolo')).toHaveCount(1);
  await expect(page.locator('#guida')).toHaveCount(1);

  expect(pageErrors).toEqual([]);
});
