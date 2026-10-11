import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseServerClient } from '../src/infrastructure/supabase/supabase-client.ts';

const secret = 'sb_secret_test_value_that_must_never_be_bearer';

test('privileged Supabase transport never sends sb_secret as Authorization Bearer', async () => {
  const originalFetch = globalThis.fetch;
  const seen: Array<{ apikey: string | null; authorization: string | null }> = [];
  globalThis.fetch = (async (_input, init) => {
    const headers = new Headers(init?.headers);
    seen.push({
      apikey: headers.get('apikey'),
      authorization: headers.get('authorization'),
    });
    return new Response('null', { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  try {
    const client = createSupabaseServerClient({
      url: 'https://project-ref.supabase.co',
      secretKey: secret,
    });
    const { error } = await client.rpc('access_get_principal', { p_principal_id: 'p-1' });
    assert.equal(error, null);
    assert.ok(seen.length >= 1);
    for (const request of seen) {
      assert.equal(request.apikey, secret);
      assert.equal(request.authorization, null);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
