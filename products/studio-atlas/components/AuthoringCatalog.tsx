"use client";

import { useId } from "react";
import { AUTHORING_TOOLS, ENVIRONMENTS, suggestEnvironments, suggestedTools, type AuthoringSelection, type EnvironmentId } from "../lib/authoring-catalog";
import type { PathwayProject, STAGES } from "../lib/model";
import { ENVIRONMENT_ART, TOOL_ART } from "../lib/catalog-artwork";
import { CatalogArtwork } from "./CatalogArtwork";
type Input = Pick<PathwayProject,"idea"|"experience"|"authoringComplexity"|"scenes"|"authoringSelection">;
type Stage = (typeof STAGES)[number];

export function AuthoringCatalog({project,onChange,onGoTo}: {
  project:Input; onChange:(selection:AuthoringSelection)=>void; onGoTo?:(stage:Stage)=>void;
}) {
  const id=useId();
  const selection=project.authoringSelection??{tools:[]};
  const suggestions=suggestEnvironments(project.idea);
  const recommended=new Set(suggestedTools(project).map(tool=>tool.id));
  const selected=ENVIRONMENTS.find(environment=>environment.id===selection.environment);
  return <section className="authoring-catalog" aria-labelledby={id}>
    <h2 id={id}>Dai forma al tuo progetto</h2>
    <p className="catalog-note">Scegli un contesto e gli strumenti di cui hai bisogno. Puoi cambiare idea senza cancellare i contenuti.</p>
    <fieldset className="catalog-environments">
      <legend>Dove prende forma l’esperienza?</legend>
      <div className="catalog-gallery" aria-label="Ambientazioni illustrate">
        {ENVIRONMENTS.map(environment=>{
          const suggestion=suggestions.find(item=>item.environment.id===environment.id);
          return <button key={environment.id} type="button" className={"catalog-visual-card"+(selection.environment===environment.id?" active":"")}
            aria-label={environment.title} aria-describedby={id+"-"+environment.id} aria-pressed={selection.environment===environment.id}
            onClick={()=>{if(selection.environment!==environment.id)onChange({...selection,environment:environment.id})}}>
            <CatalogArtwork src={ENVIRONMENT_ART[environment.id]}/>
            <span className="catalog-card-copy"><strong>{environment.title}</strong><span id={id+"-"+environment.id}>{environment.description}</span>
              {suggestion&&<small className="catalog-recommended">Suggerita · {suggestion.matches.join(", ")}</small>}
              {suggestion&&<small>{environment.reason}</small>}</span>
          </button>;
        })}
      </div>
      <label className="catalog-compact-choice"><span>Ambientazione di progetto</span>
        <select value={selection.environment??""} onChange={event=>onChange({...selection,environment:(event.target.value||undefined) as EnvironmentId|undefined})}>
          <option value="">Decidi più avanti</option>
          {ENVIRONMENTS.map(environment=><option key={environment.id} value={environment.id}>{environment.title}</option>)}
        </select>
      </label>
      {selected&&<p className="catalog-note">Ambientazione scelta: <strong>{selected.title}</strong>. Questa scelta orienta la progettazione: non crea automaticamente scene o mondi.</p>}
    </fieldset>
    <fieldset className="catalog-tools"><legend>Strumenti di lavoro</legend>
      <p className="catalog-note">Aggiungi soltanto quelli utili alla tua esperienza.</p>
      {AUTHORING_TOOLS.map(tool=><div key={tool.id} className={"catalog-tool"+(selection.tools.includes(tool.id)?" active":"")}>
        <label><input type="checkbox" checked={selection.tools.includes(tool.id)} onChange={event=>onChange({...selection,tools:event.target.checked?[...selection.tools,tool.id]:selection.tools.filter(item=>item!==tool.id)})}/>
          <CatalogArtwork src={TOOL_ART[tool.id]}/>
          <span><strong>{tool.title}</strong>
          <small>{tool.availability==="EDITOR"?"Editor disponibile":tool.availability==="PILOT"?"Disponibilità pilota":"Solo progettazione"}{recommended.has(tool.id)?" · Suggerito":""}</small>
          <span>{tool.description}</span></span>
        </label>
        {onGoTo&&selection.tools.includes(tool.id)&&(tool.availability!=="PILOT"||tool.id==="DIAGRAM")&&<button type="button" className="quiet-action" onClick={()=>onGoTo(tool.stage)}>Apri {tool.title.toLowerCase()}</button>}
      </div>)}
    </fieldset>
    <p className="catalog-note">Gli strumenti selezionati organizzano il lavoro. Non sostituiscono le verifiche di produzione e non autorizzano la pubblicazione. Le illustrazioni sono esempi e schemi di lavoro, non materiali generati per questa bozza.</p>
  </section>;
}
