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
  background: {
    lim: '/media/trama-gateway-bg-lim.webp',
    s: '/media/trama-gateway-bg-s.webp',
    m: '/media/trama-gateway-bg-m.webp',
    l: '/media/trama-gateway-bg-l.webp',
  },
  classicBackground: {
    lim: '/media/trama-gateway-classic-bg-lim.webp',
    s: '/media/trama-gateway-classic-bg-s.webp',
    m: '/media/trama-gateway-classic-bg-m.webp',
    l: '/media/trama-gateway-classic-bg-l.webp',
  },
} as const;

export type GatewayVisualProfile = 'atelier' | 'studio-classico';

export function resolveGatewayVisualProfile(search: string): GatewayVisualProfile {
  return new URLSearchParams(search).get('ambiente') === 'studio-classico' ? 'studio-classico' : 'atelier';
}
