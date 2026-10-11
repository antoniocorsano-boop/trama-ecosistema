import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveTask11ProvisioningDeps, provisionTask11Pilot } from '../scripts/provision-task11-pilot.ts';

type User = { id: string; email?: string | null };

function harness(input?: { providerUsers?: User[]; governedSubject?: string | null }) {
  const order: string[] = [];
  let createCount = 0;
  let provisionCount = 0;
  const providerUsers = [...(input?.providerUsers ?? [])];
  const governedSubject = input?.governedSubject ?? null;
  return {
    order,
    counts: () => ({ createCount, provisionCount }),
    deps: {
      async listProviderUsers() { order.push('list-provider'); return providerUsers; },
      async createProviderUser(email: string) {
        order.push('create-provider');
        createCount += 1;
        const user = { id: 'provider-subject-created', email };
        providerUsers.push(user);
        return user;
      },
      async findGovernedAlias(_email: string) {
        order.push('find-governed');
        return governedSubject ? { providerIssuer: 'https://project.supabase.co/auth/v1', providerSubject: governedSubject } : null;
      },
      async provisionGovernedPilot(input: { providerSubject: string }) {
        order.push(`provision-governed:${input.providerSubject}`);
        provisionCount += 1;
      },
    },
  };
}

const base = {
  pilotEmails: ['pilot@example.test'],
  providerIssuer: 'https://project.supabase.co/auth/v1',
  region: 'eu-central-1',
  plan: 'free' as const,
  institutionRef: 'inst:task11-pilot',
};

test('Task 11 provisioning refuses zero or multiple pilot emails before mutation', async () => {
  for (const pilotEmails of [[], ['a@example.test', 'b@example.test']]) {
    const h = harness();
    await assert.rejects(() => provisionTask11Pilot({ ...base, pilotEmails }, h.deps), /PILOT_SCOPE_INVALID/);
    assert.deepEqual(h.order, []);
    assert.deepEqual(h.counts(), { createCount: 0, provisionCount: 0 });
  }
});

test('live Task 11 provisioning rejects non-https Supabase URL before any request', () => {
  let fetchCount = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCount += 1;
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
  assert.throws(
    () => createLiveTask11ProvisioningDeps({
      url: 'http://project-ref.supabase.co',
      secretKey: 'sb_secret_test_value_that_must_never_escape',
      fetchImpl,
    }),
    /SUPABASE_URL_INVALID/,
  );
  assert.equal(fetchCount, 0);
});

test('Task 11 provisioning rejects any provider project that already contains another user', async () => {
  const h = harness({ providerUsers: [{ id: 'other-subject', email: 'other@example.test' }] });
  await assert.rejects(() => provisionTask11Pilot(base, h.deps), /PROVIDER_SCOPE_VIOLATION/);
  assert.equal(h.counts().createCount, 0);
  assert.equal(h.counts().provisionCount, 0);
});

test('provider user is created before governed issuer+subject binding', async () => {
  const h = harness();
  const receipt = await provisionTask11Pilot(base, h.deps);
  assert.ok(h.order.indexOf('create-provider') >= 0);
  assert.ok(h.order.indexOf('provision-governed:provider-subject-created') > h.order.indexOf('create-provider'));
  assert.deepEqual(h.counts(), { createCount: 1, provisionCount: 1 });
  assert.equal(receipt.state, 'PROVISIONED');
});

test('existing exact provider and governed binding is idempotent', async () => {
  const h = harness({ providerUsers: [{ id: 'provider-subject-1', email: 'pilot@example.test' }], governedSubject: 'provider-subject-1' });
  const receipt = await provisionTask11Pilot(base, h.deps);
  assert.deepEqual(h.counts(), { createCount: 0, provisionCount: 0 });
  assert.equal(receipt.state, 'ALREADY_PROVISIONED');
});

test('governed subject mismatch fails closed without provisioning a new binding', async () => {
  const h = harness({ providerUsers: [{ id: 'provider-subject-1', email: 'pilot@example.test' }], governedSubject: 'different-subject' });
  await assert.rejects(() => provisionTask11Pilot(base, h.deps), /SUBJECT_BINDING_MISMATCH/);
  assert.deepEqual(h.counts(), { createCount: 0, provisionCount: 0 });
});

test('sanitized receipt excludes email, provider subject, OTP, secret and tokens', async () => {
  const h = harness();
  const receipt = await provisionTask11Pilot(base, h.deps);
  const serialized = JSON.stringify(receipt);
  for (const forbidden of ['pilot@example.test', 'provider-subject-created', 'otp', 'secret', 'access_token', 'refresh_token']) {
    assert.equal(serialized.toLowerCase().includes(forbidden.toLowerCase()), false, `receipt leaked ${forbidden}`);
  }
  assert.deepEqual(receipt, {
    state: 'PROVISIONED',
    providerKind: 'supabase',
    region: 'eu-central-1',
    plan: 'free',
    providerUserCount: 1,
    identityAuthority: 'issuer+subject',
  });
});
