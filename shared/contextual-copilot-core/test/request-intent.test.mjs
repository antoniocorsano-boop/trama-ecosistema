import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createActionRegistry,
  createContextualCopilotCore,
  createFailClosedPolicyEngine,
} from '../src/index.js';

const actions = [
  { id: 'review', capability: 'REVIEW', label: 'Rivedi', priority: 70, risk: 'PROPOSE', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'search', capability: 'SEARCH', label: 'Cerca', priority: 50, risk: 'READ_ONLY', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'create', capability: 'CREATE', label: 'Crea', priority: 40, risk: 'PROPOSE', requiresGenerativeAI: false, requiresSemanticSearch: false },
];

const context = {
  appId: 'test-consumer',
  surface: 'TEST_SURFACE',
  entities: [{ type: 'resource', id: 'resource-1' }],
  capabilities: ['REVIEW', 'SEARCH'],
  permissions: ['professional:read', 'professional:propose'],
  privacy: {
    dataClasses: ['TEACHER_PROFESSIONAL'],
    remoteProviderAllowed: false,
  },
};

function createCore(options = {}) {
  return createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: createFailClosedPolicyEngine(),
    ...options,
  });
}

test('copilot request requires a non-empty message and known allowed capabilities', async () => {
  const core = createCore();

  await assert.rejects(
    core.resolveRequest({ context, message: '   ', allowedCapabilities: ['REVIEW'] }),
    /message/i,
  );
  await assert.rejects(
    core.resolveRequest({ context, message: 'Rivedi questa fonte', allowedCapabilities: ['NOT_A_CAPABILITY'] }),
    /capability/i,
  );
});

test('copilot request allowedCapabilities narrows context authority and falls back deterministically without an Intent Port', async () => {
  const core = createCore();

  const result = await core.resolveRequest({
    context,
    message: 'Rivedi questa fonte e poi crea qualcosa',
    allowedCapabilities: ['REVIEW', 'CREATE'],
  });

  assert.equal(result.status, 'UNRESOLVED');
  assert.equal(result.reason, 'INTENT_PORT_UNAVAILABLE');
  assert.deepEqual(result.actions.map((action) => action.id), ['review']);
  assert.ok(result.actions.every((action) => context.capabilities.includes(action.capability)));
});

test('copilot request reports no allowed actions when the request intersection is empty', async () => {
  const core = createCore();

  const result = await core.resolveRequest({
    context,
    message: 'Crea una proposta',
    allowedCapabilities: ['CREATE'],
  });

  assert.deepEqual(result, {
    status: 'UNRESOLVED',
    reason: 'NO_ALLOWED_ACTIONS',
    actions: [],
  });
});

test('local Intent Port resolves only already-authorized actions and sorts valid matches by score', async () => {
  const calls = [];
  const core = createCore({
    intentPort: {
      mode: 'local',
      async resolve(input) {
        calls.push(input);
        return [
          { actionId: 'review', score: 0.7 },
          { actionId: 'search', score: 0.9 },
          { actionId: 'create', score: 100 },
          { actionId: 'invented-action', score: 200 },
          { actionId: 'review', score: Number.NaN },
        ];
      },
    },
  });

  const result = await core.resolveRequest({
    context,
    message: 'Cerca prima e poi rivedi questa fonte',
    allowedCapabilities: ['REVIEW', 'SEARCH', 'CREATE'],
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.reason, 'INTENT_RESOLVED');
  assert.deepEqual(result.actions.map((action) => action.id), ['search', 'review']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].message, 'Cerca prima e poi rivedi questa fonte');
  assert.deepEqual(calls[0].actions.map((action) => action.id), ['review', 'search']);
});

