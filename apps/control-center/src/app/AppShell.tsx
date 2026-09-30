import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">TRAMA CONTROL CENTER · MODULAR CANDIDATE</p>
          <h1>Control Center</h1>
          <p className="lede">
            Fondazione A1 isolata. Il Control Center pubblico legacy resta l’unico runtime di produzione.
          </p>
        </div>
        <span className="readonly" aria-label="Modalità sola lettura">READ_ONLY</span>
      </header>

      <nav className="primary-nav" aria-label="Navigazione principale candidate">
        <a aria-current="page" href="#/">Fondazione</a>
        <span aria-disabled="true">Maturità</span>
        <span aria-disabled="true">Ecosistema</span>
        <span aria-disabled="true">Evidenze</span>
        <span aria-disabled="true">Operazioni</span>
      </nav>

      <main id="main-content">{children}</main>
    </div>
  );
}
