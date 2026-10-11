import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(testsDir, '../supabase/migrations');

function migrations() {
  return readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
}

test('live Access schema migration sorts before pilot provisioning migration', () => {
  const files = migrations();
  const live = files.find((name) => name.includes('access_live.sql'));
  const provision = files.find((name) => name.includes('access_pilot_provision.sql'));
  assert.ok(live, 'live schema migration missing');
  assert.ok(provision, 'pilot provisioning migration missing');
  assert.ok(files.indexOf(live) < files.indexOf(provision), `${live} must sort before ${provision}`);
});

test('Magic Link auth-method migration is forward-only and sorts after existing Task 11 migrations', () => {
  const files = migrations();
  const live = files.find((name) => name.includes('access_live.sql'));
  const provision = files.find((name) => name.includes('access_pilot_provision.sql'));
  const magic = files.find((name) => name.includes('access_magic_link_auth_method.sql'));
  assert.ok(live, 'live schema migration missing');
  assert.ok(provision, 'pilot provisioning migration missing');
  assert.ok(magic, 'Magic Link auth-method migration missing');
  assert.ok(files.indexOf(provision) < files.indexOf(magic), `${magic} must sort after ${provision}`);

  const historical = readFileSync(path.join(migrationsDir, live), 'utf8');
  assert.match(historical, /EMAIL_OTP/, 'historical applied migration must remain intact');

  const sql = readFileSync(path.join(migrationsDir, magic), 'utf8');
  assert.match(sql, /EMAIL_MAGIC_LINK/);
  assert.match(sql, /drop constraint if exists access_sessions_auth_method_check/i);
  assert.match(sql, /p_auth_method\s*<>\s*'EMAIL_MAGIC_LINK'/i);
  assert.doesNotMatch(sql, /p_auth_method\s*<>\s*'EMAIL_OTP'/i);
});

test('live shared limiter derives sliding-window time from the database clock', () => {
  const live = migrations().find((name) => name.includes('access_live.sql'));
  assert.ok(live);
  const sql = readFileSync(path.join(migrationsDir, live), 'utf8');
  const start = sql.indexOf('create or replace function public.access_rate_limit_consume');
  assert.ok(start >= 0, 'rate limiter function missing');
  const section = sql.slice(start);
  assert.match(section, /transaction_timestamp\s*\(\s*\)/i);
  assert.doesNotMatch(section, /\bp_now\b/i);
});
