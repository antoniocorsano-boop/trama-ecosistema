#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_TABLES = [
  'professional_principal',
  'principal_context',
  'principal_entitlement',
  'access_session',
];

const FORBIDDEN_IDENTIFIERS = [
  'email',
  'lesson',
  'lezione',
  'curriculum',
  'curricolo',
  'material',
  'class',
  'classe',
  'group',
  'gruppo',
  'workspace',
  'studio_atlas_draft',
  'learner',
  'student',
];

const CANONICAL_PAIRS = [
  ['DOCENTE_OS', 'USE'],
  ['CURRICOLO_ATLAS', 'READ'],
  ['STUDIO_ATLAS', 'AUTHOR'],
  ['ARENA', 'ENTER'],
  ['CONTROL_CENTER', 'GOVERNANCE_OPERATOR'],
];

function normalizeSql(sql) {
  return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function collectColumnIdentifiers(sql) {
  const identifiers = new Set();
  const typePattern = '(?:uuid|text|timestamptz|timestamp|jsonb|json|integer|bigint|boolean|bytea|numeric)';

  for (const match of sql.matchAll(new RegExp(`^\\s*([a-z_][a-z0-9_]*)\\s+${typePattern}\\b`, 'gim'))) {
    identifiers.add(match[1].toLowerCase());
  }
  for (const match of sql.matchAll(/alter\s+table\s+[a-z_][a-z0-9_]*\s+add\s+column\s+([a-z_][a-z0-9_]*)/gi)) {
    identifiers.add(match[1].toLowerCase());
  }

  return [...identifiers];
}

export function validateAccessMigration(sql) {
  const normalized = normalizeSql(sql);
  const errors = [];
  const tables = [...normalized.matchAll(/create\s+table\s+([a-z_][a-z0-9_]*)/gi)].map((match) =>
    match[1].toLowerCase(),
  );

  const unexpectedTables = tables.filter((table) => !REQUIRED_TABLES.includes(table));
  const missingTables = REQUIRED_TABLES.filter((table) => !tables.includes(table));
  if (unexpectedTables.length) errors.push(`unexpected tables: ${unexpectedTables.join(', ')}`);
  if (missingTables.length) errors.push(`missing tables: ${missingTables.join(', ')}`);
  if (tables.length !== REQUIRED_TABLES.length) errors.push('Access migration must define exactly four tables');

  if (!/unique\s*\(\s*issuer\s*,\s*subject\s*\)/i.test(normalized)) {
    errors.push('professional_principal must uniquely bind exact issuer+subject');
  }
  if (!/status[^;]+ACTIVE[^;]+DISABLED/is.test(normalized)) {
    errors.push('principal status constraint missing');
  }
  if (!/context_type[^;]+PERSONAL[^;]+INSTITUTION/is.test(normalized)) {
    errors.push('context type constraint missing');
  }
  if (!/context_type\s*=\s*'PERSONAL'[^;]+institution_ref\s+is\s+null/is.test(normalized)) {
    errors.push('PERSONAL context must have null institution_ref');
  }
  if (!/context_type\s*=\s*'INSTITUTION'[^;]+institution_ref\s+is\s+not\s+null/is.test(normalized)) {
    errors.push('INSTITUTION context must require institution_ref');
  }

  for (const [application, entitlement] of CANONICAL_PAIRS) {
    if (!normalized.includes(`('${application}', '${entitlement}')`)) {
      errors.push(`missing canonical entitlement pair ${application}/${entitlement}`);
    }
  }
  if (!/status[^;]+ACTIVE[^;]+REVOKED/is.test(normalized)) {
    errors.push('entitlement lifecycle constraint missing');
  }

  for (const column of ['session_digest', 'issued_at', 'expires_at', 'revoked_at']) {
    if (!new RegExp(`\\b${column}\\b`, 'i').test(normalized)) errors.push(`missing ${column}`);
  }
  if (/\b(session_secret|raw_secret)\b/i.test(normalized)) {
    errors.push('raw session secret column forbidden');
  }

  for (const table of REQUIRED_TABLES) {
    if (!new RegExp(`alter\\s+table\\s+${table}\\s+enable\\s+row\\s+level\\s+security`, 'i').test(normalized)) {
      errors.push(`RLS not enabled for ${table}`);
    }
  }
  if (/create\s+policy[\s\S]+\bto\s+(anon|authenticated)\b/i.test(normalized)) {
    errors.push('browser-facing anon/authenticated policy forbidden');
  }

  const columns = collectColumnIdentifiers(normalized);
  const forbiddenIdentifiers = columns.filter((column) =>
    FORBIDDEN_IDENTIFIERS.some((identifier) => column.includes(identifier)),
  );
  if (forbiddenIdentifiers.length) {
    errors.push(`forbidden Access identifiers: ${forbiddenIdentifiers.join(', ')}`);
  }

  return { errors, tables, forbiddenIdentifiers };
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const defaultPath = path.resolve(
    scriptDir,
    '../supabase/migrations/20261010_000001_access_phase2.sql',
  );
  const migrationPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;

  if (!fs.existsSync(migrationPath)) {
    console.error(JSON.stringify({ result: 'FAIL', errors: [`missing migration: ${migrationPath}`] }, null, 2));
    process.exit(1);
  }

  const result = validateAccessMigration(fs.readFileSync(migrationPath, 'utf8'));
  console.log(
    JSON.stringify(
      {
        contract: 'ACCESS-01-PHASE2-STORE',
        migration: migrationPath,
        result: result.errors.length ? 'FAIL' : 'PASS',
        ...result,
      },
      null,
      2,
    ),
  );
  process.exit(result.errors.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
