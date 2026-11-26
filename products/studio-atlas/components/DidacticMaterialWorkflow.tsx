"use client";
import {useEffect,useRef,useState} from "react";
import {contextKey,isGearWorkflow,isolatedPreview,materialFiles,prepareDidacticMaterial,verifyInteractivePreview,workflowState,type MaterialFile} from "../lib/didactic-material-workflow";
import {readMaterialArchive,saveMaterialBinding,type ArchivedMaterial,type MaterialContext} from "../lib/didactic-material-archive";
import {inspectMaterial} from "../lib/didactic-materials";
import {MATERIAL_CHOICES} from "../lib/didactic-content-candidates";

type View={key:string;rows:ArchivedMaterial[];status:"loading"|"ready"|"error"};
type Selected={key:string;file:string;status:"CURRENT"|"OBSOLETE";preview:ReturnType<typeof isolatedPreview>};
const labels=(kind:string)=>MATERIAL_CHOICES.find(k=>k.id===kind)?.label??kind;
const message=(error:unknown)=>error instanceof Error&&error.message.includes("CONFLICT")?"La bozza è cambiata. Riapri la richiesta corrente.":error instanceof Error&&error.message.includes("LIMIT")?"Archivio pieno. Le versioni restano conservate; nuove associazioni non disponibili.":error instanceof Error&&error.message.includes("LAB_VERSION")?"Questa versione del simulatore non coincide con quella disponibile nel banco. Puoi conservarla o scaricarla, ma non eseguirla qui.":"Operazione non riuscita. Nessun materiale non verificato è stato associato.";
function download(file:MaterialFile){
 const url=URL.createObjectURL(new Blob([file.body],{type:file.mime}));
 const a=document.createElement("a");a.href=url;a.download=file.name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function DidacticMaterialWorkflow({context,getCurrent,historyOnly=false}:{context:MaterialContext;getCurrent:()=>MaterialContext;historyOnly?:boolean}){
 const key=contextKey(context);
 const [view,setView]=useState<View>({key,rows:[],status:"loading"});
 const [selected,setSelected]=useState<Selected|null>(null);
 const [working,setWorking]=useState("");
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const generation=useRef(0),operation=useRef<AbortController|null>(null),alive=useRef(false),current=useRef(getCurrent);
 current.current=getCurrent;
 async function refresh(){
  const sequence=++generation.current;
  setSelected(null);
  try{
   const snapshot=current.current(),snapshotKey=contextKey(snapshot);
   setView({key:snapshotKey,rows:[],status:"loading"});
   const rows=await readMaterialArchive(snapshot);
   if(alive.current&&generation.current===sequence&&contextKey(current.current())===snapshotKey)setView({key:snapshotKey,rows,status:"ready"});
  }catch{if(alive.current&&generation.current===sequence)setView({key,rows:[],status:"error"});}
 }
 useEffect(()=>{
  alive.current=true;
  void refresh();
  const changed=()=>{operation.current?.abort();setNotice("");void refresh();};
  const visible=()=>{if(document.visibilityState==="visible")changed();};
  window.addEventListener("storage",changed);document.addEventListener("visibilitychange",visible);
  return ()=>{alive.current=false;++generation.current;operation.current?.abort();window.removeEventListener("storage",changed);document.removeEventListener("visibilitychange",visible);};
 },[key]);
 const ready=view.key===key&&view.status==="ready";
 const rows=ready?view.rows:[];
 const requests=workflowState(context,rows);
 async function prepare(resourceId:string){
  if(operation.current||!ready||!isGearWorkflow(context))return;
  const controller=new AbortController();operation.current=controller;setWorking(resourceId);setError("");setNotice("");setSelected(null);
  try{
   const binding=await prepareDidacticMaterial(context,resourceId,()=>current.current(),controller.signal);
   if(controller.signal.aborted)throw Error("MATERIAL_CANCELLED");
   await saveMaterialBinding(binding,()=>{if(controller.signal.aborted)throw Error("MATERIAL_CANCELLED");return current.current();});
   if(alive.current&&!controller.signal.aborted){setNotice("Materiale verificato e conservato. Da revisionare dal docente.");await refresh();}
  }catch(cause){if(alive.current&&!controller.signal.aborted)setError(message(cause));}
  finally{if(operation.current===controller){operation.current=null;if(alive.current)setWorking("");}}
 }
 async function open(row:Extract<ArchivedMaterial,{binding:unknown}>,file:MaterialFile,action:"preview"|"download"){
  setError("");setSelected(null);
  try{
   const snapshot=current.current(),snapshotKey=contextKey(snapshot);
   const status=await inspectMaterial(row.binding,snapshot.draft,snapshot.project);
   if(status!==row.status)throw Error("MATERIAL_REVISION_CONFLICT");
   if(action==="preview")await verifyInteractivePreview(file);
   if(!alive.current||contextKey(current.current())!==snapshotKey||status!==row.status)throw Error("MATERIAL_REVISION_CONFLICT");
   if(action==="download")download(file);
   else setSelected({key:row.key,file:file.label,status,preview:isolatedPreview(file)});
  }catch(cause){if(alive.current){setError(message(cause));void refresh();}}
 }
 function files(row:Extract<ArchivedMaterial,{binding:unknown}>){
  return <div style={{minWidth:0,overflowWrap:"anywhere"}}>
   {materialFiles(row.binding).filter(f=>f.preview).map(f=><div key={f.name} style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBlock:"0.5rem"}}>
    <button type="button" className="secondary-action" onClick={()=>void open(row,f,"preview")}>Anteprima {f.label}</button>
    <button type="button" className="quiet-action" onClick={()=>void open(row,f,"download")}>Scarica {f.label}</button>
   </div>)}
   <details><summary>File e ricevute</summary>{materialFiles(row.binding).filter(f=>!f.preview).map(f=><div key={f.name}><button type="button" onClick={()=>void open(row,f,"download")}>Scarica {f.label}</button></div>)}<button type="button" onClick={()=>void open(row,{name:"associazione-materiale.json",label:"Associazione",body:JSON.stringify(row.binding),mime:"application/json"},"download")}>Esporta associazione completa</button></details>
   {selected?.key===row.key&&selected.status===row.status&&<div>
    <p>{selected.file} · {row.status==="CURRENT"?"Da revisionare":"Versione precedente"}</p>
    <button type="button" onClick={()=>setSelected(null)}>Chiudi anteprima</button>
    <iframe title={"Anteprima "+selected.file} srcDoc={selected.preview.html} sandbox={selected.preview.sandbox} referrerPolicy="no-referrer" style={{display:"block",width:"100%",height:640,border:0,marginBlock:12}}/>
   </div>}
  </div>;
 }
 const available=requests.filter(r=>r.available).length;
 const old=rows.filter(r=>r.status!=="CURRENT");
 if(historyOnly&&view.status!=="error"&&!old.length)return null;
 return <section className="visual-factory-step" aria-label="Materiali del percorso" style={{minWidth:0}}>
  <h2>{historyOnly?"Archivio dei materiali":"Materiali del percorso"}</h2>
  {!historyOnly&&context.draft&&<p>Tecnologia · Classe {context.draft.config.grade} · {context.draft.config.durationMinutes} minuti · Bozza didattica revisione {context.draft.revision}</p>}
  {!historyOnly&&<p>Prepara e conserva i materiali della bozza. La verifica tecnica non sostituisce la tua revisione.</p>}
  {!ready&&<p role={view.status==="error"?"alert":"status"}>{view.status==="error"?"Archivio non disponibile. Nessun materiale viene considerato verificato.":"Verifica dei materiali conservati…"}</p>}
  {ready&&!historyOnly&&<p role="status">{available} di {requests.length} materiali conservati e verificati</p>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!historyOnly&&requests.length===0&&<p>Nessuna richiesta corrente. Ricomponi la bozza se il percorso è cambiato.</p>}
  <div style={{display:"grid",gap:12}}>{requests.map(r=>{
   const matches=rows.filter((row):row is Extract<ArchivedMaterial,{binding:unknown}>=>row.status==="CURRENT"&&row.binding.resourceId===r.id);
   return <article key={r.id} aria-label={labels(r.kind)} style={{border:"1px solid currentColor",borderRadius:12,padding:12,minWidth:0,overflowWrap:"anywhere"}}>
    <h3>{labels(r.kind)}</h3><p>{r.blocked?"Bloccato":r.available?"Verificato · da revisionare":working===r.id?"Preparazione in corso…":"Da preparare"}</p>
    <p>{r.spec}</p><details><summary>Attività e alternativa accessibile</summary><p>{r.phases.join(", ")||"Non assegnato a una fase"}. {r.alternative}</p></details>
    {!r.blocked&&!r.available&&<button type="button" className="secondary-action" disabled={!ready||!!working} onClick={()=>void prepare(r.id)}>Prepara e conserva {labels(r.kind)}</button>}
    {matches.map(row=><div key={row.key}>{files(row)}</div>)}
   </article>;
  })}</div>
  {old.length>0&&<details><summary>Materiali precedenti o non validi ({old.length})</summary>{old.map(row=><article key={row.key} style={{marginBlock:12}}>{row.status==="INVALID"?<p>Materiale non valido. Nessuna anteprima o esportazione.</p>:<><h3>{labels(row.binding.kind)} · revisione {row.binding.draftRevision}</h3><p>Obsoleto: non appartiene alla bozza corrente.</p>{files(row)}</>}</article>)}</details>}
  {!historyOnly&&<p><strong>Revisione del docente:</strong> {ready&&requests.length>0&&available===requests.length?"Tutti i materiali richiesti sono disponibili. Esamina i contenuti prima di approvarli.":"Completa le richieste della bozza."} Nessuna pubblicazione automatica.</p>}
 </section>;
}
