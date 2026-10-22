import { getRuntime } from '../../../../src/server/runtime.ts';
import { handleRequestMagicLink } from '../../../../src/server/handlers/request-magic-link.ts';

export async function POST(request: Request) {
  return handleRequestMagicLink(request, getRuntime());
}
