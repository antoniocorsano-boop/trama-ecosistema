import { useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';

export type TramaBackgroundSources = {
  lim: string;
  s: string;
  m: string;
  l: string;
};

export type TramaMediaBackdropProps = {
  videoSrc: string;
  background: TramaBackgroundSources;
  className?: string;
};

export function TramaMediaBackdrop({ videoSrc, background, className }: TramaMediaBackdropProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !prefersReducedMotion && !videoFailed;

  return (
    <div className={className} aria-hidden="true">
      <picture>
        <source media="(min-width: 1024px)" srcSet={background.l} />
        <source media="(min-width: 600px)" srcSet={background.m} />
        <source media="(max-width: 359px)" srcSet={background.lim} />
        <img
          data-testid="trama-media-poster"
          src={background.s}
          alt=""
          className="trama-media-visual absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {showVideo ? (
        <video
          data-testid="trama-media-video"
          src={videoSrc}
          poster={background.l}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="trama-media-visual absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
