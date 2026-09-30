import { useEffect, useRef, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { RuntimeStatus } from "../components/feedback/RuntimeStatus";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => mainRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Vai al contenuto</a>
      <header className="app-header">
        <div>
          <p className="eyebrow">TRAMA CONTROL CENTER · MODULAR CANDIDATE</p>
          <h1>Control Center</h1>
          <p className="lede">
            Orientamento e viste specialistiche in migrazione. Il runtime pubblico legacy resta invariato.
          </p>
          <RuntimeStatus />
        </div>
        <span className="readonly" aria-label="Modalità sola lettura">READ_ONLY</span>
      </header>

      <nav className="primary-nav" aria-label="Navigazione principale candidate">
        <NavLink to="/" end>Overview</NavLink>
        <NavLink to="/maturity">Maturità</NavLink>
        <NavLink to="/ecosystem">Ecosistema</NavLink>
        <NavLink to="/evidence">Evidenze</NavLink>
        <NavLink to="/operations">Operazioni</NavLink>
        <NavLink to="/assurance">Assurance</NavLink>
      </nav>

      <main id="main-content" ref={mainRef} tabIndex={-1}>{children}</main>
    </div>
  );
}
