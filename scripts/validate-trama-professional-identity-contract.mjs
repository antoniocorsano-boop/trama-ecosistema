import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const schemaPath = path.join(repoRoot, 'governance/access/trama-professional-identity-contract.v1.schema.json');
const CONTRACT_SCHEMA = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const CANONICAL_PAIRS = [
  { application: 'DOCENTE_OS', entitlement: 'USE' },
  { application: 'CURRICOLO_ATLAS', entitlement: 'READ' },
  { application: 'STUDIO_ATLAS', entitlement: 'AUTHOR' },
  { application: 'ARENA', entitlement: 'ENTER' },
  { application: 'CONTROL_CENTER', entitlement: 'GOVERNANCE_OPERATOR' },
];

const REQUIRED_SECTIONS = [
  'contractId',
  'version',
  'status',
  'scope',
  'principal',
  'institutionalContext',
  'applicationEntitlement',
  'localIdentityBinding',
  'oidcRelyingParty',
  'session',
  'logout',
  'failureModes',
  'forbiddenPatterns',
];

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function matchesType(value, expectedType) {
  if (expectedType === 'object') return isObject(value);
  if (expectedType === 'array') return Array.isArray(value);
  if (expectedType === 'string') return typeof value === 'string';
  if (expectedType === 'boolean') return typeof value === 'boolean';
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (expectedType === 'integer') return Number.isInteger(value);
  if (expectedType === 'null') return value === null;
  return false;
}

function validateSchemaNode(value, schema, valuePath = '$') {
  const errors = [];
  const violation = (rule) => errors.push(`SCHEMA_VIOLATION:${valuePath}:${rule}`);

  if (!isObject(schema)) {
    violation('schema_node_invalid');
    return errors;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    violation(`type=${schema.type}`);
    return errors;
  }

  if (Object.hasOwn(schema, 'const') && !sameJson(value, schema.const)) {
    violation('const');
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => sameJson(value, candidate))) {
    violation('enum');
  }

  if (typeof value === 'string' && Number.isInteger(schema.minLength) && value.length < schema.minLength) {
    violation(`minLength=${schema.minLength}`);
  }

  if (isObject(value)) {
    const properties = isObject(schema.properties) ? schema.properties : {};

    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.hasOwn(value, key)) violation(`required=${key}`);
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) violation(`additionalProperties=${key}`);
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        errors.push(...validateSchemaNode(value[key], childSchema, `${valuePath}.${key}`));
      }
    }
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      violation(`minItems=${schema.minItems}`);
    }
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) {
      violation(`maxItems=${schema.maxItems}`);
    }

    const prefixItems = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
    for (let index = 0; index < Math.min(prefixItems.length, value.length); index += 1) {
      errors.push(...validateSchemaNode(value[index], prefixItems[index], `${valuePath}[${index}]`));
    }

    if (schema.items === false && value.length > prefixItems.length) {
      for (let index = prefixItems.length; index < value.length; index += 1) {
        errors.push(`SCHEMA_VIOLATION:${valuePath}[${index}]:items=false`);
      }
    } else if (isObject(schema.items)) {
      for (let index = prefixItems.length; index < value.length; index += 1) {
        errors.push(...validateSchemaNode(value[index], schema.items, `${valuePath}[${index}]`));
      }
    }
  }

  return errors;
}

