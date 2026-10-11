import type { MagicLinkCallbackInput, MagicLinkEmailOtpType } from '../../ports/auth-provider.ts';
import type { AccessRuntime } from '../runtime.ts';
import { verifyPilotMagicLink } from '../../domain/auth-service.ts';
import { serializeAccessSessionCookie } from '../session-cookie.ts';

const EMAIL_LINK_TYPES = new Set<MagicLinkEmailOtpType>(['email', 'magiclink', 'signup', 'invite', 'recovery', 'email_change']);

function configuredLocation(runtime: AccessRuntime, auth?: 'invalid' | 'denied' | 'unavailable'): string {
  const url = new URL('/', runtime.config.origin);
  if (auth) url.searchParams.set('auth', auth);
  return url.toString();
}

function callbackFromUrl(url: URL): MagicLinkCallbackInput | null {
  const codes = url.searchParams.getAll('code');
  const tokenHashes = url.searchParams.getAll('token_hash');
  const types = url.searchParams.getAll('type');

  const hasCodeForm = codes.length === 1 && codes[0]!.trim().length > 0 && tokenHashes.length === 0 && types.length === 0;
  if (hasCodeForm) return { code: codes[0]! };

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

export async function handleMagicLinkCallback(request: Request, runtime: AccessRuntime): Promise<Response> {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return new Response(null, { status: 303, headers: { Location: configuredLocation(runtime, 'invalid') } });
  }

  const callback = callbackFromUrl(url);
  if (!callback) {
    return new Response(null, { status: 303, headers: { Location: configuredLocation(runtime, 'invalid') } });
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
    return new Response(null, {
      status: 303,
      headers: {
        Location: configuredLocation(runtime),
        'Set-Cookie': serializeAccessSessionCookie(result.sessionSecret),
      },
    });
  }

  if (result.status === 'PROVIDER_UNAVAILABLE') {
    return new Response(null, { status: 303, headers: { Location: configuredLocation(runtime, 'unavailable') } });
  }
  if (result.status === 'MAGIC_LINK_INVALID') {
    return new Response(null, { status: 303, headers: { Location: configuredLocation(runtime, 'invalid') } });
  }
  return new Response(null, { status: 303, headers: { Location: configuredLocation(runtime, 'denied') } });
}
