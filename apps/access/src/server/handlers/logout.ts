import type { AccessRuntime } from '../runtime.ts';
import { assertSameOrigin } from '../origin-guard.ts';
import { clearAccessSessionCookie, readAccessSessionSecret } from '../session-cookie.ts';
import { revokeAccessSession } from '../../domain/session-service.ts';
export async function handleLogout(request: Request, runtime: AccessRuntime): Promise<Response> {
  try { assertSameOrigin(request, runtime.config.origin); } catch { return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 }); }
  const secret = readAccessSessionSecret(request);
  if (secret) await revokeAccessSession({ store: runtime.sessionStore, secret, now: runtime.now() });
  return new Response(null, { status: 204, headers: { 'Set-Cookie': clearAccessSessionCookie() } });
}
