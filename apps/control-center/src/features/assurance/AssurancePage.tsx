import {useEffect,useMemo,useState} from "react";
import {loadEcosystemSnapshot,type SnapshotLoadState} from "../../data/client";
import {hasFormalCertificate,statusLabel,targetGapKinds,toAssuranceModel} from "../../domain/assurance/model";
import "./assurance.css";

const initial:SnapshotLoadState={status:"LOADING"};

export function AssurancePage(){
 const [state,setState]=useState<SnapshotLoadState>(initial);
 const [domain,setDomain]=useState("ALL");
 useEffect(()=>{const c=new AbortController();void loadEcosystemSnapshot(c.signal).then(setState);return()=>c.abort();},[]);
 if(state.status==="LOADING") return <Status message="Caricamento delle evidenze di assurance…"/>;
 if(state.status==="INVALID"||state.status==="UNAVAILABLE") return <Status message="Snapshot non utilizzabile. La candidate non deduce conformità o certificazioni." error/>;
 const model=toAssuranceModel(state.data);
 const domains=useMemo(()=>[...new Set(model.claims.map(c=>c.domain).filter(Boolean) as string[])].sort(),[model.claims]);
 const claims=model.claims.filter(c=>domain==="ALL"||c.domain===domain);
 const formal=model.claims.filter(hasFormalCertificate).length;
 return <section className="assurance-page" aria-labelledby="assurance-title">
  <header className="feature-header"><p className="section-kicker">A5 · ASSURANCE</p><h2 id="assurance-title">Stakeholder Assurance</h2><p>Stato → target → evidenze mancanti. Nessun punteggio complessivo e nessuna certificazione implicita.</p></header>
  <section className="assurance-summary" aria-label="Sintesi assurance">
   <div><span>Requisiti</span><strong>{model.claims.length}</strong></div>
   <div><span>Con certificato esterno registrato</span><strong>{formal}</strong></div>
   <div><span>Con gap evidenziali</span><strong>{model.claims.filter(c=>targetGapKinds(c).length>0).length}</strong></div>
  </section>
  <div className="assurance-filter"><label>Dominio<select value={domain} onChange={e=>setDomain(e.target.value)}><option value="ALL">Tutti</option>{domains.map(d=><option key={d}>{d}</option>)}</select></label></div>
  <section className="assurance-list" aria-label="Requisiti assurance">
   {claims.map(c=><article key={c.requirementId} className="assurance-item">
    <div className="assurance-item-head"><div><strong>{c.requirementId}</strong><h3>{c.domain?.replaceAll("_"," ")}</h3></div><span data-status={c.status}>{statusLabel(c.status)}</span></div>
    <p>{c.scope}</p>
    <dl>
     <div><dt>Target</dt><dd>{statusLabel(c.targetStatus)}</dd></div>
     <div><dt>Authority</dt><dd>{c.reviewAuthority||"—"}</dd></div>
     <div><dt>Standard</dt><dd>{c.standardRef||"Non dichiarato"}</dd></div>
     <div><dt>Assessor</dt><dd>{c.assessor||"Non registrato"}</dd></div>
    </dl>
    <div className="readiness-line" aria-label={c.requirementId+": "+String(c.readiness?.metPrerequisites||0)+" prerequisiti presenti su "+String(c.readiness?.requiredPrerequisites||0)}>
     <span>Prerequisiti presenti</span><strong>{c.readiness?.metPrerequisites||0} / {c.readiness?.requiredPrerequisites||0}</strong>
    </div>
    <div className="assurance-gaps"><strong>Evidenze mancanti</strong>{targetGapKinds(c).length?<ul>{targetGapKinds(c).map(x=><li key={x}>{x.replaceAll("_"," ")}</li>)}</ul>:<p>Nessun gap dichiarato nello snapshot.</p>}</div>
    {c.externalCertificateRef?<p className="certificate-ref">Certificato esterno: {c.externalCertificateRef}</p>:null}
    {c.limitations?.length?<details><summary>Limiti della dichiarazione</summary><ul>{c.limitations.map(x=><li key={x}>{x}</li>)}</ul></details>:null}
   </article>)}
  </section>
  <footer className="feature-footer">Snapshot {formatDate(model.generatedAt)} · READ_ONLY · nessuna certificazione dedotta</footer>
 </section>;
}
function Status({message,error=false}:{message:string;error?:boolean}){return <section className={error?"feature-status is-error":"feature-status"}><p className="section-kicker">A5 · ASSURANCE</p><h2>Assurance</h2><p role={error?"alert":undefined}>{message}</p></section>}
function formatDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("it-IT",{dateStyle:"medium",timeStyle:"short"}).format(d);}
