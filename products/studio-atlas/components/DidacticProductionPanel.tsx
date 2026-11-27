"use client";
import {useEffect,useState} from "react";
import {DidacticMaterialWorkflow} from "./DidacticMaterialWorkflow";
import type {MaterialContext} from "../lib/didactic-material-archive";
import {EducationDiagramBank} from "./EducationDiagramBank";
import {SimulationLabBank} from "./SimulationLabBank";
import {readDidacticDraft} from "../lib/didactic-draft-local";
import {sourceForIdea,MATERIAL_CHOICES} from "../lib/didactic-content-candidates";
import {planDidacticProduction,type ProductionPlan} from "../lib/didactic-production";
import {getProject} from "../lib/store";
import type {PathwayProject} from "../lib/model";

const messages={MISSING:"Nessuna bozza didattica salvata. I banchi rimangono disponibili in modalità autonoma.",INVALID:"Bozza non valida: nessuna richiesta trasferita.",STALE:"Bozza o percorso obsoleto: ricomponi la bozza prima di trasferire richieste.",UNSUPPORTED:"Fonte contestuale non più pertinente: nessuna richiesta trasferita."};
export function DidacticProductionPanel({project,openStandaloneBanks=false}:{project:PathwayProject;openStandaloneBanks?:boolean}){
 const [materialContext,setMaterialContext]=useState<MaterialContext|null>(null);
 function getMaterialContext():MaterialContext{
  const latest=getProject(project.projectId);if(!latest||latest.revision!==project.revision||latest.idea!==project.idea)throw Error("MATERIAL_PROJECT_CONFLICT");
  const scope={projectId:latest.projectId,revision:latest.revision,idea:latest.idea};
  try{return {project:scope,draft:readDidacticDraft(localStorage,latest.projectId)};}catch{return {project:scope,draft:null};}
 }
 const [plan,setPlan]=useState<ProductionPlan|null>(null);
 function current():ProductionPlan{
  try{
   const latest=getProject(project.projectId);
   if(!latest||latest.revision!==project.revision)return {status:"STALE",requests:[]};
   const draft=readDidacticDraft(localStorage,project.projectId);
   const source=draft?sourceForIdea(latest.idea,draft.config.durationMinutes,draft.config.differentiationMode):undefined;
   return planDidacticProduction(draft,latest,source);
  }catch{return {status:"INVALID",requests:[]};}
 }
 useEffect(()=>{
  const refresh=()=>{setPlan(current());try{setMaterialContext(getMaterialContext());}catch{setMaterialContext(null);}};
  refresh();window.addEventListener("storage",refresh);window.addEventListener("focus",refresh);
  return ()=>{window.removeEventListener("storage",refresh);window.removeEventListener("focus",refresh);};
 },[project.projectId,project.revision,project.idea]);
 function confirmed():ProductionPlan|undefined{
  const fresh=current();setPlan(fresh);
  if(fresh.status==="READY"&&plan?.status==="READY"&&JSON.stringify(fresh)===JSON.stringify(plan))return fresh;
  return undefined;
 }
 const gear=materialContext&&sourceForIdea(materialContext.project.idea)?.id==="pack-gear";
 if(gear&&materialContext)return <>
  <DidacticMaterialWorkflow context={materialContext} getCurrent={getMaterialContext}/>
  <details open={openStandaloneBanks || undefined}><summary>Strumenti di produzione avanzati</summary><EducationDiagramBank didacticSeed={plan?.diagram} getDidacticSeed={()=>confirmed()?.diagram}/><SimulationLabBank didacticGearRequested={!!plan?.requests.some(r=>r.target==="GEAR")} confirmDidacticGear={()=>!!confirmed()?.requests.some(r=>r.target==="GEAR")}/></details>
 </>;
 return <>
  <section className="visual-factory-step" aria-label="Materiali della bozza didattica">
   <h2>Materiali della bozza didattica</h2>
   <p>Richieste del docente, non materiali già prodotti o approvati. Nessuna associazione o pubblicazione automatica.</p>
   {!plan?<p>Verifica della bozza locale…</p>:plan.status!=="READY"?<p>{messages[plan.status]}</p>:<>
    <p>Bozza didattica · revisione {plan.draftRevision}</p>
    {!plan.requests.length?<p>Nessun materiale richiesto.</p>:<ul>{plan.requests.map(r=><li key={r.id}>
     <strong>{MATERIAL_CHOICES.find(k=>k.id===r.kind)?.label??r.kind}</strong>: {r.spec}
     <p>Fasi: {r.phases.join(", ")||"Non assegnato a una fase"}. Alternativa: {r.alternative}</p>
     {r.blocked?<p>Richiesta bloccata.</p>:r.target==="DIAGRAM"?<a href="#didactic-diagram-bank">Apri editor diagrammi</a>:r.target==="GEAR"?<a href="#didactic-simulation-bank">Apri banco simulatori</a>:<p>Preparazione manuale: nessun generatore collegato.</p>}
    </li>)}</ul>}
   </>}
  </section>
  {materialContext&&<DidacticMaterialWorkflow context={materialContext} getCurrent={getMaterialContext} historyOnly/>}
  <div id="didactic-diagram-bank"><EducationDiagramBank didacticSeed={plan?.diagram} getDidacticSeed={()=>confirmed()?.diagram}/></div>
  <div id="didactic-simulation-bank"><SimulationLabBank didacticGearRequested={!!plan?.requests.some(r=>r.target==="GEAR")} confirmDidacticGear={()=>!!confirmed()?.requests.some(r=>r.target==="GEAR")}/></div>
 </>;
}
