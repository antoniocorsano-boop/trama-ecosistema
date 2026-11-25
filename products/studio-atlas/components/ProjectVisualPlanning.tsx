"use client";
import { useEffect, useState } from "react";
import type { PathwayProject } from "../lib/model";
import { digestAuthoringState } from "../lib/production";
import { planProjectVisualReferences } from "../lib/visual-project-profile";

type Plan = ReturnType<typeof planProjectVisualReferences>;

export function ProjectVisualPlanning({ project }: { project: PathwayProject }) {
  const [result, setResult] = useState<{digest:string; plan:Plan} | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setResult(null); setError("");
    void digestAuthoringState(project).then(digest => {
      if (active) setResult({digest, plan:planProjectVisualReferences(project,digest,false)});
    }).catch(() => { if (active) setError("La pianificazione richiede da una a sei scene distinte, un tipo di esperienza, luoghi e azioni descritti."); });
    return () => { active = false; };
  }, [project]);
  function confirm() {
    if (!result) return;
    try { setResult({digest:result.digest,plan:planProjectVisualReferences(project,result.digest,true)}); }
    catch { setError("Pianificazione non disponibile: rivedi il progetto."); setResult(null); }
  }
  const ready = result?.plan.references.decision === "REFERENCE_GENERATION_READY";
  return <div className="visual-factory-authoring">
    <header className="visual-factory-authoring__intro">
      <p className="eyebrow">Visual Factory · pianificazione locale</p>
      <h1>Produzione visiva del percorso</h1>
      <p className="lead">{project.title}</p>
      <p>Proposta ricavata dalle scene. Verifica luoghi, inquadrature e coerenza didattica. La produzione automatica per questo progetto non è ancora ammessa: nessun servizio esterno verrà chiamato.</p>
    </header>
    {error && <p role="alert">{error}</p>}
    {!result && !error && <p role="status">Preparazione della proposta…</p>}
    {result && <>
      <section className="visual-factory-step">
        <h2>Riferimenti e scene da preparare</h2>
        <p>Una proposta di riferimento per scena; le scelte artistiche sono da revisionare.</p>
        <ol>{result.plan.profile.shots.map((shot,index) => <li key={shot.specId}>
          <strong>{project.scenes[index].title}</strong> · {result.plan.profile.references[index].composition.dominantSubject}
          <p>{shot.narrativeFunction}</p>
          <details>
            <summary>Verifica contenuto e proposta visiva</summary>
            <p>Elementi da rappresentare:</p>
            <ul>{shot.requiredVisualFacts.map((fact, i) => <li key={i}>{fact}</li>)}</ul>
            <p>{shot.camera.shotScale} · {shot.camera.viewpoint} · luce: {shot.lightingMood}.</p>
            <p>{shot.composition.spatialRelation}</p>
          </details>
          <small>{project.scenes[index].illustration ? "Illustrazione già presente nel progetto" : "Illustrazione da predisporre"}</small>
        </li>)}</ol>
        {result.plan.findings.length > 0 && <ul>{result.plan.findings.map((item,index) => <li key={index}>{item.message}</li>)}</ul>}
        <button type="button" className="secondary-action" disabled={ready || result.plan.findings.some(item=>item.severity==="ERROR")} onClick={confirm}>Conferma la coerenza e prepara il piano locale</button>
        <p role="status">{ready ? result.plan.references.jobs.length + " richieste di riferimento pianificate, non eseguite." : "Pianificazione da confermare."}</p>
        <p>Le inquadrature restano in attesa di riferimenti verificati. Nessun asset è stato generato o approvato automaticamente.</p>
      </section>
    </>}
  </div>;
}
