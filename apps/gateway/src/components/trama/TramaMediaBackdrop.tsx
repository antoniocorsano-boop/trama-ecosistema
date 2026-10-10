import { useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';

export type TramaPosterSources = {
  s: string;
  m: string;
  l: string;
};

export type TramaMediaBackdropProps = {
  videoSrc: string;
  poster: TramaPosterSources;
  className?: string;
};

export function TramaMediaBackdrop({ videoSrc, poster, className }: TramaMediaBackdropProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !prefersReducedMotion && !videoFailed;

  return (
    <div className={className} aria-hidden="true">
      <picture>
        <source media="(min-width: 1024px)" srcSet={poster.l} />
        <source media="(min-width: 600px)" srcSet={poster.m} />
        <img
          data-testid="trama-media-poster"
          src={poster.s}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {showVideo ? (
        <video
          data-testid="trama-media-video"
          src={videoSrc}
          poster={poster.l}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
