import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { issueSession, revokeSession } from '../domain/session-service.js';
import { resolveProfessionalPrincipal } from '../domain/principal-service.js';
import type { AccessRepository } from '../ports/access-repository.js';
import {
  PasswordlessAccessDeniedError,
  PasswordlessProviderUnavailableError,
  type PasswordlessProvider,
  type ProviderCookie,
  type ProviderCookieJar,
} from '../ports/passwordless-provider.js';
import { CSRF_COOKIE_NAME, verifyMutationRequest } from '../security/csrf.js';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../security/session-cookie.js';

export const ACCESS_FLASH_COOKIE_NAME = 'trama_access_flash';

const flashCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60,
};

export type AuthRouteLogger = { error(message: string): void };

export type AuthRouteDependencies = {
  repository: AccessRepository;
  passwordlessProvider: PasswordlessProvider;
  publicOrigin: string;
  allowedIssuer: string;
  logger: AuthRouteLogger;
  now?: () => Date;
};

class FastifyProviderCookieJar implements ProviderCookieJar {
  private readonly values = new Map<string, ProviderCookie>();

  constructor(request: FastifyRequest, private readonly reply: FastifyReply) {
    for (const [name, value] of Object.entries(request.cookies)) {
      if (typeof value === 'string') this.values.set(name, { name, value });
    }
  }

  getAll(): ProviderCookie[] {
    return [...this.values.values()].map((cookie) => ({
      ...cookie,
      options: cookie.options ? { ...cookie.options } : undefined,
    }));
  }

  setAll(cookies: ProviderCookie[]): void {
    for (const cookie of cookies) {
      if (cookie.options?.maxAge === 0 || cookie.value === '') {
        this.values.delete(cookie.name);
      } else {
        this.values.set(cookie.name, { ...cookie });
      }
      this.reply.setCookie(cookie.name, cookie.value, cookie.options ?? {});
    }
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function mutationAllowed(request: FastifyRequest, expectedOrigin: string): boolean {
  return verifyMutationRequest(
    request.headers.origin,
    expectedOrigin,
    request.cookies[CSRF_COOKIE_NAME],
    headerValue(request.headers['x-csrf-token']),
  );
}

function validEmailBody(body: unknown): body is { email: string } {
  if (!body || typeof body !== 'object') return false;
  const email = (body as { email?: unknown }).email;
  return typeof email === 'string' && email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFlash(reply: FastifyReply, state: 'ACCESS_DENIED' | 'PROVIDER_UNAVAILABLE'): void {
  reply.setCookie(ACCESS_FLASH_COOKIE_NAME, state, flashCookieOptions);
}

function clearSessionCookie(reply: FastifyReply): void {
  reply.setCookie(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
}

export function registerAuthRoutes(app: FastifyInstance, deps: AuthRouteDependencies): void {
  const now = deps.now ?? (() => new Date());
  const callbackUrl = `${deps.publicOrigin}/auth/callback`;

  app.post('/api/auth/request-link', async (request, reply) => {
    if (!mutationAllowed(request, deps.publicOrigin)) {
      return reply.code(403).send({ state: 'ACCESS_DENIED' });
    }
    if (!validEmailBody(request.body)) {
      return reply.code(400).send({ state: 'ACCESS_DENIED' });
    }

    const jar = new FastifyProviderCookieJar(request, reply);
    try {
      await deps.passwordlessProvider.requestSignIn(request.body.email, callbackUrl, jar);
      return reply.code(202).send({ state: 'MAGIC_LINK_SENT' });
    } catch (error) {
      if (error instanceof PasswordlessAccessDeniedError) {
        return reply.code(202).send({ state: 'MAGIC_LINK_SENT' });
      }
      deps.logger.error('PASSWORDLESS_PROVIDER_UNAVAILABLE');
      return reply.code(503).send({ state: 'PROVIDER_UNAVAILABLE' });
    }
  });

  app.get('/auth/callback', async (request, reply) => {
    const query = request.query as { code?: unknown };
    const code = typeof query?.code === 'string' ? query.code : '';
    const jar = new FastifyProviderCookieJar(request, reply);

    if (!code) {
      setFlash(reply, 'ACCESS_DENIED');
      await deps.passwordlessProvider.clearTransientAuth(jar).catch(() => undefined);
      return reply.code(303).redirect('/');
    }

    try {
      const identity = await deps.passwordlessProvider.completeSignIn(code, jar);
      if (
        identity.issuer !== deps.allowedIssuer ||
        !identity.issuer.trim() ||
        !identity.subject.trim()
      ) {
        throw new PasswordlessAccessDeniedError();
      }

      await deps.passwordlessProvider.clearTransientAuth(jar);
      const resolution = await resolveProfessionalPrincipal(identity, deps.repository, { allowCreate: true });
      if (resolution.kind !== 'ACTIVE') throw new PasswordlessAccessDeniedError();

      const predecessor = request.cookies[SESSION_COOKIE_NAME];
      const session = await issueSession(
        resolution.principal.principalId,
        now(),
        deps.repository,
        predecessor,
      );
      reply.setCookie(SESSION_COOKIE_NAME, session.secret, sessionCookieOptions);
      reply.setCookie(ACCESS_FLASH_COOKIE_NAME, '', { ...flashCookieOptions, maxAge: 0 });
      return reply.code(303).redirect('/');
    } catch (error) {
      clearSessionCookie(reply);
      await deps.passwordlessProvider.clearTransientAuth(jar).catch(() => undefined);
      if (error instanceof PasswordlessProviderUnavailableError) {
        deps.logger.error('PASSWORDLESS_PROVIDER_UNAVAILABLE');
        setFlash(reply, 'PROVIDER_UNAVAILABLE');
      } else {
        setFlash(reply, 'ACCESS_DENIED');
      }
      return reply.code(303).redirect('/');
    }
  });

  app.post('/api/auth/logout', async (request, reply) => {
    if (!mutationAllowed(request, deps.publicOrigin)) {
      return reply.code(403).send({ state: 'ACCESS_DENIED' });
    }

    const secret = request.cookies[SESSION_COOKIE_NAME];
    if (secret) await revokeSession(secret, now(), deps.repository);
    clearSessionCookie(reply);
    return reply.code(204).send();
  });
}
