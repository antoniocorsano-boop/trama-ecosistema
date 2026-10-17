import type { EcosystemGraphProjection } from "../../domain/ecosystem/model";

function authorityLabel(owner:string|null,refs:string[]){return owner ?? refs.join(", ") || "—";}
function evidenceLabel(refs:string[]){return refs.join(", ") || "—";}

export function EcosystemStateList({graph,selectedFlowId,onSelectFlow}:{graph:EcosystemGraphProjection;selectedFlowId:string|null;onSelectFlow:(id:string)=>void}){
  const labels=new Map([...graph.externalActors.map((item)=>[item.id,item.label] as const),...graph.nodes.map((item)=>[item.id,item.label] as const)]);
  return (
    <div className="canonical-state-list" aria-label="Elenco accessibile del grafo canonico">
      <section aria-labelledby="canonical-nodes-title"><h4 id="canonical-nodes-title">Nodi</h4><div className="state-node-grid">
        {graph.nodes.map((node)=><article className="state-node" key={node.id}>
          <div><strong>{node.label}</strong><span data-state={node.state}>{node.state}</span></div>
          <p>{node.boundary}</p>
          <dl className="state-meta">
            <div><dt>Target</dt><dd>{node.targetState}</dd></div>
            <div><dt>Authority</dt><dd>{authorityLabel(node.authorityOwner,node.authorityRefs)}</dd></div>
            <div><dt>Evidenze</dt><dd>{evidenceLabel(node.evidenceRefs)}</dd></div>
            <div><dt>NEXT</dt><dd>{node.nextAllowedIntervention.action}</dd></div>
          </dl>
        </article>)}
      </div></section>
      <section aria-labelledby="canonical-flows-title"><h4 id="canonical-flows-title">Flussi</h4><div className="state-flow-list">
        {graph.flows.map((flow)=><button type="button" key={flow.id} className={flow.id===selectedFlowId?"state-flow is-selected":"state-flow"} aria-pressed={flow.id===selectedFlowId} onClick={()=>onSelectFlow(flow.id)}>
          <span><strong>{labels.get(flow.from) ?? flow.from} → {labels.get(flow.to) ?? flow.to}</strong><small>{flow.kind} · Authority: {authorityLabel(flow.authorityOwner,flow.authorityRefs)} · NEXT: {flow.nextAllowedIntervention.action}</small></span><em data-state={flow.state}>{flow.state}</em>
        </button>)}
      </div></section>
    </div>
  );
}
