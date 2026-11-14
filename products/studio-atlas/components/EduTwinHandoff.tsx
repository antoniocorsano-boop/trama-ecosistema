"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {importEduTwin,listEduTwins,loadEduTwinHistory,MAX_HANDOFF_BYTES} from "../lib/edutwin-archive";
import type {ConversationRevision} from "../lib/edutwin-conversation";
import {listActivityDrafts} from "../lib/activity-drafts";
import {resolveOriginalImages,type OriginalImageMatch} from "../lib/edutwin-original-images";
import {atlasPreviewOrigin,openEduTwinIllustratedReviewPreview} from "../lib/preview-bridge";
import type {LocalStoryReview} from "../lib/edutwin-illustrated-preview";

export function EduTwinHandoff(){
 const file=useRef<HTMLInputElement>(null);
 const [projects,setProjects]=useState<ConversationRevision[]>([]);
 const [history,setHistory]=useState<ConversationRevision[]>([]);
 const [selected,setSelected]=useState<ConversationRevision>();
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState("");
 const [failed,setFailed]=useState(false);
 const [storyReview,setStoryReview]=useState<LocalStoryReview>();
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
 const isLatest=Boolean(selected&&selected.digest===history.at(-1)?.digest);
 const bindings=selected?.sceneIllustrations??[];
 const imagesReady=Boolean(bindings.length&&selected&&resourceFailure!==selected.digest&&originals?.digest===selected.digest&&
  bindings.every(b=>originals.matches.some(m=>m.id===b.assetId&&m.state==="VERIFIED_LOCAL")));
 const transferReady=Boolean(selected?.project.scenes.some(s=>s.kind==="TRANSFER"));
 const canReview=Boolean(isLatest&&imagesReady&&transferReady&&atlasPreviewOrigin());
 async function openIllustrated(){
  if(!selected||!storyReview||storyReview.revisionDigest!==selected.digest||!canReview)return;
  setBusy(true);setNotice("");setFailed(false);
  try{
   const result=await openEduTwinIllustratedReviewPreview(selected.project.projectId,storyReview);
   if(result.status==="OPENED")setNotice("Anteprima illustrata di revisione aperta. Nessuna pubblicazione.");
   else{setFailed(true);setNotice(result.status==="POPUP_BLOCKED"?"Consenti l’apertura della finestra di anteprima.":"Il collegamento all’anteprima Atlas non è disponibile.");}
  }catch{setFailed(true);setNotice("Anteprima bloccata: verifica l’ultima revisione, le risorse originali e i requisiti della storia.");}
  finally{setBusy(false);setStoryReview(undefined);}
 }
 function exportContext(){
  if(!selected||selected.digest!==history.at(-1)?.digest)return;
  // The user explicitly requests a local file; no automatic network transfer.
  // Contains the minimised authoring context, not authenticated approval evidence.
  const context={projectId:selected.project.projectId,expectedParentDigest:selected.digest,brief:selected.brief,
   project:selected.project,decisions:selected.decisions,feedback:selected.feedback,assets:selected.assets,responses:selected.responses,...(selected.sceneIllustrations===undefined?{}:{sceneIllustrations:selected.sceneIllustrations})};
  const url=URL.createObjectURL(new Blob([JSON.stringify(context,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="EduTwin-"+selected.project.projectId+"-revisione.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <main className="studio-shell narrow">
  <nav className="back-nav"><Link href="/">← Studio Atlas</Link></nav>
  <header className="form-heading"><p className="eyebrow">EduTwin</p><h1>Continua da ChatGPT</h1>
   <p>Importa una bozza preparata nella conversazione. Puoi rileggerla e conservare le successive correzioni.</p></header>
  <p>Usa soltanto contenuti didattici senza dati personali. Le bozze restano in questo browser. Una versione illustrata può essere provata in anteprima privata dopo la revisione della storia.</p>
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
   {selected.sceneIllustrations!==undefined&&<section aria-labelledby="edutwin-visual-story">
    <h3 id="edutwin-visual-story">Storia illustrata — proposta da rivedere</h3>
    <p>Le immagini sono associate alle scene dal progetto, non selezionate automaticamente per somiglianza. La dicitura distingue l’ambientazione o il personaggio di riferimento dall’illustrazione di un evento.</p>
    {selected.project.scenes.map((scene,index)=>{
     const binding=selected.sceneIllustrations?.find(item=>item.sceneId===scene.sceneId);
     const match=resourceFailure!==selected.digest&&originals?.digest===selected.digest&&binding
      ?originals.matches.find(item=>item.id===binding.assetId&&item.state==="VERIFIED_LOCAL"):undefined;
     return <details key={scene.sceneId} open={index===0||undefined} style={{margin:"1rem 0"}}>
      <summary>{index+1}. {scene.title}</summary>
      {binding&&match?.image?<figure style={{margin:"1rem 0"}}>
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img src={"data:image/webp;base64,"+match.image.base64} alt={binding.alt} width={match.image.pixelWidth} height={match.image.pixelHeight}
        loading={index===0?"eager":"lazy"} style={{display:"block",maxWidth:"100%",height:"auto",borderRadius:"12px"}}/>
       <figcaption>{binding.role==="SETTING"?"Ambientazione di riferimento":binding.role==="CHARACTER"?"Personaggio di riferimento":"Illustrazione della scena"} · Originale verificato</figcaption>
      </figure>:binding?<p>{originals?.digest===selected.digest||resourceFailure===selected.digest?"Illustrazione originale non disponibile o non verificata.":"Verifica dell’illustrazione in corso…"}</p>:<p>Illustrazione da progettare.</p>}
      {index!==0&&<p style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{scene.visibleSituation}</p>}
      {index!==0&&<p><strong>Azione:</strong> {scene.learnerAction}</p>}
      <p><strong>Conseguenza prevista:</strong> {scene.consequence}</p>
      {scene.choices.length>0&&<ul>{scene.choices.map(choice=><li key={choice.choiceId}>{choice.label} — {choice.feedback}</li>)}</ul>}
     </details>;
    })}
    <p>Questa è una tavola narrativa per la revisione. L’anteprima usa il motore interattivo Atlas, non questa tavola.</p>
   </section>}
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
   {isLatest&&bindings.length>0&&<section aria-label="Anteprima illustrata docente" style={{margin:"1rem 0"}}>
    <h3>Prova la versione illustrata</h3>
    <p>{bindings.length} di {selected.project.scenes.length} scene con illustrazione associata. Le altre restano senza immagine.</p>
    {!imagesReady?<p>Prima occorrono tutte le illustrazioni associate.</p>:!transferReady?<p>Manca una scena di trasferimento dell’apprendimento.</p>:!atlasPreviewOrigin()?<p>Il collegamento con Atlas non è configurato in questa versione.</p>:null}
    <label style={{display:"flex",alignItems:"flex-start",gap:".5rem"}}>
     <input type="checkbox" checked={storyReview?.revisionDigest===selected.digest} disabled={!canReview||busy}
      onChange={e=>setStoryReview(e.target.checked?{revisionDigest:selected.digest,decision:"PASS",reviewedAt:new Date().toISOString()}:undefined)}/>
     <span>Ho esaminato questa storia e la approvo soltanto per la prova docente. Non approvo ancora il prodotto né l’uso da parte degli studenti.</span>
    </label>
    <button className="primary-action" disabled={!canReview||busy||storyReview?.revisionDigest!==selected.digest} onClick={()=>void openIllustrated()}>Apri anteprima illustrata</button>
    <p>La decisione vale per questa apertura e questa versione esatta; la bozza archiviata rimane da rivedere.</p>
   </section>}
   {isLatest&&<button className="secondary-action" onClick={exportContext}>Prepara prossima revisione</button>}
   <p>La revisione è ancora necessaria. Nessuna approvazione automatica.</p>
  </section>}
 </main>;
}
