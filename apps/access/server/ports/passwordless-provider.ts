import type { VerifiedProviderIdentity } from '../domain/types.js';

export type ProviderCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  secure?: boolean;
};

export type ProviderCookie = {
  name: string;
  value: string;
  options?: ProviderCookieOptions;
};

export interface ProviderCookieJar {
  getAll(): ProviderCookie[];
  setAll(cookies: ProviderCookie[]): void;
}

export interface PasswordlessProvider {
  requestSignIn(email: string, redirectTo: string, cookies: ProviderCookieJar): Promise<void>;
  completeSignIn(code: string, cookies: ProviderCookieJar): Promise<VerifiedProviderIdentity>;
  clearTransientAuth(cookies: ProviderCookieJar): Promise<void>;
}

export class PasswordlessAccessDeniedError extends Error {
  constructor(message = 'PASSWORDLESS_ACCESS_DENIED') {
    super(message);
    this.name = 'PasswordlessAccessDeniedError';
  }
}

export class PasswordlessProviderUnavailableError extends Error {
  constructor(message = 'PASSWORDLESS_PROVIDER_UNAVAILABLE') {
    super(message);
    this.name = 'PasswordlessProviderUnavailableError';
  }
}
