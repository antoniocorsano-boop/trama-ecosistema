"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ensureMuseoZeroPilotProject,
  listProjects,
  updateProject,
} from "../lib/store";
import type { PathwayProject } from "../lib/model";

export function StudioHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<PathwayProject[]>([]);

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
        <Link className="primary-action" href="/nuovo">Nuovo Percorso</Link>
      </header>

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
