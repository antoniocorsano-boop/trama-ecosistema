import { useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';

export type TramaMediaBackdropProps = {
  videoSrc: string;
  posterSrc: string;
  className?: string;
};

export function TramaMediaBackdrop({ videoSrc, posterSrc, className }: TramaMediaBackdropProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = !prefersReducedMotion && !videoFailed;

  return (
    <div className={className} aria-hidden="true">
      <img
        data-testid="trama-media-poster"
        src={posterSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {showVideo ? (
        <video
          data-testid="trama-media-video"
          src={videoSrc}
          poster={posterSrc}
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
