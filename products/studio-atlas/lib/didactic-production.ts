import type {GearTransmission} from "./education-diagram";
import gearTeachingProfile from "./gear-teaching-profile.json";
import {validateDidacticDraft,type ContentPack,type Draft} from "./didactic-draft";
export type DiagramSeed={title:string;description:string;nodes:{id:string;label:string;detail:string}[];edges:[string,string][];activity:{question:string;criterion:string};transmission?:GearTransmission};
const diagrams:Record<string,DiagramSeed>={
 "pack-agri":{title:"Rete di irrigazione",description:"Modello della distribuzione dell’acqua: osserva le differenze tra due filari.",nodes:[{id:"n1",label:"Riserva",detail:"Acqua disponibile"},{id:"n2",label:"Rete",detail:"Distribuzione"},{id:"n3",label:"Filare A",detail:"200 mL di esempio"},{id:"n4",label:"Filare B",detail:"50 mL di esempio"}],edges:[["n1","n2"],["n2","n3"],["n2","n4"]],activity:{question:"Quale controllo proponi per spiegare la differenza?",criterion:"Distingue misura, ipotesi e controllo."}},
 "pack-energy":{title:"Bilancio energetico",description:"Modello ideale senza accumulo: ingresso di 100 unità, uscite di 25 e 75 unità.",nodes:[{id:"n1",label:"Ingresso",detail:"100 unità"},{id:"n2",label:"Lampada",detail:"Trasformazione"},{id:"n3",label:"Luce",detail:"25 unità"},{id:"n4",label:"Calore",detail:"75 unità"}],edges:[["n1","n2"],["n2","n3"],["n2","n4"]],activity:{question:"Come si verifica il bilancio?",criterion:"Somma le uscite e le confronta con l’ingresso."}},
 "pack-gear":{title:"Coppia di ingranaggi",description:"Due ruote esterne in presa: versi opposti, velocità della condotta pari alla metà della motrice.",nodes:[{id:"n1",label:"Motrice",detail:gearTeachingProfile.driverTeeth+" denti"},{id:"n2",label:"Condotta",detail:gearTeachingProfile.drivenTeeth+" denti"}],edges:[["n1","n2"]],activity:{question:"Che cosa accade scambiando le due ruote?",criterion:"Spiega l’inversione del rapporto e i versi opposti."},transmission:{kind:"external-gear-pair",...gearTeachingProfile}},
};
export type ProductionPlan={status:"MISSING"|"INVALID"|"STALE"|"UNSUPPORTED"|"READY";draftId?:string;draftRevision?:number;requests:{id:string;kind:Draft["resources"][number]["kind"];spec:string;alternative:string;phases:string[];target:"MANUAL"|"DIAGRAM"|"GEAR";blocked:boolean}[];diagram?:DiagramSeed};
export function planDidacticProduction(input:unknown,project:{projectId:string;revision:number;idea:string},source?:ContentPack):ProductionPlan{
 const empty=(status:ProductionPlan["status"]):ProductionPlan=>({status,requests:[]});
 if(input===null)return empty("MISSING");
 if(validateDidacticDraft(input).length)return empty("INVALID");
 const d=input as Draft;
 if(d.projectId!==project.projectId||d.sourceProjectRevision!==project.revision)return empty("STALE");
 if(!d.steps.length||!source||source.topic.trim()!==project.idea.trim()||source.subjectRef!==d.config.subjectRef||source.grade!==d.config.grade||d.sources.length!==1)return empty("UNSUPPORTED");
 const ref=d.sources[0];
 if(ref.id!==source.id||ref.ref!==source.sourceRef||ref.revision!==source.revision)return empty("UNSUPPORTED");
 if(d.resources.some(r=>!source.resources.some(s=>s.id===r.id&&s.kind===r.kind&&s.spec===r.spec&&s.accessibleAlternative===r.accessibleAlternative)))return empty("INVALID");
 const requests:ProductionPlan["requests"]=d.resources.map(r=>({id:r.id,kind:r.kind,spec:r.spec,alternative:r.accessibleAlternative,phases:d.steps.filter(s=>s.resourceRefs.includes(r.id)).map(s=>s.title),blocked:r.status==="BLOCKED",target:r.status!=="REQUESTED"?"MANUAL":r.kind==="DIAGRAM"&&Object.hasOwn(diagrams,source.id)?"DIAGRAM":r.kind==="SIMULATION"&&source.id==="pack-gear"&&source.sourceRef==="internal:vf-simulation-gear-model"?"GEAR":"MANUAL"}));
 return {status:"READY",draftId:d.draftId,draftRevision:d.revision,requests,...(requests.some(r=>r.target==="DIAGRAM")?{diagram:structuredClone(diagrams[source.id])}:{})};
}
