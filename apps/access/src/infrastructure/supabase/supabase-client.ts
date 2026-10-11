import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseServerClientInput {
  url: string;
  secretKey: string;
  signal?: AbortSignal;
}

export function createSupabaseServerClient(input: SupabaseServerClientInput): SupabaseClient {
  const signal = input.signal;
  const fetchWithSignal: typeof fetch = async (request, init = {}) => {
    if (!signal) return fetch(request, init);
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return fetch(request, { ...init, signal });
  };

  return createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      retry: false,
    },
    global: {
      fetch: fetchWithSignal,
    },
  });
}
