import { randomBytes } from 'node:crypto';

export const PKCE_COOKIE_NAME = '__Host-trama_access_pkce';
const PKCE_MAX_AGE_SECONDS = 3600;
const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;

export function createPkceVerifier(): string {
  return randomBytes(32).toString('base64url');
}

export function isPkceVerifier(value: string): boolean {
  return PKCE_VERIFIER_PATTERN.test(value);
}

export function readPkceVerifier(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  for (const segment of cookie.split(';')) {
    const index = segment.indexOf('=');
    if (index < 0) continue;
    const name = segment.slice(0, index).trim();
    if (name !== PKCE_COOKIE_NAME) continue;
    const value = segment.slice(index + 1).trim();
    return isPkceVerifier(value) ? value : null;
  }
  return null;
}

export function serializePkceVerifierCookie(verifier: string): string {
  if (!isPkceVerifier(verifier)) throw new Error('PKCE_VERIFIER_INVALID');
  return `${PKCE_COOKIE_NAME}=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${PKCE_MAX_AGE_SECONDS}`;
}

export function clearPkceVerifierCookie(): string {
  return `${PKCE_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
