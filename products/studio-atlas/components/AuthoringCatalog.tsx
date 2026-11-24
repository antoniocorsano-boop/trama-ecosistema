"use client";

import { useId } from "react";
import { AUTHORING_TOOLS, ENVIRONMENTS, suggestEnvironments, suggestedTools, type AuthoringSelection, type EnvironmentId } from "../lib/authoring-catalog";
import type { PathwayProject, STAGES } from "../lib/model";
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
    <label><span>Ambientazione di progetto</span>
      <select value={selection.environment??""} onChange={event=>onChange({...selection,environment:(event.target.value||undefined) as EnvironmentId|undefined})}>
        <option value="">Decidi più avanti</option>
        {ENVIRONMENTS.map(environment=><option key={environment.id} value={environment.id}>{environment.title}</option>)}
      </select>
    </label>
    {selected&&<p className="catalog-note">{selected.description} Questa scelta orienta la progettazione: non crea automaticamente scene o mondi.</p>}
    {suggestions.length>0&&<div className="catalog-suggestions">
      <h3>Ambientazioni suggerite</h3>
      {suggestions.map(({environment,matches})=><p key={environment.id}>
        <button className="quiet-action" type="button" onClick={()=>onChange({...selection,environment:environment.id})}>{environment.title}</button>
        <span>{environment.reason} ({matches.join(", ")})</span>
      </p>)}
    </div>}
    <fieldset className="catalog-tools"><legend>Strumenti di lavoro</legend>
      {AUTHORING_TOOLS.map(tool=><div key={tool.id} className="catalog-tool">
        <label><input type="checkbox" checked={selection.tools.includes(tool.id)} onChange={event=>onChange({...selection,tools:event.target.checked?[...selection.tools,tool.id]:selection.tools.filter(item=>item!==tool.id)})}/>
          <span><strong>{tool.title}</strong>
          <small>{tool.availability==="EDITOR"?"Editor disponibile":tool.availability==="PILOT"?"Disponibilità pilota":"Solo progettazione"}{recommended.has(tool.id)?" · Suggerito":""}</small>
          <span>{tool.description}</span></span>
        </label>
        {onGoTo&&selection.tools.includes(tool.id)&&tool.availability!=="PILOT"&&<button type="button" className="quiet-action" onClick={()=>onGoTo(tool.stage)}>Apri {tool.title.toLowerCase()}</button>}
      </div>)}
    </fieldset>
    <p className="catalog-note">Gli strumenti selezionati organizzano il lavoro. Non sostituiscono le verifiche di produzione e non autorizzano la pubblicazione.</p>
  </section>;
}
