import type { PropsWithChildren } from 'react';
import { gatewayConfig, type GatewayVisualProfile } from '../../config/gateway';
import { TramaHistoricalStage } from './TramaHistoricalStage';
import { TramaMediaBackdrop } from './TramaMediaBackdrop';
import { TramaSegnoVivo } from './TramaSegnoVivo';

export function TramaGatewayShell({ children, profile }: PropsWithChildren<{ profile: GatewayVisualProfile }>) {
  const background = profile === 'studio-classico' ? gatewayConfig.classicBackground : gatewayConfig.background;
  return (
    <div
      id="top"
      data-visual-revision={gatewayConfig.visualRevision}
      data-visual-profile={profile}
      className="trama-gateway-stage relative min-h-svh overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
    >
      {profile === 'orizzonte' ? (
        <TramaHistoricalStage>
          <TramaSegnoVivo />
          {children}
        </TramaHistoricalStage>
      ) : (
        <>
          <TramaMediaBackdrop
            background={background}
            className="absolute inset-0 z-0"
          />
          <TramaSegnoVivo />
          {children}
        </>
      )}
    </div>
  );
}
