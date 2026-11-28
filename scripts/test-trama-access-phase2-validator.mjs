import assert from 'node:assert/strict';
import { validatePhase2Snapshot } from './validate-trama-access-phase2.mjs';

function expectViolation(name, files, changedFiles, pattern) {
  const errors = validatePhase2Snapshot({ files, changedFiles });
  assert.ok(errors.some((error) => pattern.test(error)), `${name}: expected ${pattern}, got ${JSON.stringify(errors)}`);
}

const safePkceProvider = `
export class SupabaseAuthProvider {
  async requestEmailMagicLink(input) {
    const url = new URL('/auth/v1/otp', this.projectUrl);
    url.searchParams.set('redirect_to', input.redirectTo);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        create_user: false,
        code_challenge: challenge(input.codeVerifier),
        code_challenge_method: 's256'
      })
    });
  }
  async verifyEmailMagicLink(input) {
    return fetch('/auth/v1/token?grant_type=pkce', {
      method: 'POST',
      body: JSON.stringify({ auth_code: input.code, code_verifier: input.codeVerifier })
    });
  }
}`;

const safe = {
  'apps/access/src/config/access-config.ts': `export const sessionTtlSeconds = 28800; if (nodeEnv === 'production' && (providerKind === 'fake' || storeKind === 'memory')) throw new Error('unsafe');`,
  'apps/access/src/config/application-registry.ts': `[{ applicationKey: 'DOCENTE_OS', federationState: 'NOT_FEDERATED' }]`,
  'apps/access/src/domain/auth-service.ts': `export async function verifyPilotMagicLink() { return 'ACCESS_DENIED'; }`,
  'apps/access/src/infrastructure/supabase/supabase-auth-provider.ts': safePkceProvider,
  'apps/access/src/server/handlers/request-magic-link.ts': `const redirectTo = runtime.config.origin + '/auth/confirm';`,
  'apps/access/app/page.tsx': `export default function Page(){ return <main>Accesso tramite link email</main>; }`,
};
assert.deepEqual(validatePhase2Snapshot({ files: safe, changedFiles: [] }), []);

expectViolation('localStorage session/token', { ...safe, 'apps/access/src/server/bad.ts': `localStorage.setItem('access_token', token)` }, [], /localStorage/i);
expectViolation('not-federated launchTarget', { ...safe, 'apps/access/src/config/application-registry.ts': `[{ federationState: 'NOT_FEDERATED', launchTarget: 'https://product.test' }]` }, [], /NOT_FEDERATED.*launchTarget|launchTarget.*NOT_FEDERATED/i);
expectViolation('SDK Magic Link auto signup', { ...safe, 'apps/access/src/infrastructure/supabase/supabase-auth-provider.ts': `client.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo } })` }, [], /shouldCreateUser|auto.?signup|create.*user/i);
expectViolation('HTTP Magic Link auto signup', { ...safe, 'apps/access/src/infrastructure/supabase/supabase-auth-provider.ts': safePkceProvider.replace('create_user: false', 'create_user: true') }, [], /create_user|auto.?signup|create.*user/i);
expectViolation('PKCE challenge missing', { ...safe, 'apps/access/src/infrastructure/supabase/supabase-auth-provider.ts': safePkceProvider.replace('code_challenge: challenge(input.codeVerifier),', '') }, [], /PKCE|challenge/i);
expectViolation('PKCE verifier exchange missing', { ...safe, 'apps/access/src/infrastructure/supabase/supabase-auth-provider.ts': safePkceProvider.replace('code_verifier: input.codeVerifier', 'verifier_missing: input.codeVerifier') }, [], /PKCE|verifier/i);
expectViolation('Magic Link redirect from request header', { ...safe, 'apps/access/src/server/handlers/request-magic-link.ts': `const redirectTo = request.headers.get('origin') + '/auth/confirm';` }, [], /redirect|origin|header/i);
expectViolation('auto provisioning', { ...safe, 'apps/access/src/server/handlers/request-magic-link.ts': `await createPrincipalFromEmail(email)` }, [], /auto-provision|createPrincipal|provision/i);
expectViolation('gateway routing mutation', safe, ['apps/gateway/src/config/entry.ts'], /Gateway/i);
expectViolation('unsafe production defaults', { ...safe, 'apps/access/src/config/access-config.ts': `const providerKind = env.ACCESS_PROVIDER_KIND ?? 'fake'; const storeKind = env.ACCESS_STORE_KIND ?? 'memory'; export const sessionTtlSeconds = 28800;` }, [], /production|fake|memory/i);
expectViolation('session ttl too high', { ...safe, 'apps/access/src/config/access-config.ts': `export const sessionTtlSeconds = 30000;` }, [], /28800|TTL/i);
expectViolation('student data in access migration', { ...safe, 'apps/access/supabase/migrations/20261011.sql': `create table access_student_progress(id uuid);` }, [], /student/i);
expectViolation('materials data in access migration', { ...safe, 'apps/access/supabase/migrations/20261012.sql': `create table access_materiali(id uuid);` }, [], /material/i);
expectViolation('english material data in access migration', { ...safe, 'apps/access/supabase/migrations/20261013.sql': `create table access_material(id uuid);` }, [], /material/i);
expectViolation('curricolo data in access migration', { ...safe, 'apps/access/supabase/migrations/20261014.sql': `create table access_curricolo_units(id uuid);` }, [], /curricolo/i);

const governedLiveMigration = `
create schema trama_access_private;
create table trama_access_private.application_entitlements(application_key text check (application_key in ('DOCENTE_OS','CURRICOLO_ATLAS','STUDIO_ATLAS','ARENA','CONTROL_CENTER')));
create table trama_access_private.rate_limit_counters(scope text check (scope in ('OTP_REQUEST','OTP_REQUEST_GLOBAL','OTP_VERIFY','OTP_VERIFY_GLOBAL')));
create function public.access_rate_limit_consume() returns void language sql security definer set search_path = '' as $$ select $$;
revoke all on schema trama_access_private from public, anon, authenticated;
revoke all on function public.access_rate_limit_consume() from public, anon, authenticated;
grant execute on function public.access_rate_limit_consume() to service_role;
`;
assert.deepEqual(validatePhase2Snapshot({
  files: { ...safe, 'apps/access/supabase/migrations/20261011_access_live.sql': governedLiveMigration },
  changedFiles: [],
}), [], 'canonical CURRICOLO_ATLAS entitlement vocabulary is metadata, not curricolo content');

expectViolation('all four limiter scopes required', {
  ...safe,
  'apps/access/supabase/migrations/20261011_access_live.sql': governedLiveMigration.replace("'OTP_VERIFY_GLOBAL'", "'OTP_VERIFY'"),
}, [], /OTP_VERIFY_GLOBAL|four.*scope/i);

expectViolation('live migration must not grant anon access', {
  ...safe,
  'apps/access/supabase/migrations/20261011_access_live.sql': `${governedLiveMigration}\ngrant select on trama_access_private.rate_limit_counters to anon;`,
}, [], /anon|grant/i);

console.log('PASS: ACCESS-01 Phase 2 validator adversarial cases');
