import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { relationKindLabel, relationTone, type Dependency } from "../../domain/ecosystem/model";

const positions: Record<string,{x:number;y:number}> = {
  TRAMA:{x:300,y:20},
  Arena:{x:40,y:220},
  "Docente OS":{x:300,y:220},
  Atlas:{x:560,y:220},
};

export function EcosystemGraph({
  dependencies,
  selectedId,
  onSelect,
}:{
  dependencies:Dependency[];
  selectedId:string|null;
  onSelect:(id:string)=>void;
}) {
  const domains=[...new Set(dependencies.flatMap((d)=>[d.from,d.to]))];
  const nodes:Node[] = domains.map((id)=>({
    id,
    position:positions[id] ?? {x:300,y:120},
    data:{label:id},
    draggable:false,
    selectable:false,
    ariaLabel:`${id}, dominio dell'ecosistema`,
    style:{
      background:"#0e2b42",
      border:"1px solid #2a607e",
      borderRadius:12,
      color:"#f4f8fb",
      minWidth:140,
      textAlign:"center",
      fontWeight:750,
    },
  }));
  const edges:Edge[] = dependencies.map((d)=>{
    const tone=relationTone(d.kind);
    const color=tone==="authority"?"#55d79a":tone==="future"?"#ae88ff":"#58bff7";
    return {
      id:d.id,
      source:d.from,
      target:d.to,
      label:relationKindLabel(d.kind),
      animated:false,
      focusable:true,
      selectable:true,
      selected:d.id===selectedId,
      ariaLabel:`${d.from} verso ${d.to}: ${relationKindLabel(d.kind)}, stato ${d.status}`,
      markerEnd:{type:MarkerType.ArrowClosed,color},
      style:{stroke:color,strokeWidth:d.id===selectedId?4:2},
      labelStyle:{fill:"#d8e6ee",fontSize:11},
    };
  });

  return (
    <div className="ecosystem-graph" aria-label="Mappa grafica delle relazioni governate">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.6}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable
        edgesFocusable
        elementsSelectable
        onEdgeClick={(_,edge)=>onSelect(edge.id)}
        ariaLabelConfig={{
          "controls.ariaLabel":"Controlli della mappa",
          "controls.zoomIn.ariaLabel":"Aumenta zoom",
          "controls.zoomOut.ariaLabel":"Riduci zoom",
          "controls.fitView.ariaLabel":"Adatta mappa",
        }}
      >
        <Background gap={18} size={1} color="#14354d" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
