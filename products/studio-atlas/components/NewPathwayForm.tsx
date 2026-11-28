"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "../lib/store";
import { ExperienceGallery } from "./ExperienceGallery";
import { EMPTY_STORY, EMPTY_WORLD, type ExperienceGrammar, type PathwayProject } from "../lib/model";
import { AuthoringProfileField } from "./AuthoringProfileField";
import { AuthoringCatalog } from "./AuthoringCatalog";
import type { AuthoringSelection } from "../lib/authoring-catalog";

export function NewPathwayForm({ startInComposition = false }: { startInComposition?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [ageBand, setAgeBand] = useState<PathwayProject["ageBand"]>("lower-secondary");
  const [stage, setStage] = useState<"idea" | "forms">("idea");
  const [grammar, setGrammar] = useState<ExperienceGrammar>("");
  const [complexity, setComplexity] = useState<PathwayProject["authoringComplexity"]>();
  const [selection,setSelection] = useState<AuthoringSelection>();
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);


  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idea.trim() || savingRef.current) return;
    if (stage === "idea" && !startInComposition) {
      setStage("forms");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError(false);
    try {
      const project = createProject({ title: title.trim() || "Nuovo percorso", idea, ageBand,
        experience: { grammar, rationale: "" }, authoringComplexity: complexity, authoringSelection:selection });
      router.push(`/percorso/${project.projectId}${startInComposition ? "?modalita=COMPOSITION" : ""}`);
    } catch {
      savingRef.current = false;
      setSaving(false);
      setError(true);
    }
  }

  return (
    <main className={`studio-shell studio-intent ${stage==="idea"?"narrow":"illustrated-intent"}`}>
      <nav className="back-nav"><Link href="/">← Studio Atlas</Link></nav>
      <header className="form-heading">
        <p className="eyebrow">{startInComposition ? "Composizione" : `Nuovo percorso · ${stage === "idea" ? "1 di 2" : "2 di 2"}`}</p>
        <h1>{stage === "idea" ? "Che cosa vuoi far scoprire?" : "Come vuoi sviluppare l’argomento?"}</h1>
        <p>{stage === "idea" ? "Descrivi ciò che gli studenti dovrebbero comprendere o sperimentare." : "Scegli una forma di progettazione. Potrai cambiarla nell’officina."}</p>
      </header>
      <form className="seed-form" onSubmit={submit}>
        {stage === "idea" ? <>
          <label><span>L’idea</span>
            <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={4} required
              placeholder="Per esempio: comprendere i sensori e i sistemi di automazione…" />
          </label>
          <label><span>Per chi?</span>
            <select value={ageBand} onChange={e => setAgeBand(e.target.value as PathwayProject["ageBand"])}>
              <option value="later-primary">Primaria · ultimi anni</option>
              <option value="lower-secondary">Secondaria di I grado</option>
              <option value="mixed-first-cycle">Primo ciclo · misto</option>
            </select>
          </label>
          <label><span>Titolo di lavoro (facoltativo)</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Es. Museo Zero" />
          </label>
          <button className="primary-action" type="submit" disabled={!idea.trim() || saving}>
            {startInComposition ? (saving ? "Salvataggio…" : "Apri il banco Composizione") : "Esplora le possibilità"}
          </button>
          {startInComposition && error && <p role="alert">Non è stato possibile salvare la bozza su questo dispositivo. Riprova.</p>}
        </> : <>
          <p className="intent-summary">{idea}</p>
          <ExperienceGallery idea={idea} grammar={grammar} onChange={setGrammar} />
          <AuthoringProfileField input={{ authoringComplexity: complexity, authoringSelection:selection, experience: { grammar, rationale: "" }, scenes: [], story: EMPTY_STORY, world: EMPTY_WORLD }} onChange={setComplexity} />
          <AuthoringCatalog project={{idea,experience:{grammar,rationale:""},authoringComplexity:complexity,authoringSelection:selection,scenes:[]}} onChange={setSelection} />
          <div className="intent-actions">
            <button className="quiet-action" type="button" disabled={saving} onClick={() => setStage("idea")}>Modifica l’idea</button>
            <button className="primary-action" type="submit" disabled={saving}>{saving ? "Salvataggio…" : "Crea il Percorso"}</button>
          </div>
          <p className="intent-hint">Questa scelta non genera automaticamente materiali e non approva la pubblicazione.</p>
          {error && <p role="alert">Non è stato possibile salvare la bozza su questo dispositivo. Riprova.</p>}
        </>}
      </form>
    </main>
  );
}
