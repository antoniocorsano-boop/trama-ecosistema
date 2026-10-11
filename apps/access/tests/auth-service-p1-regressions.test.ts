import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuthProviderAdapter } from '../src/ports/auth-provider.ts';
import type { IdentityRepository } from '../src/ports/identity-repository.ts';
import type { VerifiedExternalIdentity } from '../src/domain/types.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { requestPilotOtp, verifyPilotOtp } from '../src/domain/auth-service.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function repository() {
  return new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{
      aliasId: 'a1',
      principalId: 'p1',
      kind: 'EMAIL',
      normalizedValue: 'teacher@example.test',
      status: 'ACTIVE',
      providerIssuer: 'issuer-1',
      providerSubject: 'subject-1',
      pilotAllowed: true,
    }],
    contexts: [{
      contextId: 'c1',
      principalId: 'p1',
      contextType: 'INSTITUTION',
      institutionRef: 'inst:1',
      status: 'ACTIVE',
    }],
    entitlements: [],
  });
}

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error('ABORTED'));
    };
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  });
}

test('negative OTP verification is padded to one common public deadline', async () => {
  const provider: AuthProviderAdapter = {
    async checkAvailability() { return true; },
    async requestEmailOtp() {},
    async verifyEmailOtp(input): Promise<VerifiedExternalIdentity> {
      if (input.email === 'teacher@example.test') {
        await abortableDelay(80, input.signal);
      }
      throw new Error('OTP_INVALID');
    },
  };

  async function timed(email: string) {
    const started = performance.now();
    const result = await verifyPilotOtp({
      repo: repository(),
      provider,
      store: new InMemorySessionStore(),
      email,
      otp: '000000',
      now: new Date(),
    });
    return { result, elapsed: performance.now() - started };
  }

  const [allowed, unknown] = await Promise.all([
    timed('teacher@example.test'),
    timed('nobody@example.test'),
  ]);

  assert.deepEqual(allowed.result, { status: 'OTP_INVALID' });
  assert.deepEqual(unknown.result, { status: 'OTP_INVALID' });
  assert.ok(allowed.elapsed >= 1050, `allowed verification returned before the common deadline: ${allowed.elapsed}ms`);
  assert.ok(unknown.elapsed >= 1050, `unknown verification returned before the common deadline: ${unknown.elapsed}ms`);
  assert.ok(
    Math.abs(allowed.elapsed - unknown.elapsed) < 80,
    `verification timing diverged: allowed=${allowed.elapsed} unknown=${unknown.elapsed}`,
  );
});

test('provider availability is bounded and aborted in both request and verify flows', async () => {
  let abortCount = 0;
  const provider: AuthProviderAdapter = {
    checkAvailability(input?: { signal?: AbortSignal }): Promise<boolean> {
      return new Promise<boolean>((_resolve, reject) => {
        const signal = input?.signal;
        if (!signal) return;
        const onAbort = () => {
          abortCount += 1;
          reject(new Error('AVAILABILITY_ABORTED'));
        };
        if (signal.aborted) onAbort();
        else signal.addEventListener('abort', onAbort, { once: true });
      });
    },
    async requestEmailOtp() {
      throw new Error('REQUEST_MUST_NOT_RUN_AFTER_AVAILABILITY_TIMEOUT');
    },
    async verifyEmailOtp(): Promise<VerifiedExternalIdentity> {
      throw new Error('VERIFY_MUST_NOT_RUN_AFTER_AVAILABILITY_TIMEOUT');
    },
  };

  const request = requestPilotOtp({
    repo: repository(),
    provider,
    email: 'teacher@example.test',
  });
  const verify = verifyPilotOtp({
    repo: repository(),
    provider,
    store: new InMemorySessionStore(),
    email: 'teacher@example.test',
    otp: '000000',
    now: new Date(),
  });

  const result = await Promise.race([
    Promise.all([request, verify]),
    sleep(1400).then(() => 'TEST_TIMEOUT' as const),
  ]);

  assert.notEqual(result, 'TEST_TIMEOUT', 'availability probes remained unbounded');
  assert.deepEqual(result, [
    { status: 'PROVIDER_UNAVAILABLE' },
    { status: 'PROVIDER_UNAVAILABLE' },
  ]);
  assert.equal(abortCount, 2, 'both availability probes must be actively aborted at the provider deadline');
});

test('request alias lookup is bounded and aborted by the shared provider deadline', async () => {
  let aliasLookupAbortCount = 0;
  const base = repository();
  const repo: IdentityRepository = {
    findAliasByEmail(_normalizedEmail: string, input?: { signal?: AbortSignal }) {
      return new Promise((_resolve, reject) => {
        const signal = input?.signal;
        if (!signal) return;
        const onAbort = () => {
          aliasLookupAbortCount += 1;
          reject(new Error('ALIAS_LOOKUP_ABORTED'));
        };
        if (signal.aborted) onAbort();
        else signal.addEventListener('abort', onAbort, { once: true });
      });
    },
    findAliasByExternalIdentity: (identity) => base.findAliasByExternalIdentity(identity),
    getAlias: (aliasId) => base.getAlias(aliasId),
    getPrincipal: (principalId) => base.getPrincipal(principalId),
    listActiveContexts: (principalId) => base.listActiveContexts(principalId),
    listEntitlements: (principalId, contextId, at) => base.listEntitlements(principalId, contextId, at),
  };
  const provider: AuthProviderAdapter = {
    async checkAvailability() { return true; },
    async requestEmailOtp() {
      throw new Error('REQUEST_MUST_NOT_RUN_AFTER_ALIAS_LOOKUP_TIMEOUT');
    },
    async verifyEmailOtp(): Promise<VerifiedExternalIdentity> {
      throw new Error('VERIFY_MUST_NOT_RUN');
    },
  };

  const result = await Promise.race([
    requestPilotOtp({
      repo,
      provider,
      email: 'teacher@example.test',
      timing: { providerBudgetMs: 30, publicFloorMs: 60 },
    }),
    sleep(150).then(() => 'TEST_TIMEOUT' as const),
  ]);

  assert.notEqual(result, 'TEST_TIMEOUT', 'alias lookup remained unbounded past the request deadline');
  assert.deepEqual(result, { status: 'OTP_REQUESTED' });
  assert.equal(aliasLookupAbortCount, 1, 'the alias lookup must be actively aborted at the shared request deadline');
});
