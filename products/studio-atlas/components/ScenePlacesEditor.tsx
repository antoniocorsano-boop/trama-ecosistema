"use client";
import type { PathwayScene, SceneStage, SceneStageLocationPosition, SceneStageEvidenceKind } from "../lib/model";
import { addStageLocation, addStageEvidence, removeStageLocation, stagePlaceErrors } from "../lib/scene-places";

const positions:Record<SceneStageLocationPosition,string>={ENTRY:"Ingresso",ROOM:"Ambiente",CONTROL:"Punto di controllo",LAB:"Laboratorio"};
const kinds:Record<SceneStageEvidenceKind,string>={TRACE:"Traccia",OBJECT:"Oggetto",PERSON:"Testimonianza",SYSTEM:"Sistema"};

export function ScenePlacesEditor({scene,onChange}:{scene:PathwayScene;onChange:(stage:SceneStage)=>void}){
  const stage=scene.stage;
  const places=stage?.locations??[];
  const evidence=stage?.evidence??[];
  return <details className="scene-places-editor">
    <summary>Luoghi e indizi · {places.length} luoghi, {evidence.length} indizi</summary>
    <p>Componi ciò che lo studente può esplorare in Atlas. I luoghi e gli indizi diventano elementi interattivi della scena, non un’immagine con punti sovrapposti.</p>
    {stagePlaceErrors(stage).length>0&&<p role="status" className="scene-places-warning">Completa i nomi, le descrizioni e i riferimenti prima della prova.</p>}
    <button type="button" className="secondary-action" onClick={()=>onChange(addStageLocation(stage,crypto.randomUUID()))}>Aggiungi luogo</button>
    {stage&&places.map((place,i)=><section key={place.id} className="scene-place-card" aria-label={"Luogo "+(i+1)}>
      <h4>Luogo {i+1}</h4>
      <label>Nome del luogo<input value={place.label} onChange={e=>onChange({...stage,locations:places.map(l=>l.id===place.id?{...l,label:e.target.value}:l)})}/></label>
      <label>Descrizione del luogo<textarea rows={2} value={place.detail} onChange={e=>onChange({...stage,locations:places.map(l=>l.id===place.id?{...l,detail:e.target.value}:l)})}/></label>
      <label>Posizione scenica<select value={place.position} onChange={e=>onChange({...stage,locations:places.map(l=>l.id===place.id?{...l,position:e.target.value as SceneStageLocationPosition}:l)})}>
        {Object.entries(positions).map(([key,label])=><option key={key} value={key}>{label}</option>)}
      </select></label>
      <button type="button" className="quiet-action" aria-pressed={stage.focusLocationId===place.id} onClick={()=>{if(stage.focusLocationId!==place.id)onChange({...stage,focusLocationId:place.id})}}>Luogo iniziale</button>
      <button type="button" className="secondary-action" onClick={()=>onChange(addStageEvidence(stage,crypto.randomUUID(),place.id))}>Aggiungi indizio</button>
      {evidence.filter(item=>item.locationId===place.id).map((item,j)=><div key={item.id} className="scene-evidence-card" role="group" aria-label={"Indizio "+(j+1)}>
        <label>Nome dell’indizio<input value={item.label} onChange={e=>onChange({...stage,evidence:evidence.map(v=>v.id===item.id?{...v,label:e.target.value}:v)})}/></label>
        <label>Che cosa rivela<textarea rows={3} value={item.detail} onChange={e=>onChange({...stage,evidence:evidence.map(v=>v.id===item.id?{...v,detail:e.target.value}:v)})}/></label>
        <label>Tipo di indizio<select value={item.kind} onChange={e=>onChange({...stage,evidence:evidence.map(v=>v.id===item.id?{...v,kind:e.target.value as SceneStageEvidenceKind}:v)})}>
          {Object.entries(kinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}
        </select></label>
        <button type="button" className="quiet-action danger" onClick={()=>onChange({...stage,evidence:evidence.filter(v=>v.id!==item.id)})}>Rimuovi indizio</button>
      </div>)}
      <button type="button" className="quiet-action danger" disabled={evidence.some(item=>item.locationId===place.id)} onClick={()=>onChange(removeStageLocation(stage,place.id))}>Rimuovi luogo</button>
      {evidence.some(item=>item.locationId===place.id)&&<small>Per rimuovere questo luogo, rimuovi prima i suoi indizi.</small>}
    </section>)}
  </details>;
}
