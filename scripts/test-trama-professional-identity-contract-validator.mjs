import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(repoRoot, 'governance/access/trama-professional-identity-contract.v1.json');
const schemaPath = path.join(repoRoot, 'governance/access/trama-professional-identity-contract.v1.schema.json');
const docPath = path.join(repoRoot, 'docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md');
const validatorPath = path.join(repoRoot, 'scripts/validate-trama-professional-identity-contract.mjs');
const threatPath = path.join(repoRoot, 'governance/access/trama-professional-identity-threat-model.v1.json');
const threatDocPath = path.join(repoRoot, 'docs/evidence/access-01/access-01-phase-1-professional-identity-threat-model.md');

assert.ok(fs.existsSync(contractPath), 'canonical professional identity contract must exist');
assert.ok(fs.existsSync(schemaPath), 'professional identity contract schema must exist');
assert.ok(fs.existsSync(docPath), 'human-readable normative identity contract must exist');

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const doc = fs.readFileSync(docPath, 'utf8');

assert.equal(contract.contractId, 'TRAMA-PROFESSIONAL-IDENTITY-01');
assert.equal(contract.version, '1.0.0');
assert.deepEqual(contract.principal?.authoritativeKey, ['issuer', 'subject']);
assert.notEqual(contract.principal?.authoritativeKey, 'email');
assert.deepEqual(contract.institutionalContext?.types, ['PERSONAL', 'INSTITUTION']);
assert.equal(contract.institutionalContext?.institution?.requiredRef, 'institutionRef');
assert.equal(contract.institutionalContext?.grantsProductPermission, false);
assert.equal(contract.localIdentityBinding?.key, '(principalId, application)');
assert.equal(contract.localIdentityBinding?.requiresMatchingUuid, false);
assert.deepEqual(contract.applicationEntitlement?.canonicalPairs, [
  { application: 'DOCENTE_OS', entitlement: 'USE' },
  { application: 'CURRICOLO_ATLAS', entitlement: 'READ' },
  { application: 'STUDIO_ATLAS', entitlement: 'AUTHOR' },
  { application: 'ARENA', entitlement: 'ENTER' },
  { application: 'CONTROL_CENTER', entitlement: 'GOVERNANCE_OPERATOR' },
]);
assert.equal(contract.learnerIdentity, undefined, 'professional contract must not define learner identity');
assert.equal(schema.$id, 'https://trama.local/schemas/TRAMA-PROFESSIONAL-IDENTITY-01/v1');
assert.ok(schema.required?.includes('oidcRelyingParty'), 'schema must require OIDC relying-party semantics');
assert.ok(doc.includes('issuer + subject'), 'normative document must describe issuer + subject authority');
assert.ok(doc.includes('Curricolo Atlas'), 'normative document must use canonical Curricolo Atlas terminology');

assert.ok(fs.existsSync(validatorPath), 'fail-closed professional identity validator must exist');
const { validateContract } = await import(pathToFileURL(validatorPath).href);

const canonical = validateContract(contract);
assert.equal(canonical.valid, true, `canonical contract must validate: ${canonical.errors?.join('; ')}`);

function expectInvalid(name, mutate, expectedCode) {
  const candidate = structuredClone(contract);
  mutate(candidate);
  const result = validateContract(candidate);
  assert.equal(result.valid, false, `${name}: candidate must be rejected`);
  assert.ok(result.errors.includes(expectedCode), `${name}: expected ${expectedCode}; got ${result.errors.join(', ')}`);
}

expectInvalid('email as principal key', (c) => {
  c.principal.authoritativeKey = ['email'];
}, 'PRINCIPAL_KEY_INVALID');

expectInvalid('email as local binding key', (c) => {
  c.localIdentityBinding.key = '(email, application)';
}, 'LOCAL_BINDING_KEY_INVALID');

expectInvalid('wildcard issuer', (c) => {
  c.oidcRelyingParty.issuerValidation = 'wildcard';
}, 'ISSUER_POLICY_INVALID');

expectInvalid('wildcard audience', (c) => {
  c.oidcRelyingParty.audienceValidation = 'wildcard';
}, 'AUDIENCE_POLICY_INVALID');

expectInvalid('wildcard redirect', (c) => {
  c.oidcRelyingParty.redirectUriPolicy = 'wildcard_allowed';
}, 'REDIRECT_POLICY_INVALID');

expectInvalid('implicit flow', (c) => {
  c.oidcRelyingParty.flow = 'implicit';
}, 'FLOW_INVALID');

