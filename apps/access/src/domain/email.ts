export function normalizeLoginEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function isLoginEmailShape(value: string): boolean {
  const normalized = normalizeLoginEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 254;
}
