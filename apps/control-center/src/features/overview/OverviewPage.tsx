import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";
import { loadProjectKnowledge } from "../../data/projectKnowledge";
import { projectKnowledgeLabel, projectKnowledgeTone, type ProjectKnowledgeState } from "../../domain/projectKnowledge/model";
import { humanPhaseStatus, toOverviewModel } from "../../domain/overview/model";
import "./overview.css";

const initialSnapshot: SnapshotLoadState = { status: "LOADING" };
const initialKnowledge: ProjectKnowledgeState = { status: "LOADING" };

export function OverviewPage() {
  const [snapshotState, setSnapshotState] = useState<SnapshotLoadState>(initialSnapshot);
  const [knowledgeState, setKnowledgeState] = useState<ProjectKnowledgeState>(initialKnowledge);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      loadEcosystemSnapshot(controller.signal).then(setSnapshotState),
      loadProjectKnowledge(controller.signal).then(setKnowledgeState),
    ]);
    return () => controller.abort();
  }, []);

  if (snapshotState.status === "LOADING") {
    return <OverviewStatus message="Caricamento dello stato governato…" />;
  }

  if (snapshotState.status === "INVALID" || snapshotState.status === "UNAVAILABLE") {
    return <OverviewStatus message="Lo stato governato non è utilizzabile. La candidate non ricostruisce lo stato." error />;
  }

  const model = toOverviewModel(snapshotState.data);
  return <OverviewView model={model} knowledgeState={knowledgeState} />;
}

