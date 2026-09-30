import {useEffect,useState} from "react";
import {loadEcosystemSnapshot,type SnapshotLoadState} from "../../data/client";
import {sortTimeline,toOperationsModel,type OperationalItem} from "../../domain/operations/model";
import {runtimeObservationFixture,visibleRuntimeObservations,type RuntimeObservation} from "../../domain/runtimeObservation/model";
import "./operations.css";

const initial:SnapshotLoadState={status:"LOADING"};

export function OperationsPage(){
 const [state,setState]=useState<SnapshotLoadState>(initial);
 const [mode,setMode]=useState<"path"|"timeline">("path");
 useEffect(()=>{const c=new AbortController();void loadEcosystemSnapshot(c.signal).then(setState);return()=>c.abort();},[]);
 if(state.status==="LOADING") return <Status message="Caricamento del percorso operativo…"/>;
 if(state.status==="INVALID"||state.status==="UNAVAILABLE") return <Status message="Snapshot non utilizzabile. La candidate non ricostruisce il percorso operativo." error/>;
 const model=toOperationsModel(state.data);
 const p=model.operationalPath;
 const timeline=sortTimeline(model.timelineEvents);
 const runtimeObservations=visibleRuntimeObservations(runtimeObservationFixture);
 return <section className="operations-page" aria-labelledby="operations-title">
  <header className="feature-header"><p className="section-kicker">A5 · OPERAZIONI</p><h2 id="operations-title">Percorso operativo e cronologia governata</h2><p>Dove siamo, cosa viene dopo e come siamo arrivati allo stato corrente, senza creare una roadmap parallela.</p></header>
  <section className="operations-summary" aria-label="Sintesi operativa">
   <div><span>Attività correnti</span><strong>{p.currentActivities.length}</strong></div>
   <div><span>Gate successivi</span><strong>{p.nextGates.length}</strong></div>
   <div><span>Eventi registrati</span><strong>{timeline.length}</strong></div>
  </section>
  <div className="view-switch" role="tablist" aria-label="Vista operativa">
   <button type="button" role="tab" aria-selected={mode==="path"} onClick={()=>setMode("path")}>Percorso operativo</button>
   <button type="button" role="tab" aria-selected={mode==="timeline"} onClick={()=>setMode("timeline")}>Cronologia governata</button>
  </div>
  {mode==="path"?<section role="tabpanel" className="operations-grid" aria-label="Percorso operativo">
   <Block title="Attività correnti" items={p.currentActivities}/>
   <Block title="Prossimi gate" items={p.nextGates}/>
   <Block title="Prossimi incrementi" items={p.nextIncrements}/>
   <Block title="Defer espliciti" items={p.explicitDefers}/>
   <Block title="Dipendenze non soddisfatte" items={p.unmetDependencies} wide/>
  </section>:<section role="tabpanel" className="timeline-list" aria-label="Cronologia governata">
   <p className="timeline-coverage"><strong>Copertura timeline: PARTIAL_EXPLICIT.</strong> La cronologia espone solo eventi governati presenti nello snapshot.</p>
   {timeline.map(e=><article key={e.id} className="timeline-event">
    <div><strong>{e.id}</strong><time dateTime={e.occurredAt}>{formatDate(e.occurredAt)}</time></div>
    <h3>{e.label||e.eventType}</h3>
    <dl><div><dt>Tipo</dt><dd>{e.eventType||"—"}</dd></div><div><dt>Authority</dt><dd>{e.authority||"—"}</dd></div><div><dt>Subject</dt><dd>{e.subjectRef||"—"}</dd></div><div><dt>Versione</dt><dd className="mono">{e.versionRef||"—"}</dd></div></dl>
    {e.details?.length?<ul>{e.details.map(d=><li key={d}>{d}</li>)}</ul>:null}
   </article>)}
  </section>}
  <RuntimeObservationPanel items={runtimeObservations}/>
  <footer className="feature-footer">Snapshot {formatDate(model.generatedAt)} · READ_ONLY</footer>
 </section>;
}

function Block({title,items,wide=false}:{title:string;items:OperationalItem[];wide?:boolean}){
 return <section className={wide?"operations-block is-wide":"operations-block"}><h3>{title}</h3>{items.length?items.map((x,i)=><article key={x.ref||String(i)}><strong>{x.ref}{x.label?" · "+x.label:""}</strong><small>{[x.kind,x.status,x.state,x.runtimeState,x.decisionAuthority,x.dependencyStatus].filter(Boolean).join(" · ")}</small>{x.dependencyRefs?.length?<small>Dipendenze: {x.dependencyRefs.join(", ")}</small>:null}</article>):<p className="empty-state">Nessun elemento dichiarato.</p>}</section>;
}
function Status({message,error=false}:{message:string;error?:boolean}){return <section className={error?"feature-status is-error":"feature-status"}><p className="section-kicker">A5 · OPERAZIONI</p><h2>Operazioni</h2><p role={error?"alert":undefined}>{message}</p></section>}
function formatDate(value?:string){if(!value)return "non dichiarata";const d=new Date(value);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("it-IT",{dateStyle:"medium",timeStyle:"short"}).format(d);}


function RuntimeObservationPanel({items}:{items:RuntimeObservation[]}){
 return <section className="runtime-observation" aria-labelledby="runtime-observation-title">
  <header><div><p className="section-kicker">OR-04 · RUNTIME OBSERVATION</p><h3 id="runtime-observation-title">Osservazione runtime</h3></div><strong className="runtime-readonly">READ_ONLY</strong></header>
  <p className="runtime-observation-note">Proiezione contract-compliant di collaudo. Non rappresenta un runtime attivo e non espone comandi operativi.</p>
  {items.map(item=><article key={item.runtimeId} className="runtime-observation-card">
   <div className="runtime-observation-head"><div><strong>{item.runtimeType} · {item.runtimeId}</strong><small>{item.adapterId} · {item.adapterVersion}</small></div><span>{item.adapterState}</span></div>
   <dl>
    <div><dt>Disponibilità</dt><dd>{item.availability}</dd></div>
    <div><dt>Health</dt><dd>{item.health}</dd></div>
    <div><dt>Sorgente</dt><dd>{item.source}</dd></div>
    <div><dt>Freshness</dt><dd>{item.stale?"STALE":"CURRENT_FIXTURE"}</dd></div>
   </dl>
   <div className="runtime-capabilities" aria-label="Capability runtime">
    {item.capabilities.map(cap=><div key={cap.key}><code>{cap.key}</code><small>{cap.supported?"supported":"unsupported"} · {cap.available?"available":"unavailable"} · {cap.authorized?"authorized":"unauthorized"}{cap.reason?" · "+cap.reason:""}</small></div>)}
   </div>
   <div className="runtime-evidence"><strong>Evidenze</strong>{item.evidenceRefs.map(ref=><code key={ref}>{ref}</code>)}</div>
  </article>)}
 </section>;
}
