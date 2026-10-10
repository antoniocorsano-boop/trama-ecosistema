import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { accessApi, readCookie } from './access-api';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  document.cookie = 'trama_access_csrf=csrf-token; Path=/';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TRAMA Access same-origin API client', () => {
  it('reads only the dedicated CSRF cookie value', () => {
    document.cookie = 'unrelated=value; Path=/';
    expect(readCookie('trama_access_csrf')).toBe('csrf-token');
    expect(readCookie('missing')).toBeNull();
  });

  it('loads state from the same-origin canonical endpoint with credentials included', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ state: 'SIGNED_OUT' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(accessApi.getState()).resolves.toEqual({ state: 'SIGNED_OUT' });
    expect(fetchMock).toHaveBeenCalledWith('/api/access-state', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    });
  });

  it('sends the CSRF token in X-CSRF-Token for passwordless request without storing auth material', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ state: 'MAGIC_LINK_SENT' }), {
        status: 202,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const localStorageSet = vi.spyOn(Storage.prototype, 'setItem');

    await expect(accessApi.requestMagicLink('pilot@example.invalid')).resolves.toEqual({
      state: 'MAGIC_LINK_SENT',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/request-link', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-csrf-token': 'csrf-token',
      },
      body: JSON.stringify({ email: 'pilot@example.invalid' }),
    });
    expect(localStorageSet).not.toHaveBeenCalled();
  });

  it('sends logout as a CSRF-protected same-origin mutation and stores no session token', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const sessionStorageSet = vi.spyOn(Storage.prototype, 'setItem');

    await expect(accessApi.logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'x-csrf-token': 'csrf-token' },
    });
    expect(sessionStorageSet).not.toHaveBeenCalled();
  });

  it('fails closed if the CSRF cookie is unavailable for a mutation', async () => {
    document.cookie = 'trama_access_csrf=; Max-Age=0; Path=/';
    await expect(accessApi.requestMagicLink('pilot@example.invalid')).rejects.toThrow(
      'ACCESS_CSRF_UNAVAILABLE',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
