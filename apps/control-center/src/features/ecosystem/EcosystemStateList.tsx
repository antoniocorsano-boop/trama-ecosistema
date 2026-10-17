import type { EcosystemGraphProjection } from "../../domain/ecosystem/model";

export function EcosystemStateList({graph,selectedFlowId,onSelectFlow}:{graph:EcosystemGraphProjection;selectedFlowId:string|null;onSelectFlow:(id:string)=>void}){
  const labels=new Map([...graph.externalActors.map((item)=>[item.id,item.label] as const),...graph.nodes.map((item)=>[item.id,item.label] as const)]);
  return (
    <div className="canonical-state-list" aria-label="Elenco accessibile del grafo canonico">
      <section aria-labelledby="canonical-nodes-title"><h4 id="canonical-nodes-title">Nodi</h4><div className="state-node-grid">
        {graph.nodes.map((node)=><article className="state-node" key={node.id}><div><strong>{node.label}</strong><span data-state={node.state}>{node.state}</span></div><p>{node.boundary}</p><small>Target: {node.targetState}</small></article>)}
      </div></section>
      <section aria-labelledby="canonical-flows-title"><h4 id="canonical-flows-title">Flussi</h4><div className="state-flow-list">
        {graph.flows.map((flow)=><button type="button" key={flow.id} className={flow.id===selectedFlowId?"state-flow is-selected":"state-flow"} aria-pressed={flow.id===selectedFlowId} onClick={()=>onSelectFlow(flow.id)}><span><strong>{labels.get(flow.from) ?? flow.from} → {labels.get(flow.to) ?? flow.to}</strong><small>{flow.kind}</small></span><em data-state={flow.state}>{flow.state}</em></button>)}
      </div></section>
    </div>
  );
}
