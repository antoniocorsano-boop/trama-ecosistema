"use client";
import { useEffect, useRef, useState } from "react";
import type { PathwayProject } from "../lib/model";
import { digestAuthoringState } from "../lib/production";
import { planProjectVisualReferences } from "../lib/visual-project-profile";

import { createProjectSourceCandidate } from "../lib/visual-project-source";

type Plan = ReturnType<typeof planProjectVisualReferences>;

export function ProjectVisualPlanning({ project }: { project: PathwayProject }) {
  const [result, setResult] = useState<{digest:string; plan:Plan} | null>(null);
  const [error, setError] = useState("");
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const currentProject = useRef(project);
  currentProject.current = project;
  useEffect(() => {
    let active = true;
    setResult(null); setError(""); setPrivacyConfirmed(false); setExportMessage("");
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
  async function exportCandidate() {
    if (!result || !privacyConfirmed || result.plan.references.decision !== "REFERENCE_GENERATION_READY") return;
    setExporting(true); setExportMessage("");
    const snapshotProject = project;
    try {
      const candidate = await createProjectSourceCandidate(snapshotProject,true);
      if (currentProject.current !== snapshotProject) return;
      if (candidate.packageDigest !== result.digest) throw Error("PROJECT_CHANGED");
      const url = URL.createObjectURL(new Blob([JSON.stringify(candidate)], {type:"application/json"}));
      try {
        const anchor = document.createElement("a");
        anchor.href=url; anchor.download="visual-project-candidate.json";
        anchor.click();
      } finally { setTimeout(()=>URL.revokeObjectURL(url),1000); }
      setExportMessage("Fonte locale predisposta: in attesa della verifica dell’operatore.");
    } catch {
      if(currentProject.current===snapshotProject) setExportMessage("Esportazione non riuscita: verifica la revisione e la dimensione del progetto.");
    } finally { setExporting(false); }
  }
  const ready = result?.plan.references.decision === "REFERENCE_GENERATION_READY";
  return <div className="visual-factory-authoring">
    <header className="visual-factory-authoring__intro">
      <p className="eyebrow">Visual Factory · pianificazione locale</p>
      <h1>Produzione visiva del percorso</h1>
      <p className="lead">{project.title}</p>
      <p>Proposta ricavata dalle scene. Verifica luoghi, inquadrature e coerenza didattica. La produzione automatica per questo progetto non è ancora ammessa. È necessaria una fonte del progetto verificata sul server e la qualificazione degli esecutori; nessun servizio esterno verrà chiamato.</p>
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
        {ready && <fieldset>
          <legend>Fonte progettuale per la qualificazione</legend>
          <p>Il file contiene i contenuti didattici del progetto e le eventuali immagini già presenti. Non viene inviato automaticamente. Rimuovi prima eventuali dati personali degli studenti.</p>
          <label><input type="checkbox" checked={privacyConfirmed} onChange={event=>setPrivacyConfirmed(event.target.checked)} /> Ho verificato che i contenuti non includano dati personali degli studenti.</label>
          <button type="button" className="secondary-action" disabled={!privacyConfirmed||exporting} onClick={()=>void exportCandidate()}>Esporta fonte progettuale</button>
          {exportMessage && <p role="status">{exportMessage}</p>}
          <p>La conferma locale non autorizza l’esecuzione. L’operatore deve verificare e approvare il file sul server.</p>
        </fieldset>}
        <p>Le inquadrature restano in attesa di riferimenti verificati. Nessun asset è stato generato o approvato automaticamente.</p>
      </section>
    </>}
  </div>;
}
