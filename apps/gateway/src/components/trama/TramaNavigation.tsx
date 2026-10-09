import { useState } from 'react';
import { gatewayConfig } from '../../config/gateway';
import { TramaGlassAction } from './TramaGlassAction';
import { TramaWordmark } from './TramaWordmark';

const links = [
  { label: 'Ecosistema', href: '#ecosistema' },
  { label: 'Curricolo', href: '#curricolo' },
  { label: 'Guida', href: '#guida' },
] as const;

export function TramaNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 md:px-8 md:py-6">
      <div className="liquid-glass flex items-center justify-between gap-4 rounded-full px-4 py-3 sm:px-5">
        <a href="#top" aria-label="TRAMA — torna all'inizio" className="shrink-0 text-[hsl(var(--foreground))]">
          <TramaWordmark className="text-2xl tracking-[-0.03em] sm:text-3xl" />
        </a>

        <nav aria-label="Navigazione principale" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
            className="liquid-glass inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
          >
            Menu
          </button>
          <TramaGlassAction href={gatewayConfig.entryHref}>Accedi</TramaGlassAction>
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
        </nav>
      ) : null}
    </header>
  );
}
