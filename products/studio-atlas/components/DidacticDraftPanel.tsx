"use client";
import {useEffect,useId,useState} from "react";
import {canonicalDraft,composeDidacticDraft,reviseSection,type Config,type Draft,type ResourceKind} from "../lib/didactic-draft";
import {defaultDidacticConfig,MATERIAL_CHOICES,sourceForIdea} from "../lib/didactic-content-candidates";
import {DURATION_CHOICES,SUPPORT_CHOICES} from "../lib/didactic-content-variants";
import {readDidacticDraft,saveDidacticDraft} from "../lib/didactic-draft-local";
import {getProject} from "../lib/store";
import type {PathwayProject} from "../lib/model";

export function DidacticDraftPanel({project,onGoToProduction}:{project:PathwayProject;onGoToProduction:()=>void}){
 const [saved,setSaved]=useState<Draft|null>(null);
 const [config,setConfig]=useState<Config>(()=>defaultDidacticConfig(project.idea));
 const [ready,setReady]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [editing,setEditing]=useState<{id:string;content:string}|null>(null);
 const uid=useId();
 useEffect(()=>{try{const d=readDidacticDraft(localStorage,project.projectId);setSaved(d);if(d)setConfig(d.config);setReady(true);}catch{setError("Bozza locale non leggibile. Nessuna sovrascrittura eseguita.");}},[project.projectId]);
 const stale=!!saved&&saved.sourceProjectRevision!==project.revision;
 const source=sourceForIdea(project.idea,config.durationMinutes,config.differentiationMode);
 const availableKinds=new Set(source?.resources.map(r=>r.kind)??[]);
 const unsupportedMaterials=config.requestedResourceKinds.filter(k=>!availableKinds.has(k));
 const configChanged=!!saved&&JSON.stringify(config)!==JSON.stringify(saved.config);
 function fail(e:unknown){const message=e instanceof Error?e.message:"";setError(message.includes("CONFLICT")?"Il percorso o la bozza è cambiato. Ricarica la pagina prima di proseguire.":message.includes("TIMING_MISMATCH")?"La durata non è coerente con la fonte candidata.": "Composizione o salvataggio non riusciti. La bozza precedente è conservata.");}
 function persist(next:Draft){const latest=getProject(project.projectId);if(!latest||latest.revision!==project.revision)throw Error("PROJECT_REVISION_CONFLICT");saveDidacticDraft(localStorage,next,latest,saved);setSaved(next);setEditing(null);setNotice("Bozza didattica salvata su questo dispositivo.");}
 function compose(){setError("");setNotice("");try{
  if(saved&&!window.confirm("Sostituire la bozza didattica locale? Scarica prima la versione da conservare."))return;
  if(source&&unsupportedMaterials.length)throw Error("UNSUPPORTED_MATERIAL");
  const draft=composeDidacticDraft({project:{projectId:project.projectId,revision:project.revision,idea:project.idea,grammar:project.experience.grammar},config,pack:source,draftId:crypto.randomUUID()});
  persist(draft);
 }catch(e){fail(e);}}
 function updateSection(){if(!saved||!editing||stale||configChanged)return;setError("");setNotice("");try{persist(reviseSection(saved,editing.id,editing.content,saved.revision));}catch(e){fail(e);}}
 function selectMaterial(kind:ResourceKind,checked:boolean){setConfig(c=>({...c,requestedResourceKinds:checked?[...c.requestedResourceKinds,kind]:c.requestedResourceKinds.filter(k=>k!==kind)}));}
 function download(){if(!saved)return;try{const url=URL.createObjectURL(new Blob([canonicalDraft(saved)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="bozza-didattica.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){fail(e);}}
 return <section className="visual-factory-step" aria-label="Composizione didattica" style={{minWidth:0}}>
  <p className="eyebrow">Progettazione educativa</p><h2>Componi la bozza didattica</h2>
  <p>Configura il percorso e verifica una proposta da revisionare. Non inserire dati personali degli studenti. Nessuna produzione o pubblicazione automatica.</p>
  <div><strong>Disciplina:</strong> Tecnologia · Secondaria di primo grado</div>
  <div><label htmlFor={uid+"-grade"}>Classe</label> <select id={uid+"-grade"} value={config.grade} onChange={e=>setConfig(c=>({...c,grade:e.target.value}))}><option value="prima">Prima</option><option value="seconda">Seconda</option><option value="terza">Terza</option></select></div>
  <div><label htmlFor={uid+"-duration"}>Durata</label> <select id={uid+"-duration"} value={config.durationMinutes} onChange={e=>setConfig(c=>({...c,durationMinutes:Number(e.target.value)}))}>{DURATION_CHOICES.map(n=><option key={n} value={n}>{n} minuti</option>)}</select></div>
  <div><label htmlFor={uid+"-support"}>Supporti didattici</label> <select id={uid+"-support"} value={config.differentiationMode} onChange={e=>setConfig(c=>({...c,differentiationMode:e.target.value}))}>{SUPPORT_CHOICES.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
  <p>Metodo: indagine guidata. Le consegne cambiano in base alla durata e ai supporti selezionati.</p>
  <fieldset><legend>Materiali da richiedere</legend>{MATERIAL_CHOICES.filter(k=>availableKinds.has(k.id)||config.requestedResourceKinds.includes(k.id)).map(k=><div key={k.id}><label><input type="checkbox" checked={config.requestedResourceKinds.includes(k.id)} onChange={e=>selectMaterial(k.id,e.target.checked)}/> {k.label}{!availableKinds.has(k.id)?" (non disponibile per questa fonte)":""}</label></div>)}{!availableKinds.size&&!config.requestedResourceKinds.length&&<p>Nessun materiale disponibile per questa fonte.</p>}</fieldset>
  {source&&unsupportedMaterials.length>0&&<p>Deseleziona i materiali non disponibili prima di comporre.</p>}
  <p>{source?(source.grade===config.grade?"Fonte contestuale candidata disponibile; contenuto da verificare.":"La fonte candidata riguarda la classe "+source.grade+". Con la classe selezionata la bozza sarà priva di contenuti."):"Nessuna fonte contestuale pertinente: il compositore non inventerà contenuti."}</p>
  <button type="button" className="secondary-action" disabled={!ready||project.ageBand!=="lower-secondary"||!!source&&unsupportedMaterials.length>0} onClick={compose}>{saved?"Ricomponi bozza":"Componi bozza"}</button>
  {project.ageBand!=="lower-secondary"&&<p>Le fonti di questo primo configuratore riguardano la secondaria di primo grado.</p>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {saved&&<div style={{overflowWrap:"anywhere"}}>
   <h3>Bozza didattica · revisione {saved.revision}</h3>
   <p>Da revisionare · collegamento al curricolo non attestato · nessuna autorizzazione agli studenti.</p>
   {stale&&<p role="alert">Il percorso è cambiato: ricomponi la bozza prima di modificarla.</p>}
   {configChanged&&<p>Configurazione modificata: ricomponi per applicarla.</p>}
   {!saved.steps.length&&<p role="status">Bozza senza contenuti: fonte mancante o non pertinente alla configurazione.</p>}
   {!!saved.outcomes.length&&<><h4>Obiettivi</h4><ul>{saved.outcomes.map(o=><li key={o.id}>{o.text}</li>)}</ul></>}
   {!!saved.steps.length&&<><h4>Sequenza didattica</h4>{saved.steps.map(step=><article key={step.id} style={{borderTop:"1px solid currentColor",padding:"0.6rem 0"}}><h5>{step.title} · {step.minutes} min</h5><p>{step.content}</p><p><strong>Consegna:</strong> {step.instruction}</p>
    {editing?.id===step.id?<><label htmlFor={uid+"-edit"}>Testo della fase</label><textarea id={uid+"-edit"} value={editing.content} maxLength={4000} onChange={e=>setEditing({...editing,content:e.target.value})} style={{display:"block",width:"100%",boxSizing:"border-box"}}/><button type="button" disabled={stale||configChanged} onClick={updateSection}>Salva fase</button> <button type="button" onClick={()=>setEditing(null)}>Annulla modifica</button></>:<button type="button" className="quiet-action" disabled={stale||configChanged||saved.review.lockedSectionIds.includes(step.id)} onClick={()=>setEditing({id:step.id,content:step.content})}>Modifica {step.title}</button>}</article>)}</>}
   {!!saved.assessmentItems.length&&<><h4>Verifica</h4>{saved.assessmentItems.map(a=><div key={a.id}><p>{a.instruction}</p><p><strong>Criterio:</strong> {a.criterion}</p><p><strong>Feedback:</strong> {a.feedback}</p></div>)}</>}
   <h4>Materiali richiesti</h4>{saved.resources.length?<ul>{saved.resources.map(r=><li key={r.id}>{MATERIAL_CHOICES.find(k=>k.id===r.kind)?.label??r.kind}: {r.spec} · Da produrre. Alternativa: {r.accessibleAlternative}</li>)}</ul>:<p>Nessun materiale richiesto disponibile dalla fonte.</p>}
   <button type="button" className="secondary-action" onClick={download}>Scarica bozza JSON</button>
   {!!saved.resources.length&&<button type="button" className="quiet-action" disabled={stale||configChanged} onClick={onGoToProduction}>Vai al banco Produzione</button>}
  </div>}
 </section>;
}
