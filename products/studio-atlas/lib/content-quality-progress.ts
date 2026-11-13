// Read-only coordination of existing authoring/production/publication gates.
// This module does not authenticate reviewers or grant publication or execution.
export type QualityCandidate = Readonly<{activityId:string;version:string;manifestDigest:string}>;
export type CheckId = "PURPOSE"|"STORY"|"SCIENCE"|"WRITING"|"VISUAL"|"VOICE_TECH"|"VOICE_LISTEN"|"ASSET_INTEGRITY"|"BROWSER_SMOKE"|"INTEGRITY"|"ACCESSIBILITY"|"SECURITY_PRIVACY"|"RIGHTS"|"USE"|"CURRICOLO"|"PUBLICATION";
type ReviewMode = "HUMAN"|"TECHNICAL"|"AUTHORITY";
type Decision = "PASS"|"REWORK"|"PENDING";
export type QualityEvidence = Readonly<QualityCandidate & {check:CheckId;mode:ReviewMode;decision:Decision;reference:string}>;
export type QualityPlan = Readonly<QualityCandidate & {narrative:boolean;visual:boolean;voice:"REQUIRED"|"NOT_PLANNED"}>;
export type QualityCheck = Readonly<{id:CheckId;label:string;mode:ReviewMode;action:string}>;
const checks:Record<CheckId,QualityCheck>={
 PURPOSE:{id:"PURPOSE",label:"Tema, destinatari e obiettivi",mode:"HUMAN",action:"Verifica che tema, scopo e prima azione siano comprensibili."},
 STORY:{id:"STORY",label:"Trama e continuità",mode:"HUMAN",action:"Rivedi il prologo, la progressione e la motivazione delle azioni."},
 SCIENCE:{id:"SCIENCE",label:"Correttezza dei contenuti",mode:"HUMAN",action:"Controlla concetti, esempi, fonti e conseguenze delle scelte."},
 WRITING:{id:"WRITING",label:"Revisione linguistica",mode:"HUMAN",action:"Leggi integralmente testo, istruzioni, sottotitoli e guida; correggi ogni errore rilevato."},
 VISUAL:{id:"VISUAL",label:"Qualità e coerenza delle immagini",mode:"HUMAN",action:"Controlla identità, continuità, leggibilità e pertinenza delle immagini."},
 VOICE_TECH:{id:"VOICE_TECH",label:"Tracce audio e controlli tecnici",mode:"TECHNICAL",action:"Verifica le registrazioni, il copione, la durata, i livelli, i tagli e le impronte."},
 VOICE_LISTEN:{id:"VOICE_LISTEN",label:"Ascolto e pronuncia",mode:"HUMAN",action:"Ascolta ogni traccia e il montaggio finale; verifica pronuncia, accenti, pause e fedeltà al copione."},
 ASSET_INTEGRITY:{id:"ASSET_INTEGRITY",label:"Corrispondenza delle risorse",mode:"TECHNICAL",action:"Verifica le impronte delle risorse della versione esatta."},
 BROWSER_SMOKE:{id:"BROWSER_SMOKE",label:"Prove locali di navigazione",mode:"TECHNICAL",action:"Verifica il percorso e le alternative nei browser di prova."},
 INTEGRITY:{id:"INTEGRITY",label:"Integrità e prove del prodotto",mode:"TECHNICAL",action:"Verifica il pacchetto esatto, le interazioni e i controlli automatici sul prodotto finale."},
 ACCESSIBILITY:{id:"ACCESSIBILITY",label:"Accessibilità e leggibilità",mode:"HUMAN",action:"Verifica equivalenti testuali, tastiera, contrasto e dispositivi previsti, con evidenze tecniche."},
 SECURITY_PRIVACY:{id:"SECURITY_PRIVACY",label:"Sicurezza e riservatezza",mode:"AUTHORITY",action:"Ottieni la verifica del runtime, dei flussi di dati e dell'assenza di identità studente."},
 RIGHTS:{id:"RIGHTS",label:"Diritti e licenze",mode:"AUTHORITY",action:"Verifica diritti di testi, immagini, audio e altri materiali."},
 USE:{id:"USE",label:"Prova finale dell'esperienza",mode:"HUMAN",action:"Prova l'intero prodotto con la guida, nelle modalità previste."},
 CURRICOLO:{id:"CURRICOLO",label:"Riferimenti curricolari Arena",mode:"AUTHORITY",action:"Collega gli obiettivi approvati senza inventare riferimenti."},
 PUBLICATION:{id:"PUBLICATION",label:"Decisione di pubblicazione Atlas",mode:"AUTHORITY",action:"Richiedi la decisione esplicita attraverso il processo di pubblicazione esistente."}
};
const same=(a:QualityCandidate,b:QualityCandidate)=>a.activityId===b.activityId&&a.version===b.version&&a.manifestDigest===b.manifestDigest;
const sha=(x:string)=>/^[a-f0-9]{64}$/.test(x);
// Evidence must be resolved by a governed caller; imported manifests are never evidence.
// Ambiguous, stale, malformed or wrong-role records fail closed.
export function evaluateContentQuality(candidate:QualityCandidate,plan:QualityPlan|undefined,governedEvidence:readonly QualityEvidence[]){
 const bound=!!plan&&same(candidate,plan)&&sha(candidate.manifestDigest);
 const groups:Array<{title:string;ids:CheckId[]}>= [
  {title:"Progetta",ids:["PURPOSE",...(!bound||plan!.narrative?["STORY" as const]:[]),"SCIENCE","WRITING"]},
  {title:"Produci",ids:[...(!bound||plan!.visual?["VISUAL" as const]:[]),...(!bound||plan!.voice==="REQUIRED"?["VOICE_TECH" as const,"VOICE_LISTEN" as const]:[])]},
  {title:"Verifica",ids:["ASSET_INTEGRITY","BROWSER_SMOKE","INTEGRITY","ACCESSIBILITY","SECURITY_PRIVACY","RIGHTS","USE"]},
  {title:"Prepara la pubblicazione",ids:["CURRICOLO","PUBLICATION"]}
 ];
 const steps=groups.filter(g=>g.ids.length).map(g=>{
  const items=g.ids.map(id=>{
   const c=checks[id],records=bound?governedEvidence.filter(e=>same(e,candidate)&&e.check===id):[];
   const e=records.length===1?records[0]:undefined;
   const valid=e&&e.mode===c.mode&&typeof e.reference==="string"&&!!e.reference.trim()&&["PASS","REWORK","PENDING"].includes(e.decision);
   return {...c,decision:(valid?e!.decision:"PENDING") as Decision,reference:valid?e!.reference:undefined};
  });
  return {title:g.title,items,decision:(items.some(i=>i.decision==="REWORK")?"REWORK":items.every(i=>i.decision==="PASS")?"PASS":"PENDING") as Decision};
 });
 const next=steps.flatMap(s=>s.items).find(i=>i.decision!=="PASS");
 return {planBound:bound,steps,next,complete:bound&&!next,publicationAuthorized:false as const};
}
// The only current curated plan is the exact V7 draft; no reviewer receipts yet.
// Imported JSON, localStorage and gallery markers cannot grant PASS.
const V7:QualityPlan={activityId:"trama-missione-118-2026",version:"0.3.0-draft",manifestDigest:"407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395",narrative:true,visual:true,voice:"REQUIRED"};
export function activityQualityProgress(candidate:QualityCandidate,technicalEvidence:readonly QualityEvidence[]=[]){
 return evaluateContentQuality(candidate,same(candidate,V7)?V7:undefined,technicalEvidence.filter(e=>e.mode==="TECHNICAL"&&(e.check==="ASSET_INTEGRITY"||e.check==="BROWSER_SMOKE")));
}
