import cookie from '@fastify/cookie';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AccessRepository } from './ports/access-repository.js';
import type { PasswordlessProvider } from './ports/passwordless-provider.js';
import { registerAuthRoutes, type AuthRouteLogger } from './routes/auth-routes.js';

export type AccessServerDependencies = {
  repository: AccessRepository;
  passwordlessProvider: PasswordlessProvider;
  publicOrigin: string;
  allowedIssuer: string;
  logger?: AuthRouteLogger;
  now?: () => Date;
};

const quietLogger: AuthRouteLogger = {
  error: () => undefined,
};

export function buildAccessServer(deps: AccessServerDependencies): FastifyInstance {
  const app = Fastify({ logger: false });
  void app.register(cookie);
  void app.register(async (instance) => {
    registerAuthRoutes(instance, {
      repository: deps.repository,
      passwordlessProvider: deps.passwordlessProvider,
      publicOrigin: deps.publicOrigin,
      allowedIssuer: deps.allowedIssuer,
      logger: deps.logger ?? quietLogger,
      now: deps.now,
    });
  });
  return app;
}
