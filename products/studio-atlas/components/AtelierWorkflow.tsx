"use client";

import Image from "next/image";
import type { STAGES } from "../lib/model";
type Stage = (typeof STAGES)[number];
type CreativeArea = { title:string; caption:string; image:string; alt:string; stage:Stage; action:string };

const areas: readonly CreativeArea[] = [
  {title:"Ambienti",caption:"Luoghi, oggetti e possibilità di esplorazione.",image:"ambienti",alt:"Sala espositiva di Museo Zero",stage:"Mondo",action:"Progetta gli ambienti"},
  {title:"Personaggi",caption:"Protagonisti, dialoghi e motivazioni.",image:"personaggi",alt:"Squadra dei protagonisti di Museo Zero",stage:"Storia",action:"Progetta i personaggi"},
  {title:"Interazioni",caption:"Azioni, scelte, esperimenti e conseguenze.",image:"interazioni",alt:"Sala di regia e strumenti di controllo di Museo Zero",stage:"Esperienza",action:"Progetta le interazioni"},
];
function ExampleImage({name,alt}:{name:string;alt:string}) {
  return <Image className="atelier-example-image" src={"/design/atelier/workflow/"+name+".webp"}
    alt={alt} width={640} height={360} unoptimized sizes="(max-width: 650px) 100vw, 360px"/>;
}
function Down() {
  return <span className="atelier-down" aria-hidden="true">↓</span>;
}
export function AtelierWorkflow({ onGoTo }: { onGoTo?: (stage:Stage)=>void }) {
  return <section className="atelier-workflow" aria-label="Atelier digitale del docente">
    <div className="atelier-intent">
      <p className="atelier-side-label">Lato docente</p>
      <h2>Studio Atlas — Atelier digitale</h2>
      <p>Ideazione e composizione creativa</p>
    </div>
    <Down/>
    <div className="atelier-areas">
      {areas.map(area=> <div className="atelier-area" key={area.stage}>
        {onGoTo ? <button type="button" className="atelier-area-action" aria-label={area.action} onClick={()=>onGoTo(area.stage)}>
          <ExampleImage name={area.image} alt={area.alt}/>
          <strong>{area.title}</strong>
          <span>{area.caption}</span>
        </button> : <>
          <ExampleImage name={area.image} alt={area.alt}/>
          <h3>{area.title}</h3><p>{area.caption}</p>
        </>}
      </div>)}
    </div>
    <Down/>
    <div className="atelier-compose">
      <h3>Composizione dell’esperienza</h3>
      <p>Produzione, collegamento e verifica dei contenuti</p>
      {onGoTo&&<div className="atelier-compose-actions">
        <button className="primary-action" type="button" onClick={()=>onGoTo("Scene")}>Componi le scene</button>
        <button className="quiet-action" type="button" onClick={()=>onGoTo("Produzione")}>Risorse e produzione</button>
      </div>}
    </div>
    <Down/>
    <div className="atelier-result">
      <ExampleImage name="esperienza" alt="Esempio della sala interattiva di Museo Zero"/>
      <p className="atelier-side-label">Lato studente</p>
      <h3>Esperienza educativa fruibile in Atlas</h3>
      <p>{onGoTo?"Verifica il prodotto nella fase di prova. L’anteprima effettiva richiede i controlli previsti.":"Dall’idea a un’esperienza da esplorare, sperimentare e comprendere."}</p>
      {onGoTo&&<button className="secondary-action" type="button" onClick={()=>onGoTo("Prova")}>Vai alla prova dell’esperienza</button>}
    </div>
    <p className="atelier-example-note">Immagini originali di Museo Zero, utilizzate come esempi di progettazione. Non rappresentano il risultato automatico del progetto corrente.{!onGoTo&&" Crea o riprendi un progetto per usare gli strumenti."}</p>
  </section>;
}
