export const gatewayConfig = {
  entryHref: (
    import.meta.env.VITE_TRAMA_ENTRY_HREF ??
    (import.meta.env.PROD ? '' : '/preview')
  ).trim(),
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

if (import.meta.env.PROD && !gatewayConfig.entryHref) {
  throw new Error('VITE_TRAMA_ENTRY_HREF is required for production builds');
}
