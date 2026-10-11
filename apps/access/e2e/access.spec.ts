import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('signed-out surface requests OTP and authenticates into non-federated launcher', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TRAMA Access' })).toBeVisible();
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await expect(page.getByText('Codice inviato')).toBeVisible();
  await page.getByLabel('Codice OTP').fill('123456');
  await page.getByRole('button', { name: 'Verifica codice' }).click();
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toBeVisible();
  await expect(page.getByText('Docente OS')).toBeVisible();
  const card = page.getByRole('button', { name: /Docente OS/ });
  await expect(card).toBeDisabled();
  await expect(page.getByText('Connessione non ancora disponibile')).toBeVisible();
});

test('zero-entitlement principal sees safe empty launcher', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email professionale').fill('empty@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await page.getByLabel('Codice OTP').fill('123456');
  await page.getByRole('button', { name: 'Verifica codice' }).click();
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toBeVisible();
  await expect(page.getByText('Nessuna applicazione disponibile per questo contesto.')).toBeVisible();
});

test('wrong OTP and provider unavailable are non-technical', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await page.getByLabel('Codice OTP').fill('000000');
  await page.getByRole('button', { name: 'Verifica codice' }).click();
  await expect(page.getByText('Codice non valido o scaduto.')).toBeVisible();

  await page.route('**/api/auth/request-otp', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ status: 'PROVIDER_UNAVAILABLE' }) }));
  await page.goto('/');
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await expect(page.getByText('Accesso temporaneamente non disponibile. Riprova più tardi.')).toBeVisible();
});

test('invalid existing session is presented as expired and logout clears a valid session', async ({ page, context }) => {
  await context.addCookies([{ name: '__Host-trama_access_session', value: 'invalid', url: 'https://localhost:3100', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await page.goto('/');
  await expect(page.getByText('La sessione è scaduta. Accedi di nuovo.')).toBeVisible();
  await context.clearCookies();
  await page.goto('/');
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await page.getByLabel('Codice OTP').fill('123456');
  await page.getByRole('button', { name: 'Verifica codice' }).click();
  await page.getByRole('button', { name: 'Esci' }).click();
  await expect(page.getByLabel('Email professionale')).toBeVisible();
});

test('signed-out and launcher surfaces have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia codice' }).click();
  await page.getByLabel('Codice OTP').fill('123456');
  await page.getByRole('button', { name: 'Verifica codice' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});
