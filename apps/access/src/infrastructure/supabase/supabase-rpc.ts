type RpcError = { message?: string; code?: string } | null;

export interface SupabaseRpcQueryLike<T> extends PromiseLike<{ data: T; error: RpcError }> {
  abortSignal(signal: AbortSignal): SupabaseRpcQueryLike<T>;
}

export interface SupabaseRpcClientLike {
  rpc<T = unknown>(functionName: string, params?: Record<string, unknown>): SupabaseRpcQueryLike<T>;
}

export async function runAccessRpc<T>(
  client: SupabaseRpcClientLike,
  functionName: string,
  params: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  try {
    let query = client.rpc<T>(functionName, params);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw new Error('ACCESS_STORE_UNAVAILABLE');
    return data;
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
    if (error instanceof Error && error.message === 'ACCESS_STORE_UNAVAILABLE') throw error;
    throw new Error('ACCESS_STORE_UNAVAILABLE');
  }
}
