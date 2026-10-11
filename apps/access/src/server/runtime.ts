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
import { createSupabaseServerClient } from '../infrastructure/supabase/supabase-client.ts';
import { SupabaseAuthProvider } from '../infrastructure/supabase/supabase-auth-provider.ts';
import { SupabaseIdentityRepository } from '../infrastructure/supabase/supabase-identity-repository.ts';
import { SupabaseSessionStore } from '../infrastructure/supabase/supabase-session-store.ts';
import { SupabaseRateLimiter } from '../infrastructure/supabase/supabase-rate-limiter.ts';
import type { SupabaseRpcClientLike } from '../infrastructure/supabase/supabase-rpc.ts';

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
  async checkAvailability(_input: { signal: AbortSignal }): Promise<boolean> { return false; }
  async requestEmailOtp(_input: { email: string; signal: AbortSignal }): Promise<void> { throw new Error('PROVIDER_UNAVAILABLE'); }
  async verifyEmailOtp(_input: { email: string; otp: string; signal: AbortSignal }): Promise<VerifiedExternalIdentity> { throw new Error('PROVIDER_UNAVAILABLE'); }
}

declare global {
  var __tramaAccessPhase2Runtime: AccessRuntime | undefined;
}

function requiredSupabaseConfig(env: NodeJS.ProcessEnv): { url: string; secretKey: string; issuer: string } {
  const rawUrl = env.ACCESS_SUPABASE_URL?.trim();
  const secretKey = env.ACCESS_SUPABASE_SECRET_KEY?.trim();
  if (!rawUrl || !secretKey) throw new Error('SUPABASE_CONFIG_MISSING');
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('SUPABASE_URL_INVALID');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('SUPABASE_URL_INVALID');
  }
  const normalizedUrl = url.origin;
  return { url: normalizedUrl, secretKey, issuer: `${normalizedUrl}/auth/v1` };
}

function createAvailabilityProbe(
  url: string,
  secretKey: string,
  fetchImpl: typeof fetch,
): (signal: AbortSignal) => Promise<boolean> {
  return async (signal) => {
    if (signal.aborted) return false;
    try {
      const response = await fetchImpl(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal,
      });
      return response.ok;
    } catch {
      return false;
    }
  };
}

export function createAccessRuntime(env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): AccessRuntime {
  const config = loadAccessConfig(env);
  const e2eSeed = env.ACCESS_E2E_SEED === '1' && config.providerKind === 'fake' && config.storeKind === 'memory';

  if (config.providerKind === 'supabase' && config.storeKind === 'supabase') {
    const live = requiredSupabaseConfig(env);
    const rpcClient = createSupabaseServerClient({ url: live.url, secretKey: live.secretKey }) as unknown as SupabaseRpcClientLike;
    const identityRepository = new SupabaseIdentityRepository(rpcClient);
    const sessionStore = new SupabaseSessionStore(rpcClient);
    const rateLimiter = new SupabaseRateLimiter(rpcClient);
    const authProvider = new SupabaseAuthProvider({
      issuer: live.issuer,
      createClientForSignal: (signal) => createSupabaseServerClient({ url: live.url, secretKey: live.secretKey, signal }),
      availabilityProbe: createAvailabilityProbe(live.url, live.secretKey, fetchImpl),
    });
    return { config, identityRepository, sessionStore, rateLimiter, authProvider, applicationRegistry: APPLICATION_REGISTRY, now: () => new Date() };
  }

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
        issuer: 'test-issuer', subject: 'test-subject', email: 'pilot@example.test', otp: env.ACCESS_TEST_OTP ?? '123456',
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
  const runtime = createAccessRuntime(process.env);
  if (runtime.config.nodeEnv !== 'production') globalThis.__tramaAccessPhase2Runtime = runtime;
  return runtime;
}
