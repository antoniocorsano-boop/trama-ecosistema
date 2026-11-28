import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createActionRegistry,
  createContextualCopilotCore,
  createFailClosedPolicyEngine,
} from '../src/index.js';

const privacy = {
  dataClasses: ['TEACHER_PROFESSIONAL'],
  remoteProviderAllowed: false,
};

const baseContext = {
  appId: 'boundary-proof',
  surface: 'TEST',
  entities: [{ type: 'resource', id: 'resource-1' }],
  capabilities: ['LINK'],
  permissions: ['professional:read', 'professional:propose'],
  privacy,
};

const permissivePolicy = {
  async evaluate() {
    return { allowed: true, reason: 'CUSTOM_ALLOW', humanConfirmationRequired: false };
  },
};

test('custom policy cannot bypass core human confirmation for reversible writes', async () => {
  const registry = createActionRegistry([
    { id: 'link', capability: 'LINK', label: 'Collega', priority: 10, risk: 'WRITE_REVERSIBLE', requiresGenerativeAI: false, requiresSemanticSearch: false },
  ]);
  const core = createContextualCopilotCore({ registry, policyEngine: permissivePolicy });
  let executions = 0;

  const gated = await core.dispatch({
    context: baseContext,
    actionId: 'link',
    executor: async () => { executions += 1; return { linked: true }; },
  });
  assert.equal(gated.status, 'HUMAN_CONFIRMATION_REQUIRED');
  assert.equal(executions, 0);

  const accepted = await core.dispatch({
    context: baseContext,
    actionId: 'link',
    humanConfirmed: true,
    executor: async () => { executions += 1; return { linked: true }; },
  });
  assert.equal(accepted.status, 'EXECUTED');
  assert.equal(executions, 1);
});

test('custom policy cannot authorize an institutional decision in the generic core', async () => {
  const registry = createActionRegistry([
    { id: 'decide', capability: 'CREATE', label: 'Decidi', priority: 10, risk: 'INSTITUTIONAL_DECISION', requiresGenerativeAI: false, requiresSemanticSearch: false },
  ]);
  const core = createContextualCopilotCore({ registry, policyEngine: permissivePolicy });
  const context = { ...baseContext, capabilities: ['CREATE'] };
  let executions = 0;

  const result = await core.dispatch({
    context,
    actionId: 'decide',
    humanConfirmed: true,
    executor: async () => { executions += 1; return { decided: true }; },
  });
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'INSTITUTIONAL_DECISION_REQUIRES_VERTICAL_AUTHORITY');
  assert.equal(executions, 0);
});

test('remote semantic ranking never receives protected or unauthorized context', async () => {
  const registry = createActionRegistry([
    { id: 'review', capability: 'REVIEW', label: 'Rivedi', priority: 20, risk: 'READ_ONLY', requiresGenerativeAI: false, requiresSemanticSearch: false },
    { id: 'open', capability: 'OPEN', label: 'Apri', priority: 10, risk: 'READ_ONLY', requiresGenerativeAI: false, requiresSemanticSearch: false },
  ]);
  let rankCalls = 0;
  const semanticPort = {
    mode: 'remote',
    async rank() {
      rankCalls += 1;
      return [{ actionId: 'open', score: 1 }];
    },
  };
  const core = createContextualCopilotCore({
    registry,
    policyEngine: createFailClosedPolicyEngine(),
    semanticPort,
  });

  const protectedContext = {
    ...baseContext,
    capabilities: ['REVIEW', 'OPEN'],
    privacy: { dataClasses: ['STUDENT_PERSONAL'], remoteProviderAllowed: true },
  };
  const protectedResolved = await core.resolveActions(protectedContext);
  assert.deepEqual(protectedResolved.map((action) => action.id), ['review', 'open']);
  assert.equal(rankCalls, 0);

  const unauthorizedContext = {
    ...baseContext,
    capabilities: ['REVIEW', 'OPEN'],
    privacy: { dataClasses: ['TEACHER_PROFESSIONAL'], remoteProviderAllowed: false },
  };
  const unauthorizedResolved = await core.resolveActions(unauthorizedContext);
  assert.deepEqual(unauthorizedResolved.map((action) => action.id), ['review', 'open']);
  assert.equal(rankCalls, 0);
});
