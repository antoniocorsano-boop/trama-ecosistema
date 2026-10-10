import type { FastifyInstance, FastifyReply } from 'fastify';
import { buildLauncher } from '../domain/launcher-service.js';
import { validateSession } from '../domain/session-service.js';
import type { AccessRepository } from '../ports/access-repository.js';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../security/session-cookie.js';
import {
  ACCESS_FLASH_COOKIE_NAME,
  clearAccessFlash,
  type AccessFlashState,
} from './auth-routes.js';

const PUBLIC_FLASH_STATES = new Set<AccessFlashState>([
  'MAGIC_LINK_SENT',
  'ACCESS_DENIED',
  'PROVIDER_UNAVAILABLE',
]);

export type AccessStateRouteDependencies = {
  repository: AccessRepository;
  now?: () => Date;
};

function clearSessionCookie(reply: FastifyReply): void {
  reply.setCookie(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
}

function readFlash(value: string | undefined): AccessFlashState | null {
  if (
    value === 'MAGIC_LINK_SENT' ||
    value === 'AUTHENTICATED' ||
    value === 'ACCESS_DENIED' ||
    value === 'PROVIDER_UNAVAILABLE'
  ) {
    return value;
  }
  return null;
}

export function registerAccessStateRoute(
  app: FastifyInstance,
  deps: AccessStateRouteDependencies,
): void {
  const now = deps.now ?? (() => new Date());

  app.get('/api/access-state', async (request, reply) => {
    const flash = readFlash(request.cookies[ACCESS_FLASH_COOKIE_NAME]);

    if (flash && PUBLIC_FLASH_STATES.has(flash)) {
      clearAccessFlash(reply);
      return reply.send({ state: flash });
    }

    const secret = request.cookies[SESSION_COOKIE_NAME];
    if (!secret) {
      if (flash === 'AUTHENTICATED') clearAccessFlash(reply);
      return reply.send({ state: 'SIGNED_OUT' });
    }

    const validation = await validateSession(secret, now(), deps.repository);
    if (validation.kind === 'INVALID') {
      clearSessionCookie(reply);
      if (flash) clearAccessFlash(reply);

      if (validation.reason === 'EXPIRED') {
        return reply.send({ state: 'SESSION_EXPIRED' });
      }
      if (validation.reason === 'PRINCIPAL_DISABLED') {
        return reply.send({ state: 'ACCESS_DENIED' });
      }
      return reply.send({ state: 'SIGNED_OUT' });
    }

    if (flash === 'AUTHENTICATED') {
      clearAccessFlash(reply);
      return reply.send({ state: 'AUTHENTICATED', principalId: validation.principalId });
    }

    const [context, launcher] = await Promise.all([
      deps.repository.getPrincipalContext(validation.principalId),
      buildLauncher(validation.principalId, deps.repository),
    ]);

    const response = {
      state: launcher.length ? 'ENTITLEMENTS_AVAILABLE' : 'NO_ENTITLEMENTS',
      principalId: validation.principalId,
      ...(context
        ? {
            context: {
              contextType: context.contextType,
              institutionRef: context.institutionRef,
            },
          }
        : {}),
      launcher,
    } as const;

    return reply.send(response);
  });
}
