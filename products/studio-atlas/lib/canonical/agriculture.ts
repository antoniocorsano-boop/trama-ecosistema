import type { PathwayProject, PathwayScene, SceneStage, SceneIllustration } from "../model";
import { makeSceneIllustration } from "../scene-media";

export const AGRICULTURE_PROJECT_ID = "ess-02-dal-campo-al-raccolto";
export const AGRICULTURE_GUIDE = "/design/ess-02/fascicolo.html";
const artwork = [
 {sceneId:"AG1",file:"orto-apertura.svg",alt:"Sara e Luca accanto a un orto: a sinistra piante verdi, a destra piante appassite. Sullo sfondo il serbatoio."},
 {sceneId:"AG2",file:"orto-indagine.svg",alt:"Vista dell'orto dall'alto: serbatoio, tubazione, due recipienti di misura, terreno e filari con vegetazione diversa."},
 {sceneId:"AG3",file:"banco-misure.svg",alt:"Sara e Luca al banco di lavoro con due recipienti graduati e un quaderno; a sinistra acqua a monte, a destra acqua a valle."},
 {sceneId:"AG4",file:"sistema-agricolo.svg",alt:"Quattro stazioni collegate: risorse naturali, strumenti e lavoro, colture e raccolto, effetti su acqua e suolo."},
 {sceneId:"AG5",file:"frutteto.svg",alt:"Frutteto collinare con alberi, due settori di terreno diversi e linea di irrigazione."},
] as const;

type Point = [id:string,label:string,detail:string,x:number,y:number,kind:NonNullable<SceneStage["evidence"]>[number]["kind"]];
function stage(place:string,detail:string,points:Point[],characterBeat?:SceneStage["characterBeat"]):SceneStage {
 return {visualMode:"CINEMATIC_EDITORIAL",focusLocationId:"site",locations:[{id:"site",label:place,detail,position:"ROOM"}],
 evidence:points.map(([id,label,detail,x,y,kind])=>({id,label,detail,locationId:"site",kind,hotspot:{x,y}})),
 ...(characterBeat?{characterBeat}:{})};
}
const situation = (sceneId:string,title:string,visibleSituation:string,learnerAction:string,consequence:string,reveal:string,extra:Partial<PathwayScene>={}):PathwayScene =>
 ({sceneId,kind:"SCENE",interaction:"SUMMARY",title,visibleSituation,learnerAction,consequence,reveal,choices:[],...extra});

