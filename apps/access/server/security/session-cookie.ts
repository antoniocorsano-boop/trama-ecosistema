export const SESSION_COOKIE_NAME = 'trama_access_session';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 28_800,
} as const;
