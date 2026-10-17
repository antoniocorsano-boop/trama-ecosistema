import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";
import {
  capabilityStateLabel,
  relationKindLabel,
  relationTone,
  selectGapEntries,
  toEcosystemModel,
  type Dependency,
  type EcosystemGraphFlow,
  type EcosystemModel,
} from "../../domain/ecosystem/model";
import { EcosystemGapView } from "./EcosystemGapView";
import { EcosystemStateList } from "./EcosystemStateList";
import "./ecosystem.css";

const EcosystemGraph=lazy(()=>import("./EcosystemGraph").then((module)=>({default:module.EcosystemGraph})));
const initial:SnapshotLoadState={status:"LOADING"};

export function EcosystemPage(){
  const [state,setState]=useState<SnapshotLoadState>(initial);

  useEffect(()=>{
    const controller=new AbortController();
    void loadEcosystemSnapshot(controller.signal).then(setState);
    return ()=>controller.abort();
  },[]);

  if(state.status==="LOADING") return <Status message="Caricamento dello snapshot governato…" />;
  if(state.status==="INVALID" || state.status==="UNAVAILABLE") return <Status message="Snapshot non utilizzabile. Nessuna relazione viene inferita." error />;

  return <EcosystemView model={toEcosystemModel(state.data)} />;
}

