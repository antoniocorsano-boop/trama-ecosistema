import { describe, expect, it } from 'vitest';
import { buildAccessServer } from '../app';
import { issueSession } from '../domain/session-service';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';
import { FakePasswordlessProvider } from '../testing/fake-passwordless-provider';
import { ACCESS_FLASH_COOKIE_NAME } from './auth-routes';
import { SESSION_COOKIE_NAME } from '../security/session-cookie';

const origin = 'https://access.trama.example';
const issuer = 'https://project-ref.supabase.co/auth/v1';
const principalId = '00000000-0000-4000-8000-000000000001';
const fixedNow = new Date('2026-10-10T10:00:00.000Z');

function build(repository = new InMemoryAccessRepository(), now = () => fixedNow) {
  return buildAccessServer({
    repository,
    passwordlessProvider: new FakePasswordlessProvider(),
    publicOrigin: origin,
    allowedIssuer: issuer,
    now,
  });
}

async function activePrincipal(repository: InMemoryAccessRepository) {
  return repository.createPrincipal({ issuer, subject: 'subject-a' }, principalId);
}

function cookieHeader(name: string, value: string): string {
  return `${name}=${value}`;
}

describe('GET /api/access-state', () => {
  it('returns SIGNED_OUT when there is no Access session or flash', async () => {
    const response = await build().inject({ method: 'GET', url: '/api/access-state' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ state: 'SIGNED_OUT' });
  });

  it('consumes request-link success flash as MAGIC_LINK_SENT', async () => {
    const response = await build().inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(ACCESS_FLASH_COOKIE_NAME, 'MAGIC_LINK_SENT') },
    });
    expect(response.json()).toEqual({ state: 'MAGIC_LINK_SENT' });
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).toContain(`${ACCESS_FLASH_COOKIE_NAME}=`);
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).toContain('Max-Age=0');
  });

  it('consumes AUTHENTICATED flash once, then resolves to launcher state using the same session', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    const session = await issueSession(principalId, fixedNow, repository);
    const app = build(repository);

    const first = await app.inject({
      method: 'GET',
      url: '/api/access-state',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.secret}; ${ACCESS_FLASH_COOKIE_NAME}=AUTHENTICATED`,
      },
    });
    expect(first.json()).toMatchObject({ state: 'AUTHENTICATED', principalId });

    const second = await app.inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(second.json()).toMatchObject({ state: 'NO_ENTITLEMENTS', principalId, launcher: [] });
  });

  it('returns NO_ENTITLEMENTS for a valid session without active entitlement', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    const session = await issueSession(principalId, fixedNow, repository);

    const response = await build(repository).inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(response.json()).toMatchObject({ state: 'NO_ENTITLEMENTS', principalId, launcher: [] });
  });

  it('returns only active governed launcher items and no provider identity material', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    await repository.upsertEntitlement({
      principalId,
      application: 'DOCENTE_OS',
      entitlement: 'USE',
      status: 'ACTIVE',
    });
    const session = await issueSession(principalId, fixedNow, repository);

    const response = await build(repository).inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    const body = response.json();
    expect(body).toMatchObject({
      state: 'ENTITLEMENTS_AVAILABLE',
      principalId,
      launcher: [
        {
          application: 'DOCENTE_OS',
          entitlement: 'USE',
          availability: 'FEDERATION_PENDING',
        },
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/email|access_token|refresh_token|issuer|subject/i);
  });

  it('clears an expired session and returns SESSION_EXPIRED', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    const session = await issueSession(principalId, fixedNow, repository);

    const response = await build(repository, () => new Date('2026-10-10T18:00:00.001Z')).inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(response.json()).toEqual({ state: 'SESSION_EXPIRED' });
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).toContain('Max-Age=0');
  });

  it('clears a disabled principal session and returns ACCESS_DENIED', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    const session = await issueSession(principalId, fixedNow, repository);
    await repository.setPrincipalStatus(principalId, 'DISABLED');

    const response = await build(repository).inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(response.json()).toEqual({ state: 'ACCESS_DENIED' });
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).toContain('Max-Age=0');
  });

  it('drops a revoked entitlement on the next request without re-login', async () => {
    const repository = new InMemoryAccessRepository();
    await activePrincipal(repository);
    await repository.upsertEntitlement({
      principalId,
      application: 'DOCENTE_OS',
      entitlement: 'USE',
      status: 'ACTIVE',
    });
    const session = await issueSession(principalId, fixedNow, repository);
    const app = build(repository);

    const before = await app.inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(before.json().state).toBe('ENTITLEMENTS_AVAILABLE');

    await repository.revokeEntitlement(principalId, 'DOCENTE_OS');
    const after = await app.inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: cookieHeader(SESSION_COOKIE_NAME, session.secret) },
    });
    expect(after.json()).toMatchObject({ state: 'NO_ENTITLEMENTS', launcher: [] });
  });
});
