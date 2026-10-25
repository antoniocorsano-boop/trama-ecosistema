import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createActionRegistry,
  createContextualCopilotCore,
  createFailClosedPolicyEngine,
} from '../src/index.js';

const professionalContext = {
  appId: 'intent-discovery-proof',
  surface: 'LIBRARY_SOURCE',
  entities: [{ type: 'library-source', id: 'source-1' }],
  capabilities: ['REVIEW', 'PREPARE', 'LINK', 'CREATE'],
  permissions: ['professional:read', 'professional:propose'],
  privacy: {
    dataClasses: ['TEACHER_PROFESSIONAL'],
    remoteProviderAllowed: false,
  },
};

const review = { id: 'review', capability: 'REVIEW', label: 'Rivedi', priority: 70, risk: 'PROPOSE', requiresGenerativeAI: false, requiresSemanticSearch: false };
const prepare = { id: 'prepare', capability: 'PREPARE', label: 'Prepara', priority: 60, risk: 'PROPOSE', requiresGenerativeAI: true, requiresSemanticSearch: false };
const link = { id: 'link', capability: 'LINK', label: 'Collega', priority: 50, risk: 'WRITE_REVERSIBLE', requiresGenerativeAI: false, requiresSemanticSearch: false };
const external = { id: 'external', capability: 'CREATE', label: 'Pubblica', priority: 40, risk: 'WRITE_EXTERNAL', requiresGenerativeAI: false, requiresSemanticSearch: false };
const institutional = { id: 'institutional', capability: 'CREATE', label: 'Decidi', priority: 30, risk: 'INSTITUTIONAL_DECISION', requiresGenerativeAI: false, requiresSemanticSearch: false };

function port(mode = 'local', discoverImpl = async () => [{ actionId: 'prepare', score: 1 }]) {
  return {
    mode,
    async resolve() {
      return [{ actionId: 'review', score: 1 }];
    },
    discover: discoverImpl,
  };
}

function core({ actions = [review, prepare, link], contextPolicy = createFailClosedPolicyEngine({ generativeMode: 'none' }), intentPort = port(), generativeMode = 'none' } = {}) {
  return createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: contextPolicy,
    intentPort,
    generativeMode,
  });
}

test('fail-closed policy treats DISCOVER separately from RESOLVE and DISPATCH for generative propose actions', async () => {
  const policy = createFailClosedPolicyEngine({ generativeMode: 'none' });
  const discover = await policy.evaluate({ context: professionalContext, action: prepare, phase: 'DISCOVER' });
  const resolve = await policy.evaluate({ context: professionalContext, action: prepare, phase: 'RESOLVE' });
  const dispatch = await policy.evaluate({ context: professionalContext, action: prepare, phase: 'DISPATCH' });

  assert.equal(discover.allowed, true);
  assert.equal(resolve.allowed, false);
  assert.equal(resolve.reason, 'GENERATIVE_PROVIDER_UNAVAILABLE');
  assert.equal(dispatch.allowed, false);
  assert.equal(dispatch.reason, 'GENERATIVE_PROVIDER_UNAVAILABLE');
});

test('discovery narrows by context capabilities and request allowedCapabilities', async () => {
  const seen = [];
  const instance = core({
    intentPort: port('local', async ({ actions }) => {
      seen.push(actions.map((action) => action.id));
      return actions.map((action, index) => ({ actionId: action.id, score: 10 - index }));
    }),
  });

  const result = await instance.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW', 'PREPARE'] },
    message: 'Prepara una attività',
    allowedCapabilities: ['PREPARE', 'LINK'],
  });

  assert.deepEqual(seen, [['prepare']]);
  assert.deepEqual(result, {
    status: 'DISCOVERED',
    reason: 'INTENT_DISCOVERED',
    intents: [{ actionId: 'prepare', capability: 'PREPARE' }],
  });
});