export function createAgricultureDraft(images:Readonly<Record<string,SceneIllustration>>):PathwayProject {
 const now=new Date().toISOString();
 const scenes:PathwayScene[]=[
 situation("AG1","La chiamata nell’orto","Sara indica due filari: «Li abbiamo irrigati insieme, ma queste piante sono appassite». Luca mostra il suo quaderno: «Prima di usare altra acqua, cerchiamo di capire dove finisce».",
 "Sei il consulente dell’orto. Esplora i tre indizi, poi formula una prima ipotesi: da che cosa potrebbe dipendere la differenza?",
 "La differenza fra i filari diventa il problema da spiegare, non un motivo per irrigare alla cieca.",
 "Una stessa operazione può produrre esiti diversi se le relazioni del sistema cambiano.",
 {stage:stage("Orto scolastico","Una mattina di lavoro nell’orto.",[
 ["sara","Sara","«Vorrei salvare le piante senza consumare acqua inutilmente. Ci aiuti?»",21,56,"PERSON"],
 ["luca","Luca","«Ho osservato che il tempo di irrigazione era lo stesso. Dobbiamo confrontare altre condizioni.»",76,55,"PERSON"],
 ["filari","I due filari","Il filare a destra appare meno vigoroso. L’aspetto è un indizio, non dimostra ancora la causa.",57,75,"TRACE"]
 ],{name:"Sara",role:"Responsabile dell’orto",line:"Ci aiuti a scoprire che cosa sta succedendo?"})}),
 situation("AG2","L’indagine sul campo","Luca ha raccolto misure nella stessa durata, con due recipienti uguali. Tutti i valori sono inventati per questo caso didattico.",
 "Esplora i sei punti. Confronta i volumi e cerca una spiegazione della differenza.",
 "Le osservazioni permettono di formulare un’ipotesi verificabile sulla distribuzione dell’acqua.",
 "Il risultato agricolo dipende dall’organizzazione delle risorse e delle operazioni, non soltanto dalla quantità disponibile.",
 {stage:stage("Impianto di irrigazione","Osserva la linea dalla sorgente fino ai filari.",[
 ["serbatoio","Riserva d’acqua","Nel serbatoio l’acqua è disponibile: è una risorsa del sistema.",15,29,"OBJECT"],
 ["monte","Misura a monte","Il primo recipiente raccoglie 200 mL nello stesso intervallo di misura.",35,55,"TRACE"],
 ["ostruzione","Tratto della linea","Luca nota un deposito visibile all’interno del raccordo tra i due punti di misura. Che effetto potrebbe avere?",53,55,"SYSTEM"],
 ["valle","Misura a valle","Il secondo recipiente raccoglie 50 mL nello stesso intervallo: un quarto del primo.",72,55,"TRACE"],
 ["suolo","Terreno","In questa prova i due filari hanno suolo simile; in altri terreni la capacità di trattenere acqua può cambiare.",33,79,"OBJECT"],
 ["piante","Colture e lavoro","Sara ha usato lo stesso tempo di irrigazione. Le piante a valle sono meno vigorose: risultato osservato, non una misura diretta dell’acqua nelle radici.",82,79,"TRACE"]
 ],{name:"Luca",role:"Osservatore",line:"Quali osservazioni ci permettono di distinguere le ipotesi?"})}),
 situation("AG3","Quale intervento scegli?","Sara guarda Luca: «Abbiamo raccolto le misure. Ora dobbiamo scegliere una prova, senza sprecare acqua».",
 "Prevedi il risultato di un intervento. Scegli, osserva le conseguenze e motiva la decisione.",
 "Una seconda misura comparabile permette di valutare l’intervento.",
 "Una spiegazione causale si controlla modificando una condizione e osservando gli effetti, non indovinando.",
 {interaction:"CHOICE",stage:stage("Banco delle misure","Una scelta da verificare, non una risposta da indovinare.",[
 ["recipiente-monte","Recipiente a monte","Misura iniziale: 200 mL. Confronta le tre ipotesi prima di scegliere.",37,63,"TRACE"],
 ["recipiente-valle","Recipiente a valle","Misura iniziale: 50 mL. Il confronto dopo l’intervento è riportato nello stato della prova.",64,63,"TRACE"]
 ]),world:{place:"Banco delle misure",status:"Prova iniziale: distribuzione irregolare",signals:[{id:"up",label:"Monte",state:"ACTIVE",detail:"200 mL"},{id:"down",label:"Valle",state:"MISMATCH",detail:"50 mL"}]},
 choices:[
 {choiceId:"longer",label:"Prolungo l’irrigazione di tutti i filari",feedback:"Nel caso simulato cresce l’acqua usata, ma resta la differenza di erogazione. Confronta gli indizi e prova un’altra scelta.",targetSceneId:"AG3",worldAfter:{place:"Banco delle misure",status:"Più acqua, distribuzione ancora irregolare",signals:[{id:"up",label:"Monte",state:"ACTIVE",detail:"400 mL"},{id:"down",label:"Valle",state:"MISMATCH",detail:"100 mL"}]}},
 {choiceId:"restore",label:"Chiedo di ripristinare la distribuzione e ripeto la misura",feedback:"Dopo il ripristino da parte del responsabile, la prova simulata nello stesso intervallo dà 190 mL a monte e 185 mL a valle. L’erogazione è più uniforme: l’ipotesi è sostenuta.",targetSceneId:"AG4",worldAfter:{place:"Banco delle misure",status:"Seconda prova comparabile: distribuzione più uniforme",signals:[{id:"up",label:"Monte",state:"STABLE",detail:"190 mL"},{id:"down",label:"Valle",state:"STABLE",detail:"185 mL"}]}},
 {choiceId:"manual",label:"Compenso soltanto il filare asciutto con un annaffiatoio",feedback:"Nel caso simulato il filare riceve acqua aggiuntiva, ma la linea continua a distribuire in modo irregolare. È un rimedio temporaneo, non la verifica della causa.",targetSceneId:"AG3",worldAfter:{place:"Banco delle misure",status:"Compensazione locale, causa ancora presente",signals:[{id:"up",label:"Monte",state:"ACTIVE",detail:"200 mL dalla linea"},{id:"down",label:"Valle",state:"MANUAL",detail:"50 mL dalla linea più acqua manuale"}]}}
 ]}),
 situation("AG4","Ricostruisci il sistema","Sara e Luca confrontano le due prove. Ora vogliono descrivere l’orto come sistema, non come una somma di oggetti.",
 "Esplora i quattro punti e disegna sul quaderno le relazioni. Quali risultati guideranno la prossima irrigazione?",
 "Colleghi risorse, tecniche, lavoro, prodotti e impatti; confronti i risultati per regolare le operazioni.",
 "Il controllo dei risultati aiuta a correggere le decisioni. Il raccolto dipende da molti fattori, non solo dall’irrigazione.",
 {stage:stage("Mappa del sistema","Quattro parti, molte relazioni.",[
 ["risorse","Risorse","Suolo, acqua, luce e condizioni climatiche.",13,50,"OBJECT"],
 ["processi","Tecniche e lavoro","Strumenti, distribuzione, misure e decisioni delle persone.",37,50,"SYSTEM"],
 ["prodotti","Risultati","Crescita e raccolto: non immediati, dipendono anche da altre condizioni.",63,50,"TRACE"],
 ["effetti","Impatti e controllo","Consumo d’acqua, condizioni del suolo, osservazioni che guidano le prossime scelte.",87,50,"SYSTEM"]
 ])}),
 situation("AG5","Un nuovo problema nel frutteto","Il responsabile di un frutteto collinare chiede aiuto: alcuni alberi crescono meno degli altri. Luca ti consegna il quaderno delle nuove osservazioni.",
 "Proponi due controlli. Quale risultato ti farebbe cambiare ipotesi? Discuti o annota la risposta.",
 "Confronta la tua proposta con un possibile piano: misurare l’umidità nei due terreni a pari condizioni, controllare drenaggio ed esposizione, poi rivedere l’ipotesi se le misure non la sostengono.",
 "La soluzione dell’orto non è una regola universale: la strategia si trasferisce, la causa va indagata nuovamente.",
 {kind:"TRANSFER",stage:stage("Frutteto collinare","Un ambiente diverso richiede nuove osservazioni.",[
 ["linea","Erogazione","I recipienti della nuova prova raccolgono quantità simili nello stesso intervallo.",46,68,"TRACE"],
 ["terreno","Suoli diversi","Una zona è più sabbiosa, l’altra più compatta. Quali proprietà potrebbero cambiare?",74,81,"OBJECT"],
 ["alberi","Stato delle colture","Gli alberi crescono in modo diverso. Non abbiamo ancora misure di umidità del terreno né informazioni sulle radici.",24,47,"TRACE"]
 ])})
 ];
 const discovery:Record<string,{minObservations:number;reflectionPrompt:string}>={
 AG1:{minObservations:3,reflectionPrompt:"Qual è la tua prima ipotesi?"},
 AG2:{minObservations:6,reflectionPrompt:"Quali due indizi sostengono la tua spiegazione?"},
 AG3:{minObservations:2,reflectionPrompt:"Che cosa prevedi che accada alle due misure?"},
 AG4:{minObservations:4,reflectionPrompt:"Quale relazione collega una risorsa, un’operazione e un risultato?"},
 AG5:{minObservations:3,reflectionPrompt:"Quali due controlli proponi e quale risultato smentirebbe la tua ipotesi?"}
 };
 for(const scene of scenes){if(scene.stage)scene.stage={...scene.stage,discovery:discovery[scene.sceneId]};}
 for(const {sceneId} of artwork){
  const scene=scenes.find(item=>item.sceneId===sceneId)!;
  const image=images[sceneId];
  if(!image)throw Error("AGRICULTURE_IMAGE_MISSING");
  scene.illustration=image;
 }
 return {projectId:AGRICULTURE_PROJECT_ID,title:"Dal campo al raccolto · Il mistero dei filari asciutti",idea:"Indaga perché due filari irrigati insieme mostrano condizioni diverse. Aiuta Sara e Luca a ricostruire il sistema agricolo e a verificare una soluzione senza sprechi.",ageBand:"lower-secondary",
 authoringComplexity:"ARTICULATED",authoringSelection:{environment:"NATURE",tools:["STORY","WORLD","FORM","SCENES","CHOICES","HOTSPOTS","PREVIEW"]},
 humanState:"STORY_REVIEW",productionState:"NOT_REQUESTED",
 story:{hook:"Due filari irrigati insieme mostrano condizioni diverse.",setting:"Orto scolastico e frutteto collinare.",characters:"Sara, responsabile dell’orto; Luca, osservatore delle misure; lo studente, consulente dell’orto.",characterGoal:"Individuare una soluzione motivata che eviti sprechi d’acqua.",disruption:"Le piante a valle sono appassite dopo l’irrigazione.",unknown:"Quale relazione impedisce la distribuzione uniforme? Quali misure distinguono le ipotesi?",learnerRole:"Consulente che osserva, confronta, sceglie e verifica nel modello didattico.",turningPoint:"Confronto fra misure a monte e a valle, indizio di ostruzione e seconda prova.",ending:"Ricostruzione del sistema e trasferimento del metodo in un frutteto."},
 storyReview:{decision:"READY"},world:{learnerRole:"Consulente dell’orto",canObserve:"Riserva, linea, due misure, terreno, piante e operazioni.",canChange:"Seleziona interventi nel modello e confronta conseguenze.",unknown:"Causa della distribuzione irregolare nel caso.",consequence:"Le misure simulate cambiano in funzione della scelta.",motivation:"Salvare le colture senza sprechi e saper spiegare le decisioni."},
 worldReview:{decision:"READY"},productReview:{decision:"READY",evidenceRef:"ESS-02 · Fascicolo educativo-didattico v0.3 (bozza)"},experience:{grammar:"INQUIRY_EVIDENCE",rationale:"L’indagine richiede osservazione di indizi, confronto di misure, una scelta causale e trasferimento."},scenes,storyboardReady:false,archived:false,createdAt:now,updatedAt:now,revision:1};
}

// Local repository artwork is converted once using the existing WebP validator;
// no external provider, no paid generation, no approval is imported.
export async function loadAgricultureDraft():Promise<PathwayProject>{
 const images:Record<string,SceneIllustration>={};
 for(const item of artwork){
  const source=new Image();source.src="/design/ess-02/"+item.file;
  await source.decode();
  const canvas=document.createElement("canvas");canvas.width=960;canvas.height=540;
  const ctx=canvas.getContext("2d");if(!ctx)throw Error("AGRICULTURE_CANVAS");
  ctx.drawImage(source,0,0,960,540);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value&&value.type==="image/webp"?resolve(value):reject(Error("AGRICULTURE_WEBP")),"image/webp",0.85));
  images[item.sceneId]={...await makeSceneIllustration(new Uint8Array(await blob.arrayBuffer())),alt:item.alt};
 }
 return createAgricultureDraft(images);
}