export function validateContract(contract) {
  const errors = [];
  const fail = (code) => {
    if (!errors.includes(code)) errors.push(code);
  };

  if (!isObject(contract)) return { valid: false, errors: ['CONTRACT_NOT_OBJECT'] };

  for (const schemaError of validateSchemaNode(contract, CONTRACT_SCHEMA)) fail(schemaError);

  for (const section of REQUIRED_SECTIONS) {
    if (!(section in contract)) fail(`MISSING_SECTION:${section}`);
  }

  if (contract.contractId !== 'TRAMA-PROFESSIONAL-IDENTITY-01') fail('CONTRACT_ID_INVALID');
  if (contract.version !== '1.0.0') fail('VERSION_INVALID');
  if (contract.scope !== 'professional_identity_only') fail('SCOPE_INVALID');

  if (!sameJson(contract.principal?.authoritativeKey, ['issuer', 'subject'])) fail('PRINCIPAL_KEY_INVALID');
  if (contract.principal?.emailAuthoritative !== false) fail('EMAIL_AUTHORITY_FORBIDDEN');
  if (contract.principal?.mutableMetadataAuthoritative !== false) fail('MUTABLE_METADATA_AUTHORITY_FORBIDDEN');

  if (!sameJson(contract.institutionalContext?.types, ['PERSONAL', 'INSTITUTION'])) fail('CONTEXT_TYPES_INVALID');
  if (contract.institutionalContext?.institution?.requiredRef !== 'institutionRef') fail('INSTITUTION_REF_INVALID');
  if (contract.institutionalContext?.grantsProductPermission !== false) fail('CONTEXT_PERMISSION_FORBIDDEN');

  if (contract.localIdentityBinding?.key !== '(principalId, application)') fail('LOCAL_BINDING_KEY_INVALID');
  if (contract.localIdentityBinding?.resolver !== 'server_side_governed_mapping') fail('LOCAL_BINDING_RESOLVER_INVALID');
  if (contract.localIdentityBinding?.result !== 'localSubjectRef') fail('LOCAL_BINDING_RESULT_INVALID');
  if (contract.localIdentityBinding?.requiresMatchingUuid !== false) fail('MATCHING_UUID_FORBIDDEN');
  if (contract.localIdentityBinding?.emailBindingAllowed !== false) fail('EMAIL_BINDING_FORBIDDEN');

  if (contract.applicationEntitlement?.scope !== 'application_entry_or_mode_only') fail('ENTITLEMENT_SCOPE_INVALID');
  if (contract.applicationEntitlement?.fineGrainedPermissionsRemainLocal !== true) fail('LOCAL_PERMISSION_AUTHORITY_REQUIRED');
  if (!sameJson(contract.applicationEntitlement?.canonicalPairs, CANONICAL_PAIRS)) fail('ENTITLEMENT_PAIR_INVALID');
  if (contract.applicationEntitlement?.governanceOperatorRequiresSeparateStepUpForSensitiveActions !== true) {
    fail('GOVERNANCE_STEP_UP_REQUIRED');
  }

  const oidc = contract.oidcRelyingParty;
  if (oidc?.protocol !== 'OpenID Connect' || oidc?.oauthProfile !== 'OAuth 2.x') fail('PROTOCOL_INVALID');
  if (oidc?.flow !== 'authorization_code' || oidc?.pkce !== 'S256') fail('FLOW_INVALID');
  if (oidc?.issuerValidation !== 'exact_allowlist') fail('ISSUER_POLICY_INVALID');
  if (oidc?.audienceValidation !== 'exact_client_binding') fail('AUDIENCE_POLICY_INVALID');
  if (oidc?.stateRequired !== true) fail('STATE_REQUIRED');
  if (oidc?.nonceRequiredWhenIdTokenConsumed !== true) fail('NONCE_REQUIRED');
  if (oidc?.redirectUriPolicy !== 'exact_allowlist_no_wildcards') fail('REDIRECT_POLICY_INVALID');
  if (oidc?.tokenTransport?.applicationUrls !== 'FORBIDDEN') fail('TOKEN_URL_FORBIDDEN');
  if (oidc?.tokenTransport?.sharedLocalStorage !== 'FORBIDDEN') fail('SHARED_LOCALSTORAGE_FORBIDDEN');

  if (contract.session?.boundedExpiry !== true) fail('BOUNDED_SESSION_REQUIRED');
  if (contract.logout?.local !== 'MUST_TERMINATE_LOCAL_SESSION_INDEPENDENTLY_OF_PROVIDER_AVAILABILITY') {
    fail('LOCAL_LOGOUT_REQUIRED');
  }

  if (contract.failureModes?.providerUnavailableNewSignIn !== 'FAIL_CLOSED') fail('PROVIDER_OUTAGE_MUST_FAIL_CLOSED');
  if (contract.failureModes?.providerVerificationUnavailable !== 'FAIL_CLOSED') fail('PROVIDER_VERIFICATION_MUST_FAIL_CLOSED');
  if (
    contract.failureModes?.publicGateway !== 'REMAIN_AVAILABLE' ||
    contract.failureModes?.publicCurricoloAtlas !== 'REMAIN_AVAILABLE' ||
    contract.failureModes?.publicControlCenter !== 'REMAIN_AVAILABLE'
  ) {
    fail('PUBLIC_SURFACE_MUST_REMAIN_AVAILABLE');
  }

  if ('learnerIdentity' in contract || 'studentIdentity' in contract || 'learnerProfile' in contract) {
    fail('LEARNER_IDENTITY_FORBIDDEN');
  }

  return { valid: errors.length === 0, errors };
}

function runCli() {
  const contractPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(repoRoot, 'governance/access/trama-professional-identity-contract.v1.json');

  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch (error) {
    console.error(`INVALID_JSON_OR_PATH: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const result = validateContract(contract);
  if (!result.valid) {
    for (const error of result.errors) console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${contract.contractId}@${contract.version}`);
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) runCli();
