"use client";
import {useState} from "react";
import {DIAGRAM_ROOT,DIAGRAM_STEM,DIAGRAM_VARIANTS,educationFiles,parseEducationReceipt,verifyEducationFile,type DiagramVariant} from "../lib/education-diagram";

export function EducationDiagramBank() {
  const [state,setState]=useState<"closed"|"checking"|"ready"|"error">("closed");
  const [variant,setVariant]=useState<DiagramVariant>("mobile-vertical");
  async function open() {
    setState("checking");
    try {
      const res=await fetch(DIAGRAM_ROOT+"education-receipt.json",{cache:"no-store"});
      if(!res.ok)throw Error("DIAGRAM_MISSING");
      const receipt=parseEducationReceipt(await res.json());
      await Promise.all(educationFiles(receipt).map(async file=>{
        const response=await fetch(DIAGRAM_ROOT+file.name,{cache:"no-store"});
        if(!response.ok)throw Error("DIAGRAM_MISSING");
        await verifyEducationFile(await response.arrayBuffer(),file.sha256);
      }));
      setState("ready");
    }catch{setState("error");}
  }
  const stem=DIAGRAM_STEM+"-"+variant;
  return <section className="visual-factory-step" aria-label="Banco diagrammi">
    <p className="eyebrow">Visual Factory · diagrammi statici</p>
    <h2>Diagrammi e infografiche</h2>
    <p>Apri il materiale campione «Dal campo alla tavola», prodotto dal generatore qualificato di Studio Atlas. È un esempio didattico indipendente dal percorso aperto: nessuna associazione o approvazione automatica.</p>
    <p>Da revisionare dal docente. Nessuna pubblicazione agli studenti.</p>
    {state!=="ready" && <button type="button" className="secondary-action" disabled={state==="checking"} onClick={()=>void open()}>{state==="checking"?"Verifica del pacchetto…":"Apri materiale didattico"}</button>}
    {state==="error" && <p role="alert">Pacchetto non disponibile o non integro. Riprepara Studio Atlas con il generatore esistente.</p>}
    {state==="ready" && <>
      <p role="status">Integrità del pacchetto verificata. Proposta da revisionare.</p>
      <label>Composizione <select value={variant} onChange={event=>setVariant(DIAGRAM_VARIANTS.find(v=>v===event.target.value)??"mobile-vertical")}>
        <option value="mobile-vertical">Smartphone · verticale</option>
        <option value="desktop-lim-horizontal">Desktop e LIM · orizzontale</option>
      </select></label>
      <figure style={{margin:"1rem 0"}}>
        <img src={DIAGRAM_ROOT+stem+".svg"} alt="Dal campo alla tavola: coltivazione, raccolta, distribuzione e consumo." style={{display:"block",width:"100%",maxWidth:variant==="mobile-vertical"?360:1280,height:"auto",margin:"auto"}} />
        <figcaption>Filiera orticola locale, esempio semplificato.</figcaption>
      </figure>
      <p>Sequenza testuale: Coltivazione (acqua, suolo, energia); Raccolta (ortaggi maturi); Distribuzione (vendita locale); Consumo (acquisto e uso).</p>
      <ul>
        <li><a href={DIAGRAM_ROOT+stem+".html"} download>Scarica HTML della composizione</a></li>
        <li><a href={DIAGRAM_ROOT+stem+".svg"} download>Scarica SVG della composizione</a></li>
        <li><a href={DIAGRAM_ROOT+"education-pilot-source.json"} download>Scarica fonte JSON</a></li>
        <li><a href={DIAGRAM_ROOT+"guida-docente.md"} download>Scarica guida docente</a></li>
        <li><a href={DIAGRAM_ROOT+"education-receipt.json"} download>Scarica ricevuta di produzione</a></li>
      </ul>
      <small>Il generatore viene eseguito durante la preparazione dell’applicazione. La modifica e rigenerazione della fonte dal banco non sono ancora disponibili.</small>
    </>}
  </section>;
}
