'use client';

import type { LauncherCard } from '../src/domain/launcher-service.ts';

export function AccessLauncher({ cards }: { cards: LauncherCard[] }) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  }
  return (
    <section className="launcher" aria-labelledby="launcher-title">
      <div className="launcher-heading">
        <div>
          <p className="access-kicker">Contesto attivo</p>
          <h2 id="launcher-title">Le tue applicazioni</h2>
        </div>
        <button className="access-secondary" type="button" onClick={logout}>Esci</button>
      </div>
      {cards.length === 0 ? (
        <p className="launcher-empty">Nessuna applicazione disponibile per questo contesto.</p>
      ) : (
        <div className="launcher-grid">
          {cards.map((card) => (
            <article className="launcher-card" key={card.applicationKey}>
              <h3>{card.displayName}</h3>
              <p>{card.availability === 'CONNECTION_NOT_AVAILABLE' ? 'Connessione non ancora disponibile' : 'Applicazione temporaneamente non disponibile'}</p>
              <button type="button" disabled={!card.launchAllowed} aria-label={`${card.displayName} — Connessione non ancora disponibile`}>Apri</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
