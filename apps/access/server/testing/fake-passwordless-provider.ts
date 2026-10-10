import type { VerifiedProviderIdentity } from '../domain/types.js';
import {
  PasswordlessAccessDeniedError,
  PasswordlessProviderUnavailableError,
  type PasswordlessProvider,
  type ProviderCookie,
  type ProviderCookieJar,
} from '../ports/passwordless-provider.js';

export { PasswordlessAccessDeniedError, PasswordlessProviderUnavailableError };

export class MemoryProviderCookieJar implements ProviderCookieJar {
  private readonly cookies = new Map<string, ProviderCookie>();

  constructor(initial: ProviderCookie[] = []) {
    this.setAll(initial);
  }

  getAll(): ProviderCookie[] {
    return [...this.cookies.values()].map((cookie) => ({
      ...cookie,
      options: cookie.options ? { ...cookie.options } : undefined,
    }));
  }

  setAll(cookies: ProviderCookie[]): void {
    for (const cookie of cookies) {
      if (cookie.options?.maxAge === 0 || cookie.value === '') {
        this.cookies.delete(cookie.name);
        continue;
      }
      this.cookies.set(cookie.name, {
        ...cookie,
        options: cookie.options ? { ...cookie.options } : undefined,
      });
    }
  }
}

export class FakePasswordlessProvider implements PasswordlessProvider {
  requestFailure: Error | undefined;
  callbackFailure: Error | undefined;
  identity: VerifiedProviderIdentity = {
    issuer: 'https://project-ref.supabase.co/auth/v1',
    subject: 'subject-a',
  };
  readonly requestCalls: Array<{ email: string; redirectTo: string }> = [];
  readonly completeCalls: string[] = [];
  clearCalls = 0;

  async requestSignIn(email: string, redirectTo: string, _cookies: ProviderCookieJar): Promise<void> {
    this.requestCalls.push({ email, redirectTo });
    if (this.requestFailure) throw this.requestFailure;
  }

  async completeSignIn(code: string, _cookies: ProviderCookieJar): Promise<VerifiedProviderIdentity> {
    this.completeCalls.push(code);
    if (this.callbackFailure) throw this.callbackFailure;
    return { ...this.identity };
  }

  async clearTransientAuth(cookies: ProviderCookieJar): Promise<void> {
    this.clearCalls += 1;
    const deletions = cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith('sb-'))
      .map((cookie) => ({
        name: cookie.name,
        value: '',
        options: { ...cookie.options, path: cookie.options?.path ?? '/', maxAge: 0 },
      }));
    cookies.setAll(deletions);
  }
}
