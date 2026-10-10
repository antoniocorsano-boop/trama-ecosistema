import { describe, expect, it } from 'vitest';
import { CSRF_COOKIE_NAME, createCsrfToken, verifyMutationRequest } from './csrf';

const expectedOrigin = 'https://access.trama.example';

describe('TRAMA Access CSRF boundary', () => {
  it('uses the dedicated non-authoritative CSRF cookie name and a strong random token', () => {
    expect(CSRF_COOKIE_NAME).toBe('trama_access_csrf');
    const a = createCsrfToken();
    const b = createCsrfToken();
    expect(Buffer.from(a, 'base64url').byteLength).toBeGreaterThanOrEqual(32);
    expect(b).not.toBe(a);
  });

  it.each([
    [undefined, 'token', 'token'],
    ['https://evil.example', 'token', 'token'],
    ['https://access.trama.example.evil.test', 'token', 'token'],
    [expectedOrigin, undefined, 'token'],
    [expectedOrigin, 'token', undefined],
    [expectedOrigin, 'cookie-token', 'header-token'],
  ] as const)('rejects missing or mismatched origin/token inputs', (origin, cookieToken, headerToken) => {
    expect(verifyMutationRequest(origin, expectedOrigin, cookieToken, headerToken)).toBe(false);
  });

  it('accepts only exact Origin plus equal double-submit token', () => {
    const token = createCsrfToken();
    expect(verifyMutationRequest(expectedOrigin, expectedOrigin, token, token)).toBe(true);
  });
});
