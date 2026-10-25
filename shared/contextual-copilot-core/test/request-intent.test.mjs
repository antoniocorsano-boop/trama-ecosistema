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
