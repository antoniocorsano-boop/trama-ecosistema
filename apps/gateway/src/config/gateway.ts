export function resolveGatewayEntryHref(
  configuredHref: string | undefined,
  production: boolean,
): string | null {
  const resolved = configuredHref?.trim() ?? '';

  if (resolved) return resolved;
  return production ? null : '/preview';
}

export const gatewayConfig = {
  entryHref: resolveGatewayEntryHref(import.meta.env.VITE_TRAMA_ENTRY_HREF, import.meta.env.PROD),
  visualRevision: 'approved-l-v3',
  prototypeVideoSrc:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
  background: {
    lim: '/media/trama-gateway-bg-lim.webp',
    s: '/media/trama-gateway-bg-s.webp',
    m: '/media/trama-gateway-bg-m.webp',
    l: '/media/trama-gateway-bg-l.webp',
  },
} as const;
