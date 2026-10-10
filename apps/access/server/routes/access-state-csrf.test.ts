import { describe, expect, it } from 'vitest';
import { buildAccessServer } from '../app';
import { CSRF_COOKIE_NAME } from '../security/csrf';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';
import { FakePasswordlessProvider } from '../testing/fake-passwordless-provider';

function app() {
  return buildAccessServer({
    repository: new InMemoryAccessRepository(),
    passwordlessProvider: new FakePasswordlessProvider(),
    publicOrigin: 'https://access.trama.example',
    allowedIssuer: 'https://project-ref.supabase.co/auth/v1',
  });
}

describe('GET /api/access-state CSRF bootstrap', () => {
  it('issues a readable secure SameSite CSRF cookie when one is absent', async () => {
    const response = await app().inject({ method: 'GET', url: '/api/access-state' });
    const serialized = JSON.stringify(response.headers['set-cookie'] ?? '');

    expect(serialized).toContain(`${CSRF_COOKIE_NAME}=`);
    expect(serialized).toContain('Secure');
    expect(serialized).toContain('SameSite=Lax');
    expect(serialized).toContain('Path=/');
    expect(serialized).not.toContain('HttpOnly');
  });

  it('does not rotate a present CSRF cookie on ordinary state reads', async () => {
    const token = 'a'.repeat(43);
    const response = await app().inject({
      method: 'GET',
      url: '/api/access-state',
      headers: { cookie: `${CSRF_COOKIE_NAME}=${token}` },
    });
    expect(JSON.stringify(response.headers['set-cookie'] ?? '')).not.toContain(`${CSRF_COOKIE_NAME}=`);
  });
});
