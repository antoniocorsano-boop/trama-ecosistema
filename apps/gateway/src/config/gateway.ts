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
  historicalBackground: {
    lim: '/media/orizzonte-LIM.webp',
    s: '/media/orizzonte-S.webp',
    m: '/media/orizzonte-M.webp',
    l: '/media/orizzonte-L.webp',
  },
  historicalVideo: {
    lim: '/media/orizzonte-LIM.mp4',
    s: '/media/orizzonte-S.mp4',
    m: '/media/orizzonte-M.mp4',
    l: '/media/orizzonte-L.mp4',
  },
} as const;

export type GatewayVisualProfile = 'atelier' | 'studio-classico' | 'orizzonte';
export type GatewayMediaRole = 'lim' | 's' | 'm' | 'l';

// Same width thresholds as TramaMediaBackdrop's native responsive picture.
export function resolveGatewayMediaRole(width: number): GatewayMediaRole {
  if (width >= 1024) return 'l';
  if (width >= 600) return 'm';
  if (width <= 359) return 'lim';
  return 's';
}

export function resolveGatewayVisualProfile(search: string): GatewayVisualProfile {
  const value = new URLSearchParams(search).get('ambiente');
  return value === 'studio-classico' || value === 'orizzonte' ? value : 'atelier';
}