test('equal intent scores fall back to action priority and then deterministic id order', async () => {
  const core = createCore({
    intentPort: {
      mode: 'local',
      async resolve() {
        return [
          { actionId: 'search', score: 0.5 },
          { actionId: 'review', score: 0.5 },
        ];
      },
    },
  });

  const result = await core.resolveRequest({
    context,
    message: 'Aiutami con questa fonte',
    allowedCapabilities: ['REVIEW', 'SEARCH'],
  });

  assert.equal(result.status, 'RESOLVED');
  assert.deepEqual(result.actions.map((action) => action.id), ['review', 'search']);
});

test('invalid or absent intent matches degrade to the authorized deterministic fallback', async () => {
  const noMatchCore = createCore({
    intentPort: {
      mode: 'local',
      async resolve() {
        return [
          { actionId: 'create', score: 10 },
          { actionId: 'invented-action', score: 20 },
          { actionId: 'review', score: Number.POSITIVE_INFINITY },
        ];
      },
    },
  });

  const noMatch = await noMatchCore.resolveRequest({
    context,
    message: 'Fai qualcosa',
    allowedCapabilities: ['REVIEW', 'SEARCH', 'CREATE'],
  });

  assert.equal(noMatch.status, 'UNRESOLVED');
  assert.equal(noMatch.reason, 'NO_INTENT_MATCH');
  assert.deepEqual(noMatch.actions.map((action) => action.id), ['review', 'search']);

  const failingCore = createCore({
    intentPort: {
      mode: 'local',
      async resolve() {
        throw new Error('intent runtime unavailable');
      },
    },
  });

  const failed = await failingCore.resolveRequest({
    context,
    message: 'Rivedi questa fonte',
    allowedCapabilities: ['REVIEW', 'SEARCH'],
  });

  assert.equal(failed.status, 'UNRESOLVED');
  assert.equal(failed.reason, 'INTENT_RESOLUTION_FAILED');
  assert.deepEqual(failed.actions.map((action) => action.id), ['review', 'search']);
});

test('remote Intent Port is never invoked without remote authorization or with protected student data', async () => {
  let calls = 0;
  const core = createCore({
    intentPort: {
      mode: 'remote',
      async resolve() {
        calls += 1;
        return [{ actionId: 'review', score: 1 }];
      },
    },
  });

  const unauthorized = await core.resolveRequest({
    context,
    message: 'Rivedi questa fonte',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(unauthorized.status, 'UNRESOLVED');
  assert.equal(unauthorized.reason, 'REMOTE_PROVIDER_NOT_AUTHORIZED');
  assert.deepEqual(unauthorized.actions.map((action) => action.id), ['review']);
  assert.equal(calls, 0);

  const protectedResult = await core.resolveRequest({
    context: {
      ...context,
      privacy: {
        dataClasses: ['STUDENT_PERSONAL'],
        remoteProviderAllowed: true,
      },
    },
    message: 'Rivedi questa fonte protetta',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(protectedResult.status, 'UNRESOLVED');
  assert.equal(protectedResult.reason, 'PROTECTED_DATA_REMOTE_DENIED');
  assert.deepEqual(protectedResult.actions.map((action) => action.id), ['review']);
  assert.equal(calls, 0);
});

test('authorized professional remote Intent Port may resolve within the existing action boundary', async () => {
  let calls = 0;
  const core = createCore({
    intentPort: {
      mode: 'remote',
      async resolve({ message, actions }) {
        calls += 1;
        assert.equal(message, 'Rivedi questa fonte professionale');
        assert.deepEqual(actions.map((action) => action.id), ['review']);
        return [{ actionId: 'review', score: 1 }];
      },
    },
  });

  const result = await core.resolveRequest({
    context: {
      ...context,
      privacy: {
        dataClasses: ['TEACHER_PROFESSIONAL'],
        remoteProviderAllowed: true,
      },
    },
    message: 'Rivedi questa fonte professionale',
    allowedCapabilities: ['REVIEW'],
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.reason, 'INTENT_RESOLVED');
  assert.deepEqual(result.actions.map((action) => action.id), ['review']);
  assert.equal(calls, 1);
});
