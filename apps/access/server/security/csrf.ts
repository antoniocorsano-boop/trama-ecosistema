import { randomBytes, timingSafeEqual } from 'node:crypto';

export const CSRF_COOKIE_NAME = 'trama_access_csrf';

export function createCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

export function verifyMutationRequest(
  origin: string | undefined,
  expectedOrigin: string,
  cookieToken: string | undefined,
  headerToken: string | undefined,
): boolean {
  if (origin !== expectedOrigin || !cookieToken || !headerToken) return false;

  const cookie = Buffer.from(cookieToken, 'utf8');
  const header = Buffer.from(headerToken, 'utf8');
  if (cookie.byteLength !== header.byteLength) return false;

  return timingSafeEqual(cookie, header);
}
