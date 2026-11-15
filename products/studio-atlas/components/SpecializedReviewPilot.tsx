"use client";
import {useState} from "react";
import {atlasPreviewOrigin,openSpecializedReviewPreview} from "../lib/preview-bridge";
import pkg from "../lib/fixtures/axf-energy-package.v0.2.json";
export function SpecializedReviewPilot(){
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 if(process.env.NEXT_PUBLIC_AXF_REVIEW_ONLY!=="true")return null;
 async function open(){
  if(!confirmed||busy)return;
  setBusy(true);setNotice("");
  try{
   const result=await openSpecializedReviewPreview(pkg);
   setNotice(result.status==="OPENED"?"Anteprima interattiva aperta. Nessuna pubblicazione.":result.status==="POPUP_BLOCKED"?"Consenti l’apertura della finestra.":"Anteprima non disponibile.");
  }catch{setNotice("Pacchetto non valido. Anteprima bloccata.");}
  finally{setBusy(false);setConfirmed(false);}
 }
 return <section className="project-list" aria-label="Collaudo mondi interattivi">
  <h2>Atelier dell’Energia</h2><p>La luce che serve · Candidato sperimentale di revisione. Tre lampade virtuali, confronto e trasferimento.</p>
  <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/> Apri soltanto per revisione professionale; nessuna autorizzazione agli studenti.</label>
  <button className="primary-action" disabled={!confirmed||busy||!atlasPreviewOrigin()} onClick={()=>void open()}>Vedi come studente — laboratorio</button>
  <p role="status">{busy?"Apertura dell’anteprima…":notice}</p>
 </section>;
}
