import type { AccessRuntime } from '../runtime.ts';
import { assertSameOrigin } from '../origin-guard.ts';
import { isLoginEmailShape } from '../../domain/email.ts';
import { requestPilotMagicLink } from '../../domain/auth-service.ts';
import { createPkceVerifier, serializePkceVerifierCookie } from '../pkce-cookie.ts';

export async function handleRequestMagicLink(request: Request, runtime: AccessRuntime): Promise<Response> {
  try {
    assertSameOrigin(request, runtime.config.origin);
  } catch {
    return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 });
  }

  const email = typeof body === 'object' && body !== null && 'email' in body
    ? (body as { email?: unknown }).email
    : undefined;
  if (typeof email !== 'string' || !isLoginEmailShape(email)) {
    return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 });
  }

  const redirectTo = `${runtime.config.origin.replace(/\/$/, '')}/auth/confirm`;
  const codeVerifier = createPkceVerifier();
  const result = await requestPilotMagicLink({
    repo: runtime.identityRepository,
    provider: runtime.authProvider,
    email,
    redirectTo,
    codeVerifier,
    rateLimiter: runtime.rateLimiter,
    now: runtime.now(),
  });

  if (result.status === 'PROVIDER_UNAVAILABLE') {
    return Response.json(result, { status: 503 });
  }
  return Response.json(result, {
    status: 202,
    headers: { 'Set-Cookie': serializePkceVerifierCookie(codeVerifier) },
  });
}
