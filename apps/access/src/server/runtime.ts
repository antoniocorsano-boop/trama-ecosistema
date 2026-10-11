import { loadAccessConfig, type AccessConfig } from '../config/access-config.ts';
import { APPLICATION_REGISTRY, type ApplicationRegistryEntry } from '../config/application-registry.ts';
import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { SessionStore } from '../ports/session-store.ts';
import type { RateLimiter } from '../ports/rate-limiter.ts';
import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../domain/types.ts';
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
  async checkAvailability(): Promise<boolean> { return false; }
  async requestEmailOtp(_input: { email: string }): Promise<void> { throw new Error('PROVIDER_UNAVAILABLE'); }
  async verifyEmailOtp(_input: { email: string; otp: string }): Promise<VerifiedExternalIdentity> { throw new Error('PROVIDER_UNAVAILABLE'); }
}

declare global {
  var __tramaAccessPhase2Runtime: AccessRuntime | undefined;
}

function createRuntime(): AccessRuntime {
  const config = loadAccessConfig(process.env);
  if (config.providerKind === 'supabase' || config.storeKind === 'supabase') throw new Error('SUPABASE_ADAPTER_NOT_AUTHORIZED');
  const e2eSeed = process.env.ACCESS_E2E_SEED === '1' && config.providerKind === 'fake' && config.storeKind === 'memory';
  const identityRepository = e2eSeed ? new InMemoryIdentityRepository({
    principals: [
      { principalId: 'p-teacher', status: 'ACTIVE' },
      { principalId: 'p-empty', status: 'ACTIVE' },
    ],
    aliases: [
      { aliasId: 'a-teacher', principalId: 'p-teacher', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'test-issuer', providerSubject: 'subject-teacher', pilotAllowed: true },
      { aliasId: 'a-empty', principalId: 'p-empty', kind: 'EMAIL', normalizedValue: 'empty@example.test', status: 'ACTIVE', providerIssuer: 'test-issuer', providerSubject: 'subject-empty', pilotAllowed: true },
    ],
    contexts: [
      { contextId: 'ctx-teacher', principalId: 'p-teacher', contextType: 'INSTITUTION', institutionRef: 'inst:test', status: 'ACTIVE' },
      { contextId: 'ctx-empty', principalId: 'p-empty', contextType: 'INSTITUTION', institutionRef: 'inst:test', status: 'ACTIVE' },
    ],
    entitlements: [
      { entitlementId: 'e-teacher-docente', principalId: 'p-teacher', contextId: 'ctx-teacher', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-01-01T00:00:00Z') },
    ],
  }) : new InMemoryIdentityRepository();
  const sessionStore = new InMemorySessionStore();
  const rateLimiter = new InMemoryRateLimiter();
  const authProvider: AuthProviderAdapter = config.providerKind === 'fake'
    ? new FakeAuthProvider({
        issuer: 'test-issuer', subject: 'test-subject', email: 'pilot@example.test', otp: process.env.ACCESS_TEST_OTP ?? '123456',
        identities: e2eSeed ? {
          'teacher@example.test': { subject: 'subject-teacher', email: 'teacher@example.test' },
          'empty@example.test': { subject: 'subject-empty', email: 'empty@example.test' },
        } : undefined,
      })
    : new DisabledProvider();
  return { config, identityRepository, sessionStore, rateLimiter, authProvider, applicationRegistry: APPLICATION_REGISTRY, now: () => new Date() };
}

export function getRuntime(): AccessRuntime {
  if (globalThis.__tramaAccessPhase2Runtime) return globalThis.__tramaAccessPhase2Runtime;
  const runtime = createRuntime();
  if (runtime.config.nodeEnv !== 'production') globalThis.__tramaAccessPhase2Runtime = runtime;
  return runtime;
}
