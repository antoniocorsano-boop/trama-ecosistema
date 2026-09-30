import type { ReactNode } from "react";
import { NavLink } from "react-router";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">TRAMA CONTROL CENTER · MODULAR CANDIDATE</p>
          <h1>Control Center</h1>
          <p className="lede">
            Orientamento e viste specialistiche in migrazione. Il runtime pubblico legacy resta invariato.
          </p>
        </div>
        <span className="readonly" aria-label="Modalità sola lettura">READ_ONLY</span>
      </header>

      <nav className="primary-nav" aria-label="Navigazione principale candidate">
        <NavLink to="/" end>Overview</NavLink>
        <NavLink to="/maturity">Maturità</NavLink>
        <span aria-disabled="true" data-stage="A4">Ecosistema</span>
        <span aria-disabled="true" data-stage="A4">Evidenze</span>
        <span aria-disabled="true" data-stage="A5">Operazioni</span>
      </nav>

      <main id="main-content">{children}</main>
    </div>
  );
}
