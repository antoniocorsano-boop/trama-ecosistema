"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "../lib/store";
import type { PathwayProject } from "../lib/model";

export function NewPathwayForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [ageBand, setAgeBand] = useState<PathwayProject["ageBand"]>("lower-secondary");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !idea.trim()) return;
    const project = createProject({ title, idea, ageBand });
    router.push(`/percorso/${project.projectId}`);
  }

  return (
    <main className="studio-shell narrow">
      <nav className="back-nav"><Link href="/">← Studio Atlas</Link></nav>
      <header className="form-heading">
        <p className="eyebrow">Nuovo Percorso</p>
        <h1>Da dove vuoi partire?</h1>
        <p>Per questa prima slice partiamo da un’idea. Il resto verrà dopo, senza cambiare il Percorso.</p>
      </header>

      <form className="seed-form" onSubmit={submit}>
        <label>
          <span>Titolo di lavoro</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. MUSEO ZERO" />
        </label>

        <label>
          <span>L’idea</span>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={7}
            placeholder="Racconta in poche righe cosa vorresti far vivere agli studenti…"
          />
        </label>

        <label>
          <span>Per chi?</span>
          <select value={ageBand} onChange={(e) => setAgeBand(e.target.value as PathwayProject["ageBand"])}>
            <option value="later-primary">Primaria · ultimi anni</option>
            <option value="lower-secondary">Secondaria di I grado</option>
            <option value="mixed-first-cycle">Primo ciclo · misto</option>
          </select>
        </label>

        <button className="primary-action" type="submit">Crea il Percorso</button>
      </form>
    </main>
  );
}