export function EcosystemView({model}:{model:EcosystemModel}){
  const [view,setView]=useState<"MAP"|"GAP">("MAP");
  const [includeSafeguards,setIncludeSafeguards]=useState(false);
  const [selectedFlow,setSelectedFlow]=useState<string|null>(model.ecosystemGraph.flows[0]?.id ?? null);
  const [selectedLegacy,setSelectedLegacy]=useState<string|null>(model.dependencies[0]?.id ?? null);
  const [search,setSearch]=useState("");
  const [owner,setOwner]=useState("ALL");

  const gapEntries=useMemo(
    ()=>selectGapEntries(model.ecosystemGraph,includeSafeguards),
    [model.ecosystemGraph,includeSafeguards],
  );
  const openGapCount=selectGapEntries(model.ecosystemGraph).length;
  const selectedCanonical=model.ecosystemGraph.flows.find((flow)=>flow.id===selectedFlow) ?? model.ecosystemGraph.flows[0] ?? null;
  const selectedRelation=model.dependencies.find((item)=>item.id===selectedLegacy) ?? model.dependencies[0] ?? null;
  const owners=[...new Set(model.capabilities.map((c)=>c.ownerDomain).filter(Boolean) as string[])].sort();
  const capabilities=model.capabilities.filter((cap)=>{
    const q=search.trim().toLowerCase();
    return (owner==="ALL" || cap.ownerDomain===owner) && (!q || cap.id.toLowerCase().includes(q) || cap.label.toLowerCase().includes(q));
  });

  return (
    <section className="ecosystem-page" aria-labelledby="ecosystem-title">
      <header className="feature-header">
        <p className="section-kicker">A4 · ECOSISTEMA · CONTROL MAP v0.3</p>
        <h2 id="ecosystem-title">Capability e relazioni governate</h2>
        <p>La topologia primaria proviene dal grafo canonico v0.3. Stato, gap, target e prossimo intervento sono proiezioni read-only: il browser non promuove nulla.</p>
      </header>

      <section className="ecosystem-summary" aria-label="Sintesi ecosistema canonico">
        <div><span>Nodi canonici</span><strong>{model.ecosystemGraph.nodes.length} nodi</strong></div>
        <div><span>Flussi canonici</span><strong>{model.ecosystemGraph.flows.length} flussi</strong></div>
        <div><span>Gap governati</span><strong>{openGapCount}</strong></div>
      </section>

      <div className="ecosystem-view-switch" role="group" aria-label="Vista ecosistema">
        <button type="button" aria-pressed={view==="MAP"} onClick={()=>setView("MAP")}>Mappa governata</button>
        <button type="button" aria-pressed={view==="GAP"} onClick={()=>setView("GAP")}>AS IS → GAP → TO BE</button>
      </div>

      {view==="MAP" ? (
        <section className="ecosystem-section" aria-labelledby="canonical-map-title">
          <div className="section-title">
            <div><h3 id="canonical-map-title">Stato completo del grafo canonico</h3><p>Ogni arco visuale corrisponde a un record di <code>ecosystemGraph.flows[]</code>.</p></div>
          </div>
          <div className="ecosystem-canonical-layout">
            <div>
              <Suspense fallback={<div className="graph-loading" role="status">Caricamento mappa…</div>}>
                <EcosystemGraph graph={model.ecosystemGraph} selectedId={selectedCanonical?.id ?? null} onSelect={setSelectedFlow} />
              </Suspense>
              <EcosystemStateList graph={model.ecosystemGraph} selectedFlowId={selectedCanonical?.id ?? null} onSelectFlow={setSelectedFlow} />
            </div>
            <CanonicalFlowDetail flow={selectedCanonical} />
          </div>
        </section>
      ) : (
        <section className="ecosystem-section" aria-labelledby="gap-view-title">
          <div className="section-title gap-title-row">
            <div><h3 id="gap-view-title">AS IS → GAP → TO BE</h3><p>Mostra solo il delta governato; nessun backlog viene inferito.</p></div>
            <label className="safeguard-toggle"><input type="checkbox" checked={includeSafeguards} onChange={(event)=>setIncludeSafeguards(event.target.checked)} />Mostra elementi da non riaprire</label>
          </div>
          <EcosystemGapView entries={gapEntries} />
        </section>
      )}

      <section className="ecosystem-section legacy-context" aria-labelledby="legacy-context-title">
        <div className="section-title"><div><h3 id="legacy-context-title">Contesto capability e lifecycle</h3><p>Contesto secondario già governato: non definisce la topologia v0.3.</p></div></div>
        <div className="ecosystem-relationship-layout">
          <div>
            <div className="relation-list" aria-label="Elenco equivalente delle relazioni">
              {model.dependencies.map((relation)=>(
                <button key={relation.id} type="button" className={relation.id===selectedRelation?.id?"relation-item is-selected":"relation-item"} aria-pressed={relation.id===selectedRelation?.id} onClick={()=>setSelectedLegacy(relation.id)}>
                  <span><strong>{relation.from} → {relation.to}</strong><small>{relationKindLabel(relation.kind)}</small></span>
                  <em data-tone={relationTone(relation.kind)}>{relation.status.replaceAll("_"," ")}</em>
                </button>
              ))}
            </div>
          </div>
          <LegacyRelationDetail relation={selectedRelation} />
        </div>

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

      <footer className="feature-footer">Snapshot {formatDate(model.generatedAt)} · GRAPH {model.ecosystemGraph.schemaVersion} · READ_ONLY · nessuna authority browser</footer>
    </section>
  );
}

function CanonicalFlowDetail({flow}:{flow:EcosystemGraphFlow|null}){
  if(!flow) return <aside className="relation-detail"><p>Nessun flusso canonico disponibile.</p></aside>;
  return (
    <aside className="relation-detail" aria-label="Dettaglio flusso canonico" aria-live="polite">
      <p className="detail-kicker">{relationKindLabel(flow.kind)}</p>
      <h4>{flow.from} → {flow.to}</h4>
      <dl>
        <div><dt>AS IS</dt><dd>{flow.state}</dd></div>
        <div><dt>TO BE</dt><dd>{flow.targetState}</dd></div>
        <div><dt>GAP</dt><dd>{flow.gap.summary}</dd></div>
        <div><dt>Authority</dt><dd>{flow.authorityOwner || flow.authorityRefs.join(", ")}</dd></div>
        <div><dt>Evidenze</dt><dd>{flow.evidenceRefs.join(", ") || "Nessuna"}</dd></div>
      </dl>
    </aside>
  );
}

function LegacyRelationDetail({relation}:{relation:Dependency|null}){
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
