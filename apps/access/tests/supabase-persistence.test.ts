import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseIdentityRepository } from '../src/infrastructure/supabase/supabase-identity-repository.ts';
import { SupabaseSessionStore } from '../src/infrastructure/supabase/supabase-session-store.ts';
import { SupabaseRateLimiter } from '../src/infrastructure/supabase/supabase-rate-limiter.ts';
import type { RateLimitScope } from '../src/ports/rate-limiter.ts';

class FakeRpcResult<T> implements PromiseLike<{ data: T; error: null }> {
  constructor(private readonly run: (signal?: AbortSignal) => Promise<T>, private signal?: AbortSignal) {}
  abortSignal(signal: AbortSignal) { this.signal = signal; return this; }
  then<TResult1 = { data: T; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.run(this.signal).then((data) => ({ data, error: null as null })).then(onfulfilled, onrejected);
  }
}

class SharedFakeAccessRpc {
  readonly events = new Map<string, number[]>();
  readonly sessions = new Map<string, Record<string, unknown>>();
  readonly seenSignals: AbortSignal[] = [];
  private databaseNowMs = Date.parse('2026-10-11T08:00:00.000Z');
  aliases = [{
    alias_id: 'alias-1', principal_id: 'principal-1', kind: 'EMAIL', normalized_value: 'pilot@example.test',
    status: 'ACTIVE', provider_issuer: 'https://project.supabase.co/auth/v1', provider_subject: 'subject-1', pilot_allowed: true,
  }];

  setDatabaseNow(value: Date) {
    this.databaseNowMs = value.getTime();
  }

  client() {
    return {
      rpc: <T = unknown>(fn: string, params: Record<string, unknown>) => new FakeRpcResult<T>(async (signal) => {
        if (signal) {
          this.seenSignals.push(signal);
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        }
        if (fn === 'access_find_alias_by_email') {
          return (this.aliases.find((row) => row.normalized_value === params.p_normalized_email) ?? null) as T;
        }
        if (fn === 'access_session_create') {
          this.sessions.set(String(params.p_session_digest), { ...params });
          return null as T;
        }
        if (fn === 'access_session_find') {
          const row = this.sessions.get(String(params.p_session_digest));
          if (!row) return null as T;
          return {
            session_digest: row.p_session_digest,
            principal_id: row.p_principal_id,
            context_id: row.p_context_id,
            alias_id: row.p_alias_id,
            provider_issuer: row.p_provider_issuer,
            provider_subject: row.p_provider_subject,
            created_at: row.p_created_at,
            absolute_expires_at: row.p_absolute_expires_at,
            revoked_at: row.p_revoked_at,
            auth_method: row.p_auth_method,
            last_entitlement_check_at: row.p_last_entitlement_check_at,
          } as T;
        }
        if (fn === 'access_session_revoke') {
          const row = this.sessions.get(String(params.p_session_digest));
          if (row) row.p_revoked_at = params.p_revoked_at;
          return null as T;
        }
        if (fn === 'access_rate_limit_consume') {
          const scope = String(params.p_scope);
          const key = String(params.p_key_digest);
          const nowMs = this.databaseNowMs;
          const limit = Number(params.p_limit);
          const windowMs = Number(params.p_window_seconds) * 1000;
          const counterKey = `${scope}:${key}`;
          const active = (this.events.get(counterKey) ?? []).filter((at) => at > nowMs - windowMs);
          if (active.length >= limit) {
            this.events.set(counterKey, active);
            return {
              allowed: false,
              remaining: 0,
              reset_at: new Date(active[0]! + windowMs).toISOString(),
            } as T;
          }
          active.push(nowMs);
          this.events.set(counterKey, active);
          return {
            allowed: true,
            remaining: limit - active.length,
            reset_at: new Date(nowMs + windowMs).toISOString(),
          } as T;
        }
        throw new Error(`unexpected rpc ${fn}`);
      }),
    };
  }
}

const now = new Date('2026-10-11T08:00:00.000Z');

