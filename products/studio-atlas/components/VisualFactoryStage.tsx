"use client";

import { useEffect, useMemo, useState } from "react";
import type { PathwayProject } from "../lib/model";
import { digestAuthoringState, getProductionBlockers } from "../lib/production";
import {
  MUSEO_ZERO_VISUAL_SUBJECTS,
  compileReferenceJobs,
  compileShotJobs,
  createInitialVisualFactoryState,
  ingestVisualCandidates,
  lockVisualReference,
  reconcileVisualFactoryState,
  type VisualFactoryState,
  type VisualGenerationPlan,
} from "../lib/visual-factory";
import { executeVisualFactoryPlan } from "../lib/visual-factory-executor";
import {
  readVisualFactoryState,
  writeVisualFactoryState,
} from "../lib/visual-factory-store";

const REVIEW_ONLY_BLOCKERS = new Set([
  "PRODUCT_REVIEW_NOT_PASS",
  "WORLD_REVIEW_NOT_PASS",
  "STORYBOARD_NOT_READY",
]);

const SUBJECT_LABELS: Record<string, string> = {
  lia: "Lia",
  omar: "Omar",
  teo: "Teo",
  "sala-zero": "Sala Zero",
  "cabina-regia": "Cabina regia",
};

export function VisualFactoryStage({ project }: { project: PathwayProject }) {
  const [packageDigest, setPackageDigest] = useState<string | null>(null);
  const [state, setState] = useState<VisualFactoryState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const structuralBlockers = useMemo(
    () => getProductionBlockers(project).filter((blocker) => !REVIEW_ONLY_BLOCKERS.has(blocker)),
    [project],
  );

  useEffect(() => {
    let cancelled = false;
    void digestAuthoringState(project).then((digest) => {
      if (cancelled) return;
      const stored = readVisualFactoryState(project.projectId);
      const reconciled = reconcileVisualFactoryState(stored, digest);
      setPackageDigest(digest);
      setState(reconciled);
      if (stored !== reconciled) writeVisualFactoryState(project.projectId, reconciled);
    });
    return () => {
      cancelled = true;
    };
  }, [project]);

  function persist(next: VisualFactoryState) {
    setState(next);
    writeVisualFactoryState(project.projectId, next);
  }

  async function execute(plan: VisualGenerationPlan) {
    if (!state) return;
    setBusy(true);
    setMessage("");
    try {
      const receipt = await executeVisualFactoryPlan(plan);
      const next = ingestVisualCandidates(state, receipt);
      persist(next);
      if (receipt.status === "WAITING_FOR_COMPUTE") {
        setMessage("Il calcolo gratuito non è disponibile in questo momento. La produzione resta in attesa.");
      } else if (receipt.status === "FAILED") {
        setMessage("L’executor non ha restituito un pacchetto valido. Nessun asset è stato accettato.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Produzione non disponibile.");
    } finally {
      setBusy(false);
    }
  }

  async function generateReferences() {
    if (!state || !packageDigest) return;
    const plan = compileReferenceJobs(project, packageDigest, state);
    if (plan.jobs.length === 0) return;
    await execute(plan);
  }

  async function generateShots() {
    if (!state || !packageDigest) return;
    const plan = compileShotJobs(project, packageDigest, state);
    if (plan.decision !== "SHOT_GENERATION_READY") {
      setMessage("Prima blocca un riferimento per Lia, Omar, Teo, Sala Zero e Cabina regia.");
      return;
    }
    await execute(plan);
  }

  function lock(subjectRef: string, assetId: string) {
    if (!state || !packageDigest) return;
    try {
      persist(lockVisualReference(state, subjectRef, assetId, packageDigest));
      setMessage(`${SUBJECT_LABELS[subjectRef] ?? subjectRef}: riferimento bloccato.`);
    } catch {
      setMessage("Questo candidato appartiene a una revisione precedente. Rigenera i riferimenti.");
    }
  }

  if (structuralBlockers.length > 0) {
    return (
      <>
        <h1>Prima rendi solido il Percorso.</h1>
        <p className="lead">
          La Visual Factory può aiutare la Human Product Review, ma non inventa parti mancanti
          della storia o dell’esperienza.
        </p>
        <ol className="blocker-list">
          {structuralBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
        </ol>
      </>
    );
  }

  if (!packageDigest || !state) {
    return <p>Preparazione della Visual Factory…</p>;
  }

  const lockedBySubject = new Map(state.referenceLocks.map((item) => [item.subjectRef, item]));
  const candidatesBySubject = new Map<string, typeof state.candidates>();
  for (const candidate of state.candidates) {
    const list = candidatesBySubject.get(candidate.subjectRef) ?? [];
    list.push(candidate);
    candidatesBySubject.set(candidate.subjectRef, list);
  }

  return (
    <div className="visual-factory-authoring">
      <header className="visual-factory-authoring__intro">
        <p className="eyebrow">Visual Factory · MUSEO ZERO</p>
        <h1>Costruisci il mondo visivo prima delle scene.</h1>
        <p className="lead">
          Prima scegliamo e blocchiamo i volti, le silhouette e gli ambienti. Solo dopo
          Studio Atlas genera F1–F6 usando gli stessi riferimenti.
        </p>
        <small className="technical-ref">digest {packageDigest.slice(0, 12)}… · nessuna autorità di pubblicazione</small>
      </header>

      {state.stage === "NEEDS_REFERENCES" && (
        <section className="visual-factory-step">
          <h2>1. Personaggi e ambienti</h2>
          <p>
            Verranno richiesti candidati distinti per Lia, Omar, Teo, Sala Zero e Cabina regia.
            Le scene non possono ancora essere generate.
          </p>
          <button className="primary-action" disabled={busy} onClick={() => void generateReferences()}>
            {busy ? "Generazione…" : "Genera personaggi e ambienti"}
          </button>
        </section>
      )}

      {(state.stage === "REFERENCE_REVIEW" || state.stage === "READY_FOR_SHOTS") && (
        <section className="visual-factory-step">
          <div className="visual-factory-step__heading">
            <div>
              <p className="eyebrow">Reference lock</p>
              <h2>2. Scegli ciò che deve restare uguale.</h2>
            </div>
            <strong>{state.referenceLocks.length}/5 bloccati</strong>
          </div>

          <div className="visual-reference-groups">
            {MUSEO_ZERO_VISUAL_SUBJECTS.map((subject) => {
              const candidates = candidatesBySubject.get(subject.subjectRef) ?? [];
              const locked = lockedBySubject.get(subject.subjectRef);
              return (
                <section className="visual-reference-group" key={subject.subjectRef}>
                  <header>
                    <h3>{SUBJECT_LABELS[subject.subjectRef] ?? subject.subjectRef}</h3>
                    <span>{locked ? "Riferimento bloccato" : "Da scegliere"}</span>
                  </header>
                  <div className="visual-candidate-strip">
                    {candidates.map((candidate) => {
                      const selected = locked?.assetId === candidate.assetId;
                      return (
                        <figure className={selected ? "visual-candidate visual-candidate--locked" : "visual-candidate"} key={candidate.assetId}>
                          <img src={candidate.url} alt={`Candidato visivo per ${SUBJECT_LABELS[subject.subjectRef] ?? subject.subjectRef}`} />
                          <figcaption>
                            <small>{candidate.modelRef}</small>
                            <button
                              className={selected ? "secondary-action" : "quiet-action"}
                              disabled={selected}
                              onClick={() => lock(subject.subjectRef, candidate.assetId)}
                            >
                              {selected ? "Bloccato" : "Usa questo riferimento"}
                            </button>
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {state.stage === "READY_FOR_SHOTS" && (
            <div className="visual-factory-next">
              <p>Le cinque identità visive sono bloccate. Ora le scene devono riusarle.</p>
              <button className="primary-action" disabled={busy} onClick={() => void generateShots()}>
                {busy ? "Generazione…" : "Genera le scene F1–F6"}
              </button>
            </div>
          )}
        </section>
      )}

      {state.stage === "SHOT_REVIEW" && (
        <section className="visual-factory-step">
          <p className="eyebrow">Scene candidate</p>
          <h2>3. Guarda il racconto, non l’interfaccia.</h2>
          <p>
            Queste immagini sono candidate da revisionare. Nessuna viene approvata automaticamente.
          </p>
          <div className="visual-scene-sequence">
            {state.sceneAssets.map((asset) => (
              <figure key={asset.assetId}>
                <img src={asset.url} alt={`Scena candidata ${asset.subjectRef}`} />
                <figcaption>
                  <strong>{asset.subjectRef}</strong>
                  <small>{asset.modelRef} · {asset.workflowRef}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {state.stage === "WAITING_FOR_COMPUTE" && (
        <section className="visual-factory-step production-wait">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Produzione in attesa</strong>
            <p>
              Non è disponibile calcolo FREE_ONLY. I riferimenti già scelti restano salvati;
              nessun provider a pagamento verrà usato.
            </p>
            <button
              className="secondary-action"
              disabled={busy}
              onClick={() => void (state.referenceLocks.length === 5 ? generateShots() : generateReferences())}
            >
              Riprova quando disponibile
            </button>
          </div>
        </section>
      )}

      {state.stage === "FAILED" && (
        <section className="visual-factory-step">
          <h2>La produzione non è stata accettata.</h2>
          <p>Nessun output incompleto o non conforme è diventato riferimento canonico.</p>
          <button
            className="secondary-action"
            disabled={busy}
            onClick={() => void (state.referenceLocks.length === 5 ? generateShots() : generateReferences())}
          >
            Riprova
          </button>
        </section>
      )}

      {message ? <p className="visual-factory-message" role="status">{message}</p> : null}
    </div>
  );
}
