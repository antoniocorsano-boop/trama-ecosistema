import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseRpcClientLike, SupabaseRpcQueryLike } from './supabase-rpc.ts';

export interface SupabaseServerClientInput {
  url: string;
  secretKey: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

export interface SupabaseAuthClientInput {
  url: string;
  publishableKey: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

type RpcError = { message?: string; code?: string } | null;

class ApiKeyRpcQuery<T> implements SupabaseRpcQueryLike<T> {
  private signal?: AbortSignal;

  constructor(
    private readonly execute: (signal?: AbortSignal) => Promise<{ data: T; error: RpcError }>,
    signal?: AbortSignal,
  ) {
    this.signal = signal;
  }

  abortSignal(signal: AbortSignal): SupabaseRpcQueryLike<T> {
    this.signal = signal;
    return this;
  }

  then<TResult1 = { data: T; error: RpcError }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: RpcError }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute(this.signal).then(onfulfilled, onrejected);
  }
}

function requestFetch(signal: AbortSignal | undefined, fetchImpl: typeof fetch): typeof fetch {
  return async (request, init = {}) => {
    const effectiveSignal = signal ?? init.signal ?? undefined;
    if (effectiveSignal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return fetchImpl(request, { ...init, signal: effectiveSignal });
  };
}

export function createSupabaseServerClient(input: SupabaseServerClientInput): SupabaseRpcClientLike {
  const fetchImpl = input.fetchImpl ?? fetch;
  const baseUrl = input.url.replace(/\/$/, '');

  return {
    rpc<T = unknown>(functionName: string, params: Record<string, unknown> = {}) {
      return new ApiKeyRpcQuery<T>(async (signal) => {
        const response = await requestFetch(signal ?? input.signal, fetchImpl)(
          `${baseUrl}/rest/v1/rpc/${encodeURIComponent(functionName)}`,
          {
            method: 'POST',
            headers: {
              apikey: input.secretKey,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          },
        );

        const text = await response.text();
        if (!response.ok) {
          return {
            data: null as T,
            error: { message: 'RPC_FAILED', code: String(response.status) },
          };
        }

        return {
          data: (text ? JSON.parse(text) : null) as T,
          error: null,
        };
      }, input.signal);
    },
  };
}

export function createSupabaseAuthClient(input: SupabaseAuthClientInput): SupabaseClient {
  return createClient(input.url, input.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      retry: false,
    },
    global: {
      fetch: requestFetch(input.signal, input.fetchImpl ?? fetch),
    },
  });
}
