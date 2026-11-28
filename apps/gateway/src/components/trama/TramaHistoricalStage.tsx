import { useEffect, useRef, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { gatewayConfig, resolveGatewayMediaRole, type GatewayMediaRole } from '../../config/gateway';
import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';
import { TramaMediaBackdrop } from './TramaMediaBackdrop';

function subscribeToViewport(notify: () => void) {
  window.addEventListener('resize', notify);
  return () => window.removeEventListener('resize', notify);
}

function currentRole(): GatewayMediaRole {
  return resolveGatewayMediaRole(window.innerWidth);
}

// A responsive role or motion preference change stops playback rather than
// silently starting another download. Only the matching local asset is mounted.
export function TramaHistoricalStage({ children }: PropsWithChildren) {
  const reduced = usePrefersReducedMotion();
  const role = useSyncExternalStore(subscribeToViewport, currentRole, (): GatewayMediaRole => 's');
  const video = useRef<HTMLVideoElement>(null);
  const [request, setRequest] = useState<GatewayMediaRole | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const active = !reduced && request === role;
  const showVideo = active && playing && !failed;

  useEffect(() => {
    setRequest(null);
    setPlaying(false);
    setFailed(false);
  }, [role, reduced]);

  useEffect(() => {
    const element = video.current;
    if (!active || !element) return;
    let cancelled = false;
    element.play().catch(() => {
      if (!cancelled) {
        setPlaying(false);
        setFailed(true);
        setRequest(null);
      }
    });
    return () => { cancelled = true; };
  }, [active, role]);

  function toggleMotion() {
    setPlaying(false);
    setFailed(false);
    setRequest(active ? null : role);
  }

  function fallback() {
    setPlaying(false);
    setFailed(true);
    setRequest(null);
  }

  return (
    <>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0" style={{ visibility: showVideo ? 'hidden' : 'visible' }}>
          <TramaMediaBackdrop background={gatewayConfig.historicalBackground} className="absolute inset-0" />
        </div>
        {active && (
          <video
            key={role}
            ref={video}
            data-testid="trama-historical-video"
            src={gatewayConfig.historicalVideo[role]}
            loop
            muted
            playsInline
            preload="none"
            onPlaying={() => setPlaying(true)}
            onWaiting={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            onError={fallback}
            className="trama-media-visual absolute inset-0 h-full w-full object-cover"
            style={{ visibility: showVideo ? 'visible' : 'hidden' }}
          />
        )}
      </div>
      {children}
      <div className="relative z-10 flex flex-col items-center gap-2 px-5 pb-6 text-center">
        {reduced ? (
          <p className="rounded-lg bg-[hsl(var(--background))] px-3 py-2 text-sm">Movimento ridotto attivo: immagine statica.</p>
        ) : (
          <button type="button" onClick={toggleMotion} className="min-h-11 max-w-full rounded-xl border border-white/50 bg-[hsl(var(--background))] px-4 py-3 text-sm [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {active ? 'Interrompi animazione' : 'Riproduci animazione'}
          </button>
        )}
        <p role="status" className={failed ? 'rounded-lg bg-[hsl(var(--background))] px-3 py-2 text-sm' : 'sr-only'}>
          {failed ? 'Video non disponibile. Immagine statica mantenuta.' : showVideo ? 'Animazione in riproduzione.' : active ? 'Caricamento animazione.' : ''}
        </p>
      </div>
    </>
  );
}
