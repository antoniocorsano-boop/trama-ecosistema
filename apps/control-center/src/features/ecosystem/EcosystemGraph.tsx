import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { relationKindLabel, type EcosystemGraphProjection } from "../../domain/ecosystem/model";

const planeX:Record<string,number>={PUBLIC:40,PROFESSIONAL:330,CROSS_CUTTING:620,LEARNER:910,GOVERNANCE:1200};
const stateStroke:Record<string,string>={REAL:"#55d79a",PARTIAL:"#58bff7",DESIGNED:"#ae88ff",DEFERRED:"#b2b9c0"};

export function EcosystemGraph({graph,selectedId,onSelect}:{graph:EcosystemGraphProjection;selectedId:string|null;onSelect:(id:string)=>void}) {
  const perPlane=new Map<string,number>();
  const nodes:Node[] = [
    ...graph.externalActors.map((actor,index)=>({
      id:actor.id,position:{x:40,y:20+index*90},data:{label:`${actor.label} · attore esterno`},draggable:false,selectable:false,
      ariaLabel:`${actor.label}, attore esterno dichiarato`,style:{background:"#132536",border:"1px dashed #6f8798",borderRadius:12,color:"#f4f8fb",minWidth:170,textAlign:"center" as const,fontWeight:700},
    })),
    ...graph.nodes.map((item)=>{
      const row=perPlane.get(item.plane) ?? 0; perPlane.set(item.plane,row+1);
      return {
        id:item.id,position:{x:planeX[item.plane] ?? 620,y:120+row*115},data:{label:`${item.label} · ${item.state}`},draggable:false,selectable:false,
        ariaLabel:`${item.label}, stato ${item.state}`,style:{background:"#0e2b42",border:`2px solid ${stateStroke[item.state]}`,borderRadius:12,color:"#f4f8fb",minWidth:190,textAlign:"center" as const,fontWeight:750},
      };
    }),
  ];
  const edges:Edge[]=graph.flows.map((flow)=>({
    id:flow.id,source:flow.from,target:flow.to,label:relationKindLabel(flow.kind),animated:false,focusable:true,selectable:true,selected:flow.id===selectedId,
    ariaLabel:`${flow.from} verso ${flow.to}: ${relationKindLabel(flow.kind)}, stato ${flow.state}`,markerEnd:{type:MarkerType.ArrowClosed,color:stateStroke[flow.state]},
    style:{stroke:stateStroke[flow.state],strokeWidth:flow.id===selectedId?4:2},labelStyle:{fill:"#d8e6ee",fontSize:11},
  }));
  return (
    <div className="ecosystem-graph" aria-label="Mappa grafica delle relazioni governate">
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.3} maxZoom={1.6} nodesDraggable={false} nodesConnectable={false} nodesFocusable edgesFocusable elementsSelectable onEdgeClick={(_,edge)=>onSelect(edge.id)} ariaLabelConfig={{"controls.ariaLabel":"Controlli della mappa","controls.zoomIn.ariaLabel":"Aumenta zoom","controls.zoomOut.ariaLabel":"Riduci zoom","controls.fitView.ariaLabel":"Adatta mappa"}}>
        <Background gap={18} size={1} color="#14354d" /><Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
