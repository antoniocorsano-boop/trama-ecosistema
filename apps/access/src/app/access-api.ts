import type { AccessState } from './access-state';

const CSRF_COOKIE_NAME = 'trama_access_csrf';

export function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(';')) {
    const candidate = part.trim();
    if (candidate.startsWith(prefix)) {
      return decodeURIComponent(candidate.slice(prefix.length));
    }
  }
  return null;
}

function mutationHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const csrf = readCookie(CSRF_COOKIE_NAME);
  if (!csrf) throw new Error('ACCESS_CSRF_UNAVAILABLE');
  return { ...extra, 'x-csrf-token': csrf };
}

async function readAccessState(response: Response): Promise<AccessState> {
  const data = (await response.json()) as unknown;
  if (!data || typeof data !== 'object' || typeof (data as { state?: unknown }).state !== 'string') {
    throw new Error('ACCESS_RESPONSE_INVALID');
  }
  return data as AccessState;
}

export const accessApi = {
  async getState(): Promise<AccessState> {
    const response = await fetch('/api/access-state', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error('ACCESS_STATE_UNAVAILABLE');
    return readAccessState(response);
  },

  async requestMagicLink(email: string): Promise<AccessState> {
    const response = await fetch('/api/auth/request-link', {
      method: 'POST',
      credentials: 'same-origin',
      headers: mutationHeaders({
        accept: 'application/json',
        'content-type': 'application/json',
      }),
      body: JSON.stringify({ email }),
    });
    return readAccessState(response);
  },

  async logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: mutationHeaders(),
    });
    if (response.status !== 204) throw new Error('ACCESS_LOGOUT_FAILED');
  },
};
