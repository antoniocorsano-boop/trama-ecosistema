"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STAGES, type PathwayProject } from "../lib/model";
import { getProject, updateProject } from "../lib/store";
import { getProductionBlockers, prepareWaitingProduction } from "../lib/production";
import { buildStudioAtlasPreviewSnapshot, getPreviewBlockers } from "../lib/preview";
import { atlasPreviewOrigin, openAtlasLearnerPreview } from "../lib/preview-bridge";
import {
  ExperienceEditor,
  SceneEditor,
  StoryEditor,
  WorldEditor,
} from "./AuthoringEditors";

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

  function patchProject(patch: Partial<PathwayProject>) {
    if (!project) return;
    setSaveState("saving");
    try {
      const updated = updateProject(project.projectId, patch);
      setProject(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function requestProduction() {
    if (!project) return;
    setSaveState("saving");
    try {
      const { request, receipt } = await prepareWaitingProduction(project);
      const updated = updateProject(project.projectId, {
        humanState: "PRODUCTION",
        productionState: "WAITING_FOR_COMPUTE",
        lastProductionRequest: request,
        lastProductionReceipt: receipt,
      });
      setProject(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function openLearnerPreview() {
    if (!project) return;
    setSaveState("saving");
    try {
      const result = await openAtlasLearnerPreview(project);
      if (result.status === "OPENED") {
        const updated = updateProject(project.projectId, {
          humanState: "PREVIEW",
          lastPreviewSnapshot: result.snapshot,
        });
        setProject(updated);
        setSaveState("saved");
        return;
      }
      setSaveState("error");
    } catch {
      setSaveState("error");
    }
  }

  async function preparePreview() {
    if (!project) return;
    setSaveState("saving");
    try {
      const snapshot = await buildStudioAtlasPreviewSnapshot(project);
      const updated = updateProject(project.projectId, {
        humanState: "PREVIEW",
        lastPreviewSnapshot: snapshot,
      });
      setProject(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
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
          <button
            className="secondary-action"
            disabled={getPreviewBlockers(project).length > 0 || !atlasPreviewOrigin()}
            onClick={() => void openLearnerPreview()}
            title={!atlasPreviewOrigin() ? "Origine Atlas preview non configurata" : undefined}
          >
            Vedi come studente
          </button>
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

          {stage === "Storia" && (
            <StoryEditor project={project} onPatch={patchProject} />
          )}

          {stage === "Mondo" && (
            <WorldEditor project={project} onPatch={patchProject} />
          )}

          {stage === "Esperienza" && (
            <ExperienceEditor project={project} onPatch={patchProject} />
          )}

          {stage === "Scene" && (
            <SceneEditor project={project} onPatch={patchProject} />
          )}

          {stage === "Produzione" && (
            <ProductionStage project={project} onRequest={requestProduction} onGoTo={setStage} />
          )}

          {stage === "Prova" && (
            <PreviewStage
              project={project}
              onPrepare={preparePreview}
              onOpen={openLearnerPreview}
              onGoTo={setStage}
            />
          )}

          {stage === "Revisione" && (
            <div className="future-stage">
              <h1>Revisione</h1>
              <p>
                La revisione completa verrà attivata quando l’anteprima Atlas potrà
                restituire una Human Use Review legata allo snapshot esatto.
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

function PreviewStage({
  project,
  onPrepare,
  onOpen,
  onGoTo,
}: {
  project: PathwayProject;
  onPrepare: () => Promise<void>;
  onOpen: () => Promise<void>;
  onGoTo: (stage: (typeof STAGES)[number]) => void;
}) {
  const blockers = getPreviewBlockers(project);

  if (blockers.length > 0) {
    return (
      <>
        <h1>Prima prepara un Percorso completo.</h1>
        <p className="lead">
          Atlas non riceve un’anteprima incompleta. Completa i passaggi mancanti,
          compresa una scena di trasferimento esplicita.
        </p>
        <ol className="blocker-list">
          {blockers.map((blocker) => <li key={blocker}>{blockerLabel(blocker)}</li>)}
        </ol>
        <button className="quiet-action" onClick={() => onGoTo(firstStageFor(blockers))}>
          Vai al primo blocco →
        </button>
      </>
    );
  }

  if (project.lastPreviewSnapshot) {
    return (
      <>
        <h1>Snapshot pronto per Atlas.</h1>
        <p className="lead">
          Studio Atlas ha congelato la versione da provare senza autorizzarla agli studenti.
          Il prossimo passo è consegnare questo snapshot al preview adapter Atlas.
        </p>
        <div className="production-wait">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <strong>Anteprima pronta · trasporto non ancora collegato</strong>
            <p>
              Il contenuto non viene messo nell’URL e non viene pubblicato. Serve il
              canale opaco Studio Atlas → Atlas che stiamo qualificando.
            </p>
            <small className="technical-ref">
              Snapshot {project.lastPreviewSnapshot.snapshotId.slice(0, 8)} ·
              digest {project.lastPreviewSnapshot.packageDigest.slice(0, 12)}…
            </small>
            {atlasPreviewOrigin() ? (
              <button className="primary-action preview-open-action" onClick={() => void onOpen()}>
                Apri in Atlas
              </button>
            ) : (
              <p className="bridge-note">
                Configura NEXT_PUBLIC_ATLAS_PREVIEW_ORIGIN per aprire la preview reale.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Prepara ciò che vedrà lo studente.</h1>
      <p className="lead">
        Verrà creato uno snapshot immutabile con digest, senza account studente,
        telemetria o autorizzazione runtime.
      </p>
      <button className="primary-action" onClick={() => void onPrepare()}>
        Prepara anteprima Atlas
      </button>
    </>
  );
}

function ProductionStage({
  project,
  onRequest,
  onGoTo,
}: {
  project: PathwayProject;
  onRequest: () => Promise<void>;
  onGoTo: (stage: (typeof STAGES)[number]) => void;
}) {
  if (project.productionState === "WAITING_FOR_COMPUTE") {
    return (
      <>
        <h1>Trasforma le scene in un prodotto.</h1>
        <div className="production-wait">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Produzione in attesa</strong>
            <p>
              La richiesta Q4 è stata salvata, ma non c’è una risorsa FREE_ONLY
              qualificata. Il Percorso non perde nulla e puoi continuare a lavorare.
            </p>
            {project.lastProductionRequest && (
              <small className="technical-ref">
                Richiesta {project.lastProductionRequest.requestId.slice(0, 8)} ·
                {project.lastProductionRequest.sceneRefs.length} scene · Q4
              </small>
            )}
          </div>
        </div>
      </>
    );
  }

  const blockers = getProductionBlockers(project);
  if (blockers.length > 0) {
    return (
      <>
        <h1>Prima rendi solido il Percorso.</h1>
        <p className="lead">
          Studio Atlas non invia alla Factory un Percorso incompleto. Mancano ancora
          alcuni passaggi verificabili.
        </p>
        <ol className="blocker-list">
          {blockers.map((blocker) => (
            <li key={blocker}>{blockerLabel(blocker)}</li>
          ))}
        </ol>
        <div className="next-line">
          <span>Completa i passaggi mancanti e torna qui.</span>
          <button className="quiet-action" onClick={() => onGoTo(firstStageFor(blockers))}>
            Vai al primo blocco →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Il Percorso è pronto per la Factory.</h1>
      <p className="lead">
        Verrà creata una richiesta Q4 legata al digest esatto di storia, mondo,
        esperienza e scene. Nessun provider o costo viene scelto qui.
      </p>
      <button className="primary-action" onClick={() => void onRequest()}>
        Prepara produzione
      </button>
    </>
  );
}

function blockerLabel(blocker: string) {
  const labels: Record<string, string> = {
    STORY_REVIEW_NOT_PASS: "La Storia non ha ancora Human Story Review PASS.",
    WORLD_REVIEW_NOT_PASS: "Il Mondo non ha ancora review PASS.",
    EXPERIENCE_NOT_SELECTED: "Non hai ancora scelto la forma dell’esperienza.",
    STORYBOARD_NOT_READY: "Lo storyboard non è ancora segnato come pronto.",
    NO_SCENES: "Non esiste ancora nessuna scena.",
    INCOMPLETE_SCENES: "Una o più scene non hanno situazione, azione e conseguenza.",
    TRANSFER_SCENE_REQUIRED: "Manca una scena di trasferimento in una situazione nuova.",
  };
  return labels[blocker] ?? blocker;
}

function firstStageFor(blockers: string[]): (typeof STAGES)[number] {
  if (blockers.includes("STORY_REVIEW_NOT_PASS")) return "Storia";
  if (blockers.includes("WORLD_REVIEW_NOT_PASS")) return "Mondo";
  if (blockers.includes("EXPERIENCE_NOT_SELECTED")) return "Esperienza";
  return "Scene";
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
