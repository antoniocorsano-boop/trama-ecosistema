export const ACCESS_SESSION_COOKIE = '__Host-trama_access_session';
export function serializeAccessSessionCookie(secret: string): string {
  return `${ACCESS_SESSION_COOKIE}=${secret}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Lax`;
}
export function clearAccessSessionCookie(): string {
  return `${ACCESS_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
export function readAccessSessionSecret(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ACCESS_SESSION_COOKIE) return rest.join('=') || null;
  }
  return null;
}
