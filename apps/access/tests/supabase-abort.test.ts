import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseIdentityRepository } from '../src/infrastructure/supabase/supabase-identity-repository.ts';

class PendingRpcQuery<T> implements PromiseLike<{ data: T; error: null }> {
  private signal?: AbortSignal;
  aborted = false;
  completedLate = false;

  abortSignal(signal: AbortSignal) {
    this.signal = signal;
    signal.addEventListener('abort', () => { this.aborted = true; }, { once: true });
    return this;
  }

  then<TResult1 = { data: T; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const promise = new Promise<{ data: T; error: null }>((resolve, reject) => {
      if (!this.signal) {
        reject(new Error('MISSING_ABORT_SIGNAL'));
        return;
      }
      if (this.signal.aborted) {
        this.aborted = true;
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer = setTimeout(() => {
        this.completedLate = true;
        resolve({ data: null as T, error: null });
      }, 100);
      this.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        this.aborted = true;
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
    return promise.then(onfulfilled, onrejected);
  }
}

test('alias lookup abort reaches the underlying RPC request and prevents late completion', async () => {
  const pending = new PendingRpcQuery<null>();
  const client = {
    rpc<T = unknown>() {
      return pending as unknown as PendingRpcQuery<T>;
    },
  };
  const repository = new SupabaseIdentityRepository(client);
  const controller = new AbortController();
  const request = repository.findAliasByEmail('pilot@example.test', { signal: controller.signal });

  await new Promise((resolve) => setTimeout(resolve, 10));
  controller.abort();

  await assert.rejects(request, (error: unknown) => error instanceof DOMException && error.name === 'AbortError');
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(pending.aborted, true);
  assert.equal(pending.completedLate, false);
});
