import type { AccessRuntime } from '../runtime.ts';
import { assertSameOrigin } from '../origin-guard.ts';
import { isLoginEmailShape } from '../../domain/email.ts';
import { requestPilotOtp } from '../../domain/auth-service.ts';
export async function handleRequestOtp(request: Request, runtime: AccessRuntime): Promise<Response> {
  try { assertSameOrigin(request, runtime.config.origin); } catch { return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 }); }
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 }); }
  const email = typeof body === 'object' && body !== null && 'email' in body ? (body as { email?: unknown }).email : undefined;
  if (typeof email !== 'string' || !isLoginEmailShape(email)) return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 });
  const result = await requestPilotOtp({ repo: runtime.identityRepository, provider: runtime.authProvider, email, rateLimiter: runtime.rateLimiter, now: runtime.now() });
  if (result.status === 'PROVIDER_UNAVAILABLE') return Response.json(result, { status: 503 });
  return Response.json(result, { status: 202 });
}
