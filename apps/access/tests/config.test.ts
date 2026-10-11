import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAccessConfig } from '../src/config/access-config.ts';

test('pins phase 2 TTL to 28800 seconds', () => {
  const cfg = loadAccessConfig({ NODE_ENV: 'test', ACCESS_PROVIDER_KIND: 'fake', ACCESS_STORE_KIND: 'memory', ACCESS_ORIGIN: 'http://localhost:3000' });
  assert.equal(cfg.sessionTtlSeconds, 28800);
});

test('rejects fake or memory runtime in production', () => {
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'production', ACCESS_PROVIDER_KIND: 'fake', ACCESS_STORE_KIND: 'memory', ACCESS_ORIGIN: 'https://access.example.test' }));
});

test('allows disabled plus disabled as production fail-closed pair', () => {
  const cfg = loadAccessConfig({ NODE_ENV: 'production', ACCESS_PROVIDER_KIND: 'disabled', ACCESS_STORE_KIND: 'disabled', ACCESS_ORIGIN: 'https://access.example.test' });
  assert.equal(cfg.providerKind, 'disabled');
  assert.equal(cfg.storeKind, 'disabled');
});

test('requires https origin for production supabase', () => {
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'production', ACCESS_PROVIDER_KIND: 'supabase', ACCESS_STORE_KIND: 'supabase', ACCESS_ORIGIN: 'http://access.example.test' }));
});

test('rejects unsupported provider or store kinds', () => {
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'test', ACCESS_PROVIDER_KIND: 'wat', ACCESS_STORE_KIND: 'memory', ACCESS_ORIGIN: 'http://localhost:3000' }));
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'test', ACCESS_PROVIDER_KIND: 'fake', ACCESS_STORE_KIND: 'wat', ACCESS_ORIGIN: 'http://localhost:3000' }));
});

test('rejects mixed provider/store pairs', () => {
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'production', ACCESS_PROVIDER_KIND: 'supabase', ACCESS_STORE_KIND: 'disabled', ACCESS_ORIGIN: 'https://access.example.test' }));
  assert.throws(() => loadAccessConfig({ NODE_ENV: 'test', ACCESS_PROVIDER_KIND: 'fake', ACCESS_STORE_KIND: 'supabase', ACCESS_ORIGIN: 'http://localhost:3000' }));
});
