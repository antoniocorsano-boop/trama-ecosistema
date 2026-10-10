#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CANONICAL = Object.freeze({
  DOCENTE_OS: 'USE',
  CURRICOLO_ATLAS: 'READ',
  STUDIO_ATLAS: 'AUTHOR',
  ARENA: 'ENTER',
  CONTROL_CENTER: 'GOVERNANCE_OPERATOR',
});

function requirePrincipal(value) {
  if (!UUID.test(value ?? '')) throw new Error('ACCESS_ADMIN_PRINCIPAL_INVALID');
  return value;
}

function canonicalEntitlement(application) {
  const entitlement = CANONICAL[application];
  if (!entitlement) throw new Error('ACCESS_ADMIN_APPLICATION_INVALID');
  return entitlement;
}

function parseNamedArgs(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flag?.startsWith('--') || value === undefined || value.startsWith('--')) {
      throw new Error('ACCESS_ADMIN_ARGUMENT_INVALID');
    }
    if (!['--principal', '--application'].includes(flag) || values.has(flag)) {
      throw new Error('ACCESS_ADMIN_ARGUMENT_INVALID');
    }
    values.set(flag, value);
  }
  return values;
}

export function parseAccessAdminCommand(argv) {
  const [scope, action, ...rest] = argv;
  if (scope === 'entitlement' && (action === 'grant' || action === 'revoke')) {
    const values = parseNamedArgs(rest);
    if (values.size !== 2 || !values.has('--principal') || !values.has('--application')) {
      throw new Error('ACCESS_ADMIN_ARGUMENT_INVALID');
    }
    const principalId = requirePrincipal(values.get('--principal'));
    const application = values.get('--application');
    const entitlement = canonicalEntitlement(application);
    return {
      kind: action === 'grant' ? 'ENTITLEMENT_GRANT' : 'ENTITLEMENT_REVOKE',
      principalId,
      application,
      entitlement,
    };
  }

  if (scope === 'principal' && action === 'disable') {
    const values = parseNamedArgs(rest);
    if (values.size !== 1 || !values.has('--principal')) {
      throw new Error('ACCESS_ADMIN_ARGUMENT_INVALID');
    }
    return {
      kind: 'PRINCIPAL_DISABLE',
      principalId: requirePrincipal(values.get('--principal')),
    };
  }

  throw new Error('ACCESS_ADMIN_COMMAND_INVALID');
}

export async function executeAccessAdminCommand(command, repository) {
  if (command.kind === 'ENTITLEMENT_GRANT') {
    await repository.upsertEntitlement({
      principalId: command.principalId,
      application: command.application,
      entitlement: command.entitlement,
      status: 'ACTIVE',
    });
  } else if (command.kind === 'ENTITLEMENT_REVOKE') {
    await repository.revokeEntitlement(command.principalId, command.application);
  } else if (command.kind === 'PRINCIPAL_DISABLE') {
    await repository.setPrincipalStatus(command.principalId, 'DISABLED');
  } else {
    throw new Error('ACCESS_ADMIN_COMMAND_INVALID');
  }

  return { result: 'PASS', kind: command.kind, principalId: command.principalId };
}

function requireEnv(env, key) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`ACCESS_ADMIN_CONFIG_MISSING:${key}`);
  return value;
}

async function createServiceRepository(env) {
  const supabaseUrl = requireEnv(env, 'SUPABASE_URL');
  const serviceRoleKey = requireEnv(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const { createClient } = await import('@supabase/supabase-js');
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const fail = (error) => {
    if (error) throw new Error('ACCESS_ADMIN_STORE_FAILURE');
  };

  return {
    async upsertEntitlement(entry) {
      const { error } = await client.from('principal_entitlement').upsert(
        {
          principal_id: entry.principalId,
          application: entry.application,
          entitlement: entry.entitlement,
          status: entry.status,
        },
        { onConflict: 'principal_id,application' },
      );
      fail(error);
    },
    async revokeEntitlement(principalId, application) {
      const { error } = await client
        .from('principal_entitlement')
        .update({ status: 'REVOKED' })
        .eq('principal_id', principalId)
        .eq('application', application);
      fail(error);
    },
    async setPrincipalStatus(principalId, status) {
      const { error } = await client
        .from('professional_principal')
        .update({ status })
        .eq('principal_id', principalId);
      fail(error);
    },
  };
}

async function main() {
  try {
    const command = parseAccessAdminCommand(process.argv.slice(2));
    const repository = await createServiceRepository(process.env);
    const result = await executeAccessAdminCommand(command, repository);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ACCESS_ADMIN_FAILURE';
    process.stderr.write(`${JSON.stringify({ result: 'FAIL', error: message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
