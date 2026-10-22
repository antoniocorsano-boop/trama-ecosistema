import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuthProviderAdapter } from '../src/ports/auth-provider.ts';
import type { IdentityRepository } from '../src/ports/identity-repository.ts';
import type { VerifiedExternalIdentity } from '../src/domain/types.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { requestPilotMagicLink, verifyPilotMagicLink } from '../src/domain/auth-service.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const redirectTo = 'https://access.example.test/auth/confirm';
const codeVerifier = 'v'.repeat(43);

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
    entitlements: [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-01-01T00:00:00Z') }],
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

function callbackProvider(subject: string, delayMs = 0): AuthProviderAdapter {
  return {
    async checkAvailability() { return true; },
    async requestEmailMagicLink() {},
    async verifyEmailMagicLink(input): Promise<VerifiedExternalIdentity> {
      if (delayMs) await abortableDelay(delayMs, input.signal);
      return { issuer: 'issuer-1', subject, verifiedEmail: 'teacher@example.test' };
    },
    async bestEffortLogout() {},
  };
}

test('negative Magic Link authorization is padded to one common public deadline', async () => {
  async function timed(subject: string, delayMs: number) {
    const started = performance.now();
    const result = await verifyPilotMagicLink({
      repo: repository(),
      provider: callbackProvider(subject, delayMs),
      store: new InMemorySessionStore(),
      callback: { code: 'valid-provider-code', codeVerifier },
      now: new Date(),
    });
    return { result, elapsed: performance.now() - started };
  }

  const [slowMismatch, fastUnknown] = await Promise.all([
    timed('subject-mismatch', 80),
    timed('subject-unknown', 0),
  ]);

  assert.deepEqual(slowMismatch.result, { status: 'ACCESS_DENIED' });
  assert.deepEqual(fastUnknown.result, { status: 'ACCESS_DENIED' });
  assert.ok(slowMismatch.elapsed >= 1050, `slow denial returned before the common deadline: ${slowMismatch.elapsed}ms`);
  assert.ok(fastUnknown.elapsed >= 1050, `fast denial returned before the common deadline: ${fastUnknown.elapsed}ms`);
  assert.ok(Math.abs(slowMismatch.elapsed - fastUnknown.elapsed) < 80, `denial timing diverged: slow=${slowMismatch.elapsed} fast=${fastUnknown.elapsed}`);
});

test('provider availability is bounded and aborted in both Magic Link request and callback flows', async () => {
  let abortCount = 0;
  const provider: AuthProviderAdapter = {
    checkAvailability(input): Promise<boolean> {
      return new Promise<boolean>((_resolve, reject) => {
        const onAbort = () => {
          abortCount += 1;
          reject(new Error('AVAILABILITY_ABORTED'));
        };
        if (input.signal.aborted) onAbort();
        else input.signal.addEventListener('abort', onAbort, { once: true });
      });
    },
    async requestEmailMagicLink() { throw new Error('REQUEST_MUST_NOT_RUN_AFTER_AVAILABILITY_TIMEOUT'); },
    async verifyEmailMagicLink(): Promise<VerifiedExternalIdentity> { throw new Error('VERIFY_MUST_NOT_RUN_AFTER_AVAILABILITY_TIMEOUT'); },
  };

  const request = requestPilotMagicLink({ repo: repository(), provider, email: 'teacher@example.test', redirectTo, codeVerifier });
  const verify = verifyPilotMagicLink({ repo: repository(), provider, store: new InMemorySessionStore(), callback: { code: 'valid-provider-code', codeVerifier }, now: new Date() });

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
    async requestEmailMagicLink() { throw new Error('REQUEST_MUST_NOT_RUN_AFTER_ALIAS_LOOKUP_TIMEOUT'); },
    async verifyEmailMagicLink(): Promise<VerifiedExternalIdentity> { throw new Error('VERIFY_MUST_NOT_RUN'); },
  };

  const result = await Promise.race([
    requestPilotMagicLink({ repo, provider, email: 'teacher@example.test', redirectTo, codeVerifier, timing: { providerBudgetMs: 30, publicFloorMs: 60 } }),
    sleep(150).then(() => 'TEST_TIMEOUT' as const),
  ]);

  assert.notEqual(result, 'TEST_TIMEOUT', 'alias lookup remained unbounded past the request deadline');
  assert.deepEqual(result, { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal(aliasLookupAbortCount, 1, 'the alias lookup must be actively aborted at the shared request deadline');
});
