import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createSupabaseServerClient } from '../src/infrastructure/supabase/supabase-client.ts';
import { SupabaseIdentityRepository } from '../src/infrastructure/supabase/supabase-identity-repository.ts';
import { runAccessRpc, type SupabaseRpcClientLike } from '../src/infrastructure/supabase/supabase-rpc.ts';

type ProviderUser = { id: string; email?: string | null };
type GovernedAlias = { providerIssuer: string; providerSubject: string };

export interface Task11ProvisioningInput {
  pilotEmails: string[];
  providerIssuer: string;
  region: string;
  plan: 'free';
  institutionRef: string;
}

export interface Task11ProvisioningDeps {
  listProviderUsers(): Promise<ProviderUser[]>;
  createProviderUser(email: string): Promise<ProviderUser>;
  findGovernedAlias(email: string): Promise<GovernedAlias | null>;
  provisionGovernedPilot(input: {
    normalizedEmail: string;
    providerIssuer: string;
    providerSubject: string;
    institutionRef: string;
  }): Promise<void>;
}

export interface Task11ProvisioningReceipt {
  state: 'PROVISIONED' | 'ALREADY_PROVISIONED';
  providerKind: 'supabase';
  region: 'eu-central-1';
  plan: 'free';
  providerUserCount: 1;
  identityAuthority: 'issuer+subject';
}

function normalizedPilotEmail(input: Task11ProvisioningInput): string {
  if (input.pilotEmails.length !== 1) throw new Error('PILOT_SCOPE_INVALID');
  const email = input.pilotEmails[0]?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('PILOT_SCOPE_INVALID');
  if (input.region !== 'eu-central-1' || input.plan !== 'free') throw new Error('TASK11_SCOPE_INVALID');
  if (!input.institutionRef.trim() || !input.providerIssuer.startsWith('https://')) throw new Error('TASK11_SCOPE_INVALID');
  return email;
}

function receipt(state: Task11ProvisioningReceipt['state']): Task11ProvisioningReceipt {
  return {
    state,
    providerKind: 'supabase',
    region: 'eu-central-1',
    plan: 'free',
    providerUserCount: 1,
    identityAuthority: 'issuer+subject',
  };
}

export async function provisionTask11Pilot(
  input: Task11ProvisioningInput,
  deps: Task11ProvisioningDeps,
): Promise<Task11ProvisioningReceipt> {
  const email = normalizedPilotEmail(input);
  const providerUsers = await deps.listProviderUsers();
  if (providerUsers.length > 1) throw new Error('PROVIDER_SCOPE_VIOLATION');

  const existingProviderUser = providerUsers[0] ?? null;
  if (existingProviderUser) {
    const providerEmail = existingProviderUser.email?.trim().toLowerCase();
    if (!existingProviderUser.id || providerEmail !== email) throw new Error('PROVIDER_SCOPE_VIOLATION');
  }

  const governedAlias = await deps.findGovernedAlias(email);
  if (governedAlias) {
    if (!existingProviderUser) throw new Error('SUBJECT_BINDING_MISMATCH');
    if (
      governedAlias.providerIssuer !== input.providerIssuer ||
      governedAlias.providerSubject !== existingProviderUser.id
    ) {
      throw new Error('SUBJECT_BINDING_MISMATCH');
    }
    return receipt('ALREADY_PROVISIONED');
  }

  const providerUser = existingProviderUser ?? await deps.createProviderUser(email);
  if (!providerUser.id || providerUser.email?.trim().toLowerCase() !== email) {
    throw new Error('PROVIDER_SCOPE_VIOLATION');
  }

  await deps.provisionGovernedPilot({
    normalizedEmail: email,
    providerIssuer: input.providerIssuer,
    providerSubject: providerUser.id,
    institutionRef: input.institutionRef.trim(),
  });
  return receipt('PROVISIONED');
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`TASK11_ENV_MISSING:${name}`);
  return value;
}

export function createLiveTask11ProvisioningDeps(input: { url: string; secretKey: string }): Task11ProvisioningDeps {
  const client = createSupabaseServerClient(input);
  const repository = new SupabaseIdentityRepository(client as unknown as SupabaseRpcClientLike);
  return {
    async listProviderUsers() {
      const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 2 });
      if (error) throw new Error('PROVIDER_ADMIN_UNAVAILABLE');
      return data.users.map((user) => ({ id: user.id, email: user.email }));
    },
    async createProviderUser(email: string) {
      const { data, error } = await client.auth.admin.createUser({ email, email_confirm: true });
      if (error || !data.user?.id) throw new Error('PROVIDER_USER_CREATE_FAILED');
      return { id: data.user.id, email: data.user.email };
    },
    async findGovernedAlias(email: string) {
      const alias = await repository.findAliasByEmail(email);
      return alias ? { providerIssuer: alias.providerIssuer, providerSubject: alias.providerSubject } : null;
    },
    async provisionGovernedPilot(governed) {
      await runAccessRpc<null>(client as unknown as SupabaseRpcClientLike, 'access_provision_pilot', {
        p_principal_id: randomUUID(),
        p_alias_id: randomUUID(),
        p_context_id: randomUUID(),
        p_entitlement_id: randomUUID(),
        p_normalized_email: governed.normalizedEmail,
        p_provider_issuer: governed.providerIssuer,
        p_provider_subject: governed.providerSubject,
        p_institution_ref: governed.institutionRef,
        p_valid_from: new Date().toISOString(),
      });
    },
  };
}

async function main() {
  const url = requiredEnv('ACCESS_SUPABASE_URL');
  const secretKey = requiredEnv('ACCESS_SUPABASE_SECRET_KEY');
  const pilotEmail = requiredEnv('TASK11_PILOT_EMAIL');
  const institutionRef = requiredEnv('TASK11_INSTITUTION_REF');
  const region = requiredEnv('TASK11_REGION');
  const plan = requiredEnv('TASK11_PLAN');
  if (plan !== 'free') throw new Error('TASK11_SCOPE_INVALID');
  const providerIssuer = `${new URL(url).origin}/auth/v1`;
  const result = await provisionTask11Pilot({
    pilotEmails: [pilotEmail],
    providerIssuer,
    region,
    plan: 'free',
    institutionRef,
  }, createLiveTask11ProvisioningDeps({ url, secretKey }));
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : 'TASK11_PROVISION_FAILED';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
