import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CAPABILITIES,
  ACTION_RISKS,
  createActionRegistry,
  createContextualCopilotCore,
  createFailClosedPolicyEngine,
  validateContextSnapshot,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const actions = [
  { id: 'annotate', capability: 'ANNOTATE', label: 'Annota', priority: 90, risk: 'WRITE_REVERSIBLE', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'open', capability: 'OPEN', label: 'Apri', priority: 80, risk: 'READ_ONLY', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'review', capability: 'REVIEW', label: 'Rivedi', priority: 70, risk: 'PROPOSE', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'ask', capability: 'ASK', label: 'Chiedi', priority: 60, risk: 'PROPOSE', requiresGenerativeAI: true, requiresSemanticSearch: false },
  { id: 'search', capability: 'SEARCH', label: 'Cerca', priority: 50, risk: 'READ_ONLY', requiresGenerativeAI: false, requiresSemanticSearch: false },
  { id: 'create', capability: 'CREATE', label: 'Crea', priority: 40, risk: 'PROPOSE', requiresGenerativeAI: true, requiresSemanticSearch: false },
];

const privacy = {
  dataClasses: ['TEACHER_PROFESSIONAL'],
  remoteProviderAllowed: false,
};

const docenteContext = {
  appId: 'docente-os',
  surface: 'LESSON_CONDUCT',
  entities: [{ type: 'lesson', id: 'lesson-1' }],
  capabilities: ['ANNOTATE', 'OPEN', 'REVIEW', 'ASK'],
  permissions: ['professional:read', 'professional:propose'],
  privacy,
};

const registroContext = {
  appId: 'registro-docente',
  surface: 'CLASS_OR_UDA',
  entities: [{ type: 'uda', id: 'uda-1' }],
  capabilities: ['ANNOTATE', 'SEARCH', 'REVIEW', 'ASK'],
  permissions: ['professional:read', 'professional:propose'],
  privacy,
};

test('exports the approved common capability and risk vocabularies', () => {
  assert.ok(CAPABILITIES.includes('ASK'));
  assert.ok(CAPABILITIES.includes('IMPORT'));
  assert.ok(ACTION_RISKS.includes('INSTITUTIONAL_DECISION'));
});

test('validates a minimal provider-neutral ContextSnapshot', () => {
  assert.deepEqual(validateContextSnapshot(docenteContext), docenteContext);
  assert.throws(() => validateContextSnapshot({ ...docenteContext, capabilities: ['PROVIDER_X'] }), /capability/i);
  assert.throws(() => validateContextSnapshot({ ...docenteContext, privacy: undefined }), /privacy/i);
});

test('the same core resolves Docente OS and registro-docente only from declared capabilities', async () => {
  const core = createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: createFailClosedPolicyEngine(),
  });

  const docente = await core.resolveActions(docenteContext);
  const registro = await core.resolveActions(registroContext);

  assert.deepEqual(docente.map((action) => action.id), ['annotate', 'open', 'review']);
  assert.deepEqual(registro.map((action) => action.id), ['annotate', 'review', 'search']);
  assert.ok(docente.every((action) => docenteContext.capabilities.includes(action.capability)));
  assert.ok(registro.every((action) => registroContext.capabilities.includes(action.capability)));
});

test('remote generative actions fail closed when remote provider flow is not authorized', async () => {
  const core = createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: createFailClosedPolicyEngine(),
  });

  const resolved = await core.resolveActions({ ...registroContext, capabilities: ['ASK', 'REVIEW'] });
  assert.deepEqual(resolved.map((action) => action.id), ['review']);
});

test('semantic ranking can reorder allowed actions but cannot add capabilities', async () => {
  const semanticPort = {
    async rank() {
      return [
        { actionId: 'search', score: 0.99 },
        { actionId: 'create', score: 1.0 },
        { actionId: 'review', score: 0.5 },
      ];
    },
  };

  const core = createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine: createFailClosedPolicyEngine(),
    semanticPort,
  });

  const resolved = await core.resolveActions(registroContext);
  assert.deepEqual(resolved.map((action) => action.id), ['search', 'review', 'annotate']);
  assert.ok(!resolved.some((action) => action.capability === 'CREATE'));
});

test('policy is evaluated before dispatch and a denied action never reaches the executor', async () => {
  const events = [];
  const policyEngine = {
    async evaluate({ action }) {
      events.push(`policy:${action.id}`);
      return { allowed: false, reason: 'DENIED_BY_TEST', humanConfirmationRequired: false };
    },
  };
  const core = createContextualCopilotCore({
    registry: createActionRegistry(actions),
    policyEngine,
  });

  let executions = 0;
  const result = await core.dispatch({
    context: { ...docenteContext, capabilities: ['OPEN'] },
    actionId: 'open',
    executor: async () => {
      executions += 1;
      events.push('executor');
      return { ok: true };
    },
  });

  assert.equal(result.status, 'DENIED');
  assert.equal(executions, 0);
  assert.deepEqual(events, ['policy:open']);
});

test('high-risk actions require explicit human confirmation before execution', async () => {
  const localActions = [
    { id: 'link', capability: 'LINK', label: 'Collega', priority: 10, risk: 'WRITE_REVERSIBLE', requiresGenerativeAI: false, requiresSemanticSearch: false },
  ];
  const core = createContextualCopilotCore({
    registry: createActionRegistry(localActions),
    policyEngine: createFailClosedPolicyEngine(),
  });
  const context = { ...registroContext, capabilities: ['LINK'] };
  let executions = 0;

  const denied = await core.dispatch({
    context,
    actionId: 'link',
    executor: async () => { executions += 1; return { linked: true }; },
  });
  assert.equal(denied.status, 'HUMAN_CONFIRMATION_REQUIRED');
  assert.equal(executions, 0);

  const accepted = await core.dispatch({
    context,
    actionId: 'link',
    humanConfirmed: true,
    executor: async () => { executions += 1; return { linked: true }; },
  });
  assert.equal(accepted.status, 'EXECUTED');
  assert.equal(executions, 1);
});

test('core source contains no app-specific branching identifiers', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8').toLowerCase();
  assert.equal(source.includes('docente-os'), false);
  assert.equal(source.includes('registro-docente'), false);
  assert.equal(source.includes('lesson_conduct'), false);
  assert.equal(source.includes('class_or_uda'), false);
});
