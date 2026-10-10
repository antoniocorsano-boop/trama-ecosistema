import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateAccessMigration } from './validate-access-migration.mjs';

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20261010_000001_access_phase2.sql',
);

function canonicalSql(): string {
  return readFileSync(migrationPath, 'utf8');
}

describe('ACCESS-01 Phase 2 migration contract', () => {
  it('accepts only the canonical four-table identity-plane migration', () => {
    const result = validateAccessMigration(canonicalSql());
    expect(result.errors).toEqual([]);
    expect(result.tables.sort()).toEqual([
      'access_session',
      'principal_context',
      'principal_entitlement',
      'professional_principal',
    ]);
  });

  it('requires exact issuer+subject uniqueness and principal lifecycle constraint', () => {
    const sql = canonicalSql();
    expect(sql).toMatch(/unique\s*\(\s*issuer\s*,\s*subject\s*\)/i);
    expect(sql).toMatch(/status[^;]+ACTIVE[^;]+DISABLED/is);
  });

  it('pins PERSONAL/INSTITUTION context semantics and opaque institution reference', () => {
    const sql = canonicalSql();
    expect(sql).toMatch(/context_type[^;]+PERSONAL[^;]+INSTITUTION/is);
    expect(sql).toMatch(/institution_ref/i);
    expect(sql).toMatch(/context_type\s*=\s*'PERSONAL'[^;]+institution_ref\s+is\s+null/is);
    expect(sql).toMatch(/context_type\s*=\s*'INSTITUTION'[^;]+institution_ref\s+is\s+not\s+null/is);
  });

  it('restricts entitlements to the five exact canonical pairs and ACTIVE/REVOKED', () => {
    const sql = canonicalSql();
    for (const pair of [
      ['DOCENTE_OS', 'USE'],
      ['CURRICOLO_ATLAS', 'READ'],
      ['STUDIO_ATLAS', 'AUTHOR'],
      ['ARENA', 'ENTER'],
      ['CONTROL_CENTER', 'GOVERNANCE_OPERATOR'],
    ]) {
      expect(sql).toContain(`('${pair[0]}', '${pair[1]}')`);
    }
    expect(sql).toMatch(/status[^;]+ACTIVE[^;]+REVOKED/is);
  });

  it('stores session digest and lifecycle timestamps without a raw secret', () => {
    const sql = canonicalSql();
    expect(sql).toMatch(/session_digest/i);
    expect(sql).toMatch(/issued_at/i);
    expect(sql).toMatch(/expires_at/i);
    expect(sql).toMatch(/revoked_at/i);
    expect(sql).not.toMatch(/session_secret/i);
    expect(sql).not.toMatch(/raw_secret/i);
  });

  it('enables RLS on all four tables without granting anon/authenticated browser policies', () => {
    const sql = canonicalSql();
    for (const table of [
      'professional_principal',
      'principal_context',
      'principal_entitlement',
      'access_session',
    ]) {
      expect(sql).toMatch(new RegExp(`alter\\s+table\\s+${table}\\s+enable\\s+row\\s+level\\s+security`, 'i'));
    }
    expect(sql).not.toMatch(/create\s+policy[\s\S]+\bto\s+(anon|authenticated)\b/i);
  });

  it('contains no product, learner, email or workspace columns', () => {
    const result = validateAccessMigration(canonicalSql());
    expect(result.forbiddenIdentifiers).toEqual([]);
  });

  it.each([
    ['email', 'alter table professional_principal add column email text;'],
    ['learner', 'alter table professional_principal add column learner_id uuid;'],
    ['lesson', 'alter table professional_principal add column lesson_id uuid;'],
    ['materials', 'alter table professional_principal add column materials jsonb;'],
    ['workspace', 'alter table professional_principal add column workspace_id uuid;'],
  ])('fails closed when forbidden %s data leaks into the Access schema', (_name, drift) => {
    expect(validateAccessMigration(`${canonicalSql()}\n${drift}`).errors.length).toBeGreaterThan(0);
  });
});
