import type { AccessRuntime } from '../runtime.ts';
import { assertSameOrigin } from '../origin-guard.ts';
import { isLoginEmailShape } from '../../domain/email.ts';
import { verifyPilotOtp } from '../../domain/auth-service.ts';
import { serializeAccessSessionCookie } from '../session-cookie.ts';
export async function handleVerifyOtp(request: Request, runtime: AccessRuntime): Promise<Response> {
  try { assertSameOrigin(request, runtime.config.origin); } catch { return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 }); }
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 }); }
  const email = typeof body === 'object' && body !== null && 'email' in body ? (body as { email?: unknown }).email : undefined;
  const otp = typeof body === 'object' && body !== null && 'otp' in body ? (body as { otp?: unknown }).otp : undefined;
  if (typeof email !== 'string' || !isLoginEmailShape(email) || typeof otp !== 'string' || !/^\d{4,10}$/.test(otp)) return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 });
  const result = await verifyPilotOtp({ repo: runtime.identityRepository, provider: runtime.authProvider, store: runtime.sessionStore, rateLimiter: runtime.rateLimiter, email, otp, now: runtime.now() });
  if (result.status === 'AUTHENTICATED') return new Response(null, { status: 204, headers: { 'Set-Cookie': serializeAccessSessionCookie(result.sessionSecret) } });
  if (result.status === 'PROVIDER_UNAVAILABLE') return Response.json({ status: 'PROVIDER_UNAVAILABLE' }, { status: 503 });
  if (result.status === 'ACCESS_DENIED') return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 });
  if (result.status === 'RATE_LIMITED') return Response.json({ status: 'ACCESS_DENIED' }, { status: 429 });
  return Response.json({ status: 'OTP_INVALID' }, { status: 401 });
}