test('custom policy receives DISCOVER and can exclude a candidate without changing normal resolution semantics', async () => {
  const phases = [];
  const policy = {
    async evaluate({ action, phase }) {
      phases.push(`${phase}:${action.id}`);
      if (phase === 'DISCOVER' && action.id === 'prepare') {
        return { allowed: false, reason: 'DISCOVERY_DENIED_BY_TEST', humanConfirmationRequired: false };
      }
      return { allowed: true, reason: 'CUSTOM_ALLOW', humanConfirmationRequired: false };
    },
  };
  let calls = 0;
  const instance = core({ contextPolicy: policy, intentPort: port('local', async () => { calls += 1; return [{ actionId: 'prepare', score: 1 }]; }) });

  const result = await instance.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['PREPARE'] },
    message: 'Prepara',
    allowedCapabilities: ['PREPARE'],
  });

  assert.deepEqual(result, { status: 'UNRESOLVED', reason: 'NO_DISCOVERABLE_ACTIONS', intents: [] });
  assert.deepEqual(phases, ['DISCOVER:prepare']);
  assert.equal(calls, 0);
});

test('policy failure during discovery fails closed before the Intent Port', async () => {
  let calls = 0;
  const policy = {
    async evaluate({ phase }) {
      if (phase === 'DISCOVER') throw new Error('policy unavailable');
      return { allowed: true, reason: 'CUSTOM_ALLOW', humanConfirmationRequired: false };
    },
  };
  const instance = core({ contextPolicy: policy, intentPort: port('local', async () => { calls += 1; return [{ actionId: 'review', score: 1 }]; }) });

  const result = await instance.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });

  assert.deepEqual(result, { status: 'UNRESOLVED', reason: 'NO_DISCOVERABLE_ACTIONS', intents: [] });
  assert.equal(calls, 0);
});

test('institutional decisions and external writes are never discoverable in v0.3', async () => {
  const permissive = {
    async evaluate() {
      return { allowed: true, reason: 'CUSTOM_ALLOW', humanConfirmationRequired: false };
    },
  };
  let calls = 0;
  const instance = core({
    actions: [external, institutional],
    contextPolicy: permissive,
    intentPort: port('local', async () => { calls += 1; return [{ actionId: 'institutional', score: 2 }, { actionId: 'external', score: 1 }]; }),
  });

  const result = await instance.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['CREATE'] },
    message: 'Fallo',
    allowedCapabilities: ['CREATE'],
  });

  assert.deepEqual(result, { status: 'UNRESOLVED', reason: 'NO_DISCOVERABLE_ACTIONS', intents: [] });
  assert.equal(calls, 0);
});

test('no Intent Port and resolve-only 0.2 Intent Port fail closed with distinct discovery reasons', async () => {
  const absent = core({ intentPort: null });
  const absentResult = await absent.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.deepEqual(absentResult, { status: 'UNRESOLVED', reason: 'INTENT_PORT_UNAVAILABLE', intents: [] });

  let resolveCalls = 0;
  const legacyPort = {
    mode: 'local',
    async resolve() {
      resolveCalls += 1;
      return [{ actionId: 'review', score: 1 }];
    },
  };
  const legacy = core({ intentPort: legacyPort });
  const legacyDiscovery = await legacy.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.deepEqual(legacyDiscovery, { status: 'UNRESOLVED', reason: 'INTENT_DISCOVERY_UNAVAILABLE', intents: [] });
  assert.equal(resolveCalls, 0);

  const legacyResolution = await legacy.resolveRequest({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(legacyResolution.status, 'RESOLVED');
  assert.equal(resolveCalls, 1);
});

test('remote discovery never receives unauthorized or protected content while local discovery remains available', async () => {
  let remoteCalls = 0;
  const remote = core({ intentPort: port('remote', async () => { remoteCalls += 1; return [{ actionId: 'review', score: 1 }]; }) });

  const unauthorized = await remote.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(unauthorized.reason, 'REMOTE_PROVIDER_NOT_AUTHORIZED');
  assert.equal(remoteCalls, 0);

  for (const dataClass of ['STUDENT_PERSONAL', 'STUDENT_SENSITIVE']) {
    const protectedResult = await remote.discoverRequestIntent({
      context: {
        ...professionalContext,
        capabilities: ['REVIEW'],
        privacy: { dataClasses: [dataClass], remoteProviderAllowed: true },
      },
      message: 'Rivedi dati protetti',
      allowedCapabilities: ['REVIEW'],
    });
    assert.equal(protectedResult.reason, 'PROTECTED_DATA_REMOTE_DENIED');
  }
  assert.equal(remoteCalls, 0);

  let localCalls = 0;
  const local = core({ intentPort: port('local', async () => { localCalls += 1; return [{ actionId: 'review', score: 1 }]; }) });
  const localResult = await local.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi localmente',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(localResult.status, 'DISCOVERED');
  assert.equal(localCalls, 1);
});

test('discovery sanitizes matches, keeps the best duplicate score, orders deterministically and exposes no scores', async () => {
  const instance = core({
    actions: [review, prepare, link],
    intentPort: port('local', async () => [
      { actionId: 'invented', score: 100 },
      { actionId: 'link', score: 50 },
      { actionId: 'prepare', score: Number.NaN },
      { actionId: 'review', score: 0.5 },
      { actionId: 'review', score: 0.9 },
      { actionId: 'prepare', score: 0.9 },
      { actionId: 'link', score: Number.POSITIVE_INFINITY },
    ]),
  });

  const result = await instance.discoverRequestIntent({
    context: professionalContext,
    message: 'Aiutami',
    allowedCapabilities: ['REVIEW', 'PREPARE'],
  });

  assert.deepEqual(result, {
    status: 'DISCOVERED',
    reason: 'INTENT_DISCOVERED',
    intents: [
      { actionId: 'review', capability: 'REVIEW' },
      { actionId: 'prepare', capability: 'PREPARE' },
    ],
  });
  assert.ok(result.intents.every((intent) => !Object.hasOwn(intent, 'score')));
});

test('empty valid match set and discovery exceptions degrade fail closed', async () => {
  const noMatch = core({ intentPort: port('local', async () => [{ actionId: 'invented', score: 1 }, { actionId: 'review', score: Number.NaN }]) });
  const noMatchResult = await noMatch.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.deepEqual(noMatchResult, { status: 'UNRESOLVED', reason: 'NO_INTENT_MATCH', intents: [] });

  const failing = core({ intentPort: port('local', async () => { throw new Error('discovery failed'); }) });
  const failed = await failing.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi',
    allowedCapabilities: ['REVIEW'],
  });
  assert.deepEqual(failed, { status: 'UNRESOLVED', reason: 'INTENT_DISCOVERY_FAILED', intents: [] });
});

