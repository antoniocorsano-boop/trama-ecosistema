import type { AccessSessionRecord } from '../domain/types.ts';
import type { SessionStore } from '../ports/session-store.ts';
export class InMemorySessionStore implements SessionStore {
  records: AccessSessionRecord[] = [];
  async create(session: AccessSessionRecord) { this.records.push({ ...session }); }
  async findByDigest(sessionDigest: string) { return this.records.find((r) => r.sessionDigest === sessionDigest) ?? null; }
  async revoke(sessionDigest: string, at: Date) {
    const record = this.records.find((r) => r.sessionDigest === sessionDigest);
    if (record) record.revokedAt = at;
  }
}
