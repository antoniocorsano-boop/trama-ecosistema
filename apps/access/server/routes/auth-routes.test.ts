import { describe, expect, it } from 'vitest';
import { buildAccessServer } from '../app';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';
import {
  FakePasswordlessProvider,
  PasswordlessAccessDeniedError,
  PasswordlessProviderUnavailableError,
} from '../testing/fake-passwordless-provider';
import { createCsrfToken, CSRF_COOKIE_NAME } from '../security/csrf';
import { SESSION_COOKIE_NAME } from '../security/session-cookie';

const origin = 'https://access.trama.example';
const allowedIssuer = 'https://project-ref.supabase.co/auth/v1';
const neutralBody = { state: 'MAGIC_LINK_SENT' };

function mutationHeaders(csrf: string) {
  return {
    origin,
    'x-csrf-token': csrf,
    cookie: `${CSRF_COOKIE_NAME}=${csrf}`,
  };
}

function build(provider = new FakePasswordlessProvider()) {
  const repository = new InMemoryAccessRepository();
  const logs: string[] = [];
  const app = buildAccessServer({
    repository,
    passwordlessProvider: provider,
    publicOrigin: origin,
    allowedIssuer,
    logger: { error: (message: string) => logs.push(message) },
  });
  return { app, repository, provider, logs };
}

describe('POST /api/auth/request-link', () => {
  it.each([
    ['accepted', undefined],
    ['unknown', new PasswordlessAccessDeniedError()],
  ])('returns the same neutral 202 response for %s identities', async (_label, failure) => {
    const provider = new FakePasswordlessProvider();
    provider.requestFailure = failure;
    const { app } = build(provider);
    const csrf = createCsrfToken();

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/request-link',
      headers: mutationHeaders(csrf),
      payload: { email: 'pilot@example.invalid' },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual(neutralBody);
  });

  it('requires exact Origin and double-submit CSRF', async () => {
    const { app } = build();
    const csrf = createCsrfToken();

    for (const headers of [
      { 'x-csrf-token': csrf, cookie: `${CSRF_COOKIE_NAME}=${csrf}` },
      { origin: 'https://evil.example', 'x-csrf-token': csrf, cookie: `${CSRF_COOKIE_NAME}=${csrf}` },
      { origin, cookie: `${CSRF_COOKIE_NAME}=${csrf}` },
      { origin, 'x-csrf-token': csrf, cookie: `${CSRF_COOKIE_NAME}=different` },
    ]) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/request-link',
        headers,
        payload: { email: 'pilot@example.invalid' },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({ state: 'ACCESS_DENIED' });
    }
  });

  it('maps provider outage to a neutral provider-unavailable state without provider details', async () => {
    const provider = new FakePasswordlessProvider();
    provider.requestFailure = new PasswordlessProviderUnavailableError('smtp detail must not leak');
    const { app, logs } = build(provider);
    const csrf = createCsrfToken();

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/request-link',
      headers: mutationHeaders(csrf),
      payload: { email: 'pilot@example.invalid' },
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ state: 'PROVIDER_UNAVAILABLE' });
    expect(response.body).not.toMatch(/smtp|supabase|stack/i);
    expect(logs.join('\n')).not.toContain('pilot@example.invalid');
  });
});

describe('GET /auth/callback', () => {
  it('fails closed for missing or invalid/replayed code without creating a principal or session', async () => {
    for (const code of [undefined, 'invalid-code', 'replayed-code']) {
      const provider = new FakePasswordlessProvider();
      if (code) provider.callbackFailure = new PasswordlessAccessDeniedError();
      const { app, repository } = build(provider);

      const response = await app.inject({
        method: 'GET',
        url: code ? `/auth/callback?code=${code}` : '/auth/callback',
      });

      expect(response.statusCode).toBe(303);
      expect(response.headers.location).toBe('/');
      expect(repository.principalCount()).toBe(0);
      expect(response.headers['set-cookie'] ?? '').not.toContain(`${SESSION_COOKIE_NAME}=`);
    }
  });

  it.each([
    [{ issuer: '', subject: 'subject-a' }, 'empty issuer'],
    [{ issuer: allowedIssuer, subject: '' }, 'empty subject'],
    [{ issuer: 'https://other.example/auth/v1', subject: 'subject-a' }, 'unexpected issuer'],
  ])('rejects %s without fallback identity linking', async (identity) => {
    const provider = new FakePasswordlessProvider();
    provider.identity = identity;
    const { app, repository } = build(provider);

    const response = await app.inject({ method: 'GET', url: '/auth/callback?code=valid-code' });

    expect(response.statusCode).toBe(303);
    expect(response.headers.location).toBe('/');
    expect(repository.principalCount()).toBe(0);
    expect(response.headers['set-cookie'] ?? '').not.toContain(`${SESSION_COOKIE_NAME}=`);
  });

  it('provider verification failure creates no principal or Access session', async () => {
    const provider = new FakePasswordlessProvider();
    provider.callbackFailure = new PasswordlessProviderUnavailableError();
    const { app, repository } = build(provider);

    const response = await app.inject({ method: 'GET', url: '/auth/callback?code=valid-code' });

    expect(response.statusCode).toBe(303);
    expect(response.headers.location).toBe('/');
    expect(repository.principalCount()).toBe(0);
    expect(response.headers['set-cookie'] ?? '').not.toContain(`${SESSION_COOKIE_NAME}=`);
  });

  it('creates/reuses the verified principal, rotates Access session, clears provider cookies and redirects token-free', async () => {
    const provider = new FakePasswordlessProvider();
    provider.identity = { issuer: allowedIssuer, subject: 'subject-a' };
    const { app, repository } = build(provider);

    const response = await app.inject({ method: 'GET', url: '/auth/callback?code=valid-code' });

    expect(response.statusCode).toBe(303);
    expect(response.headers.location).toBe('/');
    expect(response.headers.location).not.toMatch(/token|code|session|jwt/i);
    expect(repository.principalCount()).toBe(1);
    expect(provider.completeCalls).toHaveLength(1);
    expect(provider.clearCalls).toBe(1);
    const cookies = response.headers['set-cookie'];
    expect(JSON.stringify(cookies)).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(JSON.stringify(cookies)).toContain('HttpOnly');
    expect(JSON.stringify(cookies)).toContain('Secure');
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the local session without depending on provider availability', async () => {
    const provider = new FakePasswordlessProvider();
    const { app, repository } = build(provider);
    const principal = await repository.createPrincipal(
      { issuer: allowedIssuer, subject: 'subject-a' },
      '00000000-0000-4000-8000-000000000001',
    );
    const { issueSession } = await import('../domain/session-service');
    const issued = await issueSession(principal.principalId, new Date(), repository);
    const csrf = createCsrfToken();

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: {
        ...mutationHeaders(csrf),
        cookie: `${CSRF_COOKIE_NAME}=${csrf}; ${SESSION_COOKIE_NAME}=${issued.secret}`,
      },
    });

    expect(response.statusCode).toBe(204);
    const { validateSession } = await import('../domain/session-service');
    await expect(validateSession(issued.secret, new Date(), repository)).resolves.toEqual({
      kind: 'INVALID',
      reason: 'REVOKED',
    });
    expect(provider.clearCalls).toBe(0);
  });
});
