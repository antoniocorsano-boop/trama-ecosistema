import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createActionRegistry,
  createContextualCopilotCore,
  createFailClosedPolicyEngine,
} from '../../contextual-copilot-core/src/index.js';
import { createEmbeddingIntentPort } from '../src/index.js';

const review = {
  id: 'review',
  capability: 'REVIEW',
  label: 'Rivedi',
  priority: 70,
  risk: 'PROPOSE',
  requiresGenerativeAI: false,
  requiresSemanticSearch: false,
};

const prepare = {
  id: 'prepare',
  capability: 'PREPARE',
  label: 'Prepara',
  priority: 60,
  risk: 'PROPOSE',
  requiresGenerativeAI: true,
  requiresSemanticSearch: false,
};

const professionalContext = {
  appId: 'intent-adapter-conformance',
  surface: 'LIBRARY_SOURCE',
  entities: [{ type: 'library-source', id: 'source-1' }],
  capabilities: ['REVIEW', 'PREPARE'],
  permissions: ['professional:read', 'professional:propose'],
  privacy: {
    dataClasses: ['TEACHER_PROFESSIONAL'],
    remoteProviderAllowed: false,
  },
};

function semanticEmbed(calls = []) {
  return async (text) => {
    calls.push(text);
    if (text === 'Rivedi questa fonte' || text === 'rivedi fonte') return [0, 1];
    if (text === 'Prepara una attività' || text === 'prepara attività') return [1, 0];
    throw new Error(`missing conformance vector for: ${text}`);
  };
}

function adapter(embed = semanticEmbed()) {
  return createEmbeddingIntentPort({
    embed,
    intents: [
      { actionId: 'review', examples: ['rivedi fonte'] },
      { actionId: 'prepare', examples: ['prepara attività'] },
    ],
  });
}

function core(intentPort = adapter(), actions = [review, prepare]) {
  return createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: createFailClosedPolicyEngine({ generativeMode: 'none' }),
    intentPort,
    generativeMode: 'none',
  });
}

test('Core 0.3 resolve keeps embedding classification inside already-authorized actions', async () => {
  const calls = [];
  const instance = core(adapter(semanticEmbed(calls)));

  const resolvedActions = await instance.resolveActions(professionalContext);
  assert.deepEqual(resolvedActions.map((action) => action.id), ['review']);

  const result = await instance.resolveRequest({
    context: professionalContext,
    message: 'Rivedi questa fonte',
    allowedCapabilities: ['REVIEW', 'PREPARE'],
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.reason, 'INTENT_RESOLVED');
  assert.deepEqual(result.actions.map((action) => action.id), ['review']);
  assert.deepEqual(calls, ['Rivedi questa fonte', 'rivedi fonte']);
  assert.equal(calls.includes('prepara attività'), false);
});

test('Core 0.3 discovery recognizes PREPARE without making it executable', async () => {
  const instance = core();

  const discovered = await instance.discoverRequestIntent({
    context: professionalContext,
    message: 'Prepara una attività',
    allowedCapabilities: ['REVIEW', 'PREPARE'],
  });

  assert.deepEqual(discovered, {
    status: 'DISCOVERED',
    reason: 'INTENT_DISCOVERED',
    intents: [{ actionId: 'prepare', capability: 'PREPARE' }],
  });

  let executions = 0;
  const dispatch = await instance.dispatch({
    context: professionalContext,
    actionId: 'prepare',
    executor: async () => {
      executions += 1;
      return { prepared: true };
    },
  });

  assert.equal(dispatch.status, 'DENIED');
  assert.equal(executions, 0);
});

test('Core 0.3 preserves no-match separately from adapter technical failures', async () => {
  const noMatchPort = createEmbeddingIntentPort({
    embed: async (text) => (text === 'nessuna corrispondenza' ? [1, 0] : [0, 1]),
    intents: [{ actionId: 'review', examples: ['review-example'] }],
  });
  const noMatchCore = core(noMatchPort, [review]);
  const noMatch = await noMatchCore.resolveRequest({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'nessuna corrispondenza',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(noMatch.status, 'UNRESOLVED');
  assert.equal(noMatch.reason, 'NO_INTENT_MATCH');

  const sentinel = new Error('LOCAL_EMBEDDING_UNAVAILABLE');
  const failingPort = createEmbeddingIntentPort({
    embed: async () => { throw sentinel; },
    intents: [{ actionId: 'review', examples: ['review-example'] }],
  });
  const failingCore = core(failingPort, [review]);

  const failedResolve = await failingCore.resolveRequest({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi questa fonte',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(failedResolve.status, 'UNRESOLVED');
  assert.equal(failedResolve.reason, 'INTENT_RESOLUTION_FAILED');

  const failedDiscovery = await failingCore.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['REVIEW'] },
    message: 'Rivedi questa fonte',
    allowedCapabilities: ['REVIEW'],
  });
  assert.equal(failedDiscovery.status, 'UNRESOLVED');
  assert.equal(failedDiscovery.reason, 'INTENT_DISCOVERY_FAILED');
});

test('Core 0.3 excludes external writes and institutional decisions before the embedding port', async () => {
  const calls = [];
  const external = {
    id: 'external',
    capability: 'CREATE',
    label: 'Pubblica',
    priority: 40,
    risk: 'WRITE_EXTERNAL',
    requiresGenerativeAI: false,
    requiresSemanticSearch: false,
  };
  const institutional = {
    id: 'institutional',
    capability: 'CREATE',
    label: 'Decidi',
    priority: 30,
    risk: 'INSTITUTIONAL_DECISION',
    requiresGenerativeAI: false,
    requiresSemanticSearch: false,
  };
  const intentPort = createEmbeddingIntentPort({
    embed: async (text) => {
      calls.push(text);
      return [1, 0];
    },
    intents: [
      { actionId: 'external', examples: ['pubblica'] },
      { actionId: 'institutional', examples: ['decidi'] },
    ],
  });
  const instance = createContextualCopilotCore({
    registry: createActionRegistry([external, institutional]),
    policyEngine: {
      async evaluate() {
        return { allowed: true, reason: 'CUSTOM_ALLOW', humanConfirmationRequired: false };
      },
    },
    intentPort,
    generativeMode: 'none',
  });

  const result = await instance.discoverRequestIntent({
    context: { ...professionalContext, capabilities: ['CREATE'] },
    message: 'Fallo',
    allowedCapabilities: ['CREATE'],
  });

  assert.deepEqual(result, {
    status: 'UNRESOLVED',
    reason: 'NO_DISCOVERABLE_ACTIONS',
    intents: [],
  });
  assert.deepEqual(calls, []);
});
