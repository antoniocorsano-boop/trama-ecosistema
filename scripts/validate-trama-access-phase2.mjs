import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RUNTIME_EXT = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/i;
const MIGRATION_RE = /^apps\/access\/supabase\/migrations\/.*\.sql$/i;
const PRODUCT_DATA_TERMS = /(?:^|[^a-z0-9])(?:lesson|curricolo|student|learner|class|group|studio_draft|material|materials|materiale|materiali)(?:[^a-z0-9]|$)/i;
const CANONICAL_RATE_SCOPES = ['OTP_REQUEST', 'OTP_REQUEST_GLOBAL', 'OTP_VERIFY', 'OTP_VERIFY_GLOBAL'];
const ALLOWED_CANONICAL_METADATA_LITERALS = ['CURRICOLO_ATLAS'];

function isRuntimeSource(file) {
  if (!file.startsWith('apps/access/')) return false;
  if (!RUNTIME_EXT.test(file)) return false;
  if (file.startsWith('apps/access/tests/') || file.startsWith('apps/access/e2e/') || file.includes('/testing/')) return false;
  return true;
}

function objectBlocks(source) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  let quote = null;
  let escaped = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') { if (depth === 0) start = i; depth += 1; }
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) { blocks.push(source.slice(start, i + 1)); start = -1; }
    }
  }
  return blocks;
}

function migrationContentWithoutCanonicalMetadata(source) {
  let result = source;
  for (const literal of ALLOWED_CANONICAL_METADATA_LITERALS) {
    result = result.replaceAll(`'${literal}'`, "'CANONICAL_APPLICATION'");
    result = result.replaceAll(`\"${literal}\"`, '"CANONICAL_APPLICATION"');
  }
  return result;
}

