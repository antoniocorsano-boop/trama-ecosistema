/** EC04a — bounded contextual source candidates; not approved teaching content. */
import type {ContentPack,Config,ResourceKind} from "./didactic-draft";
const AGRICULTURE_IDEA="Indaga perché due filari irrigati insieme mostrano condizioni diverse. Aiuta Sara e Luca a ricostruire il sistema agricolo e a verificare una soluzione senza sprechi.";
const agriculture: ContentPack = {id:'pack-agri',revision:'v1',topic:'Agricoltura',subjectRef:'TECNOLOGIA',grade:'seconda',sourceRef:'internal:ess-02-review',outcomes:[{id:'o1',text:'Riconoscere risorse e processi.'},{id:'o2',text:'Formulare una ipotesi.'}],steps:[{id:'s1',title:'Problema',minutes:10,content:'Due filari ricevono acqua per lo stesso tempo.',instruction:'Proponi ipotesi.',outcomeRefs:['o2'],resourceRefs:[]},{id:'s2',title:'Modello',minutes:15,content:'La rete distribuisce la risorsa.',instruction:'Individua ingresso e processo.',outcomeRefs:['o1'],resourceRefs:[]},{id:'s3',title:'Indagine',minutes:20,content:'Esempio sintetico: 200 mL e 50 mL.',instruction:'Confronta i volumi.',outcomeRefs:['o1','o2'],resourceRefs:['r1','r2']},{id:'s4',title:'Rielaborazione',minutes:10,content:'Una misura non basta a dimostrare la causa.',instruction:'Proponi un controllo.',outcomeRefs:['o2'],resourceRefs:[]},{id:'s5',title:'Verifica',minutes:5,content:'Trasferisci il ragionamento.',instruction:'Rispondi alla domanda.',outcomeRefs:['o1','o2'],resourceRefs:[]}],resources:[{id:'r1',kind:'STUDENT_SHEET',spec:'Tabella di misure.',accessibleAlternative:'Consegna testuale.'},{id:'r2',kind:'DIAGRAM',spec:'Riserva, rete, filari.',accessibleAlternative:'Sequenza testuale.'}],assessmentItems:[{id:'a1',kind:'OPEN_RESPONSE',outcomeRefs:['o1','o2'],instruction:'Che cosa controlli?',criterion:'Distingue risorsa e processo.',feedback:'Confronta le misure prima di concludere.'}]};
const energy:ContentPack={...structuredClone(agriculture),id:"pack-energy",topic:"Energia",grade:"terza",sourceRef:"internal:energy-v1",
 outcomes:[{id:"o1",text:"Distinguere ingresso e uscite energetiche."},{id:"o2",text:"Spiegare la conservazione dell’energia."}],
 steps:agriculture.steps.map((s,i)=>({...s,content:["Una lampada trasferisce energia come luce e calore.","L’energia non scompare durante la trasformazione.","Modello sintetico: 100 unità in ingresso, 25 luce e 75 calore.","La somma delle uscite uguaglia l’ingresso nel modello senza accumulo.","Trasferisci il bilancio a un altro esempio."][i],instruction:["Individua le forme in uscita.","Rappresenta ingresso e uscite.","Completa il bilancio.","Spiega la conservazione.","Rispondi al quesito finale."][i]})),
 resources:[{id:"r1",kind:"STUDENT_SHEET",spec:"Tabella ingresso e uscite.",accessibleAlternative:"Consegna testuale."},{id:"r2",kind:"DIAGRAM",spec:"Ingresso, luce, calore.",accessibleAlternative:"Sequenza testuale."}],
 assessmentItems:[{id:"a1",kind:"OPEN_RESPONSE",outcomeRefs:["o1","o2"],instruction:"Se entrano 100 unità e 30 sono luce, quante restano?",criterion:"70 unità nel modello senza accumulo.",feedback:"Esplicita tutte le uscite."}]};
const norm=(s:string)=>s.normalize("NFKC").trim().toLocaleLowerCase("it");
export const MATERIAL_CHOICES:ReadonlyArray<{id:ResourceKind;label:string}>=[{id:"STUDENT_SHEET",label:"Scheda di lavoro"},{id:"DIAGRAM",label:"Diagramma"}];
export function sourceForIdea(idea:string):ContentPack|undefined{
 const normalized=norm(idea);
 const source=normalized===norm(AGRICULTURE_IDEA)||normalized===norm(agriculture.topic)?agriculture:normalized===norm(energy.topic)?energy:undefined;
 return source?{...structuredClone(source),topic:idea.trim()}:undefined;
}
export function defaultDidacticConfig(idea:string):Config{
 const source=sourceForIdea(idea);
 return {subjectRef:"TECNOLOGIA",schoolOrder:"secondaria-primo-grado",grade:source?.grade??"seconda",durationMinutes:60,teachingMethodId:"INQUIRY",differentiationMode:"COMMON_WITH_SUPPORT",requestedResourceKinds:["STUDENT_SHEET","DIAGRAM"]};
}
