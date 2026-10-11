import type { AccessRuntime } from '../runtime.ts';
import { assertSameOrigin } from '../origin-guard.ts';
import { readAccessSessionSecret } from '../session-cookie.ts';
import { sha256SessionSecret } from '../../domain/session-service.ts';
import { isSessionBindingCurrent } from '../../domain/principal-service.ts';
import { authorizeLaunch } from '../../domain/launcher-service.ts';
import type { CanonicalApplicationKey } from '../../domain/types.ts';
export async function handleLaunch(request: Request, runtime: AccessRuntime): Promise<Response> {
  try { assertSameOrigin(request, runtime.config.origin); } catch { return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 }); }
  const secret = readAccessSessionSecret(request);
  if (!secret) return Response.json({ status: 'ACCESS_DENIED' }, { status: 401 });
  const record = await runtime.sessionStore.findByDigest(sha256SessionSecret(secret));
  if (!record || record.revokedAt || runtime.now() >= record.absoluteExpiresAt) return Response.json({ status: 'ACCESS_DENIED' }, { status: 401 });
  const principal = await runtime.identityRepository.getPrincipal(record.principalId);
  const contexts = await runtime.identityRepository.listActiveContexts(record.principalId);
  const bindingCurrent = await isSessionBindingCurrent(runtime.identityRepository, record);
  if (!principal || principal.status !== 'ACTIVE' || contexts.length !== 1 || contexts[0]!.contextId !== record.contextId || !bindingCurrent) return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ status: 'INVALID_REQUEST' }, { status: 400 }); }
  const applicationKey = typeof body === 'object' && body !== null && 'applicationKey' in body ? (body as { applicationKey?: unknown }).applicationKey : undefined;
  if (typeof applicationKey !== 'string' || !runtime.applicationRegistry.some((entry) => entry.applicationKey === applicationKey)) return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 });
  const entitlements = await runtime.identityRepository.listEntitlements(record.principalId, record.contextId, runtime.now());
  const decision = authorizeLaunch({ applicationKey: applicationKey as CanonicalApplicationKey, entitlements, registry: runtime.applicationRegistry, at: runtime.now() });
  if (decision.allowed) return Response.json({ status: 'READY' }, { status: 501 });
  if (decision.code === 'NOT_FEDERATED') return Response.json({ status: 'NOT_FEDERATED' }, { status: 409 });
  return Response.json({ status: 'ACCESS_DENIED' }, { status: 403 });
}
