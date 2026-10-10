import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(
  repoRoot,
  'governance/access/trama-professional-identity-contract.v1.json',
);

assert.ok(fs.existsSync(contractPath), 'canonical professional identity contract must exist');

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

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

console.log('PASS: Task 1 professional identity contract semantics');
