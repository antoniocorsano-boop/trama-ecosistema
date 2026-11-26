import type {ContentPack} from "./didactic-draft";

// Closed teaching candidates, not an approved source or a production receipt.
export const DURATION_CHOICES = [45,60,90] as const;
export const SUPPORT_CHOICES = [
 {id:"COMMON_WITH_SUPPORT",label:"Percorso comune con supporti"},
 {id:"COMMON",label:"Percorso comune"},
] as const;
export const GEAR_CANDIDATE:ContentPack={
 id:"pack-gear",revision:"v1",topic:"Ingranaggi",subjectRef:"TECNOLOGIA",grade:"seconda",sourceRef:"internal:vf-simulation-gear-model",
 outcomes:[{id:"o1",text:"Prevedere il verso di rotazione di due ruote dentate esterne."},{id:"o2",text:"Confrontare le velocità in base al numero di denti."}],
 steps:[
  {id:"s1",title:"Problema",minutes:10,content:"Due ruote dentate esterne sono in presa. Una ruota motrice ha 24 denti, la condotta ne ha 48.",instruction:"Prevedi verso e velocità relativa della condotta.",outcomeRefs:["o1","o2"],resourceRefs:[]},
  {id:"s2",title:"Modello",minutes:15,content:"Nel modello ideale, le ruote esterne in presa ruotano in versi opposti. Il rapporto tra velocità della condotta e della motrice in valore assoluto è 24/48 = 1/2.",instruction:"Rappresenta le frecce e il rapporto.",outcomeRefs:["o1","o2"],resourceRefs:["r2"]},
  {id:"s3",title:"Indagine",minutes:20,content:"Confronta 24/48 e 48/24 mantenendo fissa la velocità della motrice. Sono esempi didattici del modello ideale.",instruction:"Compila una tabella con denti, verso e rapporto; confronta le previsioni con il modello.",outcomeRefs:["o1","o2"],resourceRefs:["r1","r3"]},
  {id:"s4",title:"Rielaborazione",minutes:10,content:"Scambiando motrice e condotta, il rapporto di velocità si inverte; il verso relativo resta opposto.",instruction:"Spiega la differenza tra verso e velocità.",outcomeRefs:["o1","o2"],resourceRefs:[]},
  {id:"s5",title:"Verifica",minutes:5,content:"Applica il modello a due ruote con lo stesso numero di denti.",instruction:"Giustifica la previsione senza ricorrere al simulatore.",outcomeRefs:["o1","o2"],resourceRefs:[]},
 ],
 resources:[{id:"r1",kind:"STUDENT_SHEET",spec:"Tabella denti, verso e rapporto.",accessibleAlternative:"Tabella testuale."},{id:"r2",kind:"DIAGRAM",spec:"Due ruote con frecce e indicazione dei denti.",accessibleAlternative:"Descrizione dei versi e del rapporto."},{id:"r3",kind:"SIMULATION",spec:"Richiesta di raccordo al laboratorio ingranaggi già presente nel banco Produzione; nessun asset associato automaticamente.",accessibleAlternative:"Tabella delle previsioni per 24/48 e 48/24."}],
 assessmentItems:[{id:"a1",kind:"OPEN_RESPONSE",outcomeRefs:["o1","o2"],instruction:"Due ruote esterne hanno 48 denti ciascuna. Prevedi verso e velocità relativa.",criterion:"Versi opposti e uguale velocità in valore assoluto nel modello ideale.",feedback:"Distingui il segno del rapporto dal suo valore assoluto."}],
};
const TASKS:Record<string,{short:string;extended:string;support:string}>={
 "pack-agri":{short:"Confronta 200 e 50 mL, individua una differenza e indica un solo controllo.",extended:"Progetta due misure ripetute per filare: indica variabile controllata, tabella e criterio per confrontare i risultati. Distingui previsione e dato osservato.",support:"Usa tre colonne: misura, differenza, ipotesi. Formula la frase: osservo…, ipotizzo…, verificherei…"},
 "pack-energy":{short:"Completa il bilancio di 100 unità e spiega perché luce e calore vanno sommati.",extended:"Confronta due bilanci ideali da 100 unità: 25 luce e 75 calore, poi 30 luce e 70 calore. Disegna i flussi e discuti quali ipotesi rendono valido il bilancio.",support:"Completa la tabella ingresso, luce, calore; scrivi ingresso = somma delle uscite nel modello senza accumulo."},
 "pack-gear":{short:"Confronta 24/48 e 48/24 con una tabella di due righe; indica i versi.",extended:"Aggiungi il caso 48/48, confronta le tre previsioni e giustifica il rapporto inverso. Se disponibile, verifica con il laboratorio già qualificato; altrimenti usa la tabella.",support:"Per ogni coppia annota denti della motrice, denti della condotta, rapporto e frecce opposte."},
};
const TIMES:Record<number,readonly number[]>={45:[8,10,15,7,5],60:[10,15,20,10,5],90:[15,20,30,15,10]};
export function adaptContentCandidate(base:ContentPack,duration:number,support:string):ContentPack|undefined{
 const times=TIMES[duration],tasks=TASKS[base.id];
 if(!DURATION_CHOICES.some(x=>x===duration)||!SUPPORT_CHOICES.some(x=>x.id===support)||!times||!tasks||base.steps.length!==times.length)return undefined;
 const result=structuredClone(base);
 // The original reference remains contextual; adaptations are distinct candidates.
 result.revision=base.revision+"-d"+duration+(support==="COMMON_WITH_SUPPORT"?"-support":"-common");
 result.steps=result.steps.map((step,i)=>{
  const task=i===2?(duration===45?tasks.short:duration===90?tasks.extended:step.instruction):step.instruction;
  return {...step,minutes:times[i],instruction:i===2&&support==="COMMON_WITH_SUPPORT"?task+" Supporto: "+tasks.support:task};
 });
 return result;
}
