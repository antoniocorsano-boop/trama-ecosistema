"use client";
import {useState} from "react";
import type {PathwayScene,SceneStage,SceneIllustration} from "../lib/model";
import {makeSceneIllustration,sceneImageBytes,SCENE_IMAGE_MAX_BYTES,PROJECT_IMAGE_MAX_BYTES} from "../lib/scene-media";

export function SceneImageEditor({scene,otherImageBytes,onChange}:{scene:PathwayScene;otherImageBytes:number;onChange:(image:SceneIllustration|undefined,stage:SceneStage|undefined)=>void}){
 const [selected,setSelected]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const image=scene.illustration,stage=scene.stage;
 const evidence=stage?.evidence??[];
 const current=evidence.find(item=>item.id===selected);
 const clearPoints=():SceneStage|undefined=>stage?{...stage,evidence:stage.evidence?.map(({hotspot,...item})=>{void hotspot;return item;})}:undefined;
 let src="";
 if(image)try{sceneImageBytes(image);src="data:image/webp;base64,"+image.base64}catch{/* fail closed */}
 async function load(file:File){
  setBusy(true);setError("");
  try{
   if(file.size>SCENE_IMAGE_MAX_BYTES||otherImageBytes+file.size>PROJECT_IMAGE_MAX_BYTES)throw Error("IMAGE_LIMIT");
   const next=await makeSceneIllustration(new Uint8Array(await file.arrayBuffer()));
   const decoded=new Image();decoded.src="data:image/webp;base64,"+next.base64;await decoded.decode();
   if(decoded.naturalWidth!==next.pixelWidth||decoded.naturalHeight!==next.pixelHeight)throw Error("IMAGE_INTEGRITY");
   onChange(next,clearPoints());setSelected("");
  }catch(e){setError(e instanceof Error&&e.message==="IMAGE_LIMIT"?"Limite superato: 256 KiB per immagine, 512 KiB per progetto.":"File non valido: scegli un’immagine WebP statica e integra.");}
  finally{setBusy(false);}
 }
 function point(x:number,y:number){
  if(!stage||!image||!current||busy)return;
  const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
  onChange(image,{...stage,evidence:evidence.map(item=>item.id===selected?{...item,hotspot:{x:clamp(x),y:clamp(y)}}:item)});
 }
 return <section className="scene-image-editor" aria-label="Immagine interattiva">
  <h4>Immagine interattiva</h4>
  <p>Importa una tua immagine WebP, scegli un indizio e posizionalo. I file rimangono nel progetto locale; usa soltanto immagini che puoi utilizzare e prive di dati personali.</p>
  <label>Carica immagine WebP<input type="file" accept="image/webp,.webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)void load(file)}}/></label>
  <small>Massimo 256 KiB per immagine e 512 KiB per progetto. La sostituzione azzera le posizioni, non cancella gli indizi.</small>
  {busy&&<p role="status">Verifica dell’immagine…</p>}
  {error&&<p role="alert">{error}</p>}
  {image&&<>
   <label>Descrizione alternativa dell’immagine<input maxLength={300} value={image.alt} disabled={busy} onChange={e=>onChange({...image,alt:e.target.value},stage)}/></label>
   <button type="button" className="quiet-action danger" disabled={busy} onClick={()=>{onChange(undefined,clearPoints());setSelected("");}}>Rimuovi immagine</button>
   <label>Indizio da posizionare<select value={selected} disabled={busy} onChange={e=>setSelected(e.target.value)}>
    <option value="">Scegli un indizio</option>{evidence.map((item,i)=><option key={item.id} value={item.id}>{i+1}. {item.label||"Indizio senza nome"}</option>)}
   </select></label>
   {src?<div className="scene-image-board">
    {/* Image bytes have been verified locally; no remote image URL is accepted. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={image.alt||"Immagine della scena"} width={image.pixelWidth} height={image.pixelHeight}/>
    <button type="button" className="scene-image-position-surface" aria-label="Posiziona sull’immagine" disabled={!current||busy} onClick={event=>{
     if(event.detail===0){point(current?.hotspot?.x??50,current?.hotspot?.y??50);return;}
     const rect=event.currentTarget.getBoundingClientRect();
     if(rect.width&&rect.height)point((event.clientX-rect.left)*100/rect.width,(event.clientY-rect.top)*100/rect.height);
    }}/>
    {evidence.map((item,i)=>item.hotspot?<span aria-hidden="true" key={item.id} className={"scene-image-marker"+(item.id===selected?" active":"")} style={{left:item.hotspot.x+"%",top:item.hotspot.y+"%"}}>{i+1}</span>:null)}
   </div>:<p role="alert">Immagine non valida: sostituiscila.</p>}
   {current&&<div className="scene-image-coordinates">
    <label>Posizione orizzontale (%)<input type="number" min={0} max={100} step={1} value={current.hotspot?.x??50} disabled={busy} onChange={e=>{if(e.target.value!=="")point(Number(e.target.value),current.hotspot?.y??50)}}/></label>
    <label>Posizione verticale (%)<input type="number" min={0} max={100} step={1} value={current.hotspot?.y??50} disabled={busy} onChange={e=>{if(e.target.value!=="")point(current.hotspot?.x??50,Number(e.target.value))}}/></label>
    <button type="button" className="secondary-action" disabled={busy} onClick={()=>point(current.hotspot?.x??50,current.hotspot?.y??50)}>Conferma posizione</button>
    {current.hotspot&&<button type="button" className="quiet-action" disabled={busy} onClick={()=>{if(stage)onChange(image,{...stage,evidence:evidence.map(item=>{if(item.id!==selected)return item;const {hotspot,...rest}=item;void hotspot;return rest;})})}}>Togli punto dall’immagine</button>}
   </div>}
   <p>{evidence.filter(item=>item.hotspot).length} punti posizionati · almeno uno e una descrizione alternativa sono necessari per la prova.</p>
  </>}
 </section>
}
