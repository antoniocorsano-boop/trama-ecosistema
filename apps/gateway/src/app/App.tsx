import { gatewayConfig } from '../config/gateway';

export function App() {
  return (
    <main data-entry-href={gatewayConfig.entryHref}>
      <span>TRAMA</span>
    </main>
  );
}
