"use client";
import {useEffect,useId,useRef,useState} from "react";
import {LABS,loadLabPackage,type LabId} from "../lib/simulation-lab-package";

type Verified={htmlUrl:string;receiptUrl:string;objective:string;question:string};
export function SimulationLabBank({didacticGearRequested=false,confirmDidacticGear}:{didacticGearRequested?:boolean;confirmDidacticGear?:()=>boolean}={}){
 const [id,setId]=useState<LabId>("gear");
 const labSelectId=useId();
 return <section className="visual-factory-step" aria-label="Banco simulatori">
  <p className="eyebrow">Visual Factory · simulazioni deterministiche</p>
  <h2>Simulatori didattici</h2>
  <p>Scegli un laboratorio prodotto dal generatore comune. Provalo e scaricalo per la revisione docente: nessuna associazione automatica al percorso, nessuna pubblicazione agli studenti.</p>
  {didacticGearRequested&&<p>Richiesta dalla bozza: laboratorio delle trasmissioni. <button type="button" onClick={()=>{if(confirmDidacticGear?.())setId("gear");}}>Seleziona laboratorio richiesto</button></p>}
  <div><label htmlFor={labSelectId}>Laboratorio</label> <select id={labSelectId} value={id} onChange={e=>{const lab=LABS.find(x=>x.id===e.target.value);if(lab)setId(lab.id);}}>
   {LABS.map(lab=><option key={lab.id} value={lab.id}>{lab.title}</option>)}
  </select></div>
  <LabCandidate key={id} id={id}/>
 </section>;
}
function LabCandidate({id}:{id:LabId}){
 const [state,setState]=useState<"closed"|"checking"|"ready"|"error">("closed");
 const [candidate,setCandidate]=useState<Verified|null>(null);
 const [preview,setPreview]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const urls=useRef<string[]>([]);
 useEffect(()=>()=>{controller.current?.abort();for(const url of urls.current)URL.revokeObjectURL(url);urls.current=[];},[]);
 async function open(){
  if(controller.current)return;
  const c=new AbortController();controller.current=c;setState("checking");
  try{
   const verified=await loadLabPackage(id,c.signal);
   if(c.signal.aborted)return;
   const htmlUrl=URL.createObjectURL(new Blob([verified.bytes],{type:"text/html;charset=utf-8"}));
   urls.current.push(htmlUrl);
   const receiptUrl=URL.createObjectURL(new Blob([JSON.stringify(verified.receipt,null,2)],{type:"application/json"}));
   urls.current.push(receiptUrl);
   setCandidate({htmlUrl,receiptUrl,objective:verified.receipt.objective,question:verified.receipt.question});setState("ready");
  }catch{
   for(const url of urls.current)URL.revokeObjectURL(url);urls.current=[];
   if(!c.signal.aborted){setCandidate(null);setPreview(false);setState("error");}
  }finally{if(controller.current===c)controller.current=null;}
 }
 const stem="vf-simulation-"+id;
 return <>
  {state!=="ready"&&<button type="button" className="secondary-action" disabled={state==="checking"} onClick={()=>void open()}>{state==="checking"?"Verifica in corso…":"Verifica laboratorio"}</button>}
  {state==="error"&&<p role="alert">Laboratorio non disponibile o non integro. Nessuna anteprima o scaricamento autorizzato.</p>}
  {state==="ready"&&candidate&&<>
   <p role="status">Integrità verificata. Candidato da revisionare.</p>
   <p><strong>Obiettivo:</strong> {candidate.objective}</p><p><strong>Domanda operativa:</strong> {candidate.question}</p>
   <button type="button" className="secondary-action" onClick={()=>setPreview(v=>!v)}>{preview?"Chiudi anteprima":"Apri anteprima interattiva"}</button>
   {preview&&<iframe title="Anteprima isolata del simulatore" src={candidate.htmlUrl} sandbox="allow-scripts" referrerPolicy="no-referrer" style={{display:"block",width:"100%",height:700,border:0,marginTop:12}}/>}
   <ul><li><a href={candidate.htmlUrl} download={stem+".html"}>Scarica simulatore HTML</a></li><li><a href={candidate.receiptUrl} download={stem+"-receipt.json"}>Scarica manifesto di produzione</a></li></ul>
   <small>Il documento HTML funziona autonomamente. La verifica del pacchetto non costituisce approvazione didattica o pubblicazione.</small>
  </>}
 </>;
}
