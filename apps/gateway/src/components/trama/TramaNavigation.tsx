import { useState } from 'react';
import { gatewayConfig } from '../../config/gateway';
import { TramaGlassAction } from './TramaGlassAction';
import { TramaWordmark } from './TramaWordmark';

const links = [
  { label: 'Ecosistema', href: '#ecosistema' },
  { label: 'Curricolo', href: '#curricolo' },
  { label: 'Guida', href: '#guida' },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      data-testid="trama-menu-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M5 8h14" />
          <path d="M5 12h14" />
          <path d="M5 16h14" />
        </>
      )}
    </svg>
  );
}

export function TramaNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="trama-gateway-header relative z-20 mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:pb-5 lg:pt-7">
      <div className="trama-gateway-nav-shell liquid-glass flex min-h-14 items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-6 lg:min-h-16 lg:px-8">
        <a href="#top" aria-label="TRAMA — torna all'inizio" className="shrink-0 text-[hsl(var(--foreground))]">
          <TramaWordmark className="text-2xl tracking-[0.08em] sm:text-3xl" />
        </a>

        <nav aria-label="Navigazione principale" className="hidden items-center gap-10 md:flex lg:gap-14">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[hsl(var(--foreground)/0.84)] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={open ? 'Chiudi navigazione' : 'Apri navigazione'}
            aria-expanded={open}
            aria-controls="trama-compact-nav"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
          >
            <MenuIcon open={open} />
          </button>
          <TramaGlassAction
            href={gatewayConfig.entryHref}
            className="trama-nav-access trama-copper-action hidden sm:inline-flex md:inline-flex"
          >
            Accedi
          </TramaGlassAction>
        </div>
      </div>

      {open ? (
        <nav
          id="trama-compact-nav"
          aria-label="Navigazione compatta"
          className="liquid-glass mt-3 flex flex-col gap-1 rounded-3xl p-3 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </a>
          ))}
          <TramaGlassAction href={gatewayConfig.entryHref} className="trama-copper-action mt-2 sm:hidden">
            Accedi
          </TramaGlassAction>
        </nav>
      ) : null}
    </header>
  );
}