expectInvalid('missing state', (c) => {
  c.oidcRelyingParty.stateRequired = false;
}, 'STATE_REQUIRED');

expectInvalid('missing nonce boundary', (c) => {
  c.oidcRelyingParty.nonceRequiredWhenIdTokenConsumed = false;
}, 'NONCE_REQUIRED');

expectInvalid('token in application URL', (c) => {
  c.oidcRelyingParty.tokenTransport.applicationUrls = 'ALLOWED';
}, 'TOKEN_URL_FORBIDDEN');

expectInvalid('shared localStorage token', (c) => {
  c.oidcRelyingParty.tokenTransport.sharedLocalStorage = 'ALLOWED';
}, 'SHARED_LOCALSTORAGE_FORBIDDEN');

expectInvalid('global shared UUID requirement', (c) => {
  c.localIdentityBinding.requiresMatchingUuid = true;
}, 'MATCHING_UUID_FORBIDDEN');

expectInvalid('fine-grained Arena permission centrally', (c) => {
  c.applicationEntitlement.canonicalPairs.push({ application: 'ARENA', entitlement: 'ARENA_APPROVE' });
}, 'ENTITLEMENT_PAIR_INVALID');

expectInvalid('unknown application pair', (c) => {
  c.applicationEntitlement.canonicalPairs[0] = { application: 'UNKNOWN_APP', entitlement: 'USE' };
}, 'ENTITLEMENT_PAIR_INVALID');

expectInvalid('learner identity contamination', (c) => {
  c.learnerIdentity = { mode: 'ACCOUNT' };
}, 'LEARNER_IDENTITY_FORBIDDEN');

expectInvalid('governance step-up bypass', (c) => {
  c.applicationEntitlement.governanceOperatorRequiresSeparateStepUpForSensitiveActions = false;
}, 'GOVERNANCE_STEP_UP_REQUIRED');

expectInvalid('provider outage disables public Gateway', (c) => {
  c.failureModes.publicGateway = 'UNAVAILABLE';
}, 'PUBLIC_SURFACE_MUST_REMAIN_AVAILABLE');

assert.ok(fs.existsSync(threatPath), 'professional identity threat register must exist');
assert.ok(fs.existsSync(threatDocPath), 'human-readable professional identity threat model must exist');

const threatModel = JSON.parse(fs.readFileSync(threatPath, 'utf8'));
const threatDoc = fs.readFileSync(threatDocPath, 'utf8');
const requiredThreatIds = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12'];

assert.equal(threatModel.threatModelId, 'TRAMA-PROFESSIONAL-IDENTITY-THREAT-MODEL-01');
assert.equal(threatModel.version, '1.0.0');
assert.equal(threatModel.contractRef, 'TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0');
assert.deepEqual(threatModel.threats.map((threat) => threat.id), requiredThreatIds);
for (const threat of threatModel.threats) {
  assert.ok(threat.asset, `${threat.id}: asset required`);
  assert.ok(threat.attackOrFailure, `${threat.id}: attackOrFailure required`);
  assert.ok(Array.isArray(threat.controls) && threat.controls.length > 0, `${threat.id}: controls required`);
  assert.ok(threat.residualRisk, `${threat.id}: residualRisk required`);
  assert.ok(threat.verification, `${threat.id}: verification required`);
}

assert.equal(threatModel.sessionFailureSemantics?.newSignInOnProviderVerificationUnavailable, 'FAIL_CLOSED');
assert.deepEqual(threatModel.sessionFailureSemantics?.publicSurfacesUnaffected, [
  'TRAMA_GATEWAY',
  'CURRICOLO_ATLAS_PUBLIC',
  'CONTROL_CENTER_PUBLIC',
]);
assert.equal(threatModel.sessionFailureSemantics?.existingSession, 'LOCAL_BOUNDED_EXPIRY_NO_NEW_PRIVILEGE');
assert.equal(threatModel.sessionFailureSemantics?.localLogout, 'MUST_TERMINATE_LOCAL_SESSION_WITHOUT_PROVIDER');
assert.equal(threatModel.sessionFailureSemantics?.coordinatedLogout, 'BEST_EFFORT_IF_SUPPORTED');
assert.equal(threatModel.sessionFailureSemantics?.entitlementRevocation, 'NO_LATER_THAN_NEXT_GOVERNED_REVALIDATION');
assert.ok(threatDoc.includes('T01'), 'human threat model must enumerate T01');
assert.ok(threatDoc.includes('T12'), 'human threat model must enumerate T12');

console.log('PASS: professional identity contract, adversarial cases and threat coverage');
