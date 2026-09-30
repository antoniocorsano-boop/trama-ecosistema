import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";
import { capabilityStateLabel, relationKindLabel, relationTone, toEcosystemModel, type Dependency } from "../../domain/ecosystem/model";
import "./ecosystem.css";

const EcosystemGraph=lazy(()=>import("./EcosystemGraph").then((module)=>({default:module.EcosystemGraph})));
const initial:SnapshotLoadState={status:"LOADING"};

export function EcosystemPage(){
  const [state,setState]=useState<SnapshotLoadState>(initial);
  const [selected,setSelected]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [owner,setOwner]=useState("ALL");

  useEffect(()=>{
    const controller=new AbortController();
    void loadEcosystemSnapshot(controller.signal).then(setState);
    return ()=>controller.abort();
  },[]);

  if(state.status==="LOADING") return <Status message="Caricamento dello snapshot governato…" />;
  if(state.status==="INVALID" || state.status==="UNAVAILABLE") return <Status message="Snapshot non utilizzabile. Nessuna relazione viene inferita." error />;

  const model=toEcosystemModel(state.data);
  const owners=[...new Set(model.capabilities.map((c)=>c.ownerDomain).filter(Boolean) as string[])].sort();
  const capabilities=model.capabilities.filter((cap)=>{
    const q=search.trim().toLowerCase();
    return (owner==="ALL" || cap.ownerDomain===owner) && (!q || cap.id.toLowerCase().includes(q) || cap.label.toLowerCase().includes(q));
  });
  const selectedRelation=model.dependencies.find((d)=>d.id===selected) ?? model.dependencies[0] ?? null;

  return (
    <section className="ecosystem-page" aria-labelledby="ecosystem-title">
      <header className="feature-header">
        <p className="section-kicker">A4 · ECOSISTEMA</p>
        <h2 id="ecosystem-title">Capability e relazioni governate</h2>
        <p>La vista mostra solo relazioni presenti nello snapshot. “Futuro non autorizzato” resta distinto da authority e flussi attivi.</p>
      </header>

      <section className="ecosystem-summary" aria-label="Sintesi ecosistema">
        <div><span>Capability dichiarate</span><strong>{model.capabilities.length}</strong></div>
        <div><span>Relazioni governate</span><strong>{model.dependencies.length}</strong></div>
        <div><span>Runtime deferred</span><strong>{model.capabilities.filter((c)=>c.runtimeState==="DEFERRED").length}</strong></div>
      </section>

      <section className="ecosystem-section" aria-labelledby="relations-title">
        <div className="section-title">
          <div><h3 id="relations-title">Relazioni</h3><p>Grafo visuale lazy + elenco accessibile equivalente.</p></div>
        </div>

        <div className="ecosystem-relationship-layout">
          <div>
            <Suspense fallback={<div className="graph-loading" role="status">Caricamento mappa…</div>}>
              <EcosystemGraph dependencies={model.dependencies} selectedId={selectedRelation?.id ?? null} onSelect={setSelected} />
            </Suspense>
            <div className="relation-list" aria-label="Elenco equivalente delle relazioni">
              {model.dependencies.map((relation)=>(
                <button
                  key={relation.id}
                  type="button"
                  className={relation.id===selectedRelation?.id?"relation-item is-selected":"relation-item"}
                  aria-pressed={relation.id===selectedRelation?.id}
                  onClick={()=>setSelected(relation.id)}
                >
                  <span><strong>{relation.from} → {relation.to}</strong><small>{relationKindLabel(relation.kind)}</small></span>
                  <em data-tone={relationTone(relation.kind)}>{relation.status.replaceAll("_"," ")}</em>
                </button>
              ))}
            </div>
          </div>
          <RelationDetail relation={selectedRelation} />
        </div>
      </section>

      <section className="ecosystem-section" aria-labelledby="capabilities-title">
        <div className="section-title"><div><h3 id="capabilities-title">Capability</h3><p>Ricerca locale sul solo snapshot validato.</p></div></div>
        <div className="ecosystem-filters">
          <label>Cerca capability<input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="ID o nome" /></label>
          <label>Owner<select value={owner} onChange={(e)=>setOwner(e.target.value)}><option value="ALL">Tutti</option>{owners.map((item)=><option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="capability-list">
          {capabilities.map((cap)=>(
            <article key={cap.id} className="capability-item">
              <div><strong>{cap.id}</strong><h4>{cap.label}</h4></div>
              <dl>
                <div><dt>Owner</dt><dd>{cap.ownerDomain || "—"}</dd></div>
                <div><dt>Stato</dt><dd>{capabilityStateLabel(cap.state)}</dd></div>
                <div><dt>Runtime</dt><dd>{cap.runtimeState || "Nessuno stato runtime separato"}</dd></div>
                <div><dt>Human Review</dt><dd>{cap.humanReview || "—"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <footer className="feature-footer">Snapshot {formatDate(model.generatedAt)} · READ_ONLY · nessuna authority browser</footer>
    </section>
  );
}

function RelationDetail({relation}:{relation:Dependency|null}){
  if(!relation) return <aside className="relation-detail"><p>Nessuna relazione disponibile.</p></aside>;
  return (
    <aside className="relation-detail" aria-live="polite">
      <p className="detail-kicker">{relationKindLabel(relation.kind)}</p>
      <h4>{relation.from} → {relation.to}</h4>
      <dl>
        <div><dt>Stato</dt><dd>{relation.status.replaceAll("_"," ")}</dd></div>
        <div><dt>Governance</dt><dd>{relation.governanceRefs?.join(", ") || "Nessun riferimento"}</dd></div>
        <div><dt>Gate</dt><dd>{relation.gateRefs?.join(", ") || "Nessuno"}</dd></div>
        <div><dt>Evidenze</dt><dd>{relation.evidenceRefs?.join(", ") || "Nessuna"}</dd></div>
      </dl>
    </aside>
  );
}

function Status({message,error=false}:{message:string;error?:boolean}){
  return <section className={error?"feature-status is-error":"feature-status"}><p className="section-kicker">A4 · ECOSISTEMA</p><h2>Ecosistema</h2><p role={error?"alert":undefined}>{message}</p></section>;
}
function formatDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("it-IT",{dateStyle:"medium",timeStyle:"short"}).format(d);}
