import { useEffect, useMemo, useState } from "react";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";
import { freshnessState, linkedCapabilities, toEvidenceModel } from "../../domain/evidence/model";
import "./evidence.css";

const initial:SnapshotLoadState={status:"LOADING"};

export function EvidencePage(){
  const [state,setState]=useState<SnapshotLoadState>(initial);
  const [area,setArea]=useState("ALL");
  const [type,setType]=useState("ALL");
  const [status,setStatus]=useState("ALL");
  const [freshness,setFreshness]=useState("ALL");
  const [head,setHead]=useState("");
  const [mode,setMode]=useState<"evidence"|"integrity">("evidence");

  useEffect(()=>{
    const controller=new AbortController();
    void loadEcosystemSnapshot(controller.signal).then(setState);
    return ()=>controller.abort();
  },[]);

  if(state.status==="LOADING") return <Status message="Caricamento delle evidenze governate…" />;
  if(state.status==="INVALID" || state.status==="UNAVAILABLE") return <Status message="Snapshot non utilizzabile. La candidate non ricostruisce evidenze mancanti." error />;

  const model=toEvidenceModel(state.data);
  const areas=[...new Set(model.evidence.map((e)=>e.area).filter(Boolean) as string[])].sort();
  const types=[...new Set(model.evidence.map((e)=>e.type).filter(Boolean) as string[])].sort();
  const statuses=[...new Set(model.evidence.map((e)=>e.status).filter(Boolean) as string[])].sort();
  const items=model.evidence.filter((item)=>{
    const exact=String(item.binding?.exactHead || "").toLowerCase();
    return (area==="ALL" || item.area===area)
      && (type==="ALL" || item.type===type)
      && (status==="ALL" || item.status===status)
      && (freshness==="ALL" || freshnessState(item,model.generatedAt)===freshness)
      && (!head.trim() || exact.includes(head.trim().toLowerCase()));
  });
  const issueCount=model.integrityChecks.filter((c)=>["ISSUE","FAIL"].includes(String(c.status))).length;
  const notEvaluable=model.integrityChecks.filter((c)=>c.status==="NOT_EVALUABLE").length;

  return (
    <section className="evidence-page" aria-labelledby="evidence-title">
      <header className="feature-header">
        <p className="section-kicker">A4 · EVIDENZE</p>
        <h2 id="evidence-title">Evidenze e integrità</h2>
        <p>Drill-down sullo snapshot governato. PASS descrive una regola specifica; non viene convertito in score complessivo.</p>
      </header>

      <section className="evidence-summary" aria-label="Sintesi evidenze">
        <div><span>Evidenze</span><strong>{model.evidence.length}</strong></div>
        <div><span>Anomalie</span><strong>{issueCount}</strong></div>
        <div><span>Non valutabili</span><strong>{notEvaluable}</strong></div>
      </section>

      <div className="view-switch" role="tablist" aria-label="Vista specialistica evidenze">
        <button type="button" role="tab" aria-selected={mode==="evidence"} onClick={()=>setMode("evidence")}>Evidence Explorer</button>
        <button type="button" role="tab" aria-selected={mode==="integrity"} onClick={()=>setMode("integrity")}>Integrità</button>
      </div>

      {mode==="evidence" ? (
        <section role="tabpanel" className="evidence-section" aria-label="Evidence Explorer">
          <div className="evidence-filters">
            <Filter label="Ambito" value={area} onChange={setArea} values={areas} all="Tutti" />
            <Filter label="Evidence type" value={type} onChange={setType} values={types} all="Tutti" />
            <Filter label="Stato" value={status} onChange={setStatus} values={statuses} all="Tutti" />
            <Filter label="Freshness" value={freshness} onChange={setFreshness} values={["CURRENT","EXPIRED","POLICY_BOUND","UNKNOWN"]} all="Tutte" />
            <label>Exact head<input type="search" value={head} onChange={(e)=>setHead(e.target.value)} placeholder="SHA o prefisso" /></label>
          </div>

          <div className="evidence-list">
            {items.map((item)=>{
              const fresh=freshnessState(item,model.generatedAt);
              const linked=linkedCapabilities(model,item.id);
              return (
                <article key={item.id} className="evidence-item">
                  <div className="evidence-item-head"><strong>{item.id}</strong><span data-status={item.status}>{item.status || "—"}</span></div>
                  <h3>{item.subject || "Evidenza"}</h3>
                  <dl>
                    <div><dt>Tipo</dt><dd>{item.type || "—"}</dd></div>
                    <div><dt>Ambito</dt><dd>{item.area || "—"}</dd></div>
                    <div><dt>Freshness</dt><dd>{fresh}</dd></div>
                    <div><dt>Capability</dt><dd>{linked.join(", ") || "Non associata"}</dd></div>
                    <div><dt>Exact head</dt><dd className="mono">{item.binding?.exactHead || "Non bound"}</dd></div>
                    <div><dt>Confidenza</dt><dd>{item.confidence || "—"}</dd></div>
                  </dl>
                  <p className="evidence-source">Fonte: {item.source?.ref || item.source?.path || "fonte governata"}</p>
                </article>
              );
            })}
            {!items.length ? <p className="empty-state">Nessuna evidenza corrisponde ai filtri.</p> : null}
          </div>
        </section>
      ) : (
        <section role="tabpanel" className="integrity-section" aria-label="Integrità">
          <div className="integrity-note"><strong>Nessuno score complessivo.</strong> PASS significa soltanto che la regola indicata non rileva incoerenze nei dati disponibili.</div>
          <div className="integrity-list">
            {model.integrityChecks.map((check)=>(
              <article key={check.id} className="integrity-item">
                <div><strong>{check.id}</strong><span data-status={check.status}>{check.status || "—"}</span></div>
                <h3>{check.summary || check.type}</h3>
                <p>{check.type} · severità {check.severity || "—"}</p>
                {check.affectedRefs?.length ? <p>Riferimenti: {check.affectedRefs.join(", ")}</p> : null}
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="feature-footer">Snapshot {formatDate(model.generatedAt)} · READ_ONLY</footer>
    </section>
  );
}

function Filter({label,value,onChange,values,all}:{label:string;value:string;onChange:(v:string)=>void;values:string[];all:string}){
 return <label>{label}<select value={value} onChange={(e)=>onChange(e.target.value)}><option value="ALL">{all}</option>{values.map((v)=><option key={v}>{v}</option>)}</select></label>;
}
function Status({message,error=false}:{message:string;error?:boolean}){return <section className={error?"feature-status is-error":"feature-status"}><p className="section-kicker">A4 · EVIDENZE</p><h2>Evidenze</h2><p role={error?"alert":undefined}>{message}</p></section>;}
function formatDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("it-IT",{dateStyle:"medium",timeStyle:"short"}).format(d);}