export function validatePhase2Snapshot({ files, changedFiles = [] }) {
  const errors = [];
  const entries = Object.entries(files);
  const runtimeEntries = entries.filter(([file]) => isRuntimeSource(file));

  for (const [file, source] of runtimeEntries) {
    if (/\blocalStorage\b/.test(source) && /(?:token|session|auth|bearer|jwt)/i.test(source)) {
      errors.push(`${file}: localStorage must not carry Access authentication/session material`);
    }
    if (/shouldCreateUser\s*:\s*true/i.test(source) || /\.auth\.signUp\s*\(/.test(source)) {
      errors.push(`${file}: Magic Link pilot must remain fail-closed with shouldCreateUser:false and no runtime auto-signup`);
    }
    if (/(?:Codice OTP|Verifica codice|Invia codice)/i.test(source)) {
      errors.push(`${file}: numeric OTP user flow is superseded by the approved Magic Link pilot`);
    }
  }

  const magicProvider = files['apps/access/src/infrastructure/supabase/supabase-auth-provider.ts'];
  if (magicProvider) {
    if (!/requestEmailMagicLink/.test(magicProvider) || !/shouldCreateUser\s*:\s*false/.test(magicProvider) || !/emailRedirectTo/.test(magicProvider)) {
      errors.push('apps/access/src/infrastructure/supabase/supabase-auth-provider.ts: Magic Link request must pin shouldCreateUser:false and an explicit emailRedirectTo');
    }
  }

  const magicRequestHandler = files['apps/access/src/server/handlers/request-magic-link.ts'];
  if (magicRequestHandler) {
    if (!/runtime\.config\.origin/.test(magicRequestHandler)) {
      errors.push('apps/access/src/server/handlers/request-magic-link.ts: Magic Link redirect must derive from configured Access origin');
    }
    if (/request\.headers|headers\s*\(|x-forwarded-host|x-forwarded-proto/i.test(magicRequestHandler)) {
      errors.push('apps/access/src/server/handlers/request-magic-link.ts: request headers must not control the Magic Link redirect origin');
    }
  }

  for (const file of ['apps/access/app/api/auth/request-otp/route.ts', 'apps/access/app/api/auth/verify-otp/route.ts']) {
    if (files[file]) errors.push(`${file}: numeric OTP route is superseded by the approved Magic Link pilot`);
  }

  const registry = files['apps/access/src/config/application-registry.ts'];
  if (registry) {
    for (const block of objectBlocks(registry)) {
      if (/federationState\s*:\s*['"]NOT_FEDERATED['"]/.test(block) && /\blaunchTarget\s*:/.test(block)) {
        errors.push('apps/access/src/config/application-registry.ts: NOT_FEDERATED entry must not define launchTarget');
      }
    }
  }

  for (const [file, source] of runtimeEntries) {
    if (!/(?:src\/server\/handlers\/|src\/domain\/auth-service)/.test(file)) continue;
    if (/(?:createPrincipal|upsertPrincipal|createLoginAlias|upsertLoginAlias|autoProvision|provisionPrincipal|provisionAlias)/i.test(source)) {
      errors.push(`${file}: auto-provisioning or runtime principal creation is forbidden in Phase 2`);
    }
  }

  const gatewayChanges = changedFiles.filter((file) => file.startsWith('apps/gateway/'));
  if (gatewayChanges.length) {
    errors.push(`Gateway changes are outside ACCESS-01 Phase 2 runtime scope: ${gatewayChanges.join(', ')}`);
  }

  const config = files['apps/access/src/config/access-config.ts'];
  if (!config) {
    errors.push('apps/access/src/config/access-config.ts: required Phase 2 configuration missing');
  } else {
    if (!/sessionTtlSeconds\s*:\s*28800/.test(config) && !/sessionTtlSeconds\s*=\s*28800/.test(config)) {
      errors.push('apps/access/src/config/access-config.ts: session TTL must be exactly 28800 seconds');
    }
    const hasProductionGuard = /production/.test(config) && /providerKind\s*===\s*['"]fake['"]/.test(config) && /storeKind\s*===\s*['"]memory['"]/.test(config) && /throw\s+new\s+Error/.test(config);
    if (!hasProductionGuard) {
      errors.push('apps/access/src/config/access-config.ts: production must reject fake provider and memory store');
    }
    if (/ACCESS_PROVIDER_KIND\s*\?\?\s*['"]fake['"]/.test(config) || /ACCESS_STORE_KIND\s*\?\?\s*['"]memory['"]/.test(config)) {
      errors.push('apps/access/src/config/access-config.ts: fake/memory must not be unconditional production defaults');
    }
  }

  for (const [file, source] of entries) {
    if (!MIGRATION_RE.test(file)) continue;
    const contentForBoundaryScan = migrationContentWithoutCanonicalMetadata(source);
    const hit = contentForBoundaryScan.match(PRODUCT_DATA_TERMS);
    if (hit) errors.push(`${file}: product/learner data term forbidden in Access store migration: ${hit[0]}`);

    if (/rate_limit_counters|access_rate_limit_consume/i.test(source)) {
      for (const scope of CANONICAL_RATE_SCOPES) {
        if (!source.includes(scope)) errors.push(`${file}: live rate limiter migration must represent canonical scope ${scope}`);
      }
    }

    const unsafeGrant = source.match(/grant\s+(?:select|insert|update|delete|all|usage)\b[^;]*\bto\s+(?:anon|authenticated)\b/i);
    if (unsafeGrant) errors.push(`${file}: Access private store must not grant Data API access to anon/authenticated roles`);
  }

  return errors;
}

function collectFiles(root, relativeDir, out) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(relativeDir.replaceAll('\\', '/'), entry.name);
    const abs = path.join(root, rel);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      collectFiles(root, rel, out);
    } else if (RUNTIME_EXT.test(rel) || MIGRATION_RE.test(rel)) {
      out[rel] = fs.readFileSync(abs, 'utf8');
    }
  }
}

function getChangedFiles(root, base) {
  if (!base) return [];
  try {
    return execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { cwd: root, encoding: 'utf8' })
      .split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to calculate Phase 2 diff from ${base}: ${detail}`);
  }
}

function main() {
  const thisFile = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(path.dirname(thisFile), '..');
  const files = {};
  collectFiles(repoRoot, 'apps/access', files);
  const baseIndex = process.argv.indexOf('--base');
  const base = baseIndex >= 0 ? process.argv[baseIndex + 1] : undefined;
  const changedFiles = getChangedFiles(repoRoot, base);
  const errors = validatePhase2Snapshot({ files, changedFiles });
  if (errors.length) {
    console.error('ACCESS-01 Phase 2 runtime invariant violations:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('PASS: ACCESS-01 Phase 2 runtime invariants');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