test('discovery passes defensive frozen context and candidates and cannot widen later authority', async () => {
  const registry = createActionRegistry([review, prepare, { id: 'create', capability: 'CREATE', label: 'Crea', priority: 10, risk: 'PROPOSE', requiresGenerativeAI: false, requiresSemanticSearch: false }]);
  const mutableContext = {
    ...professionalContext,
    capabilities: ['REVIEW', 'PREPARE'],
    permissions: [...professionalContext.permissions],
    entities: professionalContext.entities.map((entity) => ({ ...entity })),
    privacy: { ...professionalContext.privacy, dataClasses: [...professionalContext.privacy.dataClasses] },
  };
  const intentPort = {
    mode: 'local',
    async resolve() { return [{ actionId: 'review', score: 1 }]; },
    async discover({ context, actions }) {
      assert.throws(() => context.capabilities.push('CREATE'), TypeError);
      assert.throws(() => { context.privacy.remoteProviderAllowed = true; }, TypeError);
      assert.throws(() => actions.push(registry.get('create')), TypeError);
      assert.throws(() => { actions[0].capability = 'CREATE'; }, TypeError);
      return [{ actionId: 'prepare', score: 1 }];
    },
  };
  const instance = createContextualCopilotCore({
    registry,
    policyEngine: createFailClosedPolicyEngine({ generativeMode: 'none' }),
    intentPort,
    generativeMode: 'none',
  });

  const discovered = await instance.discoverRequestIntent({
    context: mutableContext,
    message: 'Prepara',
    allowedCapabilities: ['REVIEW', 'PREPARE', 'CREATE'],
  });
  assert.equal(discovered.status, 'DISCOVERED');
  assert.deepEqual(mutableContext.capabilities, ['REVIEW', 'PREPARE']);
  assert.equal(mutableContext.privacy.remoteProviderAllowed, false);

  const resolved = await instance.resolveActions(mutableContext);
  assert.deepEqual(resolved.map((action) => action.id), ['review']);

  let executions = 0;
  const dispatch = await instance.dispatch({
    context: mutableContext,
    actionId: 'create',
    executor: async () => { executions += 1; return { created: true }; },
  });
  assert.equal(dispatch.status, 'DENIED');
  assert.equal(executions, 0);
});