async function assertConcurrentLimit(scope: RateLimitScope, limit: number, keyDigest: string) {
  const shared = new SharedFakeAccessRpc();
  const a = new SupabaseRateLimiter(shared.client());
  const b = new SupabaseRateLimiter(shared.client());
  const attempts = Array.from({ length: limit + 1 }, (_, i) => (i % 2 === 0 ? a : b).consume({ scope, keyDigest, now }));
  const results = await Promise.all(attempts);
  assert.equal(results.filter((result) => result.allowed).length, limit);
  assert.equal(results.filter((result) => !result.allowed).length, 1);
  assert.equal(results.at(-1)?.remaining, 0);
  assert.ok(results.every((result) => result.resetAt instanceof Date && !Number.isNaN(result.resetAt.getTime())));
}

test('Supabase identity repository maps governed alias rows and propagates AbortSignal', async () => {
  const shared = new SharedFakeAccessRpc();
  const repository = new SupabaseIdentityRepository(shared.client());
  const controller = new AbortController();
  const alias = await repository.findAliasByEmail('pilot@example.test', { signal: controller.signal });
  assert.deepEqual(alias, {
    aliasId: 'alias-1', principalId: 'principal-1', kind: 'EMAIL', normalizedValue: 'pilot@example.test',
    status: 'ACTIVE', providerIssuer: 'https://project.supabase.co/auth/v1', providerSubject: 'subject-1', pilotAllowed: true,
  });
  assert.equal(shared.seenSignals.at(-1), controller.signal);
});

test('Supabase session store persists the existing digest only and round-trips governed fields', async () => {
  const shared = new SharedFakeAccessRpc();
  const store = new SupabaseSessionStore(shared.client());
  await store.create({
    sessionDigest: 'digest-only', principalId: 'principal-1', contextId: 'context-1', aliasId: 'alias-1',
    providerIssuer: 'https://project.supabase.co/auth/v1', providerSubject: 'subject-1', createdAt: now,
    absoluteExpiresAt: new Date(now.getTime() + 28_800_000), authMethod: 'EMAIL_OTP', lastEntitlementCheckAt: now,
  });
  assert.equal(JSON.stringify([...shared.sessions.values()]).includes('raw-session-secret'), false);
  const found = await store.findByDigest('digest-only');
  assert.equal(found?.sessionDigest, 'digest-only');
  assert.equal(found?.authMethod, 'EMAIL_OTP');
  await store.revoke('digest-only', new Date(now.getTime() + 1000));
  assert.ok((await store.findByDigest('digest-only'))?.revokedAt instanceof Date);
});

test('OTP_REQUEST is shared and atomic across limiter instances at 5/15m', async () => {
  await assertConcurrentLimit('OTP_REQUEST', 5, 'normalized-email-digest');
});

test('OTP_VERIFY is shared and atomic across limiter instances at 10/15m', async () => {
  await assertConcurrentLimit('OTP_VERIFY', 10, 'normalized-email-digest');
});

test('OTP_REQUEST_GLOBAL is shared and atomic across limiter instances at 20/15m', async () => {
  await assertConcurrentLimit('OTP_REQUEST_GLOBAL', 20, 'fixed-non-personal-global-digest');
});

test('OTP_VERIFY_GLOBAL is shared and atomic across limiter instances at 20/15m', async () => {
  await assertConcurrentLimit('OTP_VERIFY_GLOBAL', 20, 'fixed-non-personal-global-digest');
});

test('shared limiter preserves sliding-window semantics across a 15-minute database-clock boundary', async () => {
  const shared = new SharedFakeAccessRpc();
  const limiter = new SupabaseRateLimiter(shared.client());
  for (let i = 0; i < 5; i++) assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest: 'alias-digest', now })).allowed, true);
  const justBefore = new Date(now.getTime() + 15 * 60 * 1000 - 1);
  shared.setDatabaseNow(justBefore);
  assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest: 'alias-digest', now })).allowed, false);
  const justAfter = new Date(now.getTime() + 15 * 60 * 1000 + 1);
  shared.setDatabaseNow(justAfter);
  assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest: 'alias-digest', now })).allowed, true);
});