export function OverviewView({
  model,
  knowledgeState,
}: {
  model: ReturnType<typeof toOverviewModel>;
  knowledgeState: ProjectKnowledgeState;
}) {
  const focusText = useMemo(() => {
    if (model.currentFocus.length) return model.currentFocus.map((phase) => `${phase.id} · ${phase.name}`).join(", ");
    if (model.nextPlanned) return `Prossimo fronte pianificato: ${model.nextPlanned.id} · ${model.nextPlanned.name}`;
    return "Nessun fronte attivo dichiarato";
  }, [model]);

  return (
    <section className="overview-page" aria-labelledby="overview-title">
      <header className="overview-hero">
        <div>
          <p className="section-kicker">A3 · OVERVIEW</p>
          <h2 id="overview-title">Dove siamo e cosa richiede attenzione.</h2>
          <p>
            Orientamento sintetico sullo stato governato. I dettagli restano nelle viste specialistiche.
          </p>
        </div>
        <div className="overview-readonly" aria-label="Stato della candidate">
          <span>READ_ONLY</span>
          <small>preview modulare · legacy pubblico invariato</small>
        </div>
      </header>

      <section className="orientation-strip" aria-label="Orientamento corrente">
        <article>
          <span>Focus</span>
          <strong>{focusText}</strong>
        </article>
        <article>
          <span>Decisioni bloccanti aperte</span>
          <strong>{model.openDecisions.length}</strong>
          <small>{model.openDecisions.length ? "Richiedono decisione o evidenza" : "Nessuna decisione bloccante ora"}</small>
        </article>
        <article>
          <span>Fonti governate</span>
          <strong>{model.freshSources}/{model.totalSources}</strong>
          <small>fresh nello snapshot corrente</small>
        </article>
      </section>

      <section className="overview-section" aria-labelledby="progress-title">
        <div className="overview-section-head">
          <div>
            <p className="overview-eyebrow">PERCORSO</p>
            <h3 id="progress-title">Progressione R1–R5</h3>
          </div>
          <span>{model.completedPhases.length} concluse · {model.plannedPhases.length} pianificate</span>
        </div>

        <ol className="phase-progress">
          {model.phases.map((phase) => (
            <li key={phase.id} data-status={phase.status}>
              <div className="phase-marker" aria-hidden="true">{phase.id}</div>
              <div>
                <strong>{phase.name}</strong>
                <small>{humanPhaseStatus(phase.status)}</small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="overview-grid">
        <ProjectKnowledgePanel state={knowledgeState} />

        <section className="overview-panel" aria-labelledby="attention-title">
          <div className="overview-section-head">
            <div>
              <p className="overview-eyebrow">ATTENZIONE</p>
              <h3 id="attention-title">Decisioni e gate</h3>
            </div>
          </div>

          {model.openDecisions.length ? (
            <ul className="attention-list">
              {model.openDecisions.map((decision) => (
                <li key={decision.id}>
                  <strong>{decision.id}</strong>
                  <span>{decision.decisionAuthority || "Human Review"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="quiet-state" role="status">
              <strong>Nessun gate bloccante aperto.</strong>
              <p>La Home non crea urgenze artificiali quando lo snapshot non ne dichiara.</p>
            </div>
          )}

          <div className="overview-facts">
            <span><strong>{model.activeCapabilityCount}</strong> capability attive</span>
            <span><strong>{model.deferredCapabilityCount}</strong> capability deferred</span>
            <span><strong>{model.evidencePassCount}</strong> evidenze PASS</span>
          </div>
        </section>
      </section>

      <section className="overview-section" aria-labelledby="destinations-title">
        <div className="overview-section-head">
          <div>
            <p className="overview-eyebrow">DOVE ANDARE</p>
            <h3 id="destinations-title">Viste specialistiche</h3>
          </div>
          <span>Progressive disclosure</span>
        </div>

        <nav className="destination-list" aria-label="Viste specialistiche">
          <Link className="destination is-available" to="/maturity">
            <span>
              <strong>Maturità</strong>
              <small>Livelli confermati/candidati ed evidenze componenti</small>
            </span>
            <em>Disponibile →</em>
          </Link>

          <Destination label="Ecosistema" description="Relazioni autorizzate tra componenti e domini" stage="A4" />
          <Destination label="Evidenze" description="Provenienza, integrità e drill-down evidenziale" stage="A4" />
          <Destination label="Operazioni" description="Percorso operativo e cronologia governata" stage="A5" />
          <Destination label="Assurance" description="Privacy, accessibilità, sicurezza e readiness" stage="A5" />
        </nav>
      </section>

      <footer className="overview-footer">
        Snapshot {formatDate(model.generatedAt)} · nessun overall score · READ_ONLY
      </footer>
    </section>
  );
}

function ProjectKnowledgePanel({ state }: { state: ProjectKnowledgeState }) {
  if (state.status === "LOADING") {
    return (
      <section className="overview-panel pk-panel" aria-labelledby="knowledge-title">
        <p className="overview-eyebrow">INFORMAZIONI</p>
        <h3 id="knowledge-title">Project Knowledge</h3>
        <p aria-live="polite">Caricamento dei riferimenti…</p>
      </section>
    );
  }

  if (state.status === "INVALID" || state.status === "UNAVAILABLE") {
    return (
      <section className="overview-panel pk-panel is-attention" aria-labelledby="knowledge-title">
        <p className="overview-eyebrow">INFORMAZIONI</p>
        <h3 id="knowledge-title">Project Knowledge</h3>
        <p role="alert">Riferimenti non utilizzabili. La candidate non deduce lo stato.</p>
      </section>
    );
  }

  const tone = projectKnowledgeTone(state.data.status);
  const primary = state.data.activeInvariants[0] ?? state.data.facts[0];

  return (
    <section className={`overview-panel pk-panel is-${tone}`} aria-labelledby="knowledge-title">
      <div className="overview-section-head">
        <div>
          <p className="overview-eyebrow">INFORMAZIONI</p>
          <h3 id="knowledge-title">Project Knowledge</h3>
        </div>
        <span className="knowledge-status">{projectKnowledgeLabel(state.data.status)}</span>
      </div>

      <p>{primary?.statement || "Nessun riferimento sintetico disponibile."}</p>

      <dl className="knowledge-meta">
        <div><dt>Riferimento</dt><dd>{formatDate(state.data.asOf)}</dd></div>
        <div><dt>Invarianti attive</dt><dd>{state.data.activeInvariants.length}</dd></div>
        <div><dt>Conflitti noti</dt><dd>{state.data.knownConflicts.length}</dd></div>
      </dl>

      {tone === "attention" ? (
        <p className="knowledge-note">
          Stato parziale: informazione utilizzabile con contesto, non errore e non authority sostitutiva.
        </p>
      ) : null}
    </section>
  );
}

function Destination({
  label,
  description,
  stage,
}: {
  label: string;
  description: string;
  stage: string;
}) {
  return (
    <div className="destination is-upcoming" aria-disabled="true">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <em>{stage}</em>
    </div>
  );
}

function OverviewStatus({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <section className={error ? "overview-status is-error" : "overview-status"}>
      <p className="section-kicker">A3 · OVERVIEW</p>
      <h2>Control Center</h2>
      <p role={error ? "alert" : undefined}>{message}</p>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
