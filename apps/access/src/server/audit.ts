const SENSITIVE_KEYS = new Set(['email', 'otp', 'token', 'cookie', 'sessionSecret']);
export type SafeAccessAuditEvent = { type: string; principalId?: string; outcome?: string; at?: string };
export function sanitizeAuditEvent(input: Record<string, unknown>): SafeAccessAuditEvent {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!SENSITIVE_KEYS.has(key) && ['type', 'principalId', 'outcome', 'at'].includes(key)) output[key] = value;
  }
  return output as SafeAccessAuditEvent;
}
export function auditAccessEvent(event: SafeAccessAuditEvent): void {
  console.info(JSON.stringify(sanitizeAuditEvent(event)));
}
