import type { AccessSessionRecord } from '../domain/types.ts';
export interface SessionStore {
  create(session: AccessSessionRecord): Promise<void>;
  findByDigest(sessionDigest: string): Promise<AccessSessionRecord | null>;
  revoke(sessionDigest: string, at: Date): Promise<void>;
}
