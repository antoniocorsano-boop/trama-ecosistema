"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ensureMuseoZeroPilotProject,
  ensureAgriculturePilotProject,
  listProjects,
  updateProject,
} from "../lib/store";
import type { PathwayProject } from "../lib/model";
import { AtelierWorkflow } from "./AtelierWorkflow";
import { AGRICULTURE_GUIDE } from "../lib/canonical/agriculture";

export function StudioHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<PathwayProject[]>([]);

  const [agricultureState,setAgricultureState] = useState<"idle"|"loading"|"error">("idle");
  const refresh = () => setProjects(listProjects());

  useEffect(() => {
    refresh();
    window.addEventListener("studio-atlas:projects", refresh);
    return () => window.removeEventListener("studio-atlas:projects", refresh);
  }, []);

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow">Studio Atlas</p>
          <h1>Crea Percorsi da vivere in Atlas.</h1>
        </div>
        <div className="studio-home-actions"><Link className="secondary-action" href="/edutwin">Continua da ChatGPT</Link><Link className="secondary-action" href="/attivita">Importa attività</Link><Link className="primary-action" href="/nuovo">Nuovo percorso</Link></div>
      </header>

      <AtelierWorkflow />

      <section className="home-intro">
        <p>
          Parti da un’idea. Costruisci la storia, il mondo e le scene.
          La parte tecnica resta dietro lo Studio.
        </p>
        <span className="development-note">S1 · salvataggio locale di sviluppo</span>
      </section>

      <section className="pilot-pathway" aria-labelledby="pilot-title">
        <div>
          <p className="eyebrow">Percorso pilota</p>
          <h2 id="pilot-title">MUSEO ZERO · La sala che non torna</h2>
          <p>
            Storia approvata. Mondo e storyboard sono materializzati nello Studio
            e attendono la decisione umana prima della preview learner.
          </p>
        </div>
        <button
          className="secondary-action"
          onClick={() => {
            const project = ensureMuseoZeroPilotProject();
            refresh();
            router.push(`/percorso/${project.projectId}`);
          }}
        >
          Apri MUSEO ZERO
        </button>
      </section>

      <section className="pilot-pathway" aria-labelledby="agriculture-pilot-title">
        <div>
          <p className="eyebrow">Prodotto educativo · Bozza da rivedere</p>
          <h2 id="agriculture-pilot-title">Dal campo al raccolto · Il mistero dei filari asciutti</h2>
          <p>Indagine in cinque scene: osservazioni, misure, scelte e trasferimento. Tecnologia, seconda annualità.</p>
          <Link href={AGRICULTURE_GUIDE}>Fascicolo educativo-didattico · v0.2</Link>
          {agricultureState==="error"&&<p role="alert">Non è stato possibile preparare la bozza locale. Riprova senza cancellare i tuoi percorsi.</p>}
        </div>
        <button className="secondary-action" disabled={agricultureState==="loading"} onClick={async()=>{
          setAgricultureState("loading");
          try{const project=await ensureAgriculturePilotProject();refresh();setAgricultureState("idle");router.push(`/percorso/${project.projectId}`);}
          catch{setAgricultureState("error");}
        }}>{agricultureState==="loading"?"Preparazione della bozza…":"Apri Dal campo al raccolto"}</button>
      </section>

      <section className="project-list" aria-labelledby="continue-title">
        <div className="section-heading">
          <h2 id="continue-title">Continua</h2>
          <span>{active.length}</span>
        </div>

        {active.length === 0 ? (
          <div className="empty-state">
            <p>Non hai ancora Percorsi in lavorazione.</p>
            <Link href="/nuovo">Parti da un’idea</Link>
          </div>
        ) : (
          active.map((project) => (
            <article className="project-row" key={project.projectId}>
              <Link href={`/percorso/${project.projectId}`} className="project-main">
                <strong>{project.title}</strong>
                <span>{labelState(project)}</span>
              </Link>
              <button
                className="quiet-action"
                onClick={() => updateProject(project.projectId, { archived: true })}
              >
                Archivia
              </button>
            </article>
          ))
        )}
      </section>

      {archived.length > 0 && (
        <section className="project-list muted" aria-labelledby="archive-title">
          <div className="section-heading">
            <h2 id="archive-title">Idee archiviate</h2>
            <span>{archived.length}</span>
          </div>
          {archived.map((project) => (
            <article className="project-row" key={project.projectId}>
              <div className="project-main">
                <strong>{project.title}</strong>
                <span>Archiviato</span>
              </div>
              <button
                className="quiet-action"
                onClick={() => updateProject(project.projectId, { archived: false })}
              >
                Ripristina
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function labelState(project: PathwayProject) {
  if (project.productionState === "WAITING_FOR_COMPUTE") return "Produzione in attesa";
  if (project.humanState === "IDEA") return "Idea";
  return project.humanState.replaceAll("_", " ").toLowerCase();
}
