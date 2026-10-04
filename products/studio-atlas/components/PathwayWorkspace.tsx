"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STAGES, type PathwayProject } from "../lib/model";
import { getProject, updateProject } from "../lib/store";
import { canPrepareProduction } from "../lib/production";

export function PathwayWorkspace({ id }: { id: string }) {
  const [project, setProject] = useState<PathwayProject | null>(null);
  const [stage, setStage] = useState<(typeof STAGES)[number]>("Idea");
  const [draftIdea, setDraftIdea] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");

  useEffect(() => {
    const loaded = getProject(id);
    setProject(loaded);
    setDraftIdea(loaded?.idea ?? "");
  }, [id]);

  const stageIndex = useMemo(() => STAGES.indexOf(stage), [stage]);

  function saveIdea() {
    if (!project) return;
    setSaveState("saving");
    try {
      const updated = updateProject(project.projectId, { idea: draftIdea });
      setProject(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function requestProduction() {
    if (!project) return;
    const updated = updateProject(project.projectId, {
      humanState: "PRODUCTION",
      productionState: "WAITING_FOR_COMPUTE",
    });
    setProject(updated);
  }

  if (!project) {
    return (
      <main className="studio-shell narrow">
        <p>Percorso non trovato.</p>
        <Link href="/">Torna a Studio Atlas</Link>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <Link className="eyebrow link" href="/">Studio Atlas</Link>
          <input
            className="title-input"
            value={project.title}
            aria-label="Titolo del Percorso"
            onChange={(e) => {
              const updated = updateProject(project.projectId, { title: e.target.value });
              setProject(updated);
            }}
          />
        </div>
        <div className="workspace-actions">
          <span className={`save-state ${saveState}`}>
            {saveState === "saving" ? "Salvataggio…" : saveState === "error" ? "Non salvato" : "Salvato"}
          </span>
          <button className="secondary-action" disabled>Vedi come studente</button>
        </div>
      </header>

      <div className="workspace-grid">
        <nav className="stage-rail" aria-label="Fasi del Percorso">
          {STAGES.map((item, index) => (
            <button
              key={item}
              className={item === stage ? "active" : ""}
              onClick={() => setStage(item)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{item}
            </button>
          ))}
        </nav>

        <section className="work-surface">
          <p className="eyebrow">Fase {stageIndex + 1}</p>

          {stage === "Idea" && (
            <>
              <h1>Che cosa vuoi far vivere?</h1>
              <p className="lead">Non serve compilare un modulo didattico. Parti da ciò che dovrebbe accadere allo studente.</p>
              <textarea
                className="idea-editor"
                value={draftIdea}
                onChange={(e) => setDraftIdea(e.target.value)}
                onBlur={saveIdea}
                aria-label="Idea del Percorso"
              />
              <div className="next-line">
                <span>Quando l’idea regge, il passo successivo sarà costruire la storia.</span>
                <button className="quiet-action" onClick={() => setStage("Storia")}>Vai a Storia →</button>
              </div>
            </>
          )}

          {stage === "Produzione" && (
            <>
              <h1>Trasforma le scene in un prodotto.</h1>
              {project.productionState === "WAITING_FOR_COMPUTE" ? (
                <div className="production-wait">
                  <span className="status-dot" aria-hidden="true" />
                  <div>
                    <strong>Produzione in attesa</strong>
                    <p>
                      Non c’è al momento una risorsa gratuita qualificata disponibile.
                      Il Percorso resta salvato e puoi continuare a lavorare sulle altre fasi.
                    </p>
                  </div>
                </div>
              ) : !canPrepareProduction(project) ? (
                <>
                  <p className="lead">
                    La Factory lavora su scene già definite. Questo Percorso è ancora
                    allo stato Idea, quindi non c’è nulla da inviare alla produzione.
                  </p>
                  <div className="production-wait">
                    <span className="status-dot neutral" aria-hidden="true" />
                    <div>
                      <strong>Prima servono le scene</strong>
                      <p>
                        Completa almeno una scena con ciò che lo studente vede, può fare
                        e fa accadere. Solo allora Studio Atlas potrà creare una richiesta
                        di produzione reale.
                      </p>
                      <button className="quiet-action" onClick={() => setStage("Scene")}>
                        Vai a Scene →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="lead">
                    La Factory userà scene, direzione visuale e riferimenti approvati.
                    Provider, modelli e GPU restano fuori dal tuo lavoro.
                  </p>
                  <button className="primary-action" onClick={requestProduction}>
                    Prepara produzione
                  </button>
                </>
              )}
            </>
          )}

          {stage !== "Idea" && stage !== "Produzione" && (
            <div className="future-stage">
              <h1>{stage}</h1>
              <p>
                Questa fase è già prevista dal percorso di authoring ma non viene simulata nella S1.
                Il progetto rimane integro mentre completiamo lo Studio.
              </p>
            </div>
          )}
        </section>

        <aside className="context-panel">
          <p className="eyebrow">Percorso</p>
          <dl>
            <div><dt>Stato</dt><dd>{humanStateLabel(project)}</dd></div>
            <div><dt>Destinatari</dt><dd>{ageLabel(project.ageBand)}</dd></div>
            <div><dt>Revisione</dt><dd>{project.revision}</dd></div>
          </dl>
          <p className="context-note">
            Nessuna classe, studente o provider di calcolo è legato a questo draft.
          </p>
        </aside>
      </div>
    </main>
  );
}

function humanStateLabel(project: PathwayProject) {
  if (project.productionState === "WAITING_FOR_COMPUTE") return "Produzione in attesa";
  if (project.humanState === "IDEA") return "Idea";
  return project.humanState.replaceAll("_", " ").toLowerCase();
}

function ageLabel(ageBand: PathwayProject["ageBand"]) {
  if (ageBand === "lower-secondary") return "Secondaria I grado";
  if (ageBand === "later-primary") return "Primaria · ultimi anni";
  return "Primo ciclo";
}
