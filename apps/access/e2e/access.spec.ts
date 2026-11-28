import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function requestMagicLink(page: Parameters<typeof test>[0] extends never ? never : any, email: string) {
  await page.getByLabel('Email professionale').fill(email);
  await page.getByRole('button', { name: 'Invia link di accesso' }).click();
  await expect(page.getByText('Controlla la tua email')).toBeVisible();
}

test('signed-out surface requests Magic Link and callback authenticates into non-federated launcher', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TRAMA Access' })).toBeVisible();
  await requestMagicLink(page, 'teacher@example.test');
  await page.goto('/auth/confirm?code=e2e-valid-code');
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toBeVisible();
  await expect(page.getByText('Docente OS')).toBeVisible();
  const card = page.getByRole('button', { name: /Docente OS/ });
  await expect(card).toBeDisabled();
  await expect(page.getByText('Connessione non ancora disponibile')).toBeVisible();
});

test('provider-valid callback without entitlement is denied before local session creation', async ({ page }) => {
  await page.goto('/');
  await requestMagicLink(page, 'empty@example.test');
  await page.goto('/auth/confirm?code=e2e-valid-code');
  await expect(page.getByText('Non è possibile completare l’accesso.')).toBeVisible();
  await expect(page.getByLabel('Email professionale')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toHaveCount(0);
});

test('invalid Magic Link and provider unavailable remain non-technical', async ({ page }) => {
  await page.goto('/auth/confirm');
  await expect(page.getByText('Il link di accesso non è valido o è scaduto.')).toBeVisible();

  await page.route('**/api/auth/request-magic-link', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ status: 'PROVIDER_UNAVAILABLE' }) }));
  await page.goto('/');
  await page.getByLabel('Email professionale').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Invia link di accesso' }).click();
  await expect(page.getByText('Accesso temporaneamente non disponibile. Riprova più tardi.')).toBeVisible();
});

test('invalid existing session is presented as expired and logout clears a valid Magic Link session', async ({ page, context }) => {
  await context.addCookies([{ name: '__Host-trama_access_session', value: 'invalid', url: 'https://localhost:3100', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await page.goto('/');
  await expect(page.getByText('La sessione è scaduta. Accedi di nuovo.')).toBeVisible();
  await context.clearCookies();
  await page.goto('/');
  await requestMagicLink(page, 'teacher@example.test');
  await page.goto('/auth/confirm?code=e2e-valid-code');
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toBeVisible();
  await page.getByRole('button', { name: 'Esci' }).click();
  await expect(page.getByLabel('Email professionale')).toBeVisible();
});

test('signed-out and launcher surfaces have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await requestMagicLink(page, 'teacher@example.test');
  await page.goto('/auth/confirm?code=e2e-valid-code');
  await expect(page.getByRole('heading', { name: 'Le tue applicazioni' })).toBeVisible();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});
