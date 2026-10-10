import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(
  repoRoot,
  'governance/access/trama-professional-identity-contract.v1.json',
);
const schemaPath = path.join(
  repoRoot,
  'governance/access/trama-professional-identity-contract.v1.schema.json',
);
const docPath = path.join(repoRoot, 'docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md');

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

console.log('PASS: Task 1 professional identity contract semantics');
