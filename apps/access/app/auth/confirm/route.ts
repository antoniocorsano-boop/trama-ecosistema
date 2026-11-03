import { getRuntime } from '../../../src/server/runtime.ts';
import { handleMagicLinkCallback } from '../../../src/server/handlers/magic-link-callback.ts';

export async function GET(request: Request) {
  return handleMagicLinkCallback(request, getRuntime());
}
