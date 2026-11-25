"use client";
import {useEffect,useRef,useState} from "react";
import {EducationDiagramEditor} from "./EducationDiagramEditor";
import {DIAGRAM_ROOT,DIAGRAM_STEM,DIAGRAM_VARIANTS,educationFiles,parseEducationReceipt,verifyEducationFile,type DiagramVariant} from "../lib/education-diagram";

export function EducationDiagramBank() {
  const [state,setState]=useState<"closed"|"checking"|"ready"|"error">("closed");
  const [variant,setVariant]=useState<DiagramVariant>("mobile-vertical");
  const [links,setLinks]=useState<Record<string,string>>({});
  const request=useRef<AbortController|null>(null);
  const urls=useRef<string[]>([]);
  useEffect(()=>()=>{request.current?.abort();urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];},[]);
  async function open() {
    if(request.current)return;
    const controller=new AbortController();
    request.current=controller;
    setState("checking");
    try {
      const options={cache:"no-store" as const,signal:controller.signal};
      const res=await fetch(DIAGRAM_ROOT+"education-receipt.json",options);
      if(!res.ok)throw Error("DIAGRAM_MISSING");
      const receiptBytes=await res.arrayBuffer();
      const receipt=parseEducationReceipt(JSON.parse(new TextDecoder().decode(receiptBytes)));
      const files=await Promise.all(educationFiles(receipt).map(async file=>{
        const response=await fetch(DIAGRAM_ROOT+file.name,options);
        if(!response.ok)throw Error("DIAGRAM_MISSING");
        const bytes=await response.arrayBuffer();
        await verifyEducationFile(bytes,file.sha256);
        return {name:file.name,bytes};
      }));
      if(controller.signal.aborted)return;
      files.push({name:"education-receipt.json",bytes:receiptBytes});
      const next:Record<string,string>={};
      for(const file of files){
        const type=file.name.endsWith(".svg")?"image/svg+xml":file.name.endsWith(".html")?"text/html":file.name.endsWith(".json")?"application/json":"text/markdown";
        const url=URL.createObjectURL(new Blob([file.bytes],{type}));
        urls.current.push(url);next[file.name]=url;
      }
      setLinks(next);setState("ready");
    }catch{
      urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];
      if(!controller.signal.aborted)setState("error");
    }finally{if(request.current===controller)request.current=null;}
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
        <img src={links[stem+".svg"]} alt="Dal campo alla tavola: coltivazione, raccolta, distribuzione e consumo." style={{display:"block",width:"100%",maxWidth:variant==="mobile-vertical"?360:1280,height:"auto",margin:"auto"}} />
        <figcaption>Filiera orticola locale, esempio semplificato.</figcaption>
      </figure>
      <p>Sequenza testuale: Coltivazione (acqua, suolo, energia); Raccolta (ortaggi maturi); Distribuzione (vendita locale); Consumo (acquisto e uso).</p>
      <ul>
        <li><a href={links[stem+".html"]} download={stem+".html"}>Scarica HTML della composizione</a></li>
        <li><a href={links[stem+".svg"]} download={stem+".svg"}>Scarica SVG della composizione</a></li>
        <li><a href={links["education-pilot-source.json"]} download={"education-pilot-source.json"}>Scarica fonte JSON</a></li>
        <li><a href={links["guida-docente.md"]} download={"guida-docente.md"}>Scarica guida docente</a></li>
        <li><a href={links["education-receipt.json"]} download={"education-receipt.json"}>Scarica ricevuta di produzione</a></li>
      </ul>
      <small>Il campione viene preparato con l’applicazione.</small>
    </>}
    <EducationDiagramEditor />
  </section>;
}
