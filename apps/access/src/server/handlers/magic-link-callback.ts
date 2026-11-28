import type { MagicLinkCallbackInput, MagicLinkEmailOtpType } from '../../ports/auth-provider.ts';
import type { AccessRuntime } from '../runtime.ts';
import { verifyPilotMagicLink } from '../../domain/auth-service.ts';
import { serializeAccessSessionCookie } from '../session-cookie.ts';
import { clearPkceVerifierCookie, readPkceVerifier } from '../pkce-cookie.ts';

const EMAIL_LINK_TYPES = new Set<MagicLinkEmailOtpType>(['email', 'magiclink', 'signup', 'invite', 'recovery', 'email_change']);

function configuredLocation(runtime: AccessRuntime, auth?: 'invalid' | 'denied' | 'unavailable'): string {
  const url = new URL('/', runtime.config.origin);
  if (auth) url.searchParams.set('auth', auth);
  return url.toString();
}

function callbackFromRequest(request: Request, url: URL): MagicLinkCallbackInput | null {
  const codes = url.searchParams.getAll('code');
  const tokenHashes = url.searchParams.getAll('token_hash');
  const types = url.searchParams.getAll('type');

  const hasCodeForm = codes.length === 1 && codes[0]!.trim().length > 0 && tokenHashes.length === 0 && types.length === 0;
  if (hasCodeForm) {
    const codeVerifier = readPkceVerifier(request);
    return codeVerifier ? { code: codes[0]!, codeVerifier } : null;
  }

  const hasTokenHashForm = codes.length === 0
    && tokenHashes.length === 1
    && tokenHashes[0]!.trim().length > 0
    && types.length === 1
    && EMAIL_LINK_TYPES.has(types[0] as MagicLinkEmailOtpType);
  if (hasTokenHashForm) {
    return { tokenHash: tokenHashes[0]!, type: types[0] as MagicLinkEmailOtpType };
  }

  return null;
}

function redirectWithPkceClear(location: string, accessSessionSecret?: string): Response {
  const headers = new Headers({ Location: location });
  if (accessSessionSecret) headers.append('Set-Cookie', serializeAccessSessionCookie(accessSessionSecret));
  headers.append('Set-Cookie', clearPkceVerifierCookie());
  return new Response(null, { status: 303, headers });
}

export async function handleMagicLinkCallback(request: Request, runtime: AccessRuntime): Promise<Response> {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return redirectWithPkceClear(configuredLocation(runtime, 'invalid'));
  }

  const callback = callbackFromRequest(request, url);
  if (!callback) {
    return redirectWithPkceClear(configuredLocation(runtime, 'invalid'));
  }

  const result = await verifyPilotMagicLink({
    repo: runtime.identityRepository,
    provider: runtime.authProvider,
    store: runtime.sessionStore,
    callback,
    now: runtime.now(),
    rateLimiter: runtime.rateLimiter,
  });

  if (result.status === 'AUTHENTICATED') {
    return redirectWithPkceClear(configuredLocation(runtime), result.sessionSecret);
  }
  if (result.status === 'PROVIDER_UNAVAILABLE') {
    return redirectWithPkceClear(configuredLocation(runtime, 'unavailable'));
  }
  if (result.status === 'MAGIC_LINK_INVALID') {
    return redirectWithPkceClear(configuredLocation(runtime, 'invalid'));
  }
  return redirectWithPkceClear(configuredLocation(runtime, 'denied'));
}
