import { gatewayConfig, resolveGatewayVisualProfile } from '../config/gateway';
import { TramaGatewayShell } from '../components/trama/TramaGatewayShell';
import { TramaGlassAction } from '../components/trama/TramaGlassAction';
import { TramaNavigation } from '../components/trama/TramaNavigation';

const landingSections = [
  {
    id: 'ecosistema',
    index: '01',
    title: 'Una trama unica, ambienti distinti.',
    body: 'TRAMA tiene insieme curricolo, progettazione, materiali, evidenze e documentazione senza appiattire strumenti e responsabilità in un unico ambiente.',
  },
  {
    id: 'curricolo',
    index: '02',
    title: 'Il curricolo di istituto come orientamento.',
    body: 'Competenze, traguardi, abilità e conoscenze restano il riferimento che collega intenzione educativa, progettazione e materiali.',
  },
  {
    id: 'guida',
    index: '03',
    title: 'Un ingresso semplice.',
    body: 'Esplora questa soglia per comprendere il sistema; quando sei pronto, Entra in TRAMA o Accedi prosegue verso la destinazione configurata.',
  },
] as const;

export function App() {
  const profile = resolveGatewayVisualProfile(typeof window === 'undefined' ? '' : window.location.search);
  return (
    <>
      <TramaGatewayShell profile={profile}>
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

      <div className="relative bg-[hsl(var(--background))] px-5 py-16 text-[hsl(var(--foreground))] sm:px-8 sm:py-20 lg:py-24">
        <section
          id="principio-guida"
          aria-labelledby="principio-guida-title"
          className="mx-auto mb-16 w-full max-w-6xl border-t border-white/15 pt-8 text-left sm:mb-20"
        >
          <h2 id="principio-guida-title" className="mb-5 text-xs font-medium tracking-[0.24em] text-[var(--solar-highlight)]">
            Il nostro principio guida
          </h2>
          <p className="max-w-3xl text-2xl font-normal leading-tight sm:text-4xl" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            La tecnologia è al servizio dell'educazione.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[hsl(var(--foreground)/0.88)] sm:text-lg">
            L'intelligenza artificiale è al servizio della tecnologia.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[hsl(var(--foreground)/0.88)] sm:text-base">
            Nessun vincolo tecnologico o commerciale deve compromettere la finalità educativa, la sostenibilità sociale e la tutela delle persone.
          </p>
        </section>

        <section id="ambienti-grafici" aria-labelledby="ambienti-grafici-title" className="mx-auto mb-16 w-full max-w-6xl border-t border-white/15 pt-8 sm:mb-20">
          <h2 id="ambienti-grafici-title" className="text-xl font-medium">Ambiente grafico</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[hsl(var(--foreground)/0.88)] sm:text-base">
            Scegli una delle due composizioni originali di TRAMA. La scelta modifica soltanto lo sfondo, non i contenuti o le modalità di accesso.
          </p>
          <nav aria-label="Scelta ambiente grafico" className="mt-5 flex flex-wrap gap-3">
            <a href="?ambiente=atelier#top" aria-current={profile === 'atelier' ? 'page' : undefined} className="min-w-0 max-w-full rounded-xl border border-white/40 px-4 py-3 text-sm [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Atelier panoramico{profile === 'atelier' ? ' · attuale' : ''}
            </a>
            <a href="?ambiente=studio-classico#top" aria-current={profile === 'studio-classico' ? 'page' : undefined} className="min-w-0 max-w-full rounded-xl border border-white/40 px-4 py-3 text-sm [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Studio classico{profile === 'studio-classico' ? ' · attuale' : ''}
            </a>
          </nav>
        </section>

        <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
          {landingSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-8 border-t border-white/15 pt-6 text-left"
            >
              <p className="mb-5 text-xs font-medium tracking-[0.24em] text-[var(--solar-highlight)]">
                {section.index}
              </p>
              <h2
                id={`${section.id}-title`}
                className="max-w-sm text-2xl font-normal leading-tight sm:text-4xl"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                {section.title}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[hsl(var(--foreground)/0.72)] sm:text-base">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
