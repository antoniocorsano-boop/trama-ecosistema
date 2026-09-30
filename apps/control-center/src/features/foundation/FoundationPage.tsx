import { useEffect, useState } from "react";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";

const initial: SnapshotLoadState = { status: "LOADING" };

export function FoundationPage() {
  const [state, setState] = useState<SnapshotLoadState>(initial);

  useEffect(() => {
    const controller = new AbortController();
    void loadEcosystemSnapshot(controller.signal).then(setState);
    return () => controller.abort();
  }, []);

  return (
    <section className="foundation" aria-labelledby="foundation-title">
      <div>
        <p className="section-kicker">A1 · Application Foundation</p>
        <h2 id="foundation-title">Una shell applicativa, nessuna nuova authority.</h2>
        <p>
          Questa candidate verifica toolchain, routing statico, validazione schema, stati di caricamento
          e composizione dei dati governati prima della migrazione delle feature.
        </p>
      </div>

      <dl className="status-grid">
        <div><dt>Architettura</dt><dd>Modular monolith statico</dd></div>
        <div><dt>Authority browser</dt><dd>Nessuna</dd></div>
        <div><dt>Runtime pubblico</dt><dd>Legacy invariato</dd></div>
        <div><dt>Snapshot</dt><dd aria-live="polite">{snapshotLabel(state)}</dd></div>
      </dl>

      {state.status === "READY" ? (
        <p className="snapshot-meta">
          Snapshot validato · schema {state.data.schemaVersion} · generato {formatDate(state.data.generatedAt)}
        </p>
      ) : null}

      {state.status === "INVALID" || state.status === "UNAVAILABLE" ? (
        <div className="error-state" role="alert">
          I dati governati non sono utilizzabili. La candidate non tenta di inferire o ricostruire lo stato.
        </div>
      ) : null}
    </section>
  );
}

function snapshotLabel(state: SnapshotLoadState) {
  switch (state.status) {
    case "LOADING": return "Caricamento…";
    case "READY": return "Valido";
    case "INVALID": return "Schema non valido";
    case "UNAVAILABLE": return "Non disponibile";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
