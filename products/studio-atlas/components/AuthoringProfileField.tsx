"use client";

import { AUTHORING_PROFILES, deriveAuthoringPlan, parseAuthoringComplexity } from "../lib/authoring-plan";
import type { PathwayProject } from "../lib/model";
import { PROFILE_ART } from "../lib/catalog-artwork";
import { CatalogArtwork } from "./CatalogArtwork";

export function AuthoringProfileField({ input, onChange }: {
  input: Parameters<typeof deriveAuthoringPlan>[0];
  onChange: (value: PathwayProject["authoringComplexity"]) => void;
}) {
  const plan = deriveAuthoringPlan(input);
  const suggested = AUTHORING_PROFILES.find(profile => profile.id === plan.suggested)!;
  const chosen = AUTHORING_PROFILES.find(profile => profile.id === input.authoringComplexity);
  return <section className="authoring-profile" aria-label="Organizzazione del lavoro">
    <h2>Quanto vuoi sviluppare l’esperienza?</h2>
    <div className="profile-gallery" role="group" aria-label="Profili illustrati">
      {AUTHORING_PROFILES.map(profile=><button key={profile.id} type="button" className={"catalog-visual-card"+(input.authoringComplexity===profile.id?" active":"")} aria-label={"Profilo "+profile.title} aria-pressed={input.authoringComplexity===profile.id} onClick={()=>onChange(profile.id)}>
        <CatalogArtwork src={PROFILE_ART[profile.id]}/>
        <span className="catalog-card-copy"><strong>{profile.title}</strong><span>{profile.description}</span>{plan.suggested===profile.id&&<small className="catalog-recommended">Suggerito</small>}</span>
      </button>)}
    </div>
    <label className="catalog-compact-choice">
      <span>Complessità del progetto</span>
      <select value={input.authoringComplexity ?? ""} onChange={event => onChange(parseAuthoringComplexity(event.target.value))}>
        <option value="">Decidi più avanti</option>
        {AUTHORING_PROFILES.map(profile => <option key={profile.id} value={profile.id}>{profile.title}</option>)}
      </select>
    </label>
    <p className="profile-explanation">{chosen ? chosen.description : "Nessun livello scelto."} Il suggerimento è {suggested.title.toLowerCase()}: puoi cambiarlo in qualsiasi momento.</p>
    <div className="profile-plan" aria-live="polite">
      <h3>Percorso di lavoro consigliato</h3>
      <p data-testid="authoring-focus-stages">{plan.focusStages.join(" → ")}</p>
      <details>
        <summary>Controlli da prevedere</summary>
        <ul>{plan.checks.map(check => <li key={check}>{check}</li>)}</ul>
      </details>
      <p className="profile-explanation">Tutte le fasi restano accessibili. Il livello organizza il lavoro: non sostituisce le revisioni richieste né abilita strumenti non ancora disponibili.</p>
    </div>
  </section>;
}
