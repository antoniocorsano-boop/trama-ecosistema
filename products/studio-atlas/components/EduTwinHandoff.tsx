"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {importEduTwin,listEduTwins,loadEduTwinHistory,MAX_HANDOFF_BYTES} from "../lib/edutwin-archive";
import type {ConversationRevision} from "../lib/edutwin-conversation";
import {listActivityDrafts} from "../lib/activity-drafts";
import {resolveOriginalImages,type OriginalImageMatch} from "../lib/edutwin-original-images";

export function EduTwinHandoff(){
 const file=useRef<HTMLInputElement>(null);
 const [projects,setProjects]=useState<ConversationRevision[]>([]);
 const [history,setHistory]=useState<ConversationRevision[]>([]);
 const [selected,setSelected]=useState<ConversationRevision>();
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState("");
 const [failed,setFailed]=useState(false);
 const [originals,setOriginals]=useState<{digest:string;matches:OriginalImageMatch[]}|undefined>();
 const [resourceFailure,setResourceFailure]=useState<string|undefined>();
 useEffect(()=>{
  if(!selected)return;
  let active=true;
  const candidate=selected;
  listActivityDrafts().then(drafts=>resolveOriginalImages(candidate.assets,drafts)).then(matches=>{
   if(active){setOriginals({digest:candidate.digest,matches});setResourceFailure(undefined);}
  }).catch(()=>{if(active)setResourceFailure(candidate.digest);});
  return()=>{active=false;};
 },[selected]);
 useEffect(()=>{let active=true;listEduTwins().then(rows=>{if(active){setProjects(rows);setReady(true);}}).catch(()=>{if(active){setFailed(true);setNotice("Non è stato possibile verificare l’archivio locale.");}});return()=>{active=false;};},[]);
 async function open(projectId:string){
  setBusy(true);setFailed(false);setNotice("");
  try{const versions=await loadEduTwinHistory(projectId);setHistory(versions);setSelected(versions.at(-1));}
  catch{setFailed(true);setNotice("Impossibile verificare le versioni conservate. Nessun dato è stato modificato.");}
  finally{setBusy(false);}
 }
 async function receive(candidate:File|undefined){
  if(!candidate)return;
  setBusy(true);setFailed(false);setNotice("");
  try{
   if(candidate.size>MAX_HANDOFF_BYTES)throw new Error("HANDOFF_TOO_LARGE");
   const saved=await importEduTwin(await candidate.text(),new Date().toISOString());
   const versions=await loadEduTwinHistory(saved.project.projectId);
   setProjects(await listEduTwins());setHistory(versions);setSelected(versions.find(v=>v.digest===saved.digest));
   setNotice("Bozza salvata e riletta. Le versioni precedenti sono conservate.");
  }catch(e){
   setFailed(true);setNotice(e instanceof Error&&e.message==="STALE_HANDOFF"?
    "Il progetto è già presente o è stato aggiornato. Riapri l’ultima versione prima di importare una revisione.":
    "Non è stato possibile confermare l’importazione. Controlla l’archivio prima di riprovare.");
  }finally{setBusy(false);if(file.current)file.current.value="";}
 }
 function exportContext(){
  if(!selected||selected.digest!==history.at(-1)?.digest)return;
  // The user explicitly requests a local file; no automatic network transfer.
  // Contains the minimised authoring context, not authenticated approval evidence.
  const context={projectId:selected.project.projectId,expectedParentDigest:selected.digest,brief:selected.brief,
   project:selected.project,decisions:selected.decisions,feedback:selected.feedback,assets:selected.assets,responses:selected.responses};
  const url=URL.createObjectURL(new Blob([JSON.stringify(context,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="EduTwin-"+selected.project.projectId+"-revisione.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <main className="studio-shell narrow">
  <nav className="back-nav"><Link href="/">← Studio Atlas</Link></nav>
  <header className="form-heading"><p className="eyebrow">EduTwin</p><h1>Continua da ChatGPT</h1>
   <p>Importa una bozza preparata nella conversazione. Puoi rileggerla e conservare le successive correzioni.</p></header>
  <p>Usa soltanto contenuti didattici senza dati personali. Le bozze restano in questo browser; non sono pubblicate né ancora riproducibili come avventura.</p>
  <input ref={file} type="file" accept=".json,application/json" hidden disabled={busy||!ready} onChange={e=>void receive(e.target.files?.[0])}/>
  <button className="primary-action" disabled={busy||!ready} onClick={()=>file.current?.click()}>Importa bozza EduTwin</button>
  <p role={failed?"alert":"status"}>{busy?"Verifica della bozza…":notice}</p>
  <section className="project-list" aria-labelledby="edutwin-projects"><div className="section-heading"><h2 id="edutwin-projects">Progetti conservati</h2><span>{projects.length}</span></div>
   {projects.length===0?<p>Non ci sono ancora bozze EduTwin.</p>:projects.map(p=><article className="project-row" key={p.project.projectId}><div><strong>{p.project.title}</strong><p>Versione {p.project.revision} · Da rivedere</p></div><button className="secondary-action" disabled={busy} onClick={()=>void open(p.project.projectId)}>Apri</button></article>)}
  </section>
  {selected&&<section className="project-list" aria-labelledby="edutwin-selected">
   <div className="section-heading"><h2 id="edutwin-selected">{selected.project.title}</h2><span>V{selected.project.revision}</span></div>
   <p>{selected.brief.theme} · {selected.brief.durationMinutes} minuti</p>
   <label>Versione da consultare <select value={selected.digest} disabled={busy} onChange={e=>setSelected(history.find(v=>v.digest===e.target.value))}>{history.map(v=><option key={v.digest} value={v.digest}>Versione {v.project.revision}</option>)}</select></label>
   <h3>Apertura della storia</h3><div style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{selected.project.scenes[0].visibleSituation}</div>
   <p><strong>Prima azione:</strong> {selected.project.scenes[0].learnerAction}</p>
   <details><summary>Decisioni conservate ({selected.decisions.length})</summary><ul>{selected.decisions.map(d=><li key={d.id}>{d.requirement}</li>)}</ul></details>
   <details><summary>Correzioni da verificare ({selected.feedback.length})</summary><ul>{selected.feedback.map(f=><li key={f.id}>{f.observation} — {f.requestedChange}</li>)}</ul></details>
   {selected.assets.length>0&&<section aria-label="Risorse originali">
    <h3>Risorse originali</h3>
    {resourceFailure===selected.digest?<p>Verifica delle risorse non disponibile.</p>:
     originals?.digest!==selected.digest?<p>Verifica delle risorse locali…</p>:<>
      <p>{originals.matches.filter(m=>m.state==="VERIFIED_LOCAL").length} di {selected.assets.length} risorse verificate nell’archivio locale.</p>
      <details><summary>Dettaglio risorse</summary><ul>{originals.matches.map(m=><li key={m.id}>{m.id} — {m.state==="VERIFIED_LOCAL"?"Originale verificato":m.state==="MISSING"?"Originale non trovato o non integro":"Formato non ancora supportato"}{m.source&&<> ({m.source.activityId}, {m.source.version})</>}</li>)}</ul></details>
      {originals.matches.some(m=>m.state==="MISSING")&&<p><Link href="/attivita">Apri l’archivio delle attività</Link> per acquisire il pacchetto originale, poi riapri questa bozza.</p>}
     </>}
    <p>Il controllo riguarda le illustrazioni WebP già acquisite. Non attribuisce diritti, approvazioni o autorizzazioni.</p>
   </section>}
   {selected.digest===history.at(-1)?.digest&&<button className="secondary-action" onClick={exportContext}>Prepara prossima revisione</button>}
   <p>La revisione è ancora necessaria. Nessuna approvazione automatica.</p>
  </section>}
 </main>;
}
