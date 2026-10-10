import type { PropsWithChildren } from 'react';
import { gatewayConfig } from '../../config/gateway';
import { TramaMediaBackdrop } from './TramaMediaBackdrop';

export function TramaGatewayShell({ children }: PropsWithChildren) {
  return (
    <div id="top" className="relative min-h-svh overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <TramaMediaBackdrop
        videoSrc={gatewayConfig.prototypeVideoSrc}
        poster={gatewayConfig.poster}
        className="absolute inset-0 z-0"
      />
      {children}
    </div>
  );
}
