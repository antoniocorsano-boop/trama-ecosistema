import { createHash, randomBytes } from 'node:crypto';
import type { SessionStore } from '../ports/session-store.ts';
import type { AccessSessionRecord } from './types.ts';
const TTL_MS = 28_800_000;
export function sha256SessionSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}
export async function issueAccessSession(input: {
  store: SessionStore;
  principalId: string;
  contextId: string;
  aliasId: string;
  providerIssuer: string;
  providerSubject: string;
  now: Date;
}): Promise<{ secret: string; record: AccessSessionRecord }> {
  const secret = randomBytes(32).toString('base64url');
  const record: AccessSessionRecord = {
    sessionDigest: sha256SessionSecret(secret),
    principalId: input.principalId,
    contextId: input.contextId,
    aliasId: input.aliasId,
    providerIssuer: input.providerIssuer,
    providerSubject: input.providerSubject,
    createdAt: input.now,
    absoluteExpiresAt: new Date(input.now.getTime() + TTL_MS),
    authMethod: 'EMAIL_MAGIC_LINK',
    lastEntitlementCheckAt: input.now,
  };
  await input.store.create(record);
  return { secret, record };
}
export type SessionValidation = { ok: true; record: AccessSessionRecord } | { ok: false; code: 'SESSION_MISSING' | 'SESSION_EXPIRED' | 'SESSION_REVOKED' | 'SESSION_INVALID' };
export async function validateAccessSession(input: { store: SessionStore; secret: string; now: Date; principalActive: boolean; contextActive: boolean; bindingActive: boolean }): Promise<SessionValidation> {
  const record = await input.store.findByDigest(sha256SessionSecret(input.secret));
  if (!record) return { ok: false, code: 'SESSION_MISSING' };
  if (record.revokedAt) return { ok: false, code: 'SESSION_REVOKED' };
  if (input.now >= record.absoluteExpiresAt) return { ok: false, code: 'SESSION_EXPIRED' };
  if (!input.principalActive || !input.contextActive || !input.bindingActive) return { ok: false, code: 'SESSION_INVALID' };
  return { ok: true, record };
}
export async function revokeAccessSession(input: { store: SessionStore; secret: string; now: Date }): Promise<void> {
  await input.store.revoke(sha256SessionSecret(input.secret), input.now);
}
