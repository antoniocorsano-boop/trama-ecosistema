export const gatewayConfig = {
  entryHref: (
    import.meta.env.VITE_TRAMA_ENTRY_HREF ??
    (import.meta.env.PROD ? '' : '/preview')
  ).trim(),
  prototypeVideoSrc:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
  posterSrc: '/media/trama-gateway-poster.webp',
} as const;

if (import.meta.env.PROD && !gatewayConfig.entryHref) {
  throw new Error('VITE_TRAMA_ENTRY_HREF is required for production builds');
}
