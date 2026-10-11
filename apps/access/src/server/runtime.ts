import { loadAccessConfig, type AccessConfig } from '../config/access-config.ts';
import { APPLICATION_REGISTRY, type ApplicationRegistryEntry } from '../config/application-registry.ts';
import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { SessionStore } from '../ports/session-store.ts';
import type { RateLimiter } from '../ports/rate-limiter.ts';
import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import { InMemoryIdentityRepository } from '../testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../testing/in-memory-session-store.ts';
import { InMemoryRateLimiter } from '../testing/in-memory-rate-limiter.ts';
import { FakeAuthProvider } from '../testing/fake-auth-provider.ts';

export interface AccessRuntime {
  config: AccessConfig;
  identityRepository: IdentityRepository;
  sessionStore: SessionStore;
  rateLimiter: RateLimiter;
  authProvider: AuthProviderAdapter;
  applicationRegistry: readonly ApplicationRegistryEntry[];
  now: () => Date;
}
class DisabledProvider implements AuthProviderAdapter {
  async checkAvailability() { return false; }
  async requestEmailOtp() { throw new Error('PROVIDER_UNAVAILABLE'); }
  async verifyEmailOtp() { throw new Error('PROVIDER_UNAVAILABLE'); }
}
let cached: AccessRuntime | null = null;
export function getRuntime(): AccessRuntime {
  if (cached) return cached;
  const config = loadAccessConfig(process.env);
  if (config.providerKind === 'supabase' || config.storeKind === 'supabase') {
    throw new Error('SUPABASE_ADAPTER_NOT_AUTHORIZED');
  }
  const identityRepository = new InMemoryIdentityRepository();
  const sessionStore = new InMemorySessionStore();
  const rateLimiter = new InMemoryRateLimiter();
  const authProvider = config.providerKind === 'fake'
    ? new FakeAuthProvider({ issuer: 'test-issuer', subject: 'test-subject', email: 'pilot@example.test', otp: process.env.ACCESS_TEST_OTP ?? '123456' })
    : new DisabledProvider();
  cached = { config, identityRepository, sessionStore, rateLimiter, authProvider, applicationRegistry: APPLICATION_REGISTRY, now: () => new Date() };
  return cached;
}
