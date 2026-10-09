import { gatewayConfig } from '../config/gateway';
import { TramaGatewayShell } from '../components/trama/TramaGatewayShell';
import { TramaGlassAction } from '../components/trama/TramaGlassAction';
import { TramaNavigation } from '../components/trama/TramaNavigation';

export function App() {
  return (
    <TramaGatewayShell>
      <TramaNavigation />
      <main className="relative z-10 flex min-h-[calc(100svh-104px)] flex-col items-center justify-center px-6 pb-24 pt-16 text-center sm:pb-32 sm:pt-20">
        <section aria-labelledby="gateway-title" className="flex w-full max-w-7xl flex-col items-center">
          <p className="animate-fade-rise mb-6 text-xs font-medium uppercase tracking-[0.32em] text-[hsl(var(--foreground))] sm:text-sm">
            TRAMA
          </p>
          <h1
            id="gateway-title"
            className="animate-fade-rise max-w-6xl text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-[hsl(var(--foreground))] sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Dove <em className="not-italic text-[hsl(var(--muted-foreground))]">curricolo</em>, conoscenza e{' '}
            <em className="not-italic text-[hsl(var(--muted-foreground))]">progettazione diventano esperienza.</em>
          </h1>
          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
            Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.
          </p>
          <TramaGlassAction
            href={gatewayConfig.entryHref}
            size="hero"
            className="animate-fade-rise-delay-2 mt-12"
          >
            Entra in TRAMA
          </TramaGlassAction>
        </section>
      </main>
    </TramaGatewayShell>
  );
}
