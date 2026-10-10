import { gatewayConfig } from '../config/gateway';
import { TramaGatewayShell } from '../components/trama/TramaGatewayShell';
import { TramaGlassAction } from '../components/trama/TramaGlassAction';
import { TramaNavigation } from '../components/trama/TramaNavigation';

export function App() {
  return (
    <TramaGatewayShell>
      <TramaNavigation />
      <main className="trama-hero-main relative z-10 flex min-h-[calc(100svh-96px)] flex-col items-center justify-center px-5 pb-20 pt-10 text-center sm:px-8 sm:pb-24 sm:pt-14 lg:pb-28">
        <section
          aria-labelledby="gateway-title"
          className="trama-hero-composition trama-hero-legibility relative flex w-full max-w-6xl flex-col items-center"
        >
          <div
            aria-hidden="true"
            data-testid="trama-hero-quiet-zone"
            className="trama-hero-quiet-zone"
          />
          <div className="trama-hero-content relative z-10 flex w-full flex-col items-center">
            <p
              data-testid="trama-hero-wordmark"
              className="trama-solar-eyebrow animate-fade-rise mb-5 font-medium uppercase sm:mb-6"
            >
              TRAMA
            </p>
            <h1
              id="gateway-title"
              className="trama-hero-title trama-copy-reinforced animate-fade-rise max-w-5xl text-[2.9rem] font-normal leading-[0.94] tracking-[-0.035em] text-[hsl(var(--foreground))] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Dove curricolo, conoscenza e progettazione diventano{' '}
              <em data-testid="trama-experience-accent" className="trama-copper-text italic">
                esperienza.
              </em>
            </h1>
            <p className="trama-hero-support trama-copy-reinforced animate-fade-rise-delay mt-7 max-w-3xl text-sm leading-relaxed text-[hsl(var(--foreground)/0.88)] sm:mt-8 sm:text-base md:text-lg">
              Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.
            </p>
            <TramaGlassAction
              href={gatewayConfig.entryHref}
              size="hero"
              className="trama-hero-cta trama-copper-action animate-fade-rise-delay-2 mt-9 sm:mt-10"
            >
              Entra in TRAMA <span aria-hidden="true" className="ml-2">→</span>
            </TramaGlassAction>
          </div>
        </section>
      </main>
    </TramaGatewayShell>
  );
}
